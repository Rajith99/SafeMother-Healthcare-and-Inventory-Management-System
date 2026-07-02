import { useEffect, useRef, useState } from "react";

export default function UserSearchSelect({
  label,
  placeholder,
  selectedUser,
  onSelect,
  searchUsers,
  noResultsText,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (selectedUser?.fullName) {
      setQuery(selectedUser.fullName);
    } else {
      setQuery("");
    }
  }, [selectedUser?._id, selectedUser?.fullName]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();

    if (!open) return;
    if (selectedUser && trimmed === selectedUser.fullName) {
      setResults([]);
      return;
    }

    let active = true;
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        
        const items = await searchUsers(trimmed);
        if (!active) return;
        setResults(items || []);
        setHasSearched(true);
      } catch {
        if (!active) return;
        setResults([]);
        setHasSearched(true);
      } finally {
        if (active) setLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [open, query, searchUsers, selectedUser]);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    setOpen(true);
    if (selectedUser) {
      onSelect(null);
    }
  };

  const handleSelect = (item) => {
    onSelect(item);
    setQuery(item.fullName || "");
    setOpen(false);
    setResults([]);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-text-primary dark:text-dark-text mb-1.5">
        {label}
      </label>
      <input
        value={query}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg text-sm bg-bg-main dark:bg-dark-bg text-text-primary dark:text-dark-text border border-border dark:border-dark-border placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
      />

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface shadow-sm overflow-hidden">
          {loading && (
            <div className="px-3 py-2 text-sm text-text-muted">
              Searching...
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <div className="px-3 py-2 text-sm text-text-muted">
              {noResultsText}
            </div>
          )}

          {!loading && results.length > 0 && (
            <ul className="max-h-56 overflow-y-auto">
              {results.map((item) => (
                <li key={item._id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-3 py-2 hover:bg-bg-main dark:hover:bg-dark-bg transition-colors"
                  >
                    <p className="text-sm font-medium text-text-primary dark:text-dark-text">
                      {item.fullName}
                    </p>
                    <p className="text-xs text-text-muted">
                      {item.email || item.role}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
