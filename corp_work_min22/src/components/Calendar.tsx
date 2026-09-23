"use client";

import { useMemo } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronDown, ChevronLeft, ChevronRight, GlobeIcon } from "./Icons";

type Props = {
  viewDate: Date;
  onViewDateChange: (date: Date) => void;
  selectedDate: string | null;
  availableDates: Set<string>;
  onSelectDate: (dateStr: string) => void;
  timeZoneLabel: string;
  timeZoneOptions: { value: string; label: string }[];
  timeZone: string;
  onTimeZoneChange: (tz: string) => void;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function Calendar({
  viewDate,
  onViewDateChange,
  selectedDate,
  availableDates,
  onSelectDate,
  timeZoneLabel,
  timeZoneOptions,
  timeZone,
  onTimeZoneChange,
}: Props) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [viewDate]);

  return (
    <div className="flex min-w-0 flex-1 flex-col p-6 sm:p-8">
      <h2 className="text-xl font-bold text-[#0b3558]">Select a Date & Time</h2>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onViewDateChange(addMonths(viewDate, -1))}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#0069ff] hover:bg-[#e6f0ff]"
          aria-label="Previous month"
        >
          <ChevronLeft />
        </button>
        <p className="text-[15px] font-semibold text-[#0b3558]">
          {format(viewDate, "MMMM yyyy")}
        </p>
        <button
          type="button"
          onClick={() => onViewDateChange(addMonths(viewDate, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#0069ff] hover:bg-[#e6f0ff]"
          aria-label="Next month"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-y-2 text-center">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2 text-xs font-medium text-[#8b8b8b]">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, viewDate);
          const available = inMonth && availableDates.has(key);
          const selected = selectedDate === key;

          return (
            <div key={key} className="flex justify-center py-0.5">
              <button
                type="button"
                disabled={!available}
                onClick={() => onSelectDate(key)}
                className={[
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition",
                  !inMonth && "invisible",
                  available && !selected && "bg-[#e6f0ff] text-[#0069ff] hover:bg-[#d4e6ff]",
                  selected && "bg-[#0069ff] text-white",
                  !available && inMonth && "cursor-default text-[#c8c8c8]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {format(day, "d")}
              </button>
            </div>
          );
        })}
      </div>

      <div className="relative mt-8 inline-flex max-w-full items-center gap-2 text-[14px] text-[#1a1a1a]">
        <GlobeIcon className="h-4 w-4 shrink-0 text-[#6e6e6e]" />
        <label className="sr-only" htmlFor="timezone">
          Time zone
        </label>
        <select
          id="timezone"
          value={timeZone}
          onChange={(e) => onTimeZoneChange(e.target.value)}
          className="max-w-[280px] cursor-pointer appearance-none bg-transparent pr-6 font-medium outline-none"
        >
          {!timeZoneOptions.some((o) => o.value === timeZone) && (
            <option value={timeZone}>{timeZoneLabel}</option>
          )}
          {timeZoneOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 h-3.5 w-3.5 text-[#6e6e6e]" />
      </div>
      <p className="mt-1 pl-6 text-xs text-[#8b8b8b]">{timeZoneLabel}</p>
    </div>
  );
}

export function isSameCalendarDay(a: Date, b: Date) {
  return isSameDay(a, b);
}
