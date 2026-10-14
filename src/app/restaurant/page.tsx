
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Restaurant = {
  _id: string;
  restaurantName?: string;
  name?: string;
  address?: string;
  location?: {
    type?: string;
    coordinates?: number[];
  };
  verified?: boolean;
  donating?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

const GREEN = "#00845F";

export default function RestaurantProfilePage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/restaurants/me", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              (response.status === 401
                ? "Please log in to view your restaurant profile."
                : "Failed to load your restaurant profile.")
          );
        }

        if (!data.restaurant) {
          throw new Error(
            "You don't have a restaurant profile yet. Please create one first."
          );
        }

        setRestaurant(data.restaurant);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading your profile."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => controller.abort();
  }, []);

  const formatDate = (value?: string) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not available";

    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8F3] px-5 text-[#193D2B]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#DCE9DF] border-t-[#00845F]" />
          <h1 className="text-xl font-bold">My Restaurant Profile</h1>
          <p className="mt-2 text-sm text-[#657568]">
            Loading your restaurant information...
          </p>
        </div>
      </main>
    );
  }

  if (error || !restaurant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8F3] px-5 py-12 text-[#193D2B]">
        <section className="w-full max-w-lg rounded-3xl border border-[#E0E8DF] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF3E8] text-3xl font-bold text-[#00845F]">
            !
          </div>

          <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-[#00845F]">
            ShareAPlate
          </p>

          <h1 className="mt-2 text-2xl font-extrabold">
            My Restaurant Profile
          </h1>

          <p role="alert" className="mt-4 text-sm leading-6 text-red-600">
            {error || "Restaurant profile not found."}
          </p>

          <div className="mt-6 flex justify-center">
            <AnimatedButton href="/">Back Home</AnimatedButton>
          </div>
        </section>
      </main>
    );
  }

  const coordinates = restaurant.location?.coordinates;
  const restaurantName =
    restaurant.restaurantName || restaurant.name || "Restaurant";

  return (
    <main className="min-h-screen bg-[#F7F8F3] text-[#193D2B]">
      {/* Page heading */}
      <section className="border-b border-[#E1E9DE] bg-gradient-to-br from-white via-white to-[#EAF3E8]">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-5 py-10 sm:px-8 sm:py-14 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#00845F]">
              ShareAPlate · Restaurant
            </p>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#193D2B] sm:text-4xl md:text-5xl">
              My Restaurant Profile
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-[#657568] sm:text-lg">
              View your restaurant information, check your verification
              status, and manage your food donation activity.
            </p>
          </div>

          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-[#D9E8D8] bg-white text-[#00845F] shadow-sm sm:h-28 sm:w-28">
            <RestaurantIcon className="h-14 w-14 sm:h-16 sm:w-16" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        {/* Navigation */}
        <nav
          aria-label="Restaurant navigation"
          className="mb-8 rounded-2xl border border-[#E1E9DE] bg-white p-3 shadow-sm"
        >
          <div className="flex flex-wrap gap-3">


            <AnimatedButton href="/restaurant/donations">
              My Donations
            </AnimatedButton>

            <AnimatedButton href="/restaurant/donations/new">
              Create Donation
            </AnimatedButton>

            <AnimatedButton href="/restaurant/profile">
              Edit Profile
            </AnimatedButton>
          </div>
        </nav>

        {/* Profile card */}
        <section className="overflow-hidden rounded-3xl border border-[#DDE7DC] bg-white shadow-sm">
          <div className="p-6 sm:p-9">
            {/* Restaurant identity */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3E8] text-[#00845F] sm:h-24 sm:w-24">
                  <RestaurantIcon className="h-12 w-12 sm:h-14 sm:w-14" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#00845F]">
                    Restaurant Account
                  </p>

                  <h2 className="mt-2 break-words text-2xl font-extrabold tracking-tight text-[#193D2B] sm:text-3xl">
                    {restaurantName}
                  </h2>

                  <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-[#657568] sm:text-base">
                    <svg
                      viewBox="0 0 24 24"
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#00845F]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>

                    <span>
                      {restaurant.address || "Address not provided"}
                    </span>
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
                  restaurant.verified
                    ? "bg-[#E3F3E6] text-[#216A3B]"
                    : "bg-[#FFF1D6] text-[#8A5B10]"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                    restaurant.verified
                      ? "bg-[#216A3B] text-white"
                      : "bg-[#8A5B10] text-white"
                  }`}
                  aria-hidden="true"
                >
                  {restaurant.verified ? "✓" : "!"}
                </span>

                {restaurant.verified
                  ? "Verified"
                  : "Pending verification"}
              </span>
            </div>

            {/* Details heading */}
            <div className="mt-8 border-t border-[#E5EBE3] pt-7">
              <div className="mb-5">
                <h3 className="text-lg font-bold text-[#193D2B]">
                  Restaurant Details
                </h3>

                <p className="mt-1 text-sm text-[#657568]">
                  Information associated with your restaurant account.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Detail
                  label="Restaurant ID"
                  value={restaurant._id}
                  icon="id"
                />

                <Detail
                  label="Donation Status"
                  value={
                    restaurant.donating === undefined
                      ? "Not specified"
                      : restaurant.donating
                        ? "Donations enabled"
                        : "Donations disabled"
                  }
                  icon="gift"
                  accent={restaurant.donating === true}
                />

                <Detail
                  label="Latitude"
                  value={
                    coordinates?.[1] == null
                      ? "Not available"
                      : String(coordinates[1])
                  }
                  icon="pin"
                />

                <Detail
                  label="Longitude"
                  value={
                    coordinates?.[0] == null
                      ? "Not available"
                      : String(coordinates[0])
                  }
                  icon="pin"
                />

                <Detail
                  label="Profile Created"
                  value={formatDate(restaurant.createdAt)}
                  icon="calendar"
                />

                <Detail
                  label="Last Updated"
                  value={formatDate(restaurant.updatedAt)}
                  icon="clock"
                />
              </div>
            </div>

            {/* Security information */}
            <div className="mt-6 flex items-start gap-4 rounded-2xl border border-[#DCE9DA] bg-[#F3F8F0] p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#00845F] shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>

              <div>
                <h3 className="font-bold text-[#193D2B]">
                  Your Account Is Protected
                </h3>

                <p className="mt-1 text-sm leading-6 text-[#657568]">
                  Your profile is loaded using your current login session.
                  Only authorized server-side logic should determine which
                  restaurant profile is returned.
                </p>
              </div>
            </div>

            {/* Donation call to action */}
            <div className="mt-8 rounded-2xl bg-[#00845F] p-6 text-white sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">
                Good food. Greater impact.
              </p>

              <h3 className="mt-2 text-xl font-bold sm:text-2xl">
                Make every surplus meal count.
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
                Share your surplus food with local NGOs and help reduce food
                waste in your community.
              </p>

              <div className="mt-5">
                <AnimatedButton href="/restaurant/donations/new">
                  Create a Donation
                </AnimatedButton>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <AnimatedButton href="/">Back Home</AnimatedButton>

          <p className="text-sm text-[#7A8A7D]">
            ShareAPlate · Connecting food with communities
          </p>
        </div>
      </div>
    </main>
  );
}

/* Reusable Uiverse-inspired animated button */
function AnimatedButton({
  children,
  href,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: {
  children: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}) {
  const letters = children.split("");

  const buttonContent = (
    <span className="relative block overflow-hidden">
      {/* Original label slides down on hover */}
      <span className="absolute inset-0 grid place-content-center whitespace-nowrap bg-[#00845F] text-white transition-transform duration-200 ease-[cubic-bezier(0.87,0,0.13,1)] group-hover:translate-y-full">
        {children}
      </span>

      {/* Staggered letter animation */}
      <span aria-hidden="true" className="inline-flex whitespace-nowrap">
        {letters.map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            style={{ transitionDelay: `${index * 35}ms` }}
            className={`inline-block text-[#00845F] opacity-0 transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.87,0,0.13,1)] group-hover:translate-y-0 group-hover:opacity-100 ${
              index % 2 === 0
                ? "-translate-y-[15px]"
                : "translate-y-[15px]"
            }`}
          >
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
      </span>
    </span>
  );

  const sharedClassName = `group relative inline-flex min-h-11 items-center justify-center overflow-hidden rounded-full border border-[#00845F] bg-[#00845F] px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition-transform duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00845F] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none ${className}`;

  if (href) {
    return (
      <Link href={href} className={sharedClassName}>
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={sharedClassName}
    >
      {buttonContent}
    </button>
  );
}

/* Restaurant illustration */
function RestaurantIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path d="M8 25h48L51 12H13L8 25Z" fill="currentColor" />

      <path
        d="M8 25h48v5a7 7 0 0 1-7 7 7 7 0 0 1-7-7 7 7 0 0 1-7 7 7 7 0 0 1-7-7 7 7 0 0 1-7 7 7 7 0 0 1-7-7 7 7 0 0 1-6 7V25Z"
        fill="#70B79A"
      />

      <path
        d="M14 36v19h36V36"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M25 43v9M39 43v9"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <path
        d="M31 39v13M35 39v13"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <path
        d="M11 56h42"
        stroke="#70B79A"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* Reusable detail card */
function Detail({
  label,
  value,
  icon,
  accent = false,
}: {
  label: string;
  value: string;
  icon: "id" | "gift" | "pin" | "calendar" | "clock";
  accent?: boolean;
}) {
  const icons = {
    id: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <circle cx="9" cy="11" r="2" />
        <path d="M6 17c.7-2 5.3-2 6 0M15 10h3M15 14h3" />
      </>
    ),
    gift: (
      <>
        <rect x="3" y="9" width="18" height="12" rx="2" />
        <path d="M12 9v12M2 9h20V5H2v4Z" />
        <path d="M12 5H7a2 2 0 1 1 2-2c0 2 3 2 3 2ZM12 5h5a2 2 0 1 0-2-2c0 2-3 2-3 2Z" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  };

  return (
    <div className="group flex min-w-0 items-start gap-4 rounded-2xl border border-[#E1E9DE] bg-[#F8FAF6] p-5 transition-colors duration-200 hover:border-[#B8D6C0] hover:bg-[#F0F7EF]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#00845F] shadow-sm transition-colors duration-200 group-hover:bg-[#00845F] group-hover:text-white">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {icons[icon]}
        </svg>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#718174]">
          {label}
        </p>

        <p
          className={`mt-2 break-words text-sm font-semibold leading-6 ${
            accent ? "text-[#00845F]" : "text-[#193D2B]"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
