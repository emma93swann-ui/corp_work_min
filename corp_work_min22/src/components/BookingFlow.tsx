"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, parse } from "date-fns";
import type { EventConfig } from "@/lib/config";
import type { TimeSlot } from "@/lib/slots";
import {
  formatSlotRange,
  getLocalTimeLabel,
  getTimezoneDisplayName,
} from "@/lib/slots";
import { Calendar } from "./Calendar";
import { EnterDetails } from "./EnterDetails";
import { EventSidebar } from "./EventSidebar";
import { Spinner } from "./Spinner";
import { TimeSlots } from "./TimeSlots";

const SPINNER_MS = 2000;

const COMMON_TIMEZONES = [
  "Europe/Moscow",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Kyiv",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "Asia/Dubai",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
  "UTC",
];

type Step = "calendar" | "details";
type LoadPhase = "idle" | "date" | "time";

type Props = {
  initialConfig: EventConfig;
};

export function BookingFlow({ initialConfig }: Props) {
  const [config] = useState(initialConfig);
  const [step, setStep] = useState<Step>("calendar");
  const [loadPhase, setLoadPhase] = useState<LoadPhase>("idle");
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [timeZone, setTimeZone] = useState("Europe/Moscow");
  const [clock, setClock] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/timezone");
        const data = (await res.json()) as { timeZone?: string };
        if (!cancelled && data.timeZone) setTimeZone(data.timeZone);
      } catch {
        const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (!cancelled && browserTz) setTimeZone(browserTz);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const tick = () => setClock(getLocalTimeLabel(timeZone));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [timeZone]);

  const fetchAvailableDates = useCallback(async () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth() + 1;
    const res = await fetch(
      `/api/slots?year=${year}&month=${month}&tz=${encodeURIComponent(timeZone)}`,
    );
    const data = (await res.json()) as { dates?: string[] };
    setAvailableDates(new Set(data.dates || []));
  }, [viewDate, timeZone]);

  useEffect(() => {
    void fetchAvailableDates();
  }, [fetchAvailableDates]);

  const timeZoneOptions = useMemo(
    () =>
      COMMON_TIMEZONES.map((tz) => ({
        value: tz,
        label: `${getTimezoneDisplayName(tz)} (${tz})`,
      })),
    [],
  );

  const timeZoneLabel = useMemo(() => {
    const label = getTimezoneDisplayName(timeZone);
    return clock ? `${label} (${clock})` : label;
  }, [timeZone, clock]);

  const dateLabel = useMemo(() => {
    if (!selectedDate) return "";
    const d = parse(selectedDate, "yyyy-MM-dd", new Date());
    return format(d, "EEEE, MMMM d");
  }, [selectedDate]);

  const selectedSummary = useMemo(() => {
    if (!selectedSlot) return null;
    return {
      rangeLabel: formatSlotRange(
        selectedSlot.startIso,
        config.durationMinutes,
        timeZone,
      ),
      timeZoneLabel: getTimezoneDisplayName(timeZone),
    };
  }, [selectedSlot, config.durationMinutes, timeZone]);

  const handleSelectDate = (dateStr: string) => {
    if (loadPhase !== "idle") return;
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setSlots([]);
    setLoadPhase("date");

    void (async () => {
      const [res] = await Promise.all([
        fetch(`/api/slots?date=${dateStr}&tz=${encodeURIComponent(timeZone)}`),
        new Promise((r) => setTimeout(r, SPINNER_MS)),
      ]);
      const data = (await res.json()) as { slots?: TimeSlot[] };
      setSlots(data.slots || []);
      setLoadPhase("idle");
    })();
  };

  const handleSelectSlot = (slot: TimeSlot) => {
    if (loadPhase !== "idle") return;
    setSelectedSlot(slot);
    setLoadPhase("time");

    void (async () => {
      await new Promise((r) => setTimeout(r, SPINNER_MS));
      setLoadPhase("idle");
      setStep("details");
    })();
  };

  const handleBack = () => {
    setStep("calendar");
    setSelectedSlot(null);
  };

  const handleTimeZoneChange = (tz: string) => {
    setTimeZone(tz);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSlots([]);
  };

  const showTimeColumn = step === "calendar" && !!selectedDate && loadPhase !== "date";
  const showSpinner = loadPhase === "date" || loadPhase === "time";

  return (
    <div className="relative mx-auto w-full max-w-[980px] overflow-hidden rounded-xl border border-[#e1e1e1] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <div className="powered-ribbon" aria-hidden>
        <span>POWERED BY Calendly</span>
      </div>

      {step === "calendar" && (
        <div className="grid min-h-[560px] lg:grid-cols-[280px_1fr]">
          <EventSidebar config={config} />

          <div className="relative min-w-0">
            {showSpinner ? (
              <div className="flex min-h-[480px] items-center justify-center">
                <Spinner
                  label={
                    loadPhase === "date" ? "Loading times…" : "Confirming…"
                  }
                />
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row">
                <Calendar
                  viewDate={viewDate}
                  onViewDateChange={setViewDate}
                  selectedDate={selectedDate}
                  availableDates={availableDates}
                  onSelectDate={handleSelectDate}
                  timeZoneLabel={timeZoneLabel}
                  timeZoneOptions={timeZoneOptions}
                  timeZone={timeZone}
                  onTimeZoneChange={handleTimeZoneChange}
                />
                {showTimeColumn && (
                  <TimeSlots
                    dateLabel={dateLabel}
                    slots={slots}
                    selectedIso={selectedSlot?.startIso ?? null}
                    onSelect={handleSelectSlot}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {step === "details" && (
        <div className="grid min-h-[560px] lg:grid-cols-[300px_1fr]">
          <EventSidebar
            config={config}
            showBack
            onBack={handleBack}
            selectedSummary={selectedSummary}
          />
          <EnterDetails
            name={name}
            email={email}
            notes={notes}
            onNameChange={setName}
            onEmailChange={setEmail}
            onNotesChange={setNotes}
          />
        </div>
      )}
    </div>
  );
}
