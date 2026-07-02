import { Lock, MessageCircle } from "lucide-react";

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";
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

export default function ConversationList({
  chats = [],
  activeChatId,
  currentUserId,
  onSelectChat,
  loading,
  hasUnreadMap = {},
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-8 h-8 border-4 border-primary border-dashed rounded-full animate-spin" />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2 px-4 text-center">
        <MessageCircle className="w-8 h-8 text-primary/40" />
        <p className="text-sm text-text-muted">
          No conversations yet. Chats appear automatically after a doctor or midwife is assigned to your pregnancy.
        </p>
      </div>
    );
  }

  return (
    <ul className="list-none m-0 p-0 flex flex-col">
      {chats.map((chat) => {
        const other = chat.participants?.find((p) => p._id !== currentUserId);
        const name = other?.fullName ?? "Unknown";
        const isActive = chat._id === activeChatId;
        const hasUnread = !isActive && !!hasUnreadMap[chat._id];
        const isReadOnly = !!chat.isReadOnly;

        return (
          <li key={chat._id}>
            <button
              onClick={() => onSelectChat(chat)}
              className={[
                "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                "border-b border-border dark:border-dark-border",
                isActive
                  ? "bg-primary/10 dark:bg-primary/15"
                  : isReadOnly
                  ? "opacity-60 hover:opacity-80 hover:bg-bg-soft/40 dark:hover:bg-dark-surface/40"
                  : "hover:bg-bg-soft/60 dark:hover:bg-dark-surface/60",
              ].join(" ")}
            >
              {}
              <div className="relative shrink-0">
                <div
                  className={[
                    "flex items-center justify-center w-10 h-10 rounded-full",
                    "text-sm font-semibold select-none",
                    isActive
                      ? "bg-primary text-white"
                      : isReadOnly
                      ? "bg-text-muted/15 text-text-muted dark:bg-dark-border/30 dark:text-text-muted"
                      : "bg-primary/10 text-primary",
                  ].join(" ")}
                >
                  {getInitials(name)}
                </div>

                {}
                {isReadOnly && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-bg-card dark:bg-dark-surface border border-border dark:border-dark-border flex items-center justify-center">
                    <Lock size={9} className="text-text-muted" />
                  </span>
                )}

                {}
                {hasUnread && !isReadOnly && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-bg-card dark:border-dark-surface" />
                )}
              </div>

              {}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={[
                        "text-sm truncate",
                        isActive
                          ? "font-semibold text-primary"
                          : hasUnread && !isReadOnly
                          ? "font-bold text-text-primary dark:text-dark-text"
                          : isReadOnly
                          ? "font-medium text-text-muted"
                          : "font-medium text-text-primary dark:text-dark-text",
                      ].join(" ")}
                    >
                      {name}
                    </span>
                    {other?.role && (
                      <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/8 text-primary/70 dark:bg-primary/10 dark:text-primary/60 leading-none">
                        {other.role.charAt(0) + other.role.slice(1).toLowerCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-text-muted shrink-0">
                    {formatTime(chat.lastMessageAt)}
                  </span>
                </div>

                {}
                {isReadOnly ? (
                  <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-text-muted/10 dark:bg-dark-border/20 text-text-muted border border-text-muted/15 dark:border-dark-border/30">
                    <Lock size={8} />
                    Archived
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
  );
}
