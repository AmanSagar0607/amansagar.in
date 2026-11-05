"use client";

import { useMemo, useState } from "react";
import { endOfMonth, format, parseISO, startOfMonth, subMonths } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DashboardMetrics } from "@/lib/admin/dashboard";

type PublicationMonth = {
  month: string;
  label: string;
  posts: number;
  activities: number;
};

const panel = "min-w-0 rounded-xl border border-white/[0.08] bg-[#101011]";
const count = (value: number) => value.toLocaleString("en-US");

export function DashboardPublishingChart({
  metrics,
}: {
  metrics: DashboardMetrics;
}) {
  const hasPosts = !!metrics.monthlyPublications;
  const allMonths: PublicationMonth[] =
    metrics.monthlyPublications ??
    metrics.monthlyActivity.map((month) => ({
      ...month,
      posts: 0,
      activities: month.count,
    }));
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const lastMonth = allMonths.at(-1)?.month;
    const firstMonth = allMonths.at(-6)?.month ?? allMonths.at(0)?.month;
    return {
      from: firstMonth ? startOfMonth(parseISO(`${firstMonth}-01`)) : undefined,
      to: lastMonth ? endOfMonth(parseISO(`${lastMonth}-01`)) : undefined,
    };
  });
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const months = useMemo(
    () =>
      allMonths.filter((month) => {
        const date = parseISO(`${month.month}-01`);
        return (
          (!dateRange.from || endOfMonth(date) >= startOfMonth(dateRange.from)) &&
          (!dateRange.to || startOfMonth(date) <= endOfMonth(dateRange.to))
        );
      }),
    [allMonths, dateRange],
  );
  const selected = months.find((month) => month.month === selectedMonth);
  const postTotal = months.reduce((total, month) => total + month.posts, 0);
  const activityTotal = months.reduce(
    (total, month) => total + month.activities,
    0,
  );
  const maximum = Math.max(
    4,
    Math.ceil(
      Math.max(
        0,
        ...months.flatMap((month) => [month.posts, month.activities]),
      ) / 4,
    ) * 4,
  );
  const dateLabel = dateRange.from
    ? `${format(dateRange.from, "MMM d, yyyy")} – ${dateRange.to ? format(dateRange.to, "MMM d, yyyy") : "Choose end date"}`
    : "Choose date range";
  const setPreset = (monthsBack: number) => {
    const lastMonth = allMonths.at(-1)?.month;
    if (!lastMonth) return;
    const end = parseISO(`${lastMonth}-01`);
    setDateRange({
      from: startOfMonth(subMonths(end, monthsBack - 1)),
      to: endOfMonth(end),
    });
    setSelectedMonth(null);
  };
  const isEmpty = postTotal + activityTotal === 0;

  return (
    <section
      className={`${panel} flex flex-col p-5 sm:p-6`}
      aria-labelledby="publishing-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="publishing-heading"
            className="text-base font-medium tracking-tight text-zinc-100"
          >
            Publishing activity
          </h2>
          <p className="mt-1 text-xs leading-5 text-zinc-400">
            Posts and published journey entries by publication month.
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              aria-label={`Choose publication date range. Current range: ${dateLabel}`}
              className="h-auto min-h-9 max-w-full justify-start gap-2 border-white/[0.08] bg-transparent px-2.5 py-2 text-left text-[11px] font-normal text-zinc-300 hover:bg-white/[0.04]"
            >
              <CalendarDays className="size-3.5 shrink-0 text-zinc-400" aria-hidden />
              <span className="truncate">{dateLabel}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto max-w-[calc(100vw-2rem)] p-0">
            <div className="border-b border-border p-3">
              <p className="mb-2 text-[11px] font-medium text-muted-foreground">
                Quick ranges
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[3, 6, 12].map((monthsBack) => (
                  <Button
                    key={monthsBack}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-[11px]"
                    onClick={() => setPreset(monthsBack)}
                  >
                    Last {monthsBack} months
                  </Button>
                ))}
              </div>
            </div>
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => {
                setDateRange(range ?? { from: undefined, to: undefined });
                setSelectedMonth(null);
              }}
              defaultMonth={dateRange.from}
              disabled={
                allMonths.length
                  ? {
                      after: endOfMonth(
                        parseISO(`${allMonths.at(-1)!.month}-01`),
                      ),
                    }
                  : undefined
              }
              numberOfMonths={1}
              className="rounded-lg border-0 bg-transparent"
            />
            <div className="border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
              Monthly totals include every month touched by this date range.
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
        {hasPosts && (
          <div className="flex items-baseline gap-2.5">
            <span className="size-2 rounded-sm bg-zinc-500" aria-hidden />
            <span className="text-2xl font-semibold tracking-tight text-zinc-100 tabular-nums">
              {count(postTotal)}
            </span>
            <span className="text-xs text-zinc-400">blog posts</span>
          </div>
        )}
        <div className="flex items-baseline gap-2.5">
          <span className="size-2 rounded-sm bg-orange-400" aria-hidden />
          <span className="text-2xl font-semibold tracking-tight text-zinc-100 tabular-nums">
            {count(activityTotal)}
          </span>
          <span className="text-xs text-zinc-400">public journey</span>
        </div>
      </div>
      <div className="mt-6 grid min-w-0 grid-cols-[1.5rem_minmax(0,1fr)] gap-3">
        <div
          className="relative h-48 text-right text-[10px] text-zinc-400 tabular-nums sm:h-56"
          aria-hidden
        >
          {[4, 3, 2, 1, 0].map((tick, index) => (
            <span
              key={tick}
              className="absolute right-0 -translate-y-1/2"
              style={{ top: `${8 + index * 21}%` }}
            >
              {(maximum * tick) / 4}
            </span>
          ))}
        </div>
        <div className="min-w-0">
          <svg
            className="h-48 w-full overflow-visible sm:h-56"
            viewBox="0 0 600 200"
            preserveAspectRatio="none"
            role="img"
            aria-labelledby="publication-chart-title publication-chart-description"
          >
            <title id="publication-chart-title">
              Publications from {dateLabel}
            </title>
            <desc id="publication-chart-description">
              {months
                .map(
                  (month) =>
                    `${month.label}: ${hasPosts ? `${month.posts} posts, ` : ""}${month.activities} journey updates`,
                )
                .join(". ")}
              . Drafts, private, sample and future content are excluded.
            </desc>
            {[0, 1, 2, 3, 4].map((tick) => (
              <line
                key={tick}
                x1="0"
                x2="600"
                y1={16 + tick * 42}
                y2={16 + tick * 42}
                stroke="rgba(255,255,255,0.07)"
                strokeDasharray={tick === 4 ? undefined : "3 5"}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {months.map((month, index) => {
              const unit = 600 / Math.max(1, months.length);
              const middle = unit * (index + 0.5);
              const barWidth = Math.min(20, unit * 0.2);
              const active = month.month === selectedMonth;
              return (
                <g key={month.month}>
                  {active && (
                    <rect
                      x={middle - unit * 0.42}
                      y="8"
                      width={unit * 0.84}
                      height="184"
                      rx="5"
                      fill="rgba(255,255,255,0.035)"
                    />
                  )}
                  {hasPosts && month.posts > 0 && (
                    <rect
                      x={middle - barWidth - 3}
                      y={184 - (month.posts / maximum) * 168}
                      width={barWidth}
                      height={(month.posts / maximum) * 168}
                      rx="3"
                      fill={active ? "#a1a1aa" : "#71717a"}
                    >
                      <title>
                        {month.label}: {month.posts} posts
                      </title>
                    </rect>
                  )}
                  {month.activities > 0 && (
                    <rect
                      x={hasPosts ? middle + 3 : middle - barWidth / 2}
                      y={184 - (month.activities / maximum) * 168}
                      width={barWidth}
                      height={(month.activities / maximum) * 168}
                      rx="3"
                      fill={active ? "#fdba74" : "#fb923c"}
                    >
                      <title>
                        {month.label}: {month.activities} journey updates
                      </title>
                    </rect>
                  )}
                  {month.posts === 0 && month.activities === 0 && (
                    <circle
                      cx={middle}
                      cy="184"
                      r={active ? 3 : 2}
                      fill={active ? "#fdba74" : "#52525b"}
                    >
                      <title>{month.label}: no public content</title>
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>
          <div
            className="mt-2 grid text-center"
            style={{
              gridTemplateColumns: `repeat(${Math.max(1, months.length)}, minmax(0,1fr))`,
            }}
            aria-label="Select a month to inspect"
          >
            {months.map((month) => (
              <button
                key={month.month}
                type="button"
                onClick={() =>
                  setSelectedMonth((current) =>
                    current === month.month ? null : month.month,
                  )
                }
                aria-pressed={selectedMonth === month.month}
                className={`min-w-0 rounded px-0.5 py-1 text-[10px] text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-orange-400 sm:text-[11px] ${selectedMonth === month.month ? "bg-white/[0.06] text-white" : ""}`}
              >
                {month.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
      {selected && (
        <div
          className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-white/[0.025] px-4 py-3"
          aria-live="polite"
        >
          <p className="text-xs font-medium text-zinc-200">{selected.label}</p>
          <div className="flex gap-5 text-xs text-zinc-400">
            {hasPosts && (
              <span>
                <strong className="font-semibold text-zinc-100 tabular-nums">
                  {count(selected.posts)}
                </strong>{" "}
                posts
              </span>
            )}
            <span>
              <strong className="font-semibold text-orange-300 tabular-nums">
                {count(selected.activities)}
              </strong>{" "}
              journey entries
            </span>
          </div>
        </div>
      )}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
        <p className="max-w-sm text-[11px] leading-5 text-zinc-400">
          {isEmpty
            ? "No public content in this period. Your next publication will appear here."
            : "Posts and journey entries are counted independently. Drafts, private and sample content are excluded."}
        </p>
        <details className="group text-[11px] text-zinc-400">
          <summary className="cursor-pointer rounded-sm underline-offset-4 hover:text-zinc-200 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400">
            View monthly data
          </summary>
          <div className="mt-3">
            <table className="w-full text-left text-xs">
              <caption className="sr-only">
                Monthly public content counts
              </caption>
              <thead>
                <tr>
                  <th className="pr-4 pb-2 font-medium">Month</th>
                  {hasPosts && <th className="pr-4 pb-2 font-medium">Posts</th>}
                  <th className="pb-2 font-medium">Journey</th>
                </tr>
              </thead>
              <tbody>
                {months.map((month) => (
                  <tr key={month.month}>
                    <th className="py-1 pr-4 font-normal">{month.label}</th>
                    {hasPosts && (
                      <td className="pr-4 tabular-nums">{month.posts}</td>
                    )}
                    <td className="tabular-nums">{month.activities}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </section>
  );
}
