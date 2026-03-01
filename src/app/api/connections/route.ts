import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const supabase = getServiceSupabase();

    // Fetch all connections where user is requester or recipient
    const { data: connections, error: connectionsError } = await supabase
      .from("connections")
      .select("*")
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("updated_at", { ascending: false });

    if (connectionsError) {
      return NextResponse.json(
        { error: "Failed to fetch connections" },
        { status: 500 }
      );
    }

    if (!connections || connections.length === 0) {
      return NextResponse.json({ connections: [] }, { status: 200 });
    }

    // Collect all unique user IDs from connections (the other party)
    const otherUserIds = connections.map((c) =>
      c.requester_id === userId ? c.recipient_id : c.requester_id
    );
    const uniqueUserIds = [...new Set(otherUserIds)];

    // Fetch user data for all related users
    const { data: users } = await supabase
      .from("users")
      .select(
        "id, email, name, avatar_url, onboarding_completed, created_at, updated_at"
      )
      .in("id", uniqueUserIds);

    const usersMap = new Map((users || []).map((u) => [u.id, u]));

    // Fetch profile data for all related users
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", uniqueUserIds);

    const profilesMap = new Map(
      (profiles || []).map((p) => [p.user_id, p])
    );

    // Enrich connections with user and profile data
    const enrichedConnections = connections.map((connection) => {
      const requesterId = connection.requester_id;
      const recipientId = connection.recipient_id;

      return {
        ...connection,
        requester: {
          ...usersMap.get(requesterId),
          profile: profilesMap.get(requesterId) || null,
        },
        recipient: {
          ...usersMap.get(recipientId),
          profile: profilesMap.get(recipientId) || null,
        },
      };
    });

    return NextResponse.json(
      { connections: enrichedConnections },
      { status: 200 }
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
    const { recipient_id, message } = body;

    if (!recipient_id) {
      return NextResponse.json(
        { error: "recipient_id is required" },
        { status: 400 }
      );
    }

    if (recipient_id === userId) {
      return NextResponse.json(
        { error: "Cannot send a connection request to yourself" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Check if a connection already exists between these users
    const { data: existingConnection } = await supabase
      .from("connections")
      .select("*")
      .or(
        `and(requester_id.eq.${userId},recipient_id.eq.${recipient_id}),and(requester_id.eq.${recipient_id},recipient_id.eq.${userId})`
      )
      .single();

    if (existingConnection) {
      return NextResponse.json(
        { error: "A connection already exists between these users" },
        { status: 409 }
      );
    }

    // Check if the recipient exists
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

    // Create the connection request
    const { data: connection, error: connectionError } = await supabase
      .from("connections")
      .insert({
        requester_id: userId,
        recipient_id,
        status: "pending",
        message: message || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (connectionError) {
      return NextResponse.json(
        { error: "Failed to create connection request" },
        { status: 500 }
      );
    }

    return NextResponse.json({ connection }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const { connection_id, status } = body;

    if (!connection_id || !status) {
      return NextResponse.json(
        { error: "connection_id and status are required" },
        { status: 400 }
      );
    }

    if (!["accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'accepted' or 'rejected'" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Fetch the connection and verify the current user is the recipient
    const { data: connection, error: fetchError } = await supabase
      .from("connections")
      .select("*")
      .eq("id", connection_id)
      .single();

    if (fetchError || !connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    if (connection.recipient_id !== userId) {
      return NextResponse.json(
        { error: "Only the recipient can update the connection status" },
        { status: 403 }
      );
    }

    if (connection.status !== "pending") {
      return NextResponse.json(
        { error: "Connection has already been responded to" },
        { status: 400 }
      );
    }

    // Update the connection status
    const { data: updatedConnection, error: updateError } = await supabase
      .from("connections")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", connection_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update connection status" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { connection: updatedConnection },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
