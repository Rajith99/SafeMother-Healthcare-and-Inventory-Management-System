import { useState, useEffect, useRef, useCallback } from "react";
import { getMyChats } from "../api/chatApi";
import { readLastSeen } from "../utils/chatStorage";









export function useUnreadBadge(userId, intervalMs = 10_000) {
  const [hasAnyUnread, setHasAnyUnread] = useState(false);
  const pollRef = useRef(null);

  const check = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await getMyChats();
      const data = res.data?.data ?? res.data ?? [];
      const lastSeen = readLastSeen(userId);
      const anyUnread = data.some((chat) => {
        if (chat.isReadOnly) return false;       
        if (!chat.lastMessageAt) return false;
        const seenAt = lastSeen[chat._id] ? new Date(lastSeen[chat._id]) : new Date(0);
        return new Date(chat.lastMessageAt) > seenAt;
      });
      setHasAnyUnread(anyUnread);
    } catch {
      
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    check(); 
    pollRef.current = setInterval(check, intervalMs);
    return () => clearInterval(pollRef.current);
  }, [check, intervalMs, userId]);

  return hasAnyUnread;
}
