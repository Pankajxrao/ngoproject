"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Donation = {
  _id: string;
  foodName: string;
  foodType: string;
  quantity: number;
  unit: string;
  preparedAt?: string;
  expiryTime: string;
  pickupDeadline: string;
  status: string;
  createdAt?: string;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

const statusStyles: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  accepted: "bg-blue-100 text-blue-800",
  picked_up: "bg-purple-100 text-purple-800",
  completed: "bg-gray-100 text-gray-700",
  expired: "bg-amber-100 text-amber-800",
  cancelled: "bg-red-100 text-red-800",
};

function formatDate(value?: string) {
  if (!value) return "Not provided";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleString();
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) =>
    letter.toUpperCase()
  );
}

export default function RestaurantDonationDetailsPage({
  params,
}: PageProps) {
  const [id, setId] = useState("");

  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Read the dynamic route ID without useParams().
  useEffect(() => {
    let cancelled = false;

    params
      .then(({ id }) => {
        if (!cancelled) {
          setId(id);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not read the donation ID.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [params]);

  // Load donation details when the route ID becomes available.
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadDonation() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/donations", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Could not load donation."
          );
        }

        const items: Donation[] = Array.isArray(result.donations)
          ? result.donations
          : [];

        const found = items.find((item) => item._id === id);

        if (!found) {
          throw new Error(
            "Donation not found in your restaurant's donation list."
          );
        }

        if (!cancelled) {
          setDonation(found);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load donation details."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDonation();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
<main className="relative min-h-screen overflow-hidden bg-[#faf9f6] text-[#173c2b]">
  {/* Decorative background */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute right-0 top-20 h-80 w-64 rounded-bl-[100%] bg-gradient-to-bl from-[#e8f1e6] to-transparent opacity-70"
  />

  {/* Navigation */}
  <nav className="relative z-10 border-b border-[#e8ebe4] bg-white/90 backdrop-blur">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
      <Link href="/" className="text-xl font-extrabold tracking-tight sm:text-2xl">
        Share<span className="text-[#16805e]">APlate</span>
      </Link>

      <Link
        href="/restaurant"
        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#edf5ef] px-3 py-2 text-sm font-semibold text-[#075b43] transition hover:bg-[#dceee1] sm:px-5"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m3 10 9-7 9 7" />
          <path d="M5 9v12h14V9M9 21v-7h6v7" />
        </svg>
        Dashboard
      </Link>
    </div>
  </nav>

  {/* Page content */}
  <section className="relative z-10 mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <Link
      href="/restaurant/donations"
      className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#08765a] transition hover:text-[#064d3a]"
    >
      <span className="text-lg" aria-hidden="true">←</span>
      Back to my donations
    </Link>

    <div className="mb-7 mt-6 sm:mb-9 sm:mt-7">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#138263]">
        Donation information
      </p>

      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#064b3b] sm:text-4xl lg:text-5xl">
        Donation Details
      </h1>

      <p className="mt-3 max-w-xl text-sm leading-6 text-[#687d89] sm:text-base sm:leading-7">
        Here you can view all the details about your food donation and
        track its current status.
      </p>
    </div>

    {/* Loading state */}
    {loading ? (
      <div className="rounded-2xl border border-[#e8ece6] bg-white p-6 shadow-sm sm:p-10">
        <div className="animate-pulse space-y-5">
          <div className="h-7 w-1/2 rounded-lg bg-gray-100" />
          <div className="h-4 w-1/3 rounded bg-gray-100" />
          <div className="h-40 rounded-xl bg-[#f1f5f1]" />
          <div className="h-16 rounded-xl bg-gray-100" />
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Loading donation details...
        </p>
      </div>
    ) : error ? (
      /* Error state */
      <div
        role="alert"
        className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:p-8"
      >
        <div className="flex items-start gap-3">
          <span className="text-xl text-red-500" aria-hidden="true">!</span>
          <div>
            <h2 className="font-bold text-red-700">
              Could not load donation
            </h2>
            <p className="mt-2 break-words text-sm leading-6 text-red-600">
              {error}
            </p>
            <Link
              href="/restaurant/donations"
              className="mt-4 inline-flex min-h-10 items-center font-semibold text-[#08765a] underline underline-offset-4"
            >
              Return to my donations
            </Link>
          </div>
        </div>
      </div>
    ) : donation ? (
      <article className="overflow-hidden rounded-2xl border border-[#e9ece6] bg-white/95 p-4 shadow-[0_12px_45px_rgba(23,60,43,0.07)] sm:p-7 md:p-8">
        {/* Donation title */}
        <div className="flex flex-col gap-5 border-b border-[#edf0eb] pb-6 sm:flex-row sm:items-center sm:justify-between sm:pb-7">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#edf5ed] text-[#26764e] sm:h-20 sm:w-20">
              <svg
                viewBox="0 0 24 24"
                className="h-9 w-9 sm:h-11 sm:w-11"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M8 3c-2 2 2 3 0 5M12 2c-2 2 2 3 0 6M16 3c-2 2 2 3 0 5" />
                <path d="M4 12h16a8 8 0 0 1-16 0Z" />
                <path d="M7 16h10" />
              </svg>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium text-[#6a7e8b]">
                Food donation
              </p>

              <h2 className="mt-1 break-words text-2xl font-extrabold tracking-tight text-[#07513e] sm:text-3xl">
                {donation.foodName}
              </h2>

              <span className="mt-2 inline-flex max-w-full rounded-full bg-[#eaf4ec] px-3 py-1 text-xs font-semibold capitalize text-[#075b43]">
                {donation.foodType.replaceAll("_", " ")}
              </span>
            </div>
          </div>

          <span
            className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold ${
              statusStyles[donation.status] ??
              "bg-gray-100 text-gray-700"
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-current" />
            {formatStatus(donation.status)}
          </span>
        </div>

        {/* Key donation information */}
        <div className="mt-5 rounded-xl bg-[#f3f7f4] p-4 sm:mt-6 sm:p-5 lg:p-6">
          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-3">
            {/* Quantity */}
            <div className="flex gap-3 border-b border-[#dfe9e3] py-4 sm:pr-4 lg:border-b-0 lg:border-r lg:pr-5 lg:pt-2">
              <svg
                viewBox="0 0 24 24"
                className="mt-0.5 h-6 w-6 shrink-0 text-[#08745a]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m12 2 9 5-9 5-9-5 9-5Z" />
                <path d="M3 7v10l9 5 9-5V7M12 12v10" />
              </svg>
              <div className="min-w-0">
                <p className="text-sm text-[#617888]">Quantity</p>
                <p className="mt-1 break-words font-bold">
                  {donation.quantity} {donation.unit}
                </p>
                <p className="mt-0.5 text-xs text-[#617888]">
                  Donation amount
                </p>
              </div>
            </div>

            {/* Preparation time */}
            <div className="flex gap-3 border-b border-[#dfe9e3] py-4 sm:pl-4 lg:border-b-0 lg:border-r lg:px-5 lg:pt-2">
              <svg
                viewBox="0 0 24 24"
                className="mt-0.5 h-6 w-6 shrink-0 text-[#08745a]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18" />
              </svg>
              <div className="min-w-0">
                <p className="text-sm text-[#617888]">Preparation time</p>
                <p className="mt-1 break-words text-sm font-semibold leading-6 sm:text-base">
                  {formatDate(donation.preparedAt)}
                </p>
              </div>
            </div>

            {/* Expiry time */}
            <div className="flex gap-3 border-b border-[#dfe9e3] py-4 sm:pr-4 lg:border-b-0 lg:pl-5 lg:pr-0 lg:pt-2">
              <svg
                viewBox="0 0 24 24"
                className="mt-0.5 h-6 w-6 shrink-0 text-[#08745a]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18" />
              </svg>
              <div className="min-w-0">
                <p className="text-sm text-[#617888]">Expiry time</p>
                <p className="mt-1 break-words text-sm font-semibold leading-6 sm:text-base">
                  {formatDate(donation.expiryTime)}
                </p>
              </div>
            </div>

            {/* Pickup deadline */}
            <div className="flex gap-3 border-b border-[#dfe9e3] py-4 sm:pr-4 lg:border-r lg:border-t lg:border-b-0 lg:pr-5">
              <svg
                viewBox="0 0 24 24"
                className="mt-0.5 h-6 w-6 shrink-0 text-[#08745a]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <div className="min-w-0">
                <p className="text-sm text-[#617888]">Pickup deadline</p>
                <p className="mt-1 break-words text-sm font-semibold leading-6 sm:text-base">
                  {formatDate(donation.pickupDeadline)}
                </p>
              </div>
            </div>

            {/* Donation ID */}
            <div className="flex gap-3 border-b border-[#dfe9e3] py-4 sm:pl-4 lg:border-r lg:border-t lg:border-b-0 lg:px-5">
              <svg
                viewBox="0 0 24 24"
                className="mt-0.5 h-6 w-6 shrink-0 text-[#08745a]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3a8 8 0 0 0-8 8v3M12 7a4 4 0 0 0-4 4v6M12 11a0 0 0 0 0 0 0" />
                <path d="M12 3a8 8 0 0 1 8 8v3a4 4 0 0 1-4 4h-1" />
                <path d="M12 15v6M8 17v2M16 11v2" />
              </svg>
              <div className="min-w-0">
                <p className="text-sm text-[#617888]">Donation ID</p>
                <p className="mt-1 break-all font-mono text-xs leading-5 text-[#617888]">
                  {donation._id}
                </p>
              </div>
            </div>

            {/* Created on */}
            <div className="flex gap-3 py-4 sm:pl-4 lg:border-t lg:pl-5 lg:pt-4">
              <svg
                viewBox="0 0 24 24"
                className="mt-0.5 h-6 w-6 shrink-0 text-[#08745a]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18" />
              </svg>
              <div className="min-w-0">
                <p className="text-sm text-[#617888]">Created on</p>
                <p className="mt-1 break-words text-sm font-semibold leading-6 sm:text-base">
                  {formatDate(donation.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status information */}
        <div className="mt-4 flex gap-4 rounded-xl border border-[#e4f0e7] bg-[#edf6ef] p-4 sm:mt-5 sm:p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#d9eddf] text-[#188052]">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          </div>

          <div className="min-w-0">
            <h3 className="break-words font-bold text-[#08614e]">
              Current status: {formatStatus(donation.status)}
            </h3>
            <p className="mt-1 text-sm leading-6 text-[#617888]">
              {donation.status === "available"
                ? "Your donation is currently available for pickup. An organization can claim it when they are ready."
                : `Your donation is currently ${formatStatus(
                    donation.status
                  ).toLowerCase()}. Check the details above for its current collection information.`}
            </p>
          </div>
        </div>

        {/* Additional details */}
        <div className="mt-6 border-t border-[#e8ede8] pt-5 sm:mt-7 sm:pt-6">
          <h3 className="mb-4 text-base font-bold text-[#28665d]">
            Additional details
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex min-w-0 gap-3 rounded-xl border border-[#e3ebe5] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e9f4eb] text-[#16805e]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 8-9 8-16Z" />
                  <path d="M4 21c3-5 6-8 11-11" />
                </svg>
              </div>
              <div className="min-w-0 self-center">
                <p className="text-sm text-[#617888]">Food type</p>
                <p className="mt-1 break-words text-sm font-medium capitalize">
                  {donation.foodType.replaceAll("_", " ")}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 gap-3 rounded-xl border border-[#e3ebe5] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e9f4eb] text-[#16805e]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </div>
              <div className="min-w-0 self-center">
                <p className="text-sm text-[#617888]">Pickup deadline</p>
                <p className="mt-1 break-words text-sm font-medium">
                  {formatDate(donation.pickupDeadline)}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 gap-3 rounded-xl border border-[#e3ebe5] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e9f4eb] text-[#16805e]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 3h14v18H5z" />
                  <path d="M8 8h8M8 12h8M8 16h5" />
                </svg>
              </div>
              <div className="min-w-0 self-center">
                <p className="text-sm text-[#617888]">Donation record</p>
                <p className="mt-1 break-words text-sm font-medium">
                  {donation.createdAt
                    ? formatDate(donation.createdAt)
                    : "Creation date not provided"}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 gap-3 rounded-xl border border-[#e3ebe5] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e9f4eb] text-[#16805e]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21v-2a8 8 0 0 1 16 0v2Z" />
                </svg>
              </div>
              <div className="min-w-0 self-center">
                <p className="text-sm text-[#617888]">Donor information</p>
                <p className="mt-1 break-words text-sm font-medium">
                  Restaurant donation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-7 border-t border-[#e8ede8] pt-5 sm:mt-8 sm:pt-6">
          <Link
            href="/restaurant/donations"
            className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#197b5d] to-[#087653] px-5 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:from-[#126b50] hover:to-[#065f42] focus:outline-none focus:ring-4 focus:ring-green-200"
          >
            <span aria-hidden="true" className="text-lg">←</span>
            Back to all donations
          </Link>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href={`/restaurant/donations/${encodeURIComponent(
                donation._id
              )}/edit`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#16805e] bg-white px-4 py-3 text-sm font-bold text-[#08745a] transition hover:bg-[#edf6ef] focus:outline-none focus:ring-4 focus:ring-green-100"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 20h9" />
                <path d="m16.5 3.5 4 4L8 20l-5 1 1-5Z" />
              </svg>
              Edit Donation
            </Link>

            <button
              type="button"
              onClick={() => {
                // Connect your existing cancellation handler here.
              }}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="m19 6-1 14H6L5 6" />
                <path d="M10 11v5M14 11v5" />
              </svg>
              Cancel Donation
            </button>
          </div>
        </div>
      </article>
    ) : null}
  </section>

  {/* Footer */}
  <footer className="relative z-10 mt-8 border-t border-[#e8ece5] bg-white/60">
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-center text-xs text-[#71818b] sm:flex-row sm:px-6 sm:text-left lg:px-8">
      <p>
        <span className="font-bold text-[#08745a]">ShareAPlate</span>
        <span className="mx-2">·</span>
        Making food sharing easier.
      </p>
      <p>Every donation can make a difference.</p>
    </div>
  </footer>
</main>
  );
}
