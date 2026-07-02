import ChatPage from "./ChatPage";
import { DOCTOR_NAV } from "../config/navConfig";

export default function DoctorChatPage() {
  return <ChatPage navItems={DOCTOR_NAV} title="Messages" />;
}
