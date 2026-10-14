"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type NGO = {
  _id: string;
  ngoName: string;
  address: string;
  verified: boolean;
  acceptingDonations?: boolean;
};

type Donation = {
  _id: string;
  status: string;
};

export default function NGODashboardPage() {
  const [ngo, setNgo] = useState<NGO | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [ngoResponse, donationResponse] = await Promise.all([
        fetch("/api/ngo/me"),
        fetch("/api/donations"),
      ]);

      const ngoData = await ngoResponse.json();
      const donationData = await donationResponse.json();

      if (!ngoResponse.ok) {
        throw new Error(
          ngoData.message || "Could not load your NGO profile."
        );
      }

      if (!donationResponse.ok) {
        throw new Error(
          donationData.message || "Could not load donations."
        );
      }

      if (!ngoData.ngo) {
        throw new Error("Your NGO profile was not found.");
      }

      setNgo(ngoData.ngo);
      setDonations(donationData.donations || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function toggleAvailability() {
    if (!ngo) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/ngo/${ngo._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          acceptingDonations: !ngo.acceptingDonations,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not update availability."
        );
      }

      setNgo({
        ...ngo,
        acceptingDonations: data.acceptingDonations,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update availability."
      );
    } finally {
      setSaving(false);
    }
  }

  const countByStatus = (status: string) =>
    donations.filter((donation) => donation.status === status).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <p className="text-gray-600">Loading your dashboard...</p>
      </main>
    );
  }

  return (
<main className="min-h-screen overflow-x-hidden bg-white px-4 py-5 text-black sm:px-6 sm:py-8 lg:px-8">
  <div className="mx-auto w-full max-w-6xl">
    {/* Header */}
    <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <p className="font-semibold text-black">
          ShareAPlate <span className="text-[#00845F]">· NGO Portal</span>
        </p>

        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
          NGO Dashboard
        </h1>

        <p className="mt-2 text-sm leading-6 text-black sm:text-base">
          Manage food donations for your organisation.
        </p>
      </div>

      <nav className="flex w-full flex-col gap-3 min-[420px]:flex-row sm:w-auto">
        <Link
          href="/ngo/donations"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-[#00845F] bg-[#00845F] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#006B4D] sm:text-base"
        >
          View Donations
        </Link>

        <Link
          href="/ngo/profile"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-[#00845F] bg-white px-4 py-2.5 text-sm font-bold text-black transition hover:bg-[#00845F]/10 sm:text-base"
        >
          Edit Profile
        </Link>
      </nav>
    </header>

    {/* Error message */}
    {error && (
      <div
        role="alert"
        className="mb-6 break-words rounded-xl border-2 border-[#00845F] bg-white p-4 text-sm text-black sm:text-base"
      >
        {error}
      </div>
    )}

    {ngo && (
      <>
        {/* Organisation and statistics */}
        <section className="mb-10 grid min-w-0 grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3">
          {/* Organisation card */}
          <div className="min-w-0 rounded-2xl border-2 border-[#00845F] bg-white p-4 shadow-[5px_5px_12px_#d9e9e1,-5px_-5px_12px_#ffffff] sm:rounded-3xl sm:p-6 lg:col-span-2">
            <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:justify-between sm:gap-6">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-black">
                  Organisation
                </p>

                <h2 className="mt-2 break-words text-2xl font-extrabold text-black sm:text-3xl">
                  {ngo.ngoName}
                </h2>

                <p className="mt-3 break-words text-sm leading-6 text-black sm:text-base">
                  {ngo.address}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-black">
                    Verification status:
                  </span>

                  <span className="rounded-full border border-[#00845F] bg-white px-3 py-1 text-xs font-bold text-black sm:text-sm">
                    {ngo.verified
                      ? "Verified"
                      : "Pending verification"}
                  </span>
                </div>
              </div>

              {/* Donation availability card */}
              <div className="w-full min-w-0 rounded-2xl border border-[#00845F] bg-white p-4 shadow-[4px_4px_10px_#d9e9e1,-4px_-4px_10px_#ffffff] sm:w-56 sm:shrink-0 sm:p-5">
                <p className="text-sm font-semibold text-black">
                  Donation availability
                </p>

                <p className="mt-2 break-words text-base font-bold text-black sm:text-lg">
                  {ngo.acceptingDonations
                    ? "Accepting donations"
                    : "Not accepting"}
                </p>

                {/* Custom green toggle */}
                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-black">
                    {ngo.acceptingDonations ? "Enabled" : "Disabled"}
                  </span>

                  <label
                    className={`relative inline-flex h-9 w-[70px] shrink-0 ${
                      !ngo.verified || saving
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      role="switch"
                      checked={ngo.acceptingDonations}
                      onChange={() => {
                        if (ngo.verified && !saving) {
                          toggleAvailability();
                        }
                      }}
                      disabled={saving || !ngo.verified}
                      aria-label="Accept donations"
                      className="peer sr-only"
                    />

                    <span className="absolute inset-0 rounded-full border-2 border-[#00845F] bg-white shadow-[3px_3px_0_#00845F] transition-colors duration-300 peer-checked:bg-[#00845F] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[#00845F]" />

                    <span className="absolute left-[3px] top-[3px] flex h-[27px] w-[27px] items-center justify-center rounded-full border-2 border-[#00845F] bg-white text-[9px] font-extrabold text-black transition-transform duration-300 peer-checked:translate-x-[32px]">
                      {ngo.acceptingDonations ? "ON" : "OFF"}
                    </span>
                  </label>
                </div>

                <p className="mt-4 text-xs leading-5 text-black">
                  {saving
                    ? "Saving your changes..."
                    : ngo.verified
                      ? "Switch to change donation availability."
                      : "Verification is required to change availability."}
                </p>
              </div>
            </div>
          </div>

          {/* Total donations card */}
          <div className="min-w-0 rounded-2xl border-2 border-[#00845F] bg-white p-5 shadow-[5px_5px_12px_#d9e9e1,-5px_-5px_12px_#ffffff] sm:rounded-3xl sm:p-6">
            <p className="text-sm font-semibold text-black">
             Total Donations
            </p>

            <p className="mt-5 break-words text-5xl font-extrabold tracking-tight text-black">
              {donations.length}
            </p>

            <div className="mt-5 h-1.5 overflow-hidden rounded-full border border-[#00845F] bg-white">
              <div className="h-full w-full rounded-full bg-[#00845F]" />
            </div>

          
          </div>
        </section>

        {/* Donation overview */}
        <section>
          <div className="mb-6 flex flex-col justify-between gap-4 min-[420px]:flex-row min-[420px]:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#00845F]">
                Track your impact
              </p>

              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-black sm:text-3xl">
                Donation Overview
              </h2>
            </div>

            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border-2 border-[#00845F] bg-white px-4 py-2 text-sm font-bold text-black shadow-[3px_3px_0_#00845F] transition hover:bg-[#00845F]/10 active:translate-y-[3px] active:shadow-none"
            >
              ↻ Refresh
            </button>
          </div>

          {/* Responsive status cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Available",
                status: "available",
                symbol: "♡",
              },
              {
                label: "Accepted",
                status: "accepted",
                symbol: "✓",
              },
              {
                label: "Picked Up",
                status: "picked_up",
                symbol: "↗",
              },
              {
                label: "Completed",
                status: "completed",
                symbol: "♥",
              },
            ].map((item) => (
              <div
                key={item.status}
                className="group min-w-0 rounded-2xl border-2 border-[#00845F] bg-white p-5 shadow-[5px_5px_12px_#d9e9e1,-5px_-5px_12px_#ffffff] transition duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_18px_#d9e9e1,-8px_-8px_18px_#ffffff] sm:rounded-3xl sm:p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="break-words text-sm font-bold text-black sm:text-base">
                    {item.label}
                  </p>

                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#00845F] bg-white text-xl font-bold text-black"
                  >
                    {item.symbol}
                  </span>
                </div>

                <p className="mt-5 break-words text-4xl font-extrabold tracking-tight text-black sm:text-5xl">
                  {countByStatus(item.status)}
                </p>

                <div className="mt-5 h-1 w-12 rounded-full bg-[#00845F] transition-all duration-300 group-hover:w-full" />
              </div>
            ))}
          </div>
        </section>
      </>
    )}
  </div>
</main>
  );
}