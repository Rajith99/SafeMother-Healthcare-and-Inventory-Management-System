import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Settings,
  BarChart3,
  HeartPulse,
  CalendarDays,
  MessageCircle,
  Baby,
  ClipboardList,
  Stethoscope,
  HeartHandshake,
  ClipboardCheck,
} from "lucide-react";

export const ADMIN_NAV = [
  { label: "Overview",  path: "/admin",          icon: <LayoutDashboard size={18} /> },
  { label: "Users",     path: "/admin/users",     icon: <Users size={18} /> },
  { label: "Settings",  path: "/admin/settings",  icon: <Settings size={18} /> },
];

export const MOTHER_NAV = [
  { label: "Overview",     path: "/dashboard",              icon: <HeartPulse size={18} /> },
  { label: "Pregnancy",    path: "/dashboard/pregnancy",    icon: <Baby size={18} /> },
  { label: "Appointments", path: "/dashboard/appointments", icon: <CalendarDays size={18} /> },
  { label: "Messages",     path: "/dashboard/messages",     icon: <MessageCircle size={18} /> },
  { label: "Settings",     path: "/dashboard/settings",     icon: <Settings size={18} /> },
];

export const DOCTOR_NAV = [
  { label: "Overview",     path: "/doctor",              icon: <Stethoscope size={18} /> },
  { label: "My Patients",  path: "/doctor/patients",     icon: <Users size={18} /> },
  { label: "Appointments", path: "/doctor/appointments", icon: <CalendarDays size={18} /> },
  { label: "Messages",     path: "/doctor/messages",     icon: <MessageCircle size={18} /> },
  { label: "Settings",     path: "/doctor/settings",     icon: <Settings size={18} /> },
];

export const MIDWIFE_NAV = [
  { label: "Overview",     path: "/midwife",              icon: <HeartHandshake size={18} /> },
  { label: "My Mothers",   path: "/midwife/mothers",      icon: <Users size={18} /> },
  { label: "Appointments", path: "/midwife/appointments", icon: <CalendarDays size={18} /> },
  { label: "Messages",     path: "/midwife/messages",     icon: <MessageCircle size={18} /> },
  { label: "Settings",     path: "/midwife/settings",     icon: <Settings size={18} /> },
];
