"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Send, MessageSquare, ArrowLeft, PenSquare } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import type { Conversation, Message, Connection, User, Profile } from "@/types";
import { timeAgo } from "@/lib/utils";

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--orange-primary)] border-t-transparent rounded-full" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("user");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [newConvModal, setNewConvModal] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<(User & { profile?: Profile })[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasOpenedTargetUser = useRef(false);

  const currentUserId = (session?.user as { id: string })?.id;

  // Open or create a conversation for a target user (from ?user= param or new conv modal)
  const openConversationForUser = useCallback(
    async (otherUserId: string, convos: Conversation[]) => {
      // Check if we already have a conversation with this user
      const existingConv = convos.find(
        (c) => c.other_user.id === otherUserId
      );
      if (existingConv) {
        openConversation(existingConv);
        return;
      }

      // No existing conversation - fetch the user's info and create a placeholder
      try {
        const res = await fetch(`/api/profile?user_id=${otherUserId}`);
        if (res.ok) {
          const data = await res.json();
          const sortedIds = [currentUserId, otherUserId].sort();
          const conversationId = `${sortedIds[0]}_${sortedIds[1]}`;

          const newConv: Conversation = {
            id: conversationId,
            other_user: {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              avatar_url: data.user.avatar_url,
              onboarding_completed: data.user.onboarding_completed,
              created_at: data.user.created_at,
              updated_at: data.user.updated_at,
              profile: data.profile || null,
            },
            last_message: null,
            unread_count: 0,
          };

          setActiveConversation(newConv);
          setMessages([]);
        }
      } catch {
        // silently fail
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUserId]
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchConversations() {
    try {
      const res = await fetch("/api/messages?type=conversations");
      if (res.ok) {
        const data = await res.json();
        const convos = data.conversations || [];
        setConversations(convos);

        // Auto-open conversation for target user if provided via query param
        if (targetUserId && !hasOpenedTargetUser.current) {
          hasOpenedTargetUser.current = true;
          openConversationForUser(targetUserId, convos);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function openConversation(conv: Conversation) {
    setActiveConversation(conv);
    setSendError(null);
    try {
      const res = await fetch(`/api/messages?conversation_id=${conv.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // silently fail
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || sending) return;

    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_id: activeConversation.other_user.id,
          content: newMessage.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");

        // Add this conversation to the list if it's new
        const exists = conversations.some((c) => c.id === activeConversation.id);
        if (!exists) {
          setConversations((prev) => [
            {
              ...activeConversation,
              last_message: data.message,
            },
            ...prev,
          ]);
        } else {
          // Update last_message in existing conversation
          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeConversation.id
                ? { ...c, last_message: data.message }
                : c
            )
          );
        }
      } else {
        const errorData = await res.json().catch(() => null);
        setSendError(errorData?.error || "Failed to send message. Please try again.");
      }
    } catch {
      setSendError("Network error. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleNewConversation() {
    setNewConvModal(true);
    setLoadingConnections(true);
    try {
      const res = await fetch("/api/connections");
      if (res.ok) {
        const data = await res.json();
        const accepted = (data.connections || []).filter(
          (c: Connection) => c.status === "accepted"
        );
        // Extract the other user from each accepted connection
        const users = accepted.map((c: Connection) => {
          if (c.requester_id === currentUserId) {
            return c.recipient
              ? { ...c.recipient, profile: c.recipient.profile }
              : null;
          }
          return c.requester
            ? { ...c.requester, profile: c.requester.profile }
            : null;
        }).filter(Boolean) as (User & { profile?: Profile })[];

        // Filter out users who already have conversations
        const existingUserIds = new Set(conversations.map((c) => c.other_user.id));
        const newUsers = users.filter((u) => !existingUserIds.has(u.id));
        setConnectedUsers(newUsers);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingConnections(false);
    }
  }

  function handleSelectUser(user: User & { profile?: Profile }) {
    setNewConvModal(false);
    const sortedIds = [currentUserId, user.id].sort();
    const conversationId = `${sortedIds[0]}_${sortedIds[1]}`;

    const newConv: Conversation = {
      id: conversationId,
      other_user: {
        ...user,
        profile: user.profile || undefined,
      },
      last_message: null,
      unread_count: 0,
    };

    setActiveConversation(newConv);
    setMessages([]);
    setSendError(null);
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--orange-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-warm)]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-dark)]">
            Messages
          </h1>
          <button
            onClick={handleNewConversation}
            className="btn-primary px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
          >
            <PenSquare className="w-4 h-4" />
            New Message
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ minHeight: "60vh" }}>
          {/* Conversations list */}
          <Card
            variant="strong"
            className={`p-0 overflow-hidden ${activeConversation ? "hidden md:block" : ""}`}
          >
            <div className="p-4 border-b border-white/30">
              <h2 className="text-sm font-semibold text-[var(--text-dark)]">
                Conversations
              </h2>
            </div>
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                      <div className="h-2 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length > 0 ? (
              <div className="divide-y divide-white/20">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-[var(--peach-light)] transition-colors text-left ${
                      activeConversation?.id === conv.id ? "bg-[var(--peach-light)]" : ""
                    }`}
                  >
                    <Avatar
                      name={conv.other_user.name}
                      src={conv.other_user.avatar_url}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--text-dark)] truncate">
                          {conv.other_user.name}
                        </span>
                        {conv.unread_count > 0 && (
                          <Badge variant="orange">{conv.unread_count}</Badge>
                        )}
                      </div>
                      {conv.last_message && (
                        <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                          {conv.last_message.content}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
                <p className="text-sm text-[var(--text-muted)]">
                  No conversations yet
                </p>
                <button
                  onClick={handleNewConversation}
                  className="mt-3 text-sm font-medium text-[var(--orange-primary)] hover:underline"
                >
                  Start a new conversation
                </button>
              </div>
            )}
          </Card>

          {/* Message thread */}
          <Card
            variant="strong"
            className={`md:col-span-2 p-0 flex flex-col overflow-hidden ${
              !activeConversation ? "hidden md:flex" : ""
            }`}
          >
            {activeConversation ? (
              <>
                {/* Thread header */}
                <div className="flex items-center gap-3 p-4 border-b border-white/30">
                  <button
                    className="md:hidden p-1 rounded-lg hover:bg-gray-100/80"
                    onClick={() => setActiveConversation(null)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <Avatar
                    name={activeConversation.other_user.name}
                    src={activeConversation.other_user.avatar_url}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-dark)]">
                      {activeConversation.other_user.name}
                    </p>
                    {activeConversation.other_user.profile?.headline && (
                      <p className="text-xs text-[var(--text-muted)]">
                        {activeConversation.other_user.profile.headline}
                      </p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: "50vh" }}>
                  {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full py-12">
                      <div className="text-center">
                        <MessageSquare className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-[var(--text-muted)]">
                          Send a message to start the conversation
                        </p>
                      </div>
                    </div>
                  )}
                  {messages.map((msg) => {
                    const isOwn = msg.sender_id === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                            isOwn
                              ? "bg-gradient-to-r from-[var(--orange-primary)] to-[var(--orange-deep)] text-white rounded-br-md"
                              : "glass rounded-bl-md text-[var(--text-body)]"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              isOwn ? "text-white/70" : "text-[var(--text-muted)]"
                            }`}
                          >
                            {timeAgo(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Send error */}
                {sendError && (
                  <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100">
                    {sendError}
                  </div>
                )}

                {/* Input */}
                <form
                  onSubmit={handleSend}
                  className="p-4 border-t border-white/30 flex gap-3"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="glass-input flex-1 px-4 py-2.5 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="btn-primary p-2.5 rounded-xl disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center flex-1 p-8">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
                  <p className="text-[var(--text-muted)]">
                    Select a conversation to start messaging
                  </p>
                  <button
                    onClick={handleNewConversation}
                    className="mt-3 text-sm font-medium text-[var(--orange-primary)] hover:underline"
                  >
                    Or start a new conversation
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* New Conversation Modal */}
      <Modal
        isOpen={newConvModal}
        onClose={() => setNewConvModal(false)}
        title="New Message"
      >
        <p className="text-sm text-[var(--text-body)] mb-4">
          Select a connection to start messaging.
        </p>
        {loadingConnections ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-2 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : connectedUsers.length > 0 ? (
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {connectedUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--peach-light)] transition-colors text-left"
              >
                <Avatar name={user.name} src={user.avatar_url} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-dark)] truncate">
                    {user.name}
                  </p>
                  {user.profile?.headline && (
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {user.profile.headline}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-[var(--text-muted)]">
              No new connections to message.
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Connect with people first to start messaging them.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
