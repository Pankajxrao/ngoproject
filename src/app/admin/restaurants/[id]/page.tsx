
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Restaurant = {
  _id: string;
  restaurantName?: string;
  name?: string;
  address?: string;
  location?: {
    coordinates?: number[];
  };
  verified: boolean;
  donating?: boolean;
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

function DetailCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="group min-w-0 rounded-2xl border border-[#e5ebe2] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b8d5bd] hover:shadow-[0_10px_28px_rgba(25,65,43,0.06)]">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf5ed] text-xl">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#829084]">
            {label}
          </p>
          <p className="mt-2 break-words text-sm font-semibold leading-6 text-[#183d2b] [overflow-wrap:anywhere] sm:text-base">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function RestaurantDetails() {
  const params = useParams();
  const id = params.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingVerification, setUpdatingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/restaurants/${id}`);
        const text = await response.text();

        let data;

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("The server returned an invalid response.");
        }

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch restaurant details."
          );
        }

        if (!data.restaurant) {
          throw new Error("Restaurant details could not be found.");
        }

        setRestaurant(data.restaurant);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading the restaurant."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurant();
    }
  }, [id]);

  const toggleVerification = async () => {
    if (!restaurant) return;

    try {
      setUpdatingVerification(true);
      setVerificationMessage("");

      const nextVerified = !restaurant.verified;

      const response = await fetch(`/api/restaurants/${id}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verified: nextVerified,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update restaurant verification."
        );
      }

      if (!data.restaurant) {
        throw new Error("The server did not return updated restaurant data.");
      }

      setRestaurant(data.restaurant);
      setVerificationMessage(
        nextVerified
          ? "Restaurant successfully verified."
          : "Restaurant verification has been revoked."
      );
    } catch (err) {
      setVerificationMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong while updating verification."
      );
    } finally {
      setUpdatingVerification(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f8f3] px-4 py-12 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-48 rounded bg-[#e0e8dc]" />
            <div className="h-10 w-72 max-w-full rounded-lg bg-[#e0e8dc]" />
            <div className="h-5 w-96 max-w-full rounded bg-[#e0e8dc]" />

            <div className="mt-10 overflow-hidden rounded-[28px] border border-[#e0e8dc] bg-white">
              <div className="h-36 bg-[#245d3e]" />
              <div className="space-y-6 p-6 sm:p-10">
                <div className="h-20 rounded-2xl bg-[#edf2e9]" />
                <div className="h-28 rounded-2xl bg-[#edf2e9]" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-28 rounded-2xl bg-[#edf2e9]"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p
            role="status"
            className="mt-6 text-center text-sm text-[#68776d]"
          >
            Loading restaurant details...
          </p>
        </div>
      </main>
    );
  }

  if (error || !restaurant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f8f3] px-4 py-12">
        <div className="w-full max-w-lg rounded-[28px] border border-[#e4e9df] bg-white p-7 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-bold text-[#173d2a]">
            Unable to load restaurant
          </h1>

          <p className="mt-3 break-words text-sm leading-6 text-[#718075]">
            {error || "Restaurant details could not be found."}
          </p>

          <Link
            href="/admin/restaurants"
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#245d3e] px-6 py-3 font-semibold text-white transition hover:bg-[#19452e] focus:outline-none focus:ring-2 focus:ring-[#70a981] focus:ring-offset-2"
          >
            ← Back to restaurants
          </Link>
        </div>
      </main>
    );
  }

  const coordinates = restaurant.location?.coordinates;
  const restaurantName =
    restaurant.restaurantName || restaurant.name || "Unnamed restaurant";

  const details = [
    {
      label: "Restaurant name",
      value: restaurantName,
      icon: "🍽️",
    },
    {
      label: "Restaurant ID",
      value: restaurant._id || "Not available",
      icon: "🪪",
    },
    {
      label: "Address",
      value: restaurant.address || "Address not provided",
      icon: "📍",
    },
    {
      label: "Latitude",
      value:
        coordinates?.[1] !== undefined
          ? String(coordinates[1])
          : "Not available",
      icon: "🌐",
    },
    {
      label: "Longitude",
      value:
        coordinates?.[0] !== undefined
          ? String(coordinates[0])
          : "Not available",
      icon: "🧭",
    },
    {
      label: "Donation eligibility",
      value: restaurant.donating ? "Eligible for donations" : "Not enabled",
      icon: "💚",
    },
    {
      label: "Created on",
      value: formatDate(restaurant.createdAt),
      icon: "📅",
    },
    {
      label: "Last updated",
      value: formatDate(restaurant.updatedAt),
      icon: "🕒",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f6f8f3] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <header className="mb-8 sm:mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#398253]">
            <Link
              href="/admin"
              className="transition hover:text-[#173d2a]"
            >
              Management
            </Link>
            <span className="text-[#a6b3a6]">/</span>
            <Link
              href="/admin/restaurants"
              className="transition hover:text-[#173d2a]"
            >
              Restaurants
            </Link>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#123d2a] sm:text-4xl lg:text-5xl">
            Restaurant profile
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#718075] sm:text-base sm:leading-7">
            Review restaurant information, manage verification, and check
            donation eligibility.
          </p>
        </header>

        {/* Main profile card */}
        <section className="overflow-hidden rounded-[24px] border border-[#e0e8dc] bg-white shadow-[0_20px_60px_rgba(25,65,43,0.07)] sm:rounded-[30px]">
          {/* Banner: content stays in normal document flow */}
          <div className="relative flex min-h-[150px] items-end overflow-hidden bg-gradient-to-br from-[#194631] via-[#286747] to-[#4d9b6b] px-5 py-7 sm:min-h-[180px] sm:px-10 sm:py-9">
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
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/85">
                Restaurant overview
              </p>
              <p className="mt-2 text-sm text-white/70">
                Restaurant information and verification
              </p>
            </div>
          </div>

          {/* All profile content begins below the banner */}
          <div className="space-y-8 px-5 py-6 sm:space-y-10 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
            {/* Restaurant identity */}
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-[#e5f2e8] text-3xl shadow-[0_4px_12px_rgba(25,65,43,0.12)] sm:h-20 sm:w-20 sm:text-4xl">
                  🍽️
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="break-words text-xl font-bold leading-tight text-[#123d2a] sm:text-2xl lg:text-3xl [overflow-wrap:anywhere]">
                    {restaurantName}
                  </h2>

                  <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-[#718075] sm:text-base">
                    <span aria-hidden="true" className="shrink-0">
                      📍
                    </span>
                    <span className="break-words [overflow-wrap:anywhere]">
                      {restaurant.address || "Address not provided"}
                    </span>
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ${
                  restaurant.verified
                    ? "bg-[#e2f4e6] text-[#267344]"
                    : "bg-[#fff1d6] text-[#9a620d]"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    restaurant.verified ? "bg-[#319458]" : "bg-[#e2a02c]"
                  }`}
                />
                {restaurant.verified ? "Verified" : "Pending verification"}
              </span>
            </div>

            {/* Verification controls */}
            <section
              aria-labelledby="verification-heading"
              className="rounded-[22px] border border-[#dfe8dc] bg-[#f8faf6] p-5 sm:p-7"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <h3
                    id="verification-heading"
                    className="text-lg font-bold text-[#123d2a] sm:text-xl"
                  >
                    Verification status
                  </h3>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#718075] sm:text-base">
                    {restaurant.verified
                      ? "This restaurant is verified and approved on the platform."
                      : "Review the restaurant details before approving its profile."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleVerification}
                  disabled={updatingVerification}
                  className={`inline-flex min-h-14 w-full shrink-0 items-center justify-center gap-3 rounded-2xl px-6 py-4 font-semibold text-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${
                    restaurant.verified
                      ? "bg-[#b65a4a] shadow-[0_5px_0_0_#8e4035] hover:bg-[#a44b3d] active:translate-y-[5px] active:shadow-none focus:ring-[#b65a4a]"
                      : "bg-[#388653] shadow-[0_5px_0_0_#a5d5b3] hover:bg-[#2e7446] active:translate-y-[5px] active:shadow-none focus:ring-[#388653]"
                  }`}
                >
                  <span aria-hidden="true" className="text-xl">
                    {updatingVerification
                      ? "⏳"
                      : restaurant.verified
                        ? "↺"
                        : "✓"}
                  </span>

                  <span>
                    {updatingVerification
                      ? "Updating..."
                      : restaurant.verified
                        ? "Revoke verification"
                        : "Approve restaurant"}
                  </span>
                </button>
              </div>

              {verificationMessage && (
                <div
                  role="status"
                  className={`mt-5 rounded-xl border px-4 py-3 text-sm leading-6 ${
                    verificationMessage.toLowerCase().includes("success") ||
                    verificationMessage.toLowerCase().includes("revoked")
                      ? "border-[#cce8d2] bg-[#eaf7ed] text-[#256b3d]"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {verificationMessage}
                </div>
              )}
            </section>

            {/* Restaurant details */}
            <section aria-labelledby="details-heading">
              <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#398253]">
                    Restaurant information
                  </p>
                  <h3
                    id="details-heading"
                    className="mt-2 text-2xl font-bold text-[#123d2a] sm:text-3xl"
                  >
                    Details &amp; location
                  </h3>
                </div>

                <span className="inline-flex w-fit items-center rounded-full bg-[#f0f4ed] px-4 py-2 text-xs font-semibold text-[#58715d]">
                  {details.length} details
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3">
                {details.map((detail) => (
                  <DetailCard
                    key={detail.label}
                    label={detail.label}
                    value={detail.value}
                    icon={detail.icon}
                  />
                ))}
              </div>
            </section>

            {/* Admin note */}
            <div className="flex items-start gap-4 rounded-2xl border border-[#dce9d9] bg-gradient-to-r from-[#f2f8f0] to-[#fafbf8] p-5 sm:p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                💡
              </div>

              <div className="min-w-0">
                <h4 className="font-bold text-[#214c31]">Admin note</h4>
                <p className="mt-1 text-sm leading-6 text-[#718075]">
                  Verify the restaurant&apos;s information before approving its
                  profile. Check its address and location details carefully.
                  Donation eligibility is shown separately from verification
                  status.
                </p>
              </div>
            </div>

            {/* Back navigation */}
            <div className="border-t border-[#e8ede5] pt-6">
              <Link
                href="/admin/restaurants"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-[#326747] transition hover:bg-[#f0f5ee] hover:text-[#173d2a] focus:outline-none focus:ring-2 focus:ring-[#70a981] focus:ring-offset-2"
              >
                <span aria-hidden="true">←</span>
                Back to restaurants
              </Link>
            </div>
          </div>
        </section>

        <footer className="px-2 py-6 text-center text-xs text-[#89958a]">
          Restaurant management · Admin dashboard
        </footer>
      </div>
    </main>
  );
}

export default function AdminRestaurantDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f6f8f3] px-4">
          <div className="flex items-center gap-3 text-sm font-medium text-[#53705a]">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#c9d9c8] border-t-[#286747]" />
            Loading restaurant profile...
          </div>
        </div>
      }
    >
      <RestaurantDetails />
    </Suspense>
  );
}
