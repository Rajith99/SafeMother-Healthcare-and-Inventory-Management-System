import { useState, useEffect, useCallback } from "react";
import { getTipsForCurrentWeek } from "../../api/tipApi";


function HeartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  );
}

function RefreshIcon({ spinning }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={`w-4 h-4 transition-transform duration-500 ${spinning ? "animate-spin" : ""}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
    </svg>
  );
}



function pickRandom(arr, currentIndex = -1) {
  if (arr.length === 0) return { item: null, index: -1 };
  if (arr.length === 1) return { item: arr[0], index: 0 };
  let idx;
  do { idx = Math.floor(Math.random() * arr.length); } while (idx === currentIndex);
  return { item: arr[idx], index: idx };
}


export default function PregnancyTipCard() {
  const [tips, setTips]               = useState([]);    
  const [tipIndex, setTipIndex]       = useState(-1);    
  const [tip, setTip]                 = useState(null);  
  const [week, setWeek]               = useState(null);  
  const [showWeekBadge, setShowWeekBadge] = useState(false); 
  const [loading, setLoading]         = useState(true);
  const [spinning, setSpinning]       = useState(false);
  const [error, setError]             = useState(null);
  const [fadeIn, setFadeIn]           = useState(false);

  
  const loadWeekTips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTipsForCurrentWeek();
      const { data: weekTips, week: weekNum, showWeekBadge: showBadge } = res.data;
      setTips(weekTips);
      setWeek(weekNum);
      setShowWeekBadge(!!showBadge);
      const { item, index } = pickRandom(weekTips);
      setTip(item);
      setTipIndex(index);
      setFadeIn(true);
    } catch {
      setError("Couldn't load tips for your week. Try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadWeekTips(); }, [loadWeekTips]);

  
  const handleNewTip = useCallback(async () => {
    if (spinning || tips.length === 0) return;
    setSpinning(true);
    setFadeIn(false);
    await new Promise((r) => setTimeout(r, 400));
    const { item, index } = pickRandom(tips, tipIndex);
    setTip(item);
    setTipIndex(index);
    setFadeIn(true);
    setSpinning(false);
  }, [spinning, tips, tipIndex]);

  
  if (loading) {
    return (
      <div className="rounded-2xl border border-primary/20 dark:border-primary/30 bg-gradient-to-br from-bg-card to-primary-soft/10 dark:from-dark-surface dark:to-primary/5 p-5 shadow-sm animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 dark:bg-primary/30" />
          <div className="h-3.5 w-32 rounded-full bg-primary/20 dark:bg-primary/30" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded-full bg-primary/10 dark:bg-primary/20" />
          <div className="h-3 w-5/6 rounded-full bg-primary/10 dark:bg-primary/20" />
          <div className="h-3 w-4/6 rounded-full bg-primary/10 dark:bg-primary/20" />
        </div>
      </div>
    );
  }

  
  if (error) {
    return (
      <div className="rounded-2xl border border-primary/20 dark:border-primary/30 bg-bg-card dark:bg-dark-surface p-5 shadow-sm text-center">
        <p className="text-sm text-text-secondary dark:text-text-muted mb-3">{error}</p>
        <button
          onClick={loadWeekTips}
          className="text-sm font-medium text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border border-primary/20 dark:border-primary/30
        bg-gradient-to-br from-bg-card via-primary-soft/10 to-bg-soft/40
        dark:from-dark-surface dark:via-primary/5 dark:to-dark-bg
        shadow-sm transition-all duration-500
        ${fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
      `}
    >
      {}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary/10 dark:bg-primary/8 blur-2xl"
      />

      <div className="relative p-5">
        {}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/15 dark:bg-primary/20 text-primary">
              <HeartIcon />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Weekly Tip
              </p>
              {tip?.category && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-muted dark:text-text-muted mt-0.5">
                  <SparkleIcon />
                  {tip.category}
                </span>
              )}
            </div>
          </div>

          {}
          <button
            onClick={handleNewTip}
            disabled={spinning || tips.length <= 1}
            aria-label="Get another tip for this week"
            title="Get another tip for this week"
            className="
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
              border border-primary/25 dark:border-primary/35
              text-primary-soft dark:text-primary
              bg-primary/8 dark:bg-primary/10
              hover:bg-primary/15 dark:hover:bg-primary/20
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
            "
          >
            <RefreshIcon spinning={spinning} />
            New tip
          </button>
        </div>

        {}
        {tip?.title && (
          <p className="text-xs font-semibold text-text-secondary dark:text-text-muted mb-1">
            {tip.title}
          </p>
        )}

        {}
        <blockquote className="mt-1">
          <p className="text-sm md:text-[15px] leading-relaxed text-text-primary dark:text-dark-text font-medium">
            {tip?.tip ?? tip?.content ?? tip?.text ?? (typeof tip === "string" ? tip : JSON.stringify(tip))}
          </p>
        </blockquote>

        {}
        {showWeekBadge && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 dark:bg-accent/15 text-accent text-xs font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Week {week}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
