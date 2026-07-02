import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, ChevronRight, Lock } from "lucide-react";
import { getMyChats } from "../../api/chatApi";
import { useAuth } from "../../context/useAuth";
import { readLastSeen } from "../../utils/chatStorage";

function getInitials(name = "") {
  return (
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?"
  );
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function MidwifeMessagesPreviewCard() {
  const { userId: currentUserId } = useAuth();
  const [chats, setChats]               = useState([]);
  const [hasUnreadMap, setHasUnreadMap] = useState({});
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const pollRef = useRef(null);
  const navigate = useNavigate();

  const computeUnread = useCallback(
    (chatList) => {
      if (!currentUserId) return;
      const lastSeen = readLastSeen(currentUserId);
      const map = {};
      for (const chat of chatList) {
        
        if (chat.isReadOnly) { map[chat._id] = false; continue; }
        if (!chat.lastMessageAt) { map[chat._id] = false; continue; }
        const seenAt = lastSeen[chat._id] ? new Date(lastSeen[chat._id]) : new Date(0);
        map[chat._id] = new Date(chat.lastMessageAt) > seenAt;
      }
      setHasUnreadMap(map);
    },
    [currentUserId]
  );

  const fetchChats = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      if (!silent) setError(null);
      try {
        const res = await getMyChats();
        const data = res.data?.data ?? res.data ?? [];
        setChats(data);
        computeUnread(data);
      } catch {
        if (!silent) setError("Couldn't load messages.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [computeUnread]
  );

  useEffect(() => {
    fetchChats(false);
    
    pollRef.current = setInterval(() => fetchChats(true), 15_000);
    return () => clearInterval(pollRef.current);
  }, [fetchChats]);

  const totalUnread = Object.values(hasUnreadMap).filter(Boolean).length;

  
  if (loading) {
    return (
      <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface shadow-sm p-5 animate-pulse">
        <div className="h-3 w-20 rounded-full bg-border dark:bg-dark-border mb-3" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-border dark:bg-dark-border shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-28 rounded-full bg-border dark:bg-dark-border" />
                <div className="h-2.5 w-40 rounded-full bg-border dark:bg-dark-border" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface shadow-sm p-5">
      {}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <MessageCircle size={13} className="text-primary" />
          Messages
        </p>
        {totalUnread > 0 && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary text-white">
            {totalUnread} new
          </span>
        )}
      </div>

      {}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {}
      {!error && chats.length === 0 && (
        <p className="text-sm text-text-secondary dark:text-text-muted">
          No conversations yet. Chats will appear once you are assigned to a
          mother's pregnancy.
        </p>
      )}

      {/* Chat previews — show up to 3 */}
      {!error && chats.length > 0 && (
        <ul className="space-y-2">
          {chats.slice(0, 3).map((chat) => {
            const other = chat.participants?.find((p) => p._id !== currentUserId);
            const name = other?.fullName ?? "Unknown";
            const hasUnread = !!hasUnreadMap[chat._id];
            const isReadOnly = !!chat.isReadOnly;

            return (
              <li key={chat._id}>
                <button
                  onClick={() => navigate("/midwife/messages")}
                  className="
                    w-full flex items-center gap-3 text-left
                    rounded-lg px-2 py-1.5 -mx-2
                    hover:bg-primary/5 dark:hover:bg-primary/10
                    transition-colors duration-150
                  "
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className={[
                        "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold select-none",
                        isReadOnly
                          ? "bg-text-muted/10 text-text-muted dark:bg-dark-border/20"
                          : hasUnread
                          ? "bg-primary text-white"
                          : "bg-primary/10 text-primary",
                      ].join(" ")}
                    >
                      {getInitials(name)}
                    </div>
                    {/* Unread dot */}
                    {hasUnread && !isReadOnly && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-bg-card dark:border-dark-surface" />
                    )}
                    {/* Read-only lock */}
                    {isReadOnly && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-bg-card dark:bg-dark-surface border border-border dark:border-dark-border flex items-center justify-center">
                        <Lock size={8} className="text-text-muted" />
                      </span>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={[
                          "text-sm truncate",
                          hasUnread && !isReadOnly
                            ? "font-bold text-text-primary dark:text-dark-text"
                            : "font-medium text-text-primary dark:text-dark-text",
                        ].join(" ")}
                      >
                        {name}
                        {other?.role && (
                          <span className="ml-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/8 text-primary/70 dark:text-primary/60 leading-none">
                            {other.role.charAt(0) + other.role.slice(1).toLowerCase()}
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] text-text-muted shrink-0">
                        {formatTime(chat.lastMessageAt)}
                      </span>
                    </div>

                    {isReadOnly ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-text-muted mt-0.5">
                        <Lock size={8} /> Archived
                      </span>
                    ) : (
                      <p
                        className={[
                          "text-xs truncate mt-0.5",
                          hasUnread
                            ? "font-semibold text-text-primary dark:text-dark-text"
                            : "text-text-muted",
                        ].join(" ")}
                      >
                        {chat.lastMessage ?? "No messages yet"}
                      </p>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Footer CTA */}
      {!error && (
        <button
          onClick={() => navigate("/midwife/messages")}
          className="
            mt-3 w-full text-xs font-medium text-primary
            flex items-center justify-center gap-0.5
            hover:underline transition-colors
          "
        >
          {chats.length === 0
            ? "Open Messages"
            : chats.length > 3
            ? `View all ${chats.length} conversations`
            : "Open Messages"}
          <ChevronRight size={13} />
        </button>
      )}
    </div>
  );
}
