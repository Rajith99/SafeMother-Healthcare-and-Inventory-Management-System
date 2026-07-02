import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Brain, ArrowLeft, AlertTriangle, ShieldCheck,
  ListChecks, Lightbulb,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAiCheck } from "../../api/appointmentApiClient";
import { useAuth } from "../../context/useAuth";
import { MOTHER_NAV, MIDWIFE_NAV } from "../../config/navConfig";

const RISK_CONFIG = {
  LOW:    { label: "Low Risk",    bg: "bg-green-100 dark:bg-green-900/30",   text: "text-green-700 dark:text-green-400",  border: "border-green-300 dark:border-green-700",  dot: "bg-green-500",  emoji: "🟢" },
  MEDIUM: { label: "Medium Risk", bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", border: "border-yellow-300 dark:border-yellow-700", dot: "bg-yellow-500", emoji: "🟡" },
  HIGH:   { label: "High Risk",   bg: "bg-red-100 dark:bg-red-900/30",       text: "text-red-700 dark:text-red-400",       border: "border-red-300 dark:border-red-700",       dot: "bg-red-500",    emoji: "🔴" },
};

function SkeletonBlock({ h = "h-20" }) {
  return <div className={`animate-pulse ${h} rounded-xl bg-border dark:bg-dark-border`} />;
}

export default function AppointmentAiStatus() {
  const { id } = useParams();
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMidwife = userRole === "MIDWIFE";

  const navItems = isMidwife ? MIDWIFE_NAV : MOTHER_NAV;
  const backPath = isMidwife
    ? `/midwife/appointments/${id}`
    : `/dashboard/appointments/${id}`;

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAiCheck(id)
      .then((res) => setResult(res.data.data))
      .catch((err) => {
        const msg = err.response?.data?.message;
        setError(msg ?? "Failed to generate AI health status. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const risk = result ? RISK_CONFIG[result.aiCheck?.riskLevel] ?? RISK_CONFIG.MEDIUM : null;
  const ai = result?.aiCheck;

  return (
    <DashboardLayout navItems={navItems}>
      <div className="w-full max-w-2xl mx-auto">
        {}
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center gap-1.5 text-sm text-text-secondary dark:text-text-muted hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Appointment
        </button>

        {}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0">
            <Brain size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary dark:text-dark-text">
              AI Health Status
            </h1>
            <p className="text-sm text-text-secondary dark:text-text-muted">
              Gemini-powered quick check based on visit data
            </p>
          </div>
        </div>

        {}
        {loading && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                <span className="text-sm text-text-secondary dark:text-text-muted">
                  Analysing appointment with Gemini AI…
                </span>
              </div>
              <SkeletonBlock h="h-8" />
            </div>
            <SkeletonBlock h="h-28" />
            <SkeletonBlock h="h-24" />
            <SkeletonBlock h="h-16" />
          </div>
        )}

        {}
        {!loading && error && (
          <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-6 text-center">
            <AlertTriangle size={36} className="mx-auto text-red-400 mb-3" />
            <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
            <p className="text-xs text-red-500 dark:text-red-300 mt-1">
              Make sure the appointment is completed and the Gemini API key is configured.
            </p>
            <button
              onClick={() => { setLoading(true); setError(null); getAiCheck(id).then((res) => setResult(res.data.data)).catch((e) => setError(e.response?.data?.message ?? "Failed.")).finally(() => setLoading(false)); }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        )}

        {}
        {!loading && result && ai && (
          <div className="space-y-5">
            {}
            <div className={`rounded-xl border ${risk.border} ${risk.bg} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-1">
                    Risk Assessment
                  </p>
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full ${risk.dot} shrink-0`} />
                    <span className={`text-2xl font-bold ${risk.text}`}>
                      {risk.label}
                    </span>
                  </div>
                </div>
                <span className="text-4xl" aria-label={risk.label}>{risk.emoji}</span>
              </div>
            </div>

            {}
            <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-6">
              <h2 className="text-sm font-semibold text-text-primary dark:text-dark-text mb-3 flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" /> Summary
              </h2>
              <p className="text-sm text-text-secondary dark:text-text-muted leading-relaxed">
                {ai.patientFriendlySummary || "No summary available."}
              </p>
            </div>

            {}
            {ai.followUpAdvice && (
              <div className="rounded-xl border border-primary/25 bg-primary/5 dark:bg-primary/10 p-6">
                <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                  <Lightbulb size={16} /> Follow-Up Advice
                </h2>
                <p className="text-sm text-text-secondary dark:text-text-muted leading-relaxed">
                  {ai.followUpAdvice}
                </p>
              </div>
            )}

            {}
            {ai.missingInfo && ai.missingInfo.length > 0 && (
              <div className="rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 p-6">
                <h2 className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-3 flex items-center gap-2">
                  <ListChecks size={16} /> Missing Information
                </h2>
                <ul className="space-y-1.5">
                  {ai.missingInfo.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-orange-700 dark:text-orange-300">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {}
            <div className="rounded-xl border border-border dark:border-dark-border bg-bg-soft dark:bg-dark-surface/50 p-4">
              <p className="text-xs text-text-muted text-center leading-relaxed">
                ⚠ This AI analysis is generated by Gemini and is for informational purposes only.
                It is <strong>not a medical diagnosis</strong>. Always consult a qualified healthcare professional.
              </p>
            </div>

            {}
            {result.generatedAt && (
              <p className="text-center text-xs text-text-muted">
                Generated at {new Date(result.generatedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
