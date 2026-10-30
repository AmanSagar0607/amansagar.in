"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownUp, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type Column = { key: string; label: string; sortable?: boolean };
export type AdminTableRow = {
  id: string;
  href: string;
  values: Record<string, string>;
};

/** A reusable content list; its rows come from the authenticated server page. */
export function ContentTable({
  columns,
  rows,
  filters = [],
  emptyMessage = "No content found.",
}: {
  columns: Column[];
  rows: AdminTableRow[];
  filters?: { key: string; label: string; options: string[] }[];
  emptyMessage?: string;
}) {
  const [query, setQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string>
  >({});
  const [sort, setSort] = useState<{ key: string; ascending: boolean } | null>(
    null,
  );
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    const matching = rows.filter(
      (row) =>
        Object.values(row.values).some((value) =>
          value.toLocaleLowerCase().includes(term),
        ) &&
        Object.entries(selectedFilters).every(
          ([key, value]) => !value || row.values[key] === value,
        ),
    );
    if (!sort) return matching;
    return [...matching].sort(
      (a, b) =>
        (a.values[sort.key] || "").localeCompare(
          b.values[sort.key] || "",
          undefined,
          { numeric: true, sensitivity: "base" },
        ) * (sort.ascending ? 1 : -1),
    );
  }, [query, rows, sort, selectedFilters]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  return (
    <div className="space-y-4">
      <label className="relative block max-w-sm">
        <span className="sr-only">Search content</span>
        <Search
          aria-hidden
          className="text-muted-foreground absolute top-3 left-3 size-4"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
          placeholder="Search content"
          className="border-input bg-background focus-visible:ring-ring min-h-10 w-full rounded-md border py-2 pr-3 pl-10 text-sm focus-visible:ring-2 focus-visible:outline-none"
        />
      </label>
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => (
            <label
              key={filter.key}
              className="text-muted-foreground flex items-center gap-2 text-sm"
            >
              {filter.label}
              <select
                value={selectedFilters[filter.key] || ""}
                onChange={(event) => {
                  setSelectedFilters((current) => ({
                    ...current,
                    [filter.key]: event.target.value,
                  }));
                  setPage(0);
                }}
                className="border-input bg-background min-h-10 rounded-md border px-3 text-sm"
              >
                <option value="">All</option>
                {filter.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}
      <div className="border-border overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-4 py-3 font-medium"
                  aria-sort={
                    sort?.key === column.key
                      ? sort.ascending
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className="hover:text-foreground inline-flex min-h-8 items-center gap-2"
                      onClick={() => {
                        setSort((current) => ({
                          key: column.key,
                          ascending:
                            current?.key === column.key
                              ? !current.ascending
                              : true,
                        }));
                        setPage(0);
                      }}
                    >
                      {column.label}
                      <ArrowDownUp className="size-3" aria-hidden />
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr className="border-border border-t" key={row.id}>
                {columns.map((column, index) => (
                  <td className="px-4 py-3" key={column.key}>
                    {index === 0 ? (
                      <Link
                        className="text-foreground font-medium underline-offset-4 hover:underline focus-visible:outline-2"
                        href={row.href}
                      >
                        {row.values[column.key]}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">
                        {row.values[column.key]}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length && (
          <p className="text-muted-foreground px-4 py-10 text-center text-sm">
            {emptyMessage}
          </p>
        )}
      </div>
      <div
        className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 text-sm"
        aria-live="polite"
      >
        <span>
          {filtered.length} {filtered.length === 1 ? "result" : "results"}
        </span>
        <div className="flex items-center gap-2">
          <span>
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous page"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next page"
            disabled={currentPage + 1 >= totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
