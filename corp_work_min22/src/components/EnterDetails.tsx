"use client";

import { useState } from "react";
import { GoogleLogo, MicrosoftLogo } from "./Icons";

type Props = {
  name: string;
  email: string;
  notes: string;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onNotesChange: (v: string) => void;
};

export function EnterDetails({
  name,
  email,
  notes,
  onNameChange,
  onEmailChange,
  onNotesChange,
}: Props) {
  const [showGuests, setShowGuests] = useState(false);
  const [guests, setGuests] = useState("");

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8">
      <h2 className="text-xl font-bold text-[#0b3558]">Enter Details</h2>

      <form className="mt-6 max-w-xl space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#1a1a1a]" htmlFor="name">
            Name *
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full rounded-lg border border-[#cfcfcf] px-3 py-2.5 text-[15px] outline-none focus:border-[#0069ff]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#1a1a1a]" htmlFor="email">
            Email *
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full rounded-lg border border-[#cfcfcf] px-3 py-2.5 text-[15px] outline-none focus:border-[#0069ff]"
          />
        </div>

        {!showGuests ? (
          <button
            type="button"
            onClick={() => setShowGuests(true)}
            className="rounded-full border border-[#0069ff] px-4 py-1.5 text-sm font-semibold text-[#0069ff] hover:bg-[#e6f0ff]"
          >
            Add guests
          </button>
        ) : (
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#1a1a1a]" htmlFor="guests">
              Guests
            </label>
            <input
              id="guests"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              placeholder="guest@email.com"
              className="w-full rounded-lg border border-[#cfcfcf] px-3 py-2.5 text-[15px] outline-none focus:border-[#0069ff]"
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#1a1a1a]" htmlFor="notes">
            Please share anything that will help prepare for our meeting.
          </label>
          <textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="w-full resize-y rounded-lg border border-[#cfcfcf] px-3 py-2.5 text-[15px] outline-none focus:border-[#0069ff]"
          />
        </div>

        <p className="text-sm leading-relaxed text-[#4a4a4a]">
          By proceeding, you confirm that you have read and agree to{" "}
          <a href="#" className="font-medium text-[#0069ff] hover:underline">
            Calendly&apos;s Participant Terms
          </a>{" "}
          and{" "}
          <a href="#" className="font-medium text-[#0069ff] hover:underline">
            Privacy Notice
          </a>
          .
        </p>

        <div className="pt-2">
          <p className="mb-3 text-sm font-semibold text-[#0b3558]">
            Sign in to schedule your event
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#d0d0d0] bg-white px-5 py-3 text-sm font-semibold text-[#3c4043] transition hover:bg-[#f8f8f8]"
              onClick={() => alert("Google sign-in (demo)")}
            >
              <GoogleLogo />
              Sign up with Google
            </button>
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#d0d0d0] bg-white px-5 py-3 text-sm font-semibold text-[#3c4043] transition hover:bg-[#f8f8f8]"
              onClick={() => alert("Microsoft sign-in (demo)")}
            >
              <MicrosoftLogo />
              Sign up with Microsoft
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
