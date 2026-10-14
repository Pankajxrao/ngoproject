
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type DonationStatus =
  | "available"
  | "accepted"
  | "picked_up"
  | "completed"
  | "expired"
  | "cancelled";

type Donation = {
  _id: string;
  foodName: string;
  foodType: string;
  quantity: number;
  unit: string;
  preparedAt?: string;
  expiryTime?: string;
  pickupDeadline?: string;
  status: DonationStatus;
  ngoId?: string;
};

const statusLabel: Record<DonationStatus, string> = {
  available: "Available",
  accepted: "Accepted",
  picked_up: "Picked up",
  completed: "Completed",
  expired: "Expired",
  cancelled: "Cancelled",
};

const filters = [
  { value: "all", label: "All donations" },
  { value: "available", label: "Available" },
  { value: "accepted", label: "Accepted" },
  { value: "picked_up", label: "Picked up" },
  { value: "completed", label: "Completed" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
] as const;

type FilterValue = (typeof filters)[number]["value"];

function formatDate(value?: string) {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not provided";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

async function readApiResponse(response: Response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed (${response.status}).`
    );
  }

  return data;
}

function StatusBadge({ status }: { status: DonationStatus }) {
  const styles: Record<DonationStatus, string> = {
    available:
      "border-emerald-200 bg-emerald-50 text-emerald-800",
    accepted: "border-blue-200 bg-blue-50 text-blue-800",
    picked_up:
      "border-amber-200 bg-amber-50 text-amber-800",
    completed:
      "border-green-200 bg-green-100 text-green-900",
    expired: "border-gray-200 bg-gray-100 text-gray-600",
    cancelled: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${styles[status]}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-current"
        aria-hidden="true"
      />
      {statusLabel[status]}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: number;
  detail: string;
  icon: string;
}) {
  return (
    <div className="group rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#00845F]/40 hover:shadow-lg sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-600">
            {label}
          </p>

          <p className="mt-3 text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
            {value}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-2xl transition-colors group-hover:bg-[#00845F]">
          <span
            className="transition-transform group-hover:scale-110"
            role="img"
            aria-label={label}
          >
            {icon}
          </span>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-gray-500">
        {detail}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15 text-sm transition-colors duration-300 group-hover:bg-emerald-50"
        aria-hidden="true"
      >
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium opacity-75">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function NGODonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(
    null
  );
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");

  const loadDonations = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch("/api/donations", {
          cache: "no-store",
        });

        const data = await readApiResponse(response);

        setDonations(data.donations ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadDonations();
  }, [loadDonations]);

  async function acceptDonation(id: string) {
    try {
      setUpdatingId(id);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/donations/${id}/accept`,
        {
          method: "POST",
        }
      );

      const data = await readApiResponse(response);

      setMessage(
        data.message || "Donation accepted successfully."
      );

      await loadDonations(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function updateDonationStatus(
    id: string,
    status: "picked_up" | "completed"
  ) {
    try {
      setUpdatingId(id);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/donations/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await readApiResponse(response);

      setMessage(
        data.message ||
          "Donation status updated successfully."
      );

      await loadDonations(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const summary = useMemo(
    () => ({
      total: donations.length,
      available: donations.filter(
        (d) => d.status === "available"
      ).length,
      accepted: donations.filter(
        (d) => d.status === "accepted"
      ).length,
      completed: donations.filter(
        (d) => d.status === "completed"
      ).length,
    }),
    [donations]
  );

  const filteredDonations = useMemo(
    () =>
      filter === "all"
        ? donations
        : donations.filter(
            (donation) => donation.status === filter
          ),
    [donations, filter]
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-white px-4 py-5 text-black sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="relative mb-8 overflow-hidden rounded-3xl bg-[#00845F] px-5 py-7 text-white shadow-lg shadow-emerald-900/10 sm:px-8 sm:py-9 lg:px-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10 sm:-right-4 sm:h-80 sm:w-80"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-white/5"
          />

          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href="/ngo/dashboard"
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <span aria-hidden="true">←</span>
                Dashboard
              </Link>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">
                ShareAPlate · NGO Portal
              </p>

              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Discover Food Donations
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
                Find available food, coordinate collections,
                and help make sure good food reaches the people
                who need it.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadDonations(true)}
              disabled={loading || refreshing}
              className="relative z-10 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#00845F] shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span
                aria-hidden="true"
                className={
                  refreshing ? "animate-spin" : ""
                }
              >
                ↻
              </span>

              {refreshing
                ? "Refreshing..."
                : "Refresh donations"}
            </button>
          </div>
        </header>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={() => void loadDonations()}
              className="shrink-0 font-bold underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {/* Success message */}
        {message && (
          <div
            role="status"
            className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900"
          >
            <p>✓ {message}</p>

            <button
              type="button"
              onClick={() => setMessage("")}
              aria-label="Dismiss message"
              className="shrink-0 text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Summary */}
        <section
          aria-label="Donation summary"
          className="mb-10"
        >
          <div className="mb-4">
            <h2 className="text-xl font-extrabold tracking-tight text-black sm:text-2xl">
              Your Donation Overview
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              A quick look at the donations and collections
              you are managing.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total donations"
              value={summary.total}
              detail="All donations currently listed"
              icon="🍱"
            />

            <SummaryCard
              label="Available"
              value={summary.available}
              detail="Ready for an NGO to accept"
              icon="🌱"
            />

            <SummaryCard
              label="Accepted"
              value={summary.accepted}
              detail="Waiting to be collected"
              icon="🤝"
            />

            <SummaryCard
              label="Completed"
              value={summary.completed}
              detail="Successfully collected and completed"
              icon="💚"
            />
          </div>
        </section>

        {/* Donation listings */}
        <section aria-label="Donation listings">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-black sm:text-3xl">
                Food Donation Listings
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Review donation details and update collection
                status.
              </p>
            </div>

            <p className="text-sm font-semibold text-gray-500">
              {filteredDonations.length}{" "}
              {filteredDonations.length === 1
                ? "donation"
                : "donations"}
            </p>
          </div>

          {/* Filters */}
          <div
            className="mb-6 flex gap-2 overflow-x-auto pb-2"
            aria-label="Filter donations by status"
          >
            {filters.map((option) => {
              const isActive = filter === option.value;

              const count =
                option.value === "all"
                  ? donations.length
                  : donations.filter(
                      (d) => d.status === option.value
                    ).length;

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setFilter(option.value)}
                  className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00845F] focus-visible:ring-offset-2 ${
                    isActive
                      ? "border-[#00845F] bg-[#00845F] text-white shadow-md shadow-emerald-900/10"
                      : "border-gray-200 bg-white text-gray-600 hover:border-[#00845F] hover:bg-emerald-50 hover:text-[#00845F]"
                  }`}
                >
                  {option.label}
                  <span className="ml-2 text-xs opacity-75">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Loading skeleton */}
          {loading ? (
            <div
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
              aria-label="Loading donation cards"
              aria-busy="true"
            >
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="min-h-[330px] animate-pulse rounded-2xl border border-gray-100 bg-gray-50 p-6"
                >
                  <div className="h-5 w-2/3 rounded-lg bg-gray-200" />
                  <div className="mt-4 h-4 w-1/3 rounded-lg bg-gray-200" />

                  <div className="mt-8 space-y-5">
                    <div className="h-10 rounded-xl bg-gray-200" />
                    <div className="h-10 rounded-xl bg-gray-200" />
                    <div className="h-10 rounded-xl bg-gray-200" />
                  </div>

                  <div className="mt-7 h-11 rounded-xl bg-gray-200" />
                </div>
              ))}
            </div>
          ) : filteredDonations.length === 0 ? (
            /* Empty state */
            <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/50 px-5 py-14 text-center sm:px-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                {donations.length === 0 ? "🍃" : "🔎"}
              </div>

              <h3 className="mt-5 text-xl font-extrabold text-black">
                {donations.length === 0
                  ? "No donations yet"
                  : "No donations found"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
                {donations.length === 0
                  ? "There are no donations to display right now. Check back soon to discover food that can help your community."
                  : "There are no donations matching this filter. Try another category to see more results."}
              </p>

              {filter !== "all" && (
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className="mt-6 rounded-xl bg-[#00845F] px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00845F] focus-visible:ring-offset-2"
                >
                  View all donations
                </button>
              )}
            </div>
          ) : (
            /* Donation cards */
            <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredDonations.map((donation) => {
                const isUpdating =
                  updatingId === donation._id;

                return (
                  <article
                    key={donation._id}
                    className="group relative isolate flex min-w-0 flex-col overflow-hidden rounded-[10px] border border-[#00845F] bg-[#00845F] text-white transition-transform duration-100 ease-linear active:scale-[0.98]"
                  >
                    {/* Animated circle background */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1/2 top-full z-0 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-white transition-[top] duration-200 ease-in-out group-hover:-top-[250px] motion-reduce:transition-none"
                    />

                    {/* Single card content wrapper */}
                    <div className="relative z-10 flex min-w-0 flex-1 flex-col p-5 text-white transition-colors duration-200 group-hover:text-[#00845F] sm:p-6">
                      {/* Title */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] opacity-75">
                            Food donation
                          </p>

                          <h3 className="mt-2 break-words text-xl font-extrabold leading-snug sm:text-2xl">
                            {donation.foodName}
                          </h3>
                        </div>

                        <span
                          className="shrink-0 rounded-xl border border-white/25 bg-white/10 px-2.5 py-2 text-lg transition-colors group-hover:border-emerald-100 group-hover:bg-emerald-50"
                          aria-hidden="true"
                        >
                          🍱
                        </span>
                      </div>

                      {/* Status and food type */}
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <StatusBadge status={donation.status} />

                        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold capitalize transition-colors group-hover:border-emerald-100 group-hover:bg-emerald-50">
                          {donation.foodType.replaceAll("_", " ")}
                        </span>
                      </div>

                      {/* Quantity */}
                      <div className="mt-5 rounded-2xl border border-white/20 bg-white/10 p-4 transition-colors duration-300 group-hover:border-emerald-100 group-hover:bg-emerald-50/80">
                        <p className="text-xs font-medium opacity-75">
                          Available quantity
                        </p>

                        <div className="mt-1 flex flex-wrap items-baseline gap-2">
                          <span className="text-3xl font-extrabold tracking-tight">
                            {donation.quantity}
                          </span>

                          <span className="text-sm font-semibold">
                            {donation.unit}
                          </span>
                        </div>
                      </div>

                      {/* Donation details */}
                      <div className="mt-5 space-y-4">
                        <DetailRow
                          icon="🕒"
                          label="Prepared at"
                          value={formatDate(donation.preparedAt)}
                        />

                        <DetailRow
                          icon="⌛"
                          label="Expiry time"
                          value={formatDate(donation.expiryTime)}
                        />

                        <DetailRow
                          icon="📍"
                          label="Pickup deadline"
                          value={formatDate(donation.pickupDeadline)}
                        />
                      </div>

                      {/* Status description and actions */}
                      <div className="mt-auto pt-6">
                        <div className="mb-4 border-t border-white/20 pt-4 transition-colors group-hover:border-emerald-100">
                          <p className="text-xs leading-5 opacity-75">
                            {donation.status === "available" &&
                              "This donation is ready to be accepted."}

                            {donation.status === "accepted" &&
                              "Coordinate your collection and mark it picked up."}

                            {donation.status === "picked_up" &&
                              "Confirm when this donation process is complete."}

                            {donation.status === "completed" &&
                              "This donation has been completed. Thank you for making a difference!"}

                            {donation.status === "expired" &&
                              "This donation has expired and is no longer available."}

                            {donation.status === "cancelled" &&
                              "This donation has been cancelled."}
                          </p>
                        </div>

                        {/* Accept donation */}
                        {donation.status === "available" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              void acceptDonation(donation._id)
                            }
                            className="w-full rounded-xl border border-white bg-white px-4 py-3 text-sm font-extrabold text-[#00845F] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#00845F] group-hover:border-[#00845F] group-hover:bg-[#00845F] group-hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isUpdating ? (
                              <span className="inline-flex items-center justify-center gap-2">
                                <span
                                  className="animate-spin"
                                  aria-hidden="true"
                                >
                                  ↻
                                </span>
                                Accepting...
                              </span>
                            ) : (
                              "Accept donation →"
                            )}
                          </button>
                        )}

                        {/* Mark as picked up */}
                        {donation.status === "accepted" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              void updateDonationStatus(
                                donation._id,
                                "picked_up"
                              )
                            }
                            className="w-full rounded-xl border border-white bg-white px-4 py-3 text-sm font-extrabold text-[#00845F] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#00845F] group-hover:border-[#00845F] group-hover:bg-[#00845F] group-hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isUpdating
                              ? "Updating..."
                              : "✓ Mark as picked up"}
                          </button>
                        )}

                        {/* Mark as completed */}
                        {donation.status === "picked_up" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              void updateDonationStatus(
                                donation._id,
                                "completed"
                              )
                            }
                            className="w-full rounded-xl border border-white bg-white px-4 py-3 text-sm font-extrabold text-[#00845F] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#00845F] group-hover:border-[#00845F] group-hover:bg-[#00845F] group-hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isUpdating
                              ? "Updating..."
                              : "✓ Mark as completed"}
                          </button>
                        )}

                        {/* Final statuses */}
                        {(
                          ["completed", "expired", "cancelled"] as DonationStatus[]
                        ).includes(donation.status) && (
                          <div className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-center text-sm font-semibold transition-colors group-hover:border-emerald-100 group-hover:bg-emerald-50">
                            <span aria-hidden="true">
                              {donation.status === "completed"
                                ? "✓"
                                : "•"}
                            </span>

                            {donation.status === "completed"
                              ? "Donation completed"
                              : "No further actions"}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-10 border-t border-gray-100 py-6 text-center">
          <p className="text-sm font-semibold text-[#00845F]">
            ShareAPlate · Share food. Spread kindness. 💚
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            Every donation is an opportunity to make a difference.
          </p>
        </footer>
      </div>
    </main>
  );
}
