import ChatPage from "./ChatPage";
import { MIDWIFE_NAV } from "../config/navConfig";

export default function MidwifeChatPage() {
  return <ChatPage navItems={MIDWIFE_NAV} title="Messages" />;
}
