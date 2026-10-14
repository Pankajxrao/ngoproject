"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Restaurant = {
  _id: string;
  restaurantName?: string;
  name?: string;
  address: string;
  verified: boolean;
  createdAt?: string;
};

function InteractiveHeading({ text, count }: { text: string; count: number }) {
  const [active, setActive] = useState<number | null>(null);
  const letters = text.split("");

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const index = Math.min(
      letters.length - 1,
      Math.max(0, Math.floor(ratio * letters.length))
    );
    setActive(index);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        onPointerMove={handleMove}
        onPointerDown={handleMove}
        onPointerLeave={() => setActive(null)}
        onPointerUp={() => setActive(null)}
        onPointerCancel={() => setActive(null)}
        style={{ touchAction: "pan-y" }}
        className="group relative inline-block cursor-default select-none"
      >
        <h1
          aria-label={text}
          className="flex text-4xl font-extrabold tracking-tight sm:text-5xl"
        >
          {letters.map((char, i) => {
            const distance = active === null ? 99 : Math.abs(i - active);
            const scale = distance === 0 ? 1.35 : distance === 1 ? 1.15 : 1;
            const lift = distance === 0 ? -8 : distance === 1 ? -4 : 0;

            return (
              <span
                key={i}
                aria-hidden="true"
                className={`inline-block transition-all duration-200 ease-out motion-reduce:transition-none ${
                  distance <= 1 ? "text-[#398653]" : "text-[#193D2B]"
                }`}
                style={{
                  transform: `translateY(${lift}px) scale(${scale})`,
                }}
              >
                {char}
              </span>
            );
          })}
        </h1>

        {/* Underline grows while the heading is being touched or hovered */}
        <span
          aria-hidden="true"
          className={`absolute -bottom-1 left-0 h-1 rounded-full bg-[#398653] transition-all duration-300 motion-reduce:transition-none ${
            active === null ? "w-8" : "w-full"
          }`}
        />
      </div>

      <span className="rounded-full border border-white bg-white/70 px-3 py-1 text-sm font-semibold text-[#398653] shadow-sm backdrop-blur-[6px]">
        {count} {count === 1 ? "result" : "results"}
      </span>
    </div>
  );
}

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRestaurants() {
      try {
        const res = await fetch("/api/restaurants");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load restaurants");
        }

        const list = Array.isArray(data.restaurants)
          ? data.restaurants
          : Array.isArray(data.data?.restaurants)
            ? data.data.restaurants
            : [];

        setRestaurants(list);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    loadRestaurants();
  }, []);

  const filtered = restaurants.filter((restaurant) =>
    `${restaurant.restaurantName || restaurant.name || ""} ${restaurant.address}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F7F8F3] text-[#193D2B]">
      {/* Background shapes so the glass blur has something to show */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-[#398653]/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-96 h-80 w-80 rounded-full bg-[#F5C26B]/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-[#7CC4A0]/30 blur-3xl"
      />

      <header className="relative z-10 border-b border-[#E2E9DF] bg-white px-4 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link href="/admin" className="text-sm font-semibold text-[#398653]">
            ← Admin dashboard
          </Link>
          <span className="text-sm font-semibold">Restaurant management</span>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-5">
        <InteractiveHeading text="Restaurants" count={filtered.length} />
        <p className="mt-4 text-[#657568]">
          Select a restaurant to view its profile.
        </p>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by restaurant name or address..."
          className="mt-6 w-full rounded-xl border border-[#DCE5DA] bg-white px-4 py-3 text-base outline-none focus:border-[#398653]"
        />

        {loading ? (
          <p className="mt-8 text-[#657568]">Loading restaurants...</p>
        ) : error ? (
          <p className="mt-8 text-red-600">{error}</p>
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#E2E9DF] bg-white p-8 text-center">
            <p className="font-semibold">No restaurants found</p>
            <p className="mt-2 text-sm text-[#657568]">
              Try another search or check whether profiles exist.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((restaurant) => (
              <Link
                key={restaurant._id}
                href={`/admin/restaurants/${restaurant._id}`}
                className="flex min-h-[220px] touch-manipulation select-none flex-col items-center justify-center gap-3 rounded-[17px] border border-white bg-[#D9D9D9]/60 p-6 text-center font-bold text-black shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-[6px] transition-all duration-500 active:scale-95 active:rotate-[1.7deg] sm:shadow-[12px_17px_51px_rgba(0,0,0,0.22)] [@media(hover:hover)]:hover:scale-105 [@media(hover:hover)]:hover:border-black"
              >
                <h2 className="break-words text-lg font-bold">
                  {restaurant.restaurantName ||
                    restaurant.name ||
                    "Unnamed restaurant"}
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    restaurant.verified
                      ? "bg-[#E5F3E9] text-[#216A3B]"
                      : "bg-[#FFF1D6] text-[#8A5B10]"
                  }`}
                >
                  {restaurant.verified ? "Verified" : "Pending"}
                </span>

                <p className="break-words text-sm font-medium text-[#4a5a4e]">
                  {restaurant.address}
                </p>

                <p className="mt-1 text-sm font-semibold text-[#398653]">
                  View details →
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}