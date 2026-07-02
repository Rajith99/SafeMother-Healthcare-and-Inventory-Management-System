import ChatPage from "./ChatPage";
import { MOTHER_NAV } from "../config/navConfig";

export default function MotherChatPage() {
  return <ChatPage navItems={MOTHER_NAV} title="Messages" />;
}
