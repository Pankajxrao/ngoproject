"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Donation = {
  _id: string;
  foodName: string;
  foodType: string;
  quantity: number;
  unit: string;
  expiryTime: string;
  pickupDeadline: string;
  status: string;
  createdAt?: string;
};

type NearbyNGO = {
  _id: string;
  ngoName: string;
  address: string;
  capacity?: number;
  location?: {
    type?: string;
    coordinates?: [number, number];
  };
};

const statusStyles: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  accepted: "bg-blue-100 text-blue-800",
  picked_up: "bg-purple-100 text-purple-800",
  completed: "bg-gray-100 text-gray-700",
  expired: "bg-amber-100 text-amber-800",
  cancelled: "bg-red-100 text-red-800",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString();
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function RestaurantDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [nearbyNGOs, setNearbyNGOs] = useState<
    Record<string, NearbyNGO[]>
  >({});
  const [nearbyLoading, setNearbyLoading] = useState<string | null>(null);
  const [nearbyErrors, setNearbyErrors] = useState<
    Record<string, string>
  >({});

  const loadDonations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/donations", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not load donations.");
      }

      setDonations(
        Array.isArray(result.donations) ? result.donations : []
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDonations();
  }, [loadDonations]);

  async function findNearbyNGOs(donationId: string) {
    setNearbyLoading(donationId);

    setNearbyErrors((previous) => ({
      ...previous,
      [donationId]: "",
    }));

    try {
      const response = await fetch(
        `/api/donations/${donationId}/nearby-NGO`,
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not find nearby NGOs.");
      }

      setNearbyNGOs((previous) => ({
        ...previous,
        [donationId]: Array.isArray(result.ngos) ? result.ngos : [],
      }));
    } catch (err) {
      setNearbyErrors((previous) => ({
        ...previous,
        [donationId]:
          err instanceof Error
            ? err.message
            : "Could not find nearby NGOs.",
      }));
    } finally {
      setNearbyLoading(null);
    }
  }

  return (
<main className="min-h-screen overflow-x-hidden bg-[#F5F8F4] text-[#173C2B]">
  {/* Navigation */}
  <nav className="sticky top-0 z-30 border-b border-[#DCE8E0] bg-white/95 backdrop-blur">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-8 sm:py-4">
      <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00845F] text-xl text-white shadow-sm sm:h-10 sm:w-10">
          ♧
        </span>

        <span className="truncate text-lg font-extrabold tracking-tight sm:text-xl">
          Share<span className="text-[#00845F]">APlate</span>
        </span>
      </Link>

      <div className="flex shrink-0 items-center gap-2 sm:gap-6">
        <Link
          href="/restaurant/donations"
          className="hidden text-sm font-semibold text-[#00845F] sm:block"
        >
          My Donations
        </Link>

        <Link
          href="/restaurant"
          className="whitespace-nowrap rounded-xl border border-[#DCE8E0] px-3 py-2 text-xs font-bold text-[#24513A] transition hover:bg-[#F0F7F1] active:translate-y-0.5 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          Dashboard ↗
        </Link>
      </div>
    </div>
  </nav>

  <section className="mx-auto max-w-7xl px-3 py-5 sm:px-8 sm:py-10">
    {/* Hero */}
    <div className="relative isolate overflow-hidden rounded-2xl bg-[#075B43] px-4 py-6 text-white shadow-sm min-[380px]:px-5 sm:rounded-3xl sm:px-10 sm:py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-24 -z-10 h-64 w-64 rounded-full border-[35px] border-white/[0.06]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-10 -z-10 h-48 w-48 rounded-full bg-[#4CC49A]/10 sm:right-40"
      />

      <div className="relative z-10 flex flex-col gap-5 sm:gap-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#C7F4DD] min-[380px]:text-[11px] sm:tracking-[0.16em]">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#83E7B9]" />
            Your food rescue hub
          </span>

          <h1 className="mt-4 text-2xl font-extrabold tracking-tight min-[380px]:text-3xl sm:mt-5 sm:text-4xl">
            My Donations
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
            Track your surplus food, monitor collection deadlines, and
            connect available donations with nearby NGOs.
          </p>

          <div className="mt-4 inline-flex max-w-full items-start gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-xs leading-5 text-white/90 min-[380px]:px-4 sm:mt-5 sm:text-sm">
            <span className="shrink-0 text-[#9EEBC6]">✦</span>
            <span>Every donation can make a difference.</span>
          </div>
        </div>

        <Link
          href="/restaurant/donations/new"
          className="group relative inline-flex w-full shrink-0 rounded-xl bg-[#006B4D] p-[3px] text-sm font-bold text-white transition-all duration-150 hover:bg-[#004F39] active:translate-y-1 sm:w-auto"
        >
          <span className="flex min-h-11 items-center justify-center gap-2 rounded-[9px] bg-[#00845F] px-5 py-2.5 transition-colors group-hover:bg-[#007553]">
            <span className="text-lg">+</span>
            Create Donation
          </span>
        </Link>
      </div>
    </div>

    {/* Summary statistics */}
    {!loading && !error && (
      <div className="mt-5 grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 sm:mt-6 sm:gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#E2EBE3] bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-500">
              Total donations
            </p>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7F5EC] text-lg">
              🍲
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold">
            {donations.length}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            All your listed donations
          </p>
        </div>

        <div className="rounded-2xl border border-[#D9EDE1] bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-500">
              Available
            </p>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-lg">
              🌱
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[#00845F]">
            {donations.filter((d) => d.status === "available").length}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Ready for NGO pickup
          </p>
        </div>

        <div className="rounded-2xl border border-[#E2EBE3] bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md min-[520px]:col-span-2 lg:col-span-1 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-500">
              Completed
            </p>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg">
              ✓
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold">
            {donations.filter((d) => d.status === "completed").length}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Successfully completed
          </p>
        </div>
      </div>
    )}

    {/* Donations heading */}
    <div className="mt-7 flex flex-col gap-3 min-[520px]:flex-row min-[520px]:items-center min-[520px]:justify-between sm:mt-9">
      <div className="min-w-0">
        <h2 className="text-xl font-extrabold">Your food listings</h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          Review details and find nearby collection partners.
        </p>
      </div>

      {!loading && !error && (
        <span className="inline-flex w-fit shrink-0 items-center rounded-full border border-[#DCE8E0] bg-white px-3 py-1.5 text-xs font-semibold text-[#42644F]">
          {donations.length}{" "}
          {donations.length === 1 ? "donation" : "donations"}
        </span>
      )}
    </div>

    {/* Loading state */}
    {loading ? (
      <div className="mt-5 grid gap-4 min-[520px]:grid-cols-2 sm:mt-6 sm:gap-5 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-2xl border border-[#E2EBE3] bg-white p-4 sm:p-6"
          >
            <div className="h-5 w-2/3 rounded bg-gray-200" />
            <div className="mt-4 h-4 w-1/3 rounded bg-gray-100" />
            <div className="mt-8 space-y-4">
              <div className="h-4 rounded bg-gray-100" />
              <div className="h-4 rounded bg-gray-100" />
              <div className="h-4 rounded bg-gray-100" />
            </div>
            <div className="mt-8 h-11 rounded-xl bg-gray-100" />
            <div className="mt-3 h-11 rounded-xl bg-gray-100" />
          </div>
        ))}
      </div>
    ) : error ? (
      <div
        role="alert"
        className="mt-5 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:p-5"
      >
        <p className="min-w-0 break-words">{error}</p>
        <button
          type="button"
          onClick={() => void loadDonations()}
          className="min-h-11 w-full shrink-0 rounded-lg border border-red-200 px-4 py-2 font-bold transition hover:bg-red-100 active:translate-y-0.5 sm:w-auto"
        >
          Try again
        </button>
      </div>
    ) : donations.length === 0 ? (
      /* Empty state */
      <section className="mt-5 rounded-2xl border border-dashed border-[#BCD4C3] bg-white px-4 py-10 text-center shadow-sm sm:mt-6 sm:rounded-3xl sm:px-10 sm:py-14">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E7F5EC] text-3xl">
          🍲
        </div>

        <h2 className="mt-5 text-xl font-extrabold">
          Your donation journey starts here
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
          Have surplus food at your restaurant? Create your first listing
          to help make it available to eligible NGOs in your area.
        </p>

        <Link
          href="/restaurant/donations/new"
          className="group mt-6 inline-flex w-full rounded-xl bg-[#006B4D] p-[3px] text-sm font-bold text-white transition active:translate-y-1 sm:w-auto"
        >
          <span className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[9px] bg-[#00845F] px-4 py-3 transition-colors group-hover:bg-[#007553] sm:px-6">
            + Create your first donation
          </span>
        </Link>
      </section>
    ) : (
      /* Donation cards */
      <div className="mt-5 grid items-start gap-4 min-[520px]:grid-cols-2 sm:mt-6 sm:gap-5 lg:grid-cols-3">
        {donations.map((donation) => (
          <article
            key={donation._id}
            className="group relative isolate flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E2EBE3] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00845F] hover:shadow-xl hover:shadow-[#00845F]/15 before:pointer-events-none before:absolute before:-right-5 before:-top-5 before:-z-10 before:h-10 before:w-10 before:scale-100 before:rounded-full before:bg-[#00845F] before:transition-transform before:duration-500 before:ease-out hover:before:scale-[30] motion-reduce:transform-none motion-reduce:transition-none motion-reduce:before:transition-none sm:p-6"
          >
            {/* Animated corner */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-0 z-20 flex h-9 w-9 items-center justify-center rounded-bl-[38px] rounded-tr-2xl bg-[#006B4D] pb-1 pl-1 text-sm font-bold text-white transition-opacity duration-200 group-hover:opacity-0"
            >
              ↗
            </span>

            {/* Title and status */}
            <div className="relative z-10 flex min-w-0 items-start justify-between gap-2 pr-2 sm:gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#00845F] transition-colors duration-300 group-hover:text-white/80">
                  Food donation
                </p>

                <h3 className="mt-2 break-words text-base font-extrabold text-[#173C2B] transition-colors duration-300 group-hover:text-white sm:text-lg">
                  {donation.foodName}
                </h3>

                <p className="mt-1 break-words text-sm capitalize text-gray-500 transition-colors duration-300 group-hover:text-white/80">
                  {donation.foodType.replaceAll("_", " ")}
                </p>
              </div>

              <span
                className={`relative z-20 max-w-[45%] shrink-0 break-words rounded-full px-2 py-1.5 text-[10px] font-extrabold sm:max-w-none sm:px-3 ${
                  statusStyles[donation.status] ??
                  "bg-gray-100 text-gray-700"
                }`}
              >
                {formatStatus(donation.status)}
              </span>
            </div>

            {/* Quantity */}
            <div className="relative z-10 mt-5 flex min-w-0 items-center gap-3 rounded-xl border border-[#E2EBE3] bg-[#F7FAF7] p-3 transition-colors duration-300 group-hover:border-white/20 group-hover:bg-white/10 sm:p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7F5EC] text-xl">
                📦
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 transition-colors duration-300 group-hover:text-white/80">
                  Available quantity
                </p>
                <p className="mt-1 break-words text-base font-extrabold text-[#173C2B] transition-colors duration-300 group-hover:text-white sm:text-lg">
                  {donation.quantity} {donation.unit}
                </p>
              </div>
            </div>

            {/* Pickup deadline */}
            <div className="relative z-10 mt-5 flex min-w-0 items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EDF5EF] text-base">
                🕒
              </span>

              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 transition-colors duration-300 group-hover:text-white/80">
                  Pickup deadline
                </p>
                <p className="mt-1 break-words text-sm font-semibold text-[#244734] transition-colors duration-300 group-hover:text-white">
                  {formatDate(donation.pickupDeadline)}
                </p>
              </div>
            </div>

            {/* Expiry */}
            <div className="relative z-10 mt-4 flex min-w-0 items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-base">
                ⏳
              </span>

              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 transition-colors duration-300 group-hover:text-white/80">
                  Food expiry time
                </p>
                <p className="mt-1 break-words text-sm font-semibold text-[#244734] transition-colors duration-300 group-hover:text-white">
                  {formatDate(donation.expiryTime)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="relative z-10 mt-auto space-y-3 pt-6">
              <Link
                href={`/restaurant/donations/${donation._id}`}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#00845F] bg-white px-3 py-2 text-sm font-bold text-[#00845F] transition-all duration-200 hover:bg-[#E7F5EC] active:translate-y-0.5 sm:px-4"
              >
                View details →
              </Link>

              <button
                type="button"
                onClick={() => void findNearbyNGOs(donation._id)}
                disabled={
                  nearbyLoading !== null ||
                  donation.status !== "available"
                }
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#006B4D] px-3 py-2 text-center text-xs font-bold text-white transition-all duration-200 hover:bg-[#004B36] active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 min-[380px]:text-sm sm:px-4"
              >
                {nearbyLoading === donation._id
                  ? "Finding nearby NGOs..."
                  : "⌖ Find Nearby NGOs (5 km)"}
              </button>

              {donation.status !== "available" && (
                <p className="text-xs leading-5 text-gray-500">
                  Nearby NGOs can only be found for available donations.
                </p>
              )}

              {/* Nearby NGO error */}
              {nearbyErrors[donation._id] && (
                <p
                  role="alert"
                  className="break-words rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {nearbyErrors[donation._id]}
                </p>
              )}

              {/* Nearby NGO results */}
              {nearbyNGOs[donation._id] && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="break-words font-extrabold text-[#173C2B]">
                    Nearby NGOs ({nearbyNGOs[donation._id].length})
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Eligible NGOs returned for this donation.
                  </p>

                  {nearbyNGOs[donation._id].length === 0 ? (
                    <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
                      No eligible NGOs found within 5 km.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {nearbyNGOs[donation._id].map((ngo) => (
                        <Link
                          key={ngo._id}
                          href={`/restaurant/nearby-ngo/${ngo._id}?donationId=${donation._id}`}
                          className="block rounded-xl border border-[#E2EBE3] bg-white p-3 transition hover:border-[#00845F] hover:bg-[#F0F8F2] active:translate-y-0.5 sm:p-4"
                        >
                          <div className="flex min-w-0 items-start justify-between gap-2">
                            <h5 className="min-w-0 break-words text-sm font-bold text-[#173C2B]">
                              {ngo.ngoName}
                            </h5>

                            <span className="shrink-0 text-xs font-bold text-[#00845F]">
                              View →
                            </span>
                          </div>

                          <p className="mt-2 break-words text-xs leading-5 text-gray-600">
                            {ngo.address}
                          </p>

                          {ngo.capacity !== undefined && (
                            <p className="mt-2 break-words text-xs font-semibold text-gray-600">
                              Capacity: {ngo.capacity}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    )}

    {/* Footer */}
    <footer className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-[#DCE8E0] pt-5 text-center sm:mt-10 sm:flex-row sm:pt-6 sm:text-left">
      <p className="text-xs leading-5 text-gray-500">
        © 2026 ShareAPlate. Sharing food, spreading care.
      </p>

      <Link
        href="/restaurant"
        className="text-sm font-semibold text-[#00845F] transition hover:text-[#00583F] hover:underline"
      >
        Back to Dashboard ↑
      </Link>
    </footer>
  </section>
</main>
  );
}
