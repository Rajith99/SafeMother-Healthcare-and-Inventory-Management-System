const STRENGTH_MAP = {
  Weak:   { width: "w-1/3", bar: "bg-red-400",     text: "text-red-500"  },
  Medium: { width: "w-2/3", bar: "bg-yellow-400",  text: "text-yellow-500" },
  Strong: { width: "w-full", bar: "bg-accent",      text: "text-accent"   },
};

export default function PasswordStrengthBar({ strength }) {
  if (!strength) return null;
  const { width, bar, text } = STRENGTH_MAP[strength] ?? STRENGTH_MAP.Weak;

  return (
    <div className="mt-2">
      <div className="h-1 w-full rounded-full bg-border dark:bg-dark-border overflow-hidden">
        <div
          className={`h-1 rounded-full transition-all duration-300 ${bar} ${width}`}
        />
      </div>
      <p className={`mt-1 text-xs ${text}`}>Strength: {strength}</p>
    </div>
  );
}
