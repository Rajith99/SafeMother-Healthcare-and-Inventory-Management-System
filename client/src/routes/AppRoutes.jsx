import { lazy } from "react";

const LandingPage = lazy(() => import("../pages/LandingPage"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const NotFound = lazy(() => import("../pages/NotFound"));
const User = lazy(() => import("../pages/Mother"));
const Doctor = lazy(() => import("../pages/Doctor"));
const Midwife = lazy(() => import("../pages/Midwife"));
const DoctorPatients = lazy(() => import("../pages/DoctorPatients"));
const MidwifeMothers = lazy(() => import("../pages/MidwifeMothers"));
const AdminUsers = lazy(() => import("../pages/AdminUsers"));
const ProfileSettings = lazy(() => import("../pages/ProfileSettings"));
const MotherChatPage = lazy(() => import("../pages/MotherChatPage"));
const MidwifeChatPage = lazy(() => import("../pages/MidwifeChatPage"));
const DoctorChatPage = lazy(() => import("../pages/DoctorChatPage"));
const MotherPregnancy = lazy(() => import("../pages/MotherPregnancy"));
const AdminAnalytics = lazy(() => import("../pages/AdminAnalytics"));

const MotherAppointments     = lazy(() => import("../pages/appointment/MotherAppointments"));
const BookAppointment        = lazy(() => import("../pages/appointment/BookAppointment"));
const AppointmentDetail      = lazy(() => import("../pages/appointment/AppointmentDetail"));
const MidwifeAppointments    = lazy(() => import("../pages/appointment/MidwifeAppointments"));
const MidwifeAppointmentDetail = lazy(() => import("../pages/appointment/MidwifeAppointmentDetail"));
const DoctorAppointments     = lazy(() => import("../pages/appointment/DoctorAppointments"));
const AppointmentAiStatus    = lazy(() => import("../pages/appointment/AppointmentAiStatus"));
const SmartReorderDashboard = lazy(() => import("../components/SmartReorderDashboard"));

export const appRoutes = [
  {
    path: "/",
    component: LandingPage,
    requiresAuth: false,
    hideChrome: true,
  },
  {
    path: "/login",
    component: Login,
    requiresAuth: false,
    publicOnly: true,
    hideChrome: true,
  },
  {
    path: "/register",
    component: Register,
    requiresAuth: false,
    publicOnly: true,
    hideChrome: true,
  },
  {
    path: "/forgot-password",
    component: ForgotPassword,
    requiresAuth: false,
    publicOnly: true,
    hideChrome: true,
  },
  {
    path: "/reset-password",
    component: ResetPassword,
    requiresAuth: false,
    publicOnly: true,
    hideChrome: true,
  },
    {
    path: "/admin",
    component: AdminAnalytics,
    requiresAuth: true,
    allowedRoles: ["ADMIN"],
    hideChrome: true,
  },
  {
    path: "/dashboard",
    component: User,
    requiresAuth: true,
    allowedRoles: ["MOTHER"],
    hideChrome: true,
  },
  {
    path: "/doctor",
    component: Doctor,
    requiresAuth: true,
    allowedRoles: ["DOCTOR"],
    hideChrome: true,
  },
  {
    path: "/doctor/patients",
    component: DoctorPatients,
    requiresAuth: true,
    allowedRoles: ["DOCTOR"],
    hideChrome: true,
  },
  {
    path: "/midwife",
    component: Midwife,
    requiresAuth: true,
    allowedRoles: ["MIDWIFE"],
    hideChrome: true,
  },

  
  {
    path: "/dashboard/appointments",
    component: MotherAppointments,
    requiresAuth: true,
    allowedRoles: ["MOTHER"],
    hideChrome: true,
  },
  {
    path: "/dashboard/appointments/new",
    component: BookAppointment,
    requiresAuth: true,
    allowedRoles: ["MOTHER"],
    hideChrome: true,
  },
  {
    path: "/dashboard/appointments/:id/ai-status",
    component: AppointmentAiStatus,
    requiresAuth: true,
    allowedRoles: ["MOTHER"],
    hideChrome: true,
  },
  {
    path: "/dashboard/appointments/:id",
    component: AppointmentDetail,
    requiresAuth: true,
    allowedRoles: ["MOTHER"],
    hideChrome: true,
  },

  
  {
    path: "/midwife/appointments",
    component: MidwifeAppointments,
    requiresAuth: true,
    allowedRoles: ["MIDWIFE"],
    hideChrome: true,
  },
  {
    path: "/midwife/appointments/:id/ai-status",
    component: AppointmentAiStatus,
    requiresAuth: true,
    allowedRoles: ["MIDWIFE"],
    hideChrome: true,
  },
  {
    path: "/midwife/appointments/:id",
    component: MidwifeAppointmentDetail,
    requiresAuth: true,
    allowedRoles: ["MIDWIFE"],
    hideChrome: true,
  },

  
  {
    path: "/doctor/appointments",
    component: DoctorAppointments,
    requiresAuth: true,
    allowedRoles: ["DOCTOR"],
    hideChrome: true,
  },

  {
    path: "/midwife/mothers",
    component: MidwifeMothers,
    requiresAuth: true,
    allowedRoles: ["MIDWIFE"],
    hideChrome: true,
  },
  {
    path: "/admin/users",
    component: AdminUsers,
    requiresAuth: true,
    allowedRoles: ["ADMIN"],
    hideChrome: true,
  },
  {
    path: "/admin/settings",
    component: ProfileSettings,
    requiresAuth: true,
    allowedRoles: ["ADMIN"],
    hideChrome: true,
  },
  {
    path: "/dashboard/settings",
    component: ProfileSettings,
    requiresAuth: true,
    allowedRoles: ["MOTHER"],
    hideChrome: true,
  },
  {
    path: "/dashboard/messages",
    component: MotherChatPage,
    requiresAuth: true,
    allowedRoles: ["MOTHER"],
    hideChrome: true,
  },
  {
    path: "/dashboard/pregnancy",
    component: MotherPregnancy,
    requiresAuth: true,
    allowedRoles: ["MOTHER"],
    hideChrome: true,
  },
  {
    path: "/doctor/settings",
    component: ProfileSettings,
    requiresAuth: true,
    allowedRoles: ["DOCTOR"],
    hideChrome: true,
  },
  {
    path: "/doctor/messages",
    component: DoctorChatPage,
    requiresAuth: true,
    allowedRoles: ["DOCTOR"],
    hideChrome: true,
  },
  {
    path: "/midwife/settings",
    component: ProfileSettings,
    requiresAuth: true,
    allowedRoles: ["MIDWIFE"],
    hideChrome: true,
  },
  {
    path: "/midwife/messages",
    component: MidwifeChatPage,
    requiresAuth: true,
    allowedRoles: ["MIDWIFE"],
    hideChrome: true,
  },
  {
    path: "/admin/inventory",
    component: SmartReorderDashboard,
    requiresAuth: true,
    allowedRoles: ["ADMIN"],
    hideChrome: true,
  },
  {
    path: "*",
    component: NotFound,
    requiresAuth: false,
    hideChrome: true,
  },
];

