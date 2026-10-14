"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type NGO = {
  _id: string;
  ngoName: string;
  address: string;
  location?: {
    type?: string;
    coordinates?: number[];
  };
  verified: boolean;
  acceptingDonations?: boolean;
  capacity?: number;
  createdAt?: string;
  updatedAt?: string;
};

function formatDate(value?: string) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminNGODetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F6F8F3] px-4">
          <div className="flex items-center gap-3 text-sm font-medium text-[#53705A]">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#C9D9C8] border-t-[#286747]" />
            Loading NGO profile...
          </div>
        </main>
      }
    >
      <NGODetails />
    </Suspense>
  );
}

function NGODetails() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [ngo, setNgo] = useState<NGO | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    async function loadNGO() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/ngo/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load NGO");
        }

        const ngoData = data.ngo ?? data.data?.ngo;

        if (!ngoData) {
          throw new Error("The API response did not contain NGO details.");
        }

        setNgo(ngoData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    void loadNGO();
  }, [id]);

  async function toggleVerification() {
    if (!ngo || busy) return;

    const nextVerified = !ngo.verified;
    const action = nextVerified ? "verify" : "revoke verification";

    if (!window.confirm(`Are you sure you want to ${action} this NGO?`)) {
      return;
    }

    try {
      setBusy(true);
      setError("");
      setMessage("");

      const response = await fetch(`/api/ngo/${id}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ verified: nextVerified }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Could not update NGO verification"
        );
      }

      const updatedNGO = data.ngo ?? data.data?.ngo;

      if (!updatedNGO) {
        throw new Error(
          "The API response did not contain the updated NGO."
        );
      }

      setNgo((current) =>
        current ? { ...current, ...updatedNGO } : current
      );

      setMessage(
        data.message ||
          (nextVerified
            ? "NGO verified successfully."
            : "NGO verification revoked successfully.")
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F6F8F3] px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="mb-4 h-4 w-44 rounded bg-[#E0E8DC]" />
          <div className="mb-3 h-10 w-72 max-w-full rounded-lg bg-[#E0E8DC]" />
          <div className="h-5 w-96 max-w-full rounded bg-[#E0E8DC]" />

          <div className="mt-8 overflow-hidden rounded-3xl border border-[#E0E8DC] bg-white">
            <div className="h-36 bg-[#245D3E]" />
            <div className="space-y-6 p-5 sm:p-9">
              <div className="h-20 rounded-2xl bg-[#EDF2E9]" />
              <div className="h-28 rounded-2xl bg-[#EDF2E9]" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-28 rounded-2xl bg-[#EDF2E9]"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <p role="status" className="mt-6 text-center text-sm text-[#718075]">
          Loading NGO details...
        </p>
      </main>
    );
  }

  if (error && !ngo) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F8F3] px-4 py-10">
        <div className="w-full max-w-lg rounded-3xl border border-[#E0E8DC] bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-bold text-[#123D2A]">
            Unable to load NGO
          </h1>

          <p className="mt-3 break-words text-sm leading-6 text-[#718075]">
            {error}
          </p>

          <Link
            href="/admin/ngos"
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#286747] px-6 py-3 font-semibold text-white transition hover:bg-[#194631] focus:outline-none focus:ring-2 focus:ring-[#70A981] focus:ring-offset-2"
          >
            ← Back to NGOs
          </Link>
        </div>
      </main>
    );
  }

  if (!ngo) return null;

  const coordinates = ngo.location?.coordinates;

  const details = [
    {
      label: "NGO ID",
      value: ngo._id || "Not available",
      icon: "🪪",
    },
    {
      label: "Address",
      value: ngo.address || "Address not provided",
      icon: "📍",
    },
    {
      label: "Accepting donations",
      value:
        ngo.acceptingDonations === undefined
          ? "Not provided by this API"
          : ngo.acceptingDonations
            ? "Yes, accepting donations"
            : "Not accepting donations",
      icon: "💚",
    },
    {
      label: "Capacity",
      value:
        ngo.capacity === undefined ? "Not provided" : String(ngo.capacity),
      icon: "👥",
    },
    {
      label: "Latitude",
      value:
        coordinates?.[1] === undefined
          ? "Not available"
          : String(coordinates[1]),
      icon: "🌐",
    },
    {
      label: "Longitude",
      value:
        coordinates?.[0] === undefined
          ? "Not available"
          : String(coordinates[0]),
      icon: "🧭",
    },
    {
      label: "Created on",
      value: formatDate(ngo.createdAt),
      icon: "📅",
    },
    {
      label: "Last updated",
      value: formatDate(ngo.updatedAt),
      icon: "🕒",
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F6F8F3] px-4 py-7 text-[#193D2B] sm:px-6 sm:py-10 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <header className="mb-8 sm:mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#398253]">
            <Link
              href="/admin"
              className="transition hover:text-[#193D2B]"
            >
              Management
            </Link>
            <span className="text-[#A6B3A6]">/</span>
            <Link
              href="/admin/ngos"
              className="transition hover:text-[#193D2B]"
            >
              NGOs
            </Link>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#123D2A] sm:text-4xl lg:text-5xl">
            NGO profile
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#718075] sm:text-base sm:leading-7">
            Review NGO information, manage verification, and check donation
            availability and capacity.
          </p>
        </header>

        {/* Main profile card */}
        <section className="overflow-hidden rounded-[24px] border border-[#E0E8DC] bg-white shadow-[0_20px_60px_rgba(25,65,43,0.07)] sm:rounded-[30px]">
          {/* Decorative banner */}
          <div className="relative flex min-h-[150px] items-end overflow-hidden bg-gradient-to-br from-[#194631] via-[#286747] to-[#4D9B6B] px-5 py-7 sm:min-h-[180px] sm:px-10 sm:py-9">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full border border-white/10 sm:h-80 sm:w-80"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-8 -top-12 h-52 w-52 rounded-full border border-white/10 sm:h-64 sm:w-64"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-28 right-28 h-52 w-52 rounded-full border border-white/10"
            />

            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/90">
                Organization overview
              </p>
              <p className="mt-2 text-sm text-white/70">
                NGO information and verification
              </p>
            </div>
          </div>

          {/* Profile content: separate from banner to prevent overlap */}
          <div className="space-y-8 px-5 py-6 sm:space-y-10 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
            {/* NGO identity */}
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-[#E5F2E8] text-3xl shadow-[0_4px_12px_rgba(25,65,43,0.12)] sm:h-20 sm:w-20 sm:text-4xl">
                  🏢
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="break-words text-xl font-bold leading-tight text-[#123D2A] [overflow-wrap:anywhere] sm:text-2xl lg:text-3xl">
                    {ngo.ngoName || "Unnamed NGO"}
                  </h2>

                  <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-[#718075] sm:text-base">
                    <span aria-hidden="true" className="shrink-0">
                      📍
                    </span>
                    <span className="break-words [overflow-wrap:anywhere]">
                      {ngo.address || "Address not provided"}
                    </span>
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ${
                  ngo.verified
                    ? "bg-[#E2F4E6] text-[#267344]"
                    : "bg-[#FFF1D6] text-[#9A620D]"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    ngo.verified ? "bg-[#319458]" : "bg-[#E2A02C]"
                  }`}
                />
                {ngo.verified ? "Verified" : "Pending verification"}
              </span>
            </div>

            {/* Verification panel */}
            <section
              aria-labelledby="verification-heading"
              className="rounded-[22px] border border-[#DFE8DC] bg-[#F8FAF6] p-5 sm:p-7"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <h3
                    id="verification-heading"
                    className="text-lg font-bold text-[#123D2A] sm:text-xl"
                  >
                    Verification status
                  </h3>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#718075] sm:text-base">
                    {ngo.verified
                      ? "This NGO is verified on the platform."
                      : "Review the NGO details before approving its profile."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleVerification}
                  disabled={busy}
                  className={`inline-flex min-h-14 w-full shrink-0 items-center justify-center gap-3 rounded-2xl px-6 py-4 font-semibold text-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${
                    ngo.verified
                      ? "bg-[#B65A4A] shadow-[0_5px_0_0_#8E4035] hover:bg-[#A44B3D] active:translate-y-[5px] active:shadow-none focus:ring-[#B65A4A]"
                      : "bg-[#388653] shadow-[0_5px_0_0_#A5D5B3] hover:bg-[#2E7446] active:translate-y-[5px] active:shadow-none focus:ring-[#388653]"
                  }`}
                >
                  <span aria-hidden="true" className="text-xl">
                    {busy ? "⏳" : ngo.verified ? "↺" : "✓"}
                  </span>

                  <span>
                    {busy
                      ? "Updating..."
                      : ngo.verified
                        ? "Revoke verification"
                        : "Approve and verify NGO"}
                  </span>
                </button>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                >
                  {error}
                </p>
              )}

              {message && (
                <p
                  role="status"
                  className="mt-5 rounded-xl border border-[#CDE8D2] bg-[#EAF7ED] px-4 py-3 text-sm leading-6 text-[#256B3D]"
                >
                  {message}
                </p>
              )}
            </section>

            {/* NGO details */}
            <section aria-labelledby="details-heading">
              <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#398253]">
                    Organization information
                  </p>

                  <h3
                    id="details-heading"
                    className="mt-2 text-2xl font-bold text-[#123D2A] sm:text-3xl"
                  >
                    Details &amp; location
                  </h3>
                </div>

                <span className="inline-flex w-fit items-center rounded-full bg-[#F0F4ED] px-4 py-2 text-xs font-semibold text-[#58715D]">
                  {details.length} details
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3">
                {details.map((detail) => (
                  <Detail
                    key={detail.label}
                    label={detail.label}
                    value={detail.value}
                    icon={detail.icon}
                  />
                ))}
              </div>
            </section>

            {/* Admin note */}
            <div className="flex items-start gap-4 rounded-2xl border border-[#DCE9D9] bg-gradient-to-r from-[#F2F8F0] to-[#FAFBF8] p-5 sm:p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                💡
              </div>

              <div className="min-w-0">
                <h4 className="font-bold text-[#214C31]">Admin note</h4>
                <p className="mt-1 text-sm leading-6 text-[#718075]">
                  Review the NGO&apos;s identity, address, and capacity before
                  approving verification. Donation availability and
                  verification status are separate details.
                </p>
              </div>
            </div>

            {/* Back navigation */}
            <div className="border-t border-[#E8EDE5] pt-6">
              <Link
                href="/admin/ngos"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-[#326747] transition hover:bg-[#F0F5EE] hover:text-[#173D2A] focus:outline-none focus:ring-2 focus:ring-[#70A981] focus:ring-offset-2"
              >
                <span aria-hidden="true">←</span>
                Back to NGOs
              </Link>
            </div>
          </div>
        </section>

        <footer className="px-2 py-6 text-center text-xs text-[#89958A]">
          NGO management · Admin dashboard
        </footer>
      </div>
    </main>
  );
}

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="group min-w-0 rounded-2xl border border-[#E5EBE2] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#B8D5BD] hover:shadow-[0_10px_28px_rgba(25,65,43,0.06)]">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDF5ED] text-xl">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#829084]">
            {label}
          </p>

          <p className="mt-2 break-words text-sm font-semibold leading-6 text-[#183D2B] [overflow-wrap:anywhere] sm:text-base">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
