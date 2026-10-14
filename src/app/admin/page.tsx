
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CountsState = {
  restaurants: number | null;
  ngos: number | null;
};

export default function AdminDashboard() {
  const [counts, setCounts] = useState<CountsState>({
    restaurants: null,
    ngos: null,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCounts() {
      try {
        setError("");

        const [restaurantsRes, ngosRes] = await Promise.all([
          fetch("/api/restaurants", { cache: "no-store" }),
          fetch("/api/ngo", { cache: "no-store" }),
        ]);

        const [restaurantsData, ngosData] = await Promise.all([
          restaurantsRes.json(),
          ngosRes.json(),
        ]);

        if (!restaurantsRes.ok || !ngosRes.ok) {
          throw new Error("Unable to load organization counts.");
        }

        const restaurants =
          restaurantsData.restaurants ??
          restaurantsData.data?.restaurants ??
          [];

        const ngos =
          ngosData.ngos ??
          ngosData.data?.ngos ??
          [];

        if (!cancelled) {
          setCounts({
            restaurants: Array.isArray(restaurants)
              ? restaurants.length
              : 0,
            ngos: Array.isArray(ngos) ? ngos.length : 0,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading dashboard data."
          );
        }
      }
    }

    void loadCounts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#F5F8F3] text-[#193D2B]">
      {/* Animated background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -right-32 top-40 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-32 bottom-0 h-80 w-80 rounded-full bg-green-200/30 blur-3xl"
      />

      {/* Navigation */}
      <header className="relative z-10 border-b border-[#E2E9DF] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          <Link
            href="/"
            className="shrink-0 text-xl font-extrabold tracking-tight sm:text-2xl"
          >
            Share<span className="text-[#00845F]">APlate</span>
            <span className="ml-2 hidden text-xs font-medium text-gray-400 sm:inline">
              ADMIN
            </span>
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-[#00845F] sm:px-4 sm:text-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00845F]" />
            </span>
            Admin panel
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        {/* Hero heading */}
        <section className="mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#00845F] shadow-sm sm:text-sm">
            <span aria-hidden="true">✦</span>
            Administration center
          </div>

          <div className="mt-5 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-[#193D2B] sm:text-5xl lg:text-6xl">
                Manage your
                <span className="block text-[#00845F]">
                  food-sharing network.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#657568] sm:text-base">
                Welcome to your ShareAPlate control center.
                Manage restaurant and NGO profiles, review
                organizations, and help connect surplus food
                with communities in need.
              </p>
            </div>

            <div className="hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm md:block">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl">
                🌱
              </div>
              <p className="mt-3 text-sm font-bold text-[#193D2B]">
                Growing together
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Less waste, more kindness.
              </p>
            </div>
          </div>
        </section>

        {/* Overview cards */}
        <section aria-labelledby="overview-heading">
          <div className="mb-5 flex flex-col gap-2 sm:mb-7">
            <h2
              id="overview-heading"
              className="text-xl font-extrabold tracking-tight sm:text-2xl"
            >
              Your organizations
            </h2>
            <p className="text-sm text-[#657568]">
              Choose a section to manage registered organizations.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
            >
              <p>{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="shrink-0 font-bold underline underline-offset-4"
              >
                Retry
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:gap-8">
            {/* Restaurant card */}
            <Link
              href="/admin/restaurants"
              className="admin-card group relative isolate min-h-[300px] overflow-hidden rounded-3xl border border-emerald-100 bg-white p-5 shadow-[0_8px_30px_rgba(25,61,43,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,132,95,0.14)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 sm:min-h-[340px] sm:p-8"
            >
              {/* Animated green blob */}
              <span
                aria-hidden="true"
                className="admin-blob absolute left-1/2 top-1/2 -z-10 h-44 w-44 rounded-full bg-[#00845F] opacity-70 blur-2xl transition-opacity duration-300 group-hover:opacity-90 sm:h-52 sm:w-52"
              />

              {/* Soft glass overlay */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-[5px] -z-10 rounded-[22px] border border-white/80 bg-white/90 backdrop-blur-xl transition-colors duration-300 group-hover:bg-white/75"
              />

              <div className="relative flex h-full min-h-[258px] flex-col sm:min-h-[290px]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-3xl shadow-sm transition duration-300 group-hover:scale-105 group-hover:bg-white sm:h-16 sm:w-16">
                    🍽️
                  </div>

                  <span className="rounded-full border border-emerald-100 bg-white/90 px-3 py-1.5 text-xs font-bold text-[#00845F]">
                    Organization
                  </span>
                </div>

                <div className="mt-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#00845F]">
                    Food providers
                  </p>

                  <h3 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                    Restaurants
                  </h3>

                  <p className="mt-3 max-w-sm text-sm leading-6 text-[#657568]">
                    Browse restaurant profiles, review
                    registered businesses, and check their
                    verification status.
                  </p>
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 pt-7">
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Registered profiles
                    </p>

                    <p className="mt-1 text-3xl font-black tracking-tight text-[#00845F] sm:text-4xl">
                      {counts.restaurants === null
                        ? "—"
                        : counts.restaurants}
                    </p>
                  </div>

                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00845F] text-xl text-white shadow-md transition duration-300 group-hover:translate-x-1 group-hover:bg-[#006B4D]">
                    →
                  </span>
                </div>
              </div>
            </Link>

            {/* NGO card */}
            <Link
              href="/admin/ngo"
              className="admin-card group relative isolate min-h-[300px] overflow-hidden rounded-3xl border border-emerald-100 bg-white p-5 shadow-[0_8px_30px_rgba(25,61,43,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,132,95,0.14)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 sm:min-h-[340px] sm:p-8"
            >
              {/* Animated green blob */}
              <span
                aria-hidden="true"
                className="admin-blob admin-blob-delay absolute left-1/2 top-1/2 -z-10 h-44 w-44 rounded-full bg-[#38A875] opacity-70 blur-2xl transition-opacity duration-300 group-hover:opacity-90 sm:h-52 sm:w-52"
              />

              {/* Soft glass overlay */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-[5px] -z-10 rounded-[22px] border border-white/80 bg-white/90 backdrop-blur-xl transition-colors duration-300 group-hover:bg-white/75"
              />

              <div className="relative flex h-full min-h-[258px] flex-col sm:min-h-[290px]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-3xl shadow-sm transition duration-300 group-hover:scale-105 group-hover:bg-white sm:h-16 sm:w-16">
                    🤝
                  </div>

                  <span className="rounded-full border border-emerald-100 bg-white/90 px-3 py-1.5 text-xs font-bold text-[#00845F]">
                    Organization
                  </span>
                </div>

                <div className="mt-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#00845F]">
                    Community partners
                  </p>

                  <h3 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                    NGOs
                  </h3>

                  <p className="mt-3 max-w-sm text-sm leading-6 text-[#657568]">
                    Review NGO profiles, manage verification
                    requests, and support trusted community
                    food distribution.
                  </p>
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 pt-7">
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Registered profiles
                    </p>

                    <p className="mt-1 text-3xl font-black tracking-tight text-[#00845F] sm:text-4xl">
                      {counts.ngos === null ? "—" : counts.ngos}
                    </p>
                  </div>

                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00845F] text-xl text-white shadow-md transition duration-300 group-hover:translate-x-1 group-hover:bg-[#006B4D]">
                    →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Bottom note */}
        <footer className="mt-10 rounded-2xl border border-emerald-100 bg-white/80 p-5 text-center sm:mt-14 sm:p-7">
          <span className="text-2xl" aria-hidden="true">
            💚
          </span>
          <p className="mt-2 text-sm font-bold text-[#193D2B]">
            Together, we can make every plate count.
          </p>
          <p className="mt-1 text-xs leading-5 text-[#657568]">
            ShareAPlate · Share food. Spread kindness.
          </p>
        </footer>
      </div>

      {/* Animation styles */}
     
    </main>
  );
}
