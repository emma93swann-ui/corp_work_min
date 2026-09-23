"use client";

import type { TimeSlot } from "@/lib/slots";

type Props = {
  dateLabel: string;
  slots: TimeSlot[];
  selectedIso: string | null;
  onSelect: (slot: TimeSlot) => void;
};

export function TimeSlots({ dateLabel, slots, selectedIso, onSelect }: Props) {
  return (
    <div className="flex w-full flex-col border-t border-[#e8e8e8] p-6 sm:w-[220px] sm:shrink-0 sm:border-l sm:border-t-0 sm:p-6 sm:pt-20">
      <p className="mb-4 text-sm font-semibold text-[#0b3558]">{dateLabel}</p>
      <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
        {slots.length === 0 && (
          <p className="text-sm text-[#8b8b8b]">No times available</p>
        )}
        {slots.map((slot) => {
          const selected = selectedIso === slot.startIso;
          return (
            <button
              key={slot.startIso}
              type="button"
              onClick={() => onSelect(slot)}
              className={[
                "w-full rounded-md border px-3 py-2.5 text-center text-[15px] font-bold transition",
                selected
                  ? "border-[#0069ff] bg-[#0069ff] text-white"
                  : "border-[#b3d4ff] bg-white text-[#0069ff] hover:border-[#0069ff]",
              ].join(" ")}
            >
              {slot.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
