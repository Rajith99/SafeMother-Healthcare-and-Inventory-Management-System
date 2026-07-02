import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 1; 

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - delta && i <= page + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-xs text-text-muted">
        Page {page} of {totalPages}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="
            flex items-center justify-center w-8 h-8 rounded-lg text-sm
            border border-border dark:border-dark-border
            text-text-secondary dark:text-dark-text
            hover:bg-primary/8 hover:text-primary transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed
          "
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="w-8 text-center text-xs text-text-muted"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`
                flex items-center justify-center w-8 h-8 rounded-lg text-xs font-medium
                transition-colors
                ${
                  p === page
                    ? "bg-primary text-white"
                    : "border border-border dark:border-dark-border text-text-secondary dark:text-dark-text hover:bg-primary/8 hover:text-primary"
                }
              `}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="
            flex items-center justify-center w-8 h-8 rounded-lg text-sm
            border border-border dark:border-dark-border
            text-text-secondary dark:text-dark-text
            hover:bg-primary/8 hover:text-primary transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed
          "
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
