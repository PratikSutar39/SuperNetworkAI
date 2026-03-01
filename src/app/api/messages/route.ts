import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";
import crypto from "crypto";

// Generate a deterministic UUID v5 from two user IDs.
// This produces a valid UUID that works with both UUID and TEXT columns.
function generateConversationId(userId1: string, userId2: string): string {
  const sorted = [userId1, userId2].sort();
  const name = `${sorted[0]}_${sorted[1]}`;

  // UUID v5: SHA-1 hash with a namespace
  const NAMESPACE = Buffer.from("6ba7b8109dad11d180b400c04fd430c8", "hex");
  const nameBytes = Buffer.from(name, "utf8");

  const hash = crypto
    .createHash("sha1")
    .update(Buffer.concat([NAMESPACE, nameBytes]))
    .digest();

  // Set version to 5
  hash[6] = (hash[6] & 0x0f) | 0x50;
  // Set variant to RFC 4122
  hash[8] = (hash[8] & 0x3f) | 0x80;

  const hex = hash.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const conversationId = searchParams.get("conversation_id");
    const supabase = getServiceSupabase();

    // Return conversations list with last message and unread count
    if (type === "conversations") {
      // Fetch all messages involving the current user
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (messagesError) {
        return NextResponse.json(
          { error: "Failed to fetch messages" },
          { status: 500 }
        );
      }

      if (!messages || messages.length === 0) {
        return NextResponse.json({ conversations: [] }, { status: 200 });
      }

      // Group by conversation_id and build conversation summaries
      const conversationMap = new Map<
        string,
        {
          conversation_id: string;
          other_user_id: string;
          last_message: typeof messages[0];
          unread_count: number;
        }
      >();

      for (const msg of messages) {
        const existing = conversationMap.get(msg.conversation_id);
        const otherUserId =
          msg.sender_id === userId ? msg.recipient_id : msg.sender_id;

        if (!existing) {
          conversationMap.set(msg.conversation_id, {
            conversation_id: msg.conversation_id,
            other_user_id: otherUserId,
            last_message: msg,
            unread_count:
              msg.recipient_id === userId && !msg.read ? 1 : 0,
          });
        } else {
          // Count unread messages sent to the current user
          if (msg.recipient_id === userId && !msg.read) {
            existing.unread_count++;
          }
        }
      }

      // Fetch user and profile data for all other users in conversations
      const otherUserIds = [
        ...new Set(
          Array.from(conversationMap.values()).map((c) => c.other_user_id)
        ),
      ];

      const { data: users } = await supabase
        .from("users")
        .select(
          "id, email, name, avatar_url, onboarding_completed, created_at, updated_at"
        )
        .in("id", otherUserIds);

      const usersMap = new Map((users || []).map((u) => [u.id, u]));

      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", otherUserIds);

      const profilesMap = new Map(
        (profiles || []).map((p) => [p.user_id, p])
      );

      // Build the conversations response
      const conversations = Array.from(conversationMap.values()).map(
        (conv) => ({
          id: conv.conversation_id,
          other_user: {
            ...usersMap.get(conv.other_user_id),
            profile: profilesMap.get(conv.other_user_id) || null,
          },
          last_message: conv.last_message,
          unread_count: conv.unread_count,
        })
      );

      return NextResponse.json({ conversations }, { status: 200 });
    }

    // Return messages for a specific conversation
    if (conversationId) {
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order("created_at", { ascending: true });

      if (messagesError) {
        return NextResponse.json(
          { error: "Failed to fetch messages" },
          { status: 500 }
        );
      }

      if (!messages || messages.length === 0) {
        return NextResponse.json({ messages: [] }, { status: 200 });
      }

      // Mark unread messages as read where the current user is the recipient
      const unreadMessageIds = messages
        .filter((m) => m.recipient_id === userId && !m.read)
        .map((m) => m.id);

      if (unreadMessageIds.length > 0) {
        await supabase
          .from("messages")
          .update({ read: true })
          .in("id", unreadMessageIds);
      }

      // Fetch sender user data
      const senderIds = [...new Set(messages.map((m) => m.sender_id))];
      const { data: senders } = await supabase
        .from("users")
        .select(
          "id, email, name, avatar_url, onboarding_completed, created_at, updated_at"
        )
        .in("id", senderIds);

      const sendersMap = new Map(
        (senders || []).map((u) => [u.id, u])
      );

      const enrichedMessages = messages.map((msg) => ({
        ...msg,
        sender: sendersMap.get(msg.sender_id) || null,
      }));

      return NextResponse.json(
        { messages: enrichedMessages },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Please provide either ?type=conversations or ?conversation_id=xxx",
      },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const { recipient_id, content } = body;

    if (!recipient_id) {
      return NextResponse.json(
        { error: "recipient_id is required" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    if (recipient_id === userId) {
      return NextResponse.json(
        { error: "Cannot send a message to yourself" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Verify recipient exists
    const { data: recipient, error: recipientError } = await supabase
      .from("users")
      .select("id")
      .eq("id", recipient_id)
      .single();

    if (recipientError || !recipient) {
      return NextResponse.json(
        { error: "Recipient user not found" },
        { status: 404 }
      );
    }

    // Find existing conversation or generate a new deterministic UUID
    let conversation_id: string;

    const { data: existingMessages } = await supabase
      .from("messages")
      .select("conversation_id")
      .or(
        `and(sender_id.eq.${userId},recipient_id.eq.${recipient_id}),and(sender_id.eq.${recipient_id},recipient_id.eq.${userId})`
      )
      .limit(1);

    if (existingMessages && existingMessages.length > 0) {
      conversation_id = existingMessages[0].conversation_id;
    } else {
      conversation_id = generateConversationId(userId, recipient_id);
    }

    // Insert the message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id,
        sender_id: userId,
        recipient_id,
        content: content.trim(),
        read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (messageError) {
      console.error("Supabase message insert error:", messageError);
      return NextResponse.json(
        { error: `Failed to send message: ${messageError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
