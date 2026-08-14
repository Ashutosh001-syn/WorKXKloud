import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, pageSize, total, onPageChange }) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startRecord = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const endRecord = Math.min(page * pageSize, total);
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

    return (
        <div className="flex flex-wrap items-center justify-between gap-y-2 border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-500">
                Showing <span className="font-medium text-slate-700">{startRecord}</span> to{" "}
                <span className="font-medium text-slate-700">{endRecord}</span> of{" "}
                <span className="font-medium text-slate-700">{total}</span> resources
            </p>

            <div className="flex items-center gap-1">
                <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeft size={15} />
                </button>

                {pageNumbers.map((pageNumber) => (
                    <button
                        key={pageNumber}
                        type="button"
                        onClick={() => onPageChange(pageNumber)}
                        className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition ${
                            pageNumber === page ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        {pageNumber}
                    </button>
                ))}

                <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => onPageChange(page + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronRight size={15} />
                </button>
            </div>
        </div>
    );
}
