export default function FormInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  rightElement,
  autoComplete,
  error,
  min,
  max,
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-text-primary dark:text-dark-text"
        >
          {label}
        </label>
        {rightElement}
      </div>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="
          w-full px-4 py-2.5 rounded-lg text-sm
          bg-bg-main dark:bg-dark-bg
          text-text-primary dark:text-dark-text
          border border-border dark:border-dark-border
          placeholder:text-text-muted
          focus:outline-none focus:border-primary focus:ring-0
          transition-colors
        "
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
