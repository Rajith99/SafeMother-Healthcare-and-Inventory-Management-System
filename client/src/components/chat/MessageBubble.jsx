import { Trash2 } from "lucide-react";

function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageBubble({ message, isOwn, onDelete }) {
  return (
    <div
      className={[
        "flex items-end gap-2 group",
        isOwn ? "justify-end" : "justify-start",
      ].join(" ")}
    >
      <div
        className={[
          "relative max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm",
          isOwn
            ? "bg-primary text-white rounded-br-sm"
            : "bg-bg-card dark:bg-dark-surface text-text-primary dark:text-dark-text border border-border dark:border-dark-border rounded-bl-sm",
        ].join(" ")}
      >
        <p className="break-words whitespace-pre-wrap">
          {message.isDeleted ? (
            <span className="italic opacity-60">Message deleted</span>
          ) : (
            message.text
          )}
        </p>

        {}
        <div
          className={[
            "flex items-center gap-1 mt-1",
            isOwn ? "justify-end" : "justify-start",
          ].join(" ")}
        >
          <span
            className={[
              "text-[10px] leading-none",
              isOwn ? "text-white/70" : "text-text-muted",
            ].join(" ")}
          >
            {formatTime(message.createdAt)}
          </span>
          {isOwn && message.isRead && (
            <span className="text-[10px] text-white/70">✓✓</span>
          )}
        </div>
      </div>

      {}
      {isOwn && !message.isDeleted && (
        <button
          onClick={() => onDelete(message._id)}
          title="Delete message"
          className="
            opacity-0 group-hover:opacity-100 transition-opacity
            flex items-center justify-center w-6 h-6 rounded-full
            bg-bg-card dark:bg-dark-surface
            border border-border dark:border-dark-border
            text-text-muted hover:text-red-500 hover:border-red-300
            shrink-0 cursor-pointer
          "
        >
          <Trash2 size={11} />
        </button>
      )}
    </div>
  );
}
