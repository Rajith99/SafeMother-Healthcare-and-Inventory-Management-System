import { useEffect, useRef, useState, useCallback } from "react";
import { Send, MessageCircle, Lock } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { getMessages, sendMessage, deleteMessage, markMessageRead } from "../../api/chatApi";
import Alert from "../ui/Alert";

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";
}

export default function ChatWindow({ chat, currentUserId, onUnreadCount, isReadOnly = false }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [initialLoading, setInitialLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const pollRef = useRef(null);
  
  const isFirstFetch = useRef(true);

  const other = chat?.participants?.find((p) => p._id !== currentUserId);
  const otherName = other?.fullName ?? "Unknown";

  
  const isNearBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }, []);

  const fetchMessages = useCallback(async (silent = false) => {
    if (!chat) return;
    if (!silent) setInitialLoading(true);
    if (!silent) setError(null);
    try {
      const res = await getMessages(chat._id);
      const data = res.data?.data ?? res.data ?? {};
      
      const msgs = data.messages ?? [];
      setMessages(msgs);

      
      const unread = msgs.filter(
        (m) => !m.isRead && (m.senderId?._id ?? m.senderId) !== currentUserId
      );

      
      if (onUnreadCount) onUnreadCount(chat._id, unread.length);

      
      if (unread.length > 0) {
        await Promise.allSettled(unread.map((m) => markMessageRead(m._id)));
        
        setMessages((prev) =>
          prev.map((m) =>
            unread.some((u) => u._id === m._id) ? { ...m, isRead: true } : m
          )
        );
        
        if (onUnreadCount) onUnreadCount(chat._id, 0);
      }
    } catch (err) {
      if (!silent) setError(err.response?.data?.message ?? "Failed to load messages.");
    } finally {
      if (!silent) setInitialLoading(false);
    }
  }, [chat, currentUserId, onUnreadCount]);

  
  useEffect(() => {
    if (!chat) return;
    isFirstFetch.current = true;
    setMessages([]);
    setText("");
    setError(null);
    fetchMessages(false); 
    isFirstFetch.current = false;

    
    pollRef.current = setInterval(() => fetchMessages(true), 10_000);
    return () => clearInterval(pollRef.current);
  }, [chat?._id]); 

  
  useEffect(() => {
    if (isNearBottom()) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isNearBottom]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await sendMessage(chat._id, trimmed);
      const newMsg = res.data?.data ?? res.data;
      setMessages((prev) => [...prev, newMsg]);
      setText("");
      inputRef.current?.focus();
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await deleteMessage(messageId);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true } : m
        )
      );
    } catch {
      
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  
  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageCircle className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text">
          Your Messages
        </h2>
        <p className="text-sm text-text-muted max-w-xs">
          Select a conversation on the left to view your messages.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary text-sm font-semibold select-none shrink-0">
          {getInitials(otherName)}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-text-primary dark:text-dark-text truncate leading-tight">
            {otherName}
          </span>
          <span className="text-xs text-text-muted leading-tight">
            {other?.role
              ? other.role.charAt(0) + other.role.slice(1).toLowerCase()
              : ""}
          </span>
        </div>
      </div>

      {}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5 min-h-0">
        {error && <Alert type="error">{error}</Alert>}

        {initialLoading && (
          <div className="flex items-center justify-center h-24">
            <div className="w-8 h-8 border-4 border-primary border-dashed rounded-full animate-spin" />
          </div>
        )}

        {!initialLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center">
            <p className="text-sm text-text-muted">
              No messages yet. Say hello! 👋
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            isOwn={msg.senderId === currentUserId || msg.senderId?._id === currentUserId}
            onDelete={handleDelete}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {}
      {isReadOnly ? (
        <div className="px-4 py-3 border-t border-border dark:border-dark-border bg-bg-soft dark:bg-dark-surface shrink-0">
          <div className="flex items-center gap-2.5 justify-center px-4 py-2.5 rounded-xl bg-primary/6 border border-primary/20">
            <Lock size={14} className="text-primary shrink-0" />
            <p className="text-xs text-text-secondary dark:text-dark-text text-center">
              This conversation is <span className="font-semibold text-primary">read-only</span> because the pregnancy status or care assignment has changed.
            </p>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              id="chat-message-input"
              rows={1}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send)"
              className="
                flex-1 resize-none px-4 py-2.5 rounded-xl text-sm
                bg-bg-main dark:bg-dark-bg
                text-text-primary dark:text-dark-text
                border border-border dark:border-dark-border
                placeholder:text-text-muted
                focus:outline-none focus:border-primary
                transition-colors leading-relaxed
                min-h-10.5 max-h-30
              "
            />
            <button
              id="chat-send-button"
              onClick={handleSend}
              disabled={!text.trim() || sending}
              className="
                flex items-center justify-center w-10 h-10 rounded-xl shrink-0
                bg-primary text-white
                hover:bg-primary/90 active:scale-95
                transition-all disabled:opacity-40 disabled:cursor-not-allowed
                cursor-pointer
              "
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}