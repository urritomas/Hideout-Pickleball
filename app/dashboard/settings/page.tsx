"use client";

import { useCallback, useEffect, useState } from "react";

type Settings = {
  dayRate: number;
  eveningRate: number;
  serviceFee: number;
  openingHour: number;
  closingHour: number;
};

export default function DashboardSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/settings");
      const payload = (await response.json()) as { data?: Settings; message?: string };

      if (!response.ok || !payload.data) {
        throw new Error(payload.message || "Failed to load settings.");
      }

      setSettings(payload.data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message || "Failed to save settings.");
      }

      alert("Settings saved successfully!");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className="text-center text-sm text-slate-500">Loading settings...</p>;
  }

  if (errorMessage && !settings) {
    return <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>;
  }

  if (!settings) {
    return <p className="text-center text-sm text-slate-500">No settings available.</p>;
  }

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <h1 className="font-display text-xl sm:text-2xl font-semibold text-slate-900">Settings</h1>
      <p className="mt-1 text-xs sm:text-sm text-slate-600">Manage pricing bands and operating hours.</p>

      {errorMessage && (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
      )}

      <div className="mt-4 sm:mt-6 grid gap-3 sm:grid-cols-2">
        <label className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          Day Rate (8:00 AM - 4:59 PM)
          <input
            type="number"
            defaultValue={settings.dayRate}
            onChange={(e) => setSettings({ ...settings, dayRate: Number(e.target.value) })}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 min-h-[44px]"
          />
        </label>
        <label className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          Evening Rate (5:00 PM - 12:00 AM)
          <input
            type="number"
            defaultValue={settings.eveningRate}
            onChange={(e) => setSettings({ ...settings, eveningRate: Number(e.target.value) })}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 min-h-[44px]"
          />
        </label>
        <label className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          Service Fee
          <input
            type="number"
            defaultValue={settings.serviceFee}
            onChange={(e) => setSettings({ ...settings, serviceFee: Number(e.target.value) })}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 min-h-[44px]"
          />
        </label>
        <label className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          Opening Hour
          <input
            type="number"
            min="0"
            max="23"
            defaultValue={settings.openingHour}
            onChange={(e) => setSettings({ ...settings, openingHour: Number(e.target.value) })}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 min-h-[44px]"
          />
        </label>
        <label className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 sm:col-span-2">
          Closing Hour
          <input
            type="number"
            min="0"
            max="23"
            defaultValue={settings.closingHour}
            onChange={(e) => setSettings({ ...settings, closingHour: Number(e.target.value) })}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 min-h-[44px]"
          />
        </label>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="mt-4 sm:mt-6 w-full min-h-[44px] rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isSaving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
