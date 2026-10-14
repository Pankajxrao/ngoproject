"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type NGO = {
  _id: string;
  ngoName?: string;
  address?: string;
  capacity?: number;
  verified?: boolean;
  acceptingDonations?: boolean;
  location?: {
    type?: string;
    coordinates?: [number, number];
  };
  [key: string]: unknown;
};

type NGOResponse = {
  success: boolean;
  message?: string;
  ngo?: NGO;
};

function formatLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function NGODetailsContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const ngoId = params.id;
  const donationId = searchParams.get("donationId");

  const [ngo, setNgo] = useState<NGO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadNGO() {
      setLoading(true);
      setError("");
      setNgo(null);

      try {
        const response = await fetch(
          `/api/ngo/${encodeURIComponent(ngoId)}/me`,
          {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store",
          },
        );

        const result: NGOResponse = await response.json();

        if (!response.ok || !result.success || !result.ngo) {
          throw new Error(
            result.message || "Could not load NGO details.",
          );
        }

        if (!cancelled) {
          setNgo(result.ngo);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (ngoId) {
      void loadNGO();
    } else {
      setError("NGO ID is missing.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [ngoId]);

  const excludedFields = new Set([
    "_id",
    "__v",
    "password",
    "passwordHash",
    "userId",
    "location",
  ]);

  const primaryFields = [
    "ngoName",
    "address",
    "capacity",
    "verified",
    "acceptingDonations",
  ];

  const additionalEntries = ngo
    ? Object.entries(ngo).filter(
        ([key, value]) =>
          !excludedFields.has(key) &&
          !primaryFields.includes(key) &&
          value !== undefined,
      )
    : [];

  const coordinates = ngo?.location?.coordinates;

  const hasCoordinates =
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    coordinates.every((coordinate) => Number.isFinite(coordinate));

  const latitude = hasCoordinates ? coordinates[1] : undefined;
  const longitude = hasCoordinates ? coordinates[0] : undefined;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f8f3] text-[#173c2b]">
      {/* Navigation */}
      <nav className="sticky top-0 z-30 border-b border-green-100/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 min-[380px]:px-4 sm:px-8 sm:py-4">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-2 sm:gap-2.5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#00845F] to-[#075B43] text-lg font-black text-white shadow-md shadow-green-900/15 transition group-hover:rotate-3 sm:h-10 sm:w-10">
              S
            </span>

            <span className="truncate text-lg font-extrabold tracking-tight text-[#173c2b] sm:text-xl">
              Share<span className="text-[#00845F]">APlate</span>
            </span>
          </Link>

          <Link
            href={
              donationId
                ? "/restaurant/donations"
                : "/restaurant"
            }
            className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border border-green-100 bg-white px-3 py-2 text-xs font-bold text-[#176747] transition hover:border-green-300 hover:bg-green-50 min-[380px]:gap-2 min-[380px]:px-4 sm:py-2.5 sm:text-sm"
          >
            <span aria-hidden="true">←</span>
            Back
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#075B43] via-[#087653] to-[#00845F]">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-lime-200/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-8 min-[380px]:px-5 sm:px-8 sm:py-14">
          <div className="flex flex-col gap-5 sm:gap-6 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 max-w-2xl">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-green-50 min-[380px]:text-xs sm:tracking-[0.18em]">
                <span className="h-2 w-2 shrink-0 rounded-full bg-lime-300" />
                Organization profile
              </div>

              <h1 className="mt-4 break-words text-2xl font-black tracking-tight text-white min-[380px]:text-3xl sm:mt-5 sm:text-4xl lg:text-5xl">
                {loading
                  ? "Loading organization..."
                  : ngo?.ngoName || "NGO Details"}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-green-50/90 sm:mt-4 sm:text-base sm:leading-7">
                Get to know the organization, explore its location,
                and discover the information available to help
                coordinate food donations.
              </p>

              {!loading && !error && ngo && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {ngo.verified && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#087653] shadow-sm">
                      <span aria-hidden="true">✓</span>
                      Verified organization
                    </span>
                  )}

                  {ngo.acceptingDonations === true && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-lime-300" />
                      Accepting donations
                    </span>
                  )}

                  {ngo.acceptingDonations === false && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white">
                      Currently not accepting
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="hidden h-32 w-32 shrink-0 items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 text-6xl shadow-2xl backdrop-blur-sm sm:flex lg:h-40 lg:w-40 lg:text-7xl">
              🏡
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-6xl px-3 py-6 min-[380px]:px-4 sm:px-8 sm:py-12">
        {loading ? (
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="animate-pulse rounded-2xl border border-green-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-8">
              <div className="h-5 w-48 rounded bg-green-100" />
              <div className="mt-8 h-4 w-24 rounded bg-gray-100" />
              <div className="mt-3 h-6 w-3/4 rounded bg-gray-100" />
              <div className="mt-8 h-4 w-20 rounded bg-gray-100" />
              <div className="mt-3 h-5 w-full rounded bg-gray-100" />
              <div className="mt-3 h-5 w-2/3 rounded bg-gray-100" />
            </div>

            <div className="animate-pulse rounded-2xl border border-green-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-8">
              <div className="h-5 w-32 rounded bg-green-100" />
              <div className="mt-6 h-32 rounded-2xl bg-gray-100" />
            </div>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-8"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-2xl">
              ⚠️
            </div>

            <h2 className="mt-4 text-lg font-extrabold text-gray-900 sm:text-xl">
              Unable to load NGO details
            </h2>

            <p className="mt-2 break-words text-sm leading-6 text-gray-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#00845F] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#006B4D] focus:outline-none focus:ring-4 focus:ring-green-200 sm:w-auto"
            >
              Try again
            </button>
          </div>
        ) : ngo ? (
          <div className="grid min-w-0 items-start gap-5 sm:gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            {/* Organization information */}
            <div className="min-w-0 space-y-5 sm:space-y-6">
              <section className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-green-950/5 sm:rounded-3xl">
                <div className="flex items-start gap-3 border-b border-green-50 px-4 py-4 min-[380px]:items-center min-[380px]:gap-4 sm:px-8 sm:py-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-xl min-[380px]:h-12 min-[380px]:w-12 min-[380px]:rounded-2xl min-[380px]:text-2xl">
                    🏢
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-base font-extrabold text-[#173c2b] sm:text-lg">
                      Organization information
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                      Basic details about this NGO
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 p-4 sm:grid-cols-2 sm:gap-6 sm:p-8">
                  <div className="rounded-2xl bg-[#f6faf5] p-4 transition hover:bg-green-50">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      NGO name
                    </p>
                    <p className="mt-2 break-words text-base font-bold text-[#173c2b]">
                      {ngo.ngoName || "Not provided"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f6faf5] p-4 transition hover:bg-green-50">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Capacity
                    </p>
                    <p className="mt-2 break-words text-base font-bold text-[#173c2b]">
                      {ngo.capacity !== undefined
                        ? ngo.capacity
                        : "Not provided"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Organization capacity
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f6faf5] p-4 sm:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Address
                    </p>
                    <p className="mt-2 break-words text-sm font-medium leading-6 text-[#173c2b] sm:leading-7">
                      {ngo.address || "Not provided"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Additional details */}
              <section className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-green-950/5 sm:rounded-3xl sm:p-8">
                <div className="flex items-start gap-3 min-[380px]:items-center min-[380px]:gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl min-[380px]:h-12 min-[380px]:w-12 min-[380px]:rounded-2xl min-[380px]:text-2xl">
                    📋
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-base font-extrabold text-[#173c2b] sm:text-lg">
                      Other profile details
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                      Additional information provided by the organization
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2">
                  {additionalEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="min-w-0 rounded-2xl border border-green-50 bg-[#f8faf7] p-3 transition hover:border-green-200 hover:bg-green-50/70 sm:p-4"
                    >
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        {formatLabel(key)}
                      </p>

                      <p className="mt-2 break-words whitespace-pre-wrap text-sm font-medium leading-6 text-[#244b37]">
                        {formatValue(value)}
                      </p>
                    </div>
                  ))}

                  {additionalEntries.length === 0 && (
                    <div className="rounded-2xl bg-[#f8faf7] p-4 text-sm leading-6 text-gray-500 sm:col-span-2 sm:p-5">
                      No additional profile details are available.
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <aside className="min-w-0 space-y-5 sm:space-y-6 lg:sticky lg:top-24">
              <section className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm sm:rounded-3xl">
                <div className="border-b border-green-50 px-4 py-4 sm:px-6 sm:py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-xl sm:h-11 sm:w-11">
                      📍
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-extrabold text-[#173c2b] sm:text-base">
                        Organization location
                      </h2>
                      <p className="mt-1 text-xs text-gray-500">
                        Find the NGO on the map
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  {hasCoordinates ? (
                    <>
                      <div className="rounded-2xl bg-[#f4f8f3] p-3 min-[380px]:p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          Coordinates
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-2 min-[380px]:gap-3">
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">
                              Latitude
                            </p>
                            <p className="mt-1 break-all text-xs font-bold text-[#173c2b] min-[380px]:text-sm">
                              {latitude}
                            </p>
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">
                              Longitude
                            </p>
                            <p className="mt-1 break-all text-xs font-bold text-[#173c2b] min-[380px]:text-sm">
                              {longitude}
                            </p>
                          </div>
                        </div>
                      </div>

                      <a
                        href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00845F] to-[#006B4D] px-3 py-3 text-center text-sm font-bold text-white shadow-md shadow-green-900/10 transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-200 sm:px-4"
                      >
                        Open in Google Maps
                        <span aria-hidden="true">↗</span>
                      </a>
                    </>
                  ) : (
                    <div className="rounded-2xl bg-[#f8faf7] p-4 text-center sm:p-5">
                      <div className="text-3xl">🗺️</div>
                      <p className="mt-3 text-sm font-semibold text-[#244b37]">
                        Location coordinates unavailable
                      </p>
                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        This organization has not provided map coordinates.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#075B43] to-[#00845F] p-5 text-white shadow-lg shadow-green-950/10 sm:rounded-3xl sm:p-6">
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />

                <div className="relative">
                  <div className="text-3xl">💚</div>
                  <h2 className="mt-4 text-lg font-extrabold">
                    Fighting food waste together
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-green-50/90">
                    Connecting food donors with organizations to help
                    surplus food reach the people who need it.
                  </p>

                  {donationId && (
                    <Link
                      href={`/restaurant/donations/${encodeURIComponent(donationId)}`}
                      className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-[#075B43] transition hover:bg-green-50 focus:outline-none focus:ring-4 focus:ring-white/30"
                    >
                      Back to donation
                      <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </div>
              </section>
            </aside>
          </div>
        ) : null}

        <div className="mt-8 border-t border-green-100 pt-5 text-center sm:mt-10 sm:pt-6">
          <Link
            href={donationId ? "/restaurant/donations" : "/restaurant"}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-[#176747] transition hover:bg-green-100/70"
          >
            <span aria-hidden="true">←</span>
            Return to dashboard
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-green-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs text-gray-500 sm:flex-row sm:px-8 sm:py-6 sm:text-left">
          <p>
            <span className="font-bold text-[#176747]">ShareAPlate</span>
            {" "}· Making food sharing easier.
          </p>
          <p>Every donation can make a difference.</p>
        </div>
      </footer>
    </main>
  );
}

export default function NGODetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f4f8f3] px-4">
          <p className="text-sm font-semibold text-[#176747] sm:text-base">
            Loading NGO details...
          </p>
        </main>
      }
    >
      <NGODetailsContent />
    </Suspense>
  );
}
