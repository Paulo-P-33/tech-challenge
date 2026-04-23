interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-6 px-4 sm:px-0">
      <span className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
        {total} {total === 1 ? "item" : "itens"}
      </span>
      <div className="flex items-center gap-1 order-1 sm:order-2 w-full sm:w-auto justify-center sm:justify-end">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors active:bg-gray-100"
          aria-label="Página anterior"
        >
          ‹
        </button>
        <span className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-700 font-medium">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors active:bg-gray-100"
          aria-label="Próxima página"
        >
          ›
        </button>
      </div>
    </div>
  );
}
