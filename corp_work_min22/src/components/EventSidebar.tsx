import type { EventConfig } from "@/lib/config";
import {
  BackArrow,
  CalendarIcon,
  ClockIcon,
  GlobeIcon,
  VideoIcon,
} from "./Icons";

type Props = {
  config: EventConfig;
  showBack?: boolean;
  onBack?: () => void;
  selectedSummary?: {
    rangeLabel: string;
    timeZoneLabel: string;
  } | null;
};

export function EventSidebar({
  config,
  showBack,
  onBack,
  selectedSummary,
}: Props) {
  return (
    <aside className="flex h-full flex-col border-b border-[#e8e8e8] p-6 sm:border-b-0 sm:border-r sm:p-8">
      {showBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-[#d0d0d0] text-[#1a1a1a] transition hover:bg-[#f5f5f5]"
          aria-label="Go back"
        >
          <BackArrow />
        </button>
      )}

      <p className="text-[15px] text-[#6e6e6e]">{config.hostName}</p>
      <h1 className="mt-1 text-[1.65rem] font-bold leading-tight tracking-tight text-[#0b3558]">
        {config.eventTitle}
      </h1>

      <ul className="mt-6 space-y-3 text-[15px] text-[#6e6e6e]">
        <li className="flex items-start gap-3">
          <ClockIcon className="mt-0.5 h-[18px] w-[18px] shrink-0" />
          <span>{config.durationMinutes} min</span>
        </li>
        <li className="flex items-start gap-3">
          <VideoIcon className="mt-0.5 h-[18px] w-[18px] shrink-0" />
          <span>{config.locationText}</span>
        </li>
        {selectedSummary && (
          <>
            <li className="flex items-start gap-3">
              <CalendarIcon className="mt-0.5 h-[18px] w-[18px] shrink-0" />
              <span>{selectedSummary.rangeLabel}</span>
            </li>
            <li className="flex items-start gap-3">
              <GlobeIcon className="mt-0.5 h-[18px] w-[18px] shrink-0" />
              <span>{selectedSummary.timeZoneLabel}</span>
            </li>
          </>
        )}
      </ul>

      <p className="mt-6 text-[15px] leading-relaxed text-[#4a4a4a]">
        {config.description}
      </p>

      <div className="mt-auto hidden pt-10 text-[13px] sm:block">
        <a href="#" className="text-[#0069ff] hover:underline">
          Cookie settings
        </a>
        <span className="mx-2 text-[#c0c0c0]">·</span>
        <a href="#" className="text-[#0069ff] hover:underline">
          Privacy Policy
        </a>
      </div>
    </aside>
  );
}
