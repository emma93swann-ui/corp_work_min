"use client";

import { FormEvent, useEffect, useState } from "react";
import type { EventConfig } from "@/lib/config";
import Link from "next/link";

const WEEKDAY_LABELS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export function AdminPanel() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const authRes = await fetch("/api/admin/auth");
      const auth = (await authRes.json()) as { authenticated: boolean };
      setAuthenticated(auth.authenticated);
      if (auth.authenticated) {
        const cfgRes = await fetch("/api/config");
        setConfig(await cfgRes.json());
      }
    })();
  }, []);

  const login = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(null);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setStatus("Wrong password");
      return;
    }
    setAuthenticated(true);
    const cfgRes = await fetch("/api/config");
    setConfig(await cfgRes.json());
  };

  const logout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
    setConfig(null);
    setPassword("");
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setStatus(null);
    const res = await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setSaving(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setStatus(data.error || "Save failed");
      return;
    }
    setConfig(await res.json());
    setStatus("Saved");
  };

  const toggleWeekday = (day: number) => {
    if (!config) return;
    const has = config.availableWeekdays.includes(day);
    const next = has
      ? config.availableWeekdays.filter((d) => d !== day)
      : [...config.availableWeekdays, day].sort((a, b) => a - b);
    setConfig({ ...config, availableWeekdays: next });
  };

  if (authenticated === null) {
    return <p className="p-8 text-sm text-zinc-500">Loading…</p>;
  }

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-[#0b3558]">Admin login</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Default password: <code className="rounded bg-zinc-100 px-1">admin</code>
        </p>
        <form onSubmit={login} className="mt-6 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-[#0069ff]"
          />
          {status && <p className="text-sm text-red-600">{status}</p>}
          <button
            type="submit"
            className="w-full rounded-full bg-[#0069ff] py-2.5 text-sm font-semibold text-white"
          >
            Sign in
          </button>
        </form>
      </div>
    );
  }

  if (!config) {
    return <p className="p-8 text-sm text-zinc-500">Loading config…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0b3558]">Event settings</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Changes apply to the booking page without rebuild.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/"
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50"
          >
            View page
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50"
          >
            Log out
          </button>
        </div>
      </div>

      <form onSubmit={save} className="mt-8 space-y-5">
        {(
          [
            ["hostName", "Host name"],
            ["eventTitle", "Event title"],
            ["locationText", "Location text"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label className="mb-1 block text-sm font-semibold">{label}</label>
            <input
              value={config[key]}
              onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-[#0069ff]"
            />
          </div>
        ))}

        <div>
          <label className="mb-1 block text-sm font-semibold">Description</label>
          <textarea
            rows={3}
            value={config.description}
            onChange={(e) => setConfig({ ...config, description: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-[#0069ff]"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold">Duration (min)</label>
            <input
              type="number"
              min={5}
              step={5}
              value={config.durationMinutes}
              onChange={(e) =>
                setConfig({ ...config, durationMinutes: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-[#0069ff]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Slots from (hour)</label>
            <input
              type="number"
              min={0}
              max={23}
              value={config.slotStartHour}
              onChange={(e) =>
                setConfig({ ...config, slotStartHour: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-[#0069ff]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Slots to (hour)</label>
            <input
              type="number"
              min={1}
              max={24}
              value={config.slotEndHour}
              onChange={(e) =>
                setConfig({ ...config, slotEndHour: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-[#0069ff]"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold">Available weekdays</p>
          <div className="flex flex-wrap gap-2">
            {WEEKDAY_LABELS.map((d) => {
              const on = config.availableWeekdays.includes(d.value);
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleWeekday(d.value)}
                  className={[
                    "rounded-full px-3 py-1.5 text-sm font-semibold",
                    on
                      ? "bg-[#0069ff] text-white"
                      : "border border-zinc-300 text-zinc-600",
                  ].join(" ")}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {status && (
          <p
            className={
              status === "Saved" ? "text-sm text-green-600" : "text-sm text-red-600"
            }
          >
            {status}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[#0069ff] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
