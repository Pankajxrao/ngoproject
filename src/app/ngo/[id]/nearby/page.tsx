
"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Restaurant {
  _id: string;
  restaurantName: string;
  address: string;
  verified: boolean;
  donating: boolean;
  distanceKm: number;
}

interface NearbyResponse {
  success: boolean;
  message?: string;
  count?: number;
  radiusKm?: number;
  restaurants?: Restaurant[];
}

function NearbyRestaurantsContent() {
  const params = useParams<{ id: string }>();
  const ngoId = params.id;

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDonatingOnly, setShowDonatingOnly] = useState(false);

  const fetchNearbyRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/ngo/${encodeURIComponent(ngoId)}/nearby`,
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        }
      );

      const data: NearbyResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load nearby restaurants."
        );
      }

      setRestaurants(data.restaurants ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [ngoId]);

  useEffect(() => {
    if (ngoId) {
      void fetchNearbyRestaurants();
    }
  }, [ngoId, fetchNearbyRestaurants]);

  const displayedRestaurants = restaurants.filter((restaurant) =>
    showDonatingOnly ? restaurant.donating : true
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-green-700">
              ShareAPlate / NGO Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Nearby Restaurants
            </h1>

            <p className="mt-2 text-gray-600">
              Discover restaurants within 5 km of your NGO.
            </p>
          </div>

          <button
            onClick={() => void fetchNearbyRestaurants()}
            disabled={loading}
            className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Restaurants found within 5 km
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-900">
              {restaurants.length}
            </p>
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={showDonatingOnly}
              onChange={(event) =>
                setShowDonatingOnly(event.target.checked)
              }
              className="h-4 w-4 accent-green-700"
            />
            Show only restaurants currently donating
          </label>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <p className="font-semibold">Unable to load restaurants</p>
            <p className="mt-1 text-sm">{error}</p>

            <button
              onClick={() => void fetchNearbyRestaurants()}
              className="mt-3 text-sm font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading && restaurants.length === 0 && !error ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <p className="text-gray-600">
              Finding restaurants near your NGO...
            </p>
          </div>
        ) : !error && displayedRestaurants.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {restaurants.length === 0
                ? "No nearby restaurants found"
                : "No donating restaurants found"}
            </h2>

            <p className="mt-2 text-gray-600">
              {restaurants.length === 0
                ? "There are no restaurants within 5 km of this NGO."
                : "Try disabling the donating-only filter to see all nearby restaurants."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {displayedRestaurants.map((restaurant) => (
              <article
                key={restaurant._id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-bold text-gray-900">
                    {restaurant.restaurantName}
                  </h2>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      restaurant.verified
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {restaurant.verified ? "Verified" : "Unverified"}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {restaurant.address}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-xs text-gray-500">Distance</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {typeof restaurant.distanceKm === "number"
                        ? `${restaurant.distanceKm.toFixed(2)} km`
                        : "Within 5 km"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      restaurant.donating
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {restaurant.donating
                      ? "Donating"
                      : "Not donating"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-gray-500">
          Distances are calculated from the NGO location saved in ShareAPlate.
        </p>
      </div>
    </main>
  );
}

export default function NearbyRestaurantsPage() {
  return (
    <Suspense fallback={<div>Loading nearby restaurants...</div>}>
      <NearbyRestaurantsContent />
    </Suspense>
  );
}
