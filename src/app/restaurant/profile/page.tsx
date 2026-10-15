"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import type { Coordinates } from "@/components/LocationPicker";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-xl border border-[#DDE8DF] bg-[#F5F8F3] text-sm text-[#657568]">
      Loading map...
    </div>
  ),
});

type Restaurant = {
  _id: string;
  restaurantName: string;
  address: string;
  location?: {
    coordinates?: [number, number];
  };
};

function PlateButton({
  href,
  children,
  type = "button",
  disabled = false,
  onClick,
  className = "",
}: {
  href?: string;
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const content = (
    <span className="flex min-h-11 items-center justify-center gap-2 border-2 border-white bg-[#E5F1E8] px-4 py-2 text-center text-sm font-extrabold tracking-wide text-[#006B4D] transition-colors duration-150 group-hover:bg-white sm:px-5">
      {children}
    </span>
  );

  const buttonClass = `group box-border inline-block cursor-pointer border-2 border-[#00583F] bg-[#00845F] pb-2 transition-[padding,transform] duration-100 ease-in-out select-none active:translate-y-[8px] active:pb-0 active:mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00845F] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none ${className}`;

  if (href) {
    return (
      <Link href={href} className={buttonClass}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClass}
    >
      {content}
    </button>
  );
}

function ProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [restaurantName, setRestaurantName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fetching, setFetching] = useState(Boolean(id));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!id) {
      setFetching(false);
      return;
    }

    const controller = new AbortController();

    async function loadProfile() {
      try {
        setFetching(true);
        setError("");

        const response = await fetch(`/api/restaurant/${id}/verify`, {
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Could not load profile.");
        }

        const profile: Restaurant = result.restaurant;

        setRestaurantName(profile.restaurantName ?? "");
        setAddress(profile.address ?? "");
        setLongitude(String(profile.location?.coordinates?.[0] ?? ""));
        setLatitude(String(profile.location?.coordinates?.[1] ?? ""));
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error ? err.message : "Could not load profile.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setFetching(false);
        }
      }
    }

    void loadProfile();

    return () => controller.abort();
  }, [id]);

  function handleLocationSelect(
    location: Coordinates,
    selectedAddress?: string,
  ) {
    setLatitude(String(location.latitude));
    setLongitude(String(location.longitude));

    if (selectedAddress) {
      setAddress(selectedAddress);
    }
  }

  async function handleDelete() {
    if (!id || loading || deleting) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this restaurant profile? This action cannot be undone.",
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/restaurants/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Could not delete restaurant profile.",
        );
      }

      if (localStorage.getItem("shareaplateRestaurantId") === id) {
        localStorage.removeItem("shareaplateRestaurantId");
      }

      router.replace("/restaurant");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while deleting the profile.",
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      !latitude.trim() ||
      !longitude.trim() ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      setError(
        "Please select a location on the map or enter valid latitude and longitude coordinates.",
      );
      return;
    }

    if (!restaurantName.trim() || !address.trim()) {
      setError("Please enter the restaurant name and full address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        id ? `/api/restaurant/${id}/verify` : "/api/restaurants",
        {
          method: id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            restaurantName: restaurantName.trim(),
            address: address.trim(),
            latitude: lat,
            longitude: lng,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.errors?.formErrors?.[0] ||
            "Could not save restaurant profile.",
        );
      }

      const savedId = result.restaurant?._id ?? id;

      if (savedId) {
        localStorage.setItem("shareaplateRestaurantId", savedId);
      }

      setNotice(result.message || "Profile saved successfully.");

      router.push("/restaurant");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="mt-8 rounded-2xl border border-[#DDE8DF] bg-white p-10 text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[#DDE8DF] border-t-[#00845F]" />
        <p className="mt-4 text-sm font-medium text-[#657568]">
          Loading restaurant profile...
        </p>
      </div>
    );
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  const initialLocation: Coordinates | undefined =
    latitude.trim() !== "" &&
    longitude.trim() !== "" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
      ? { latitude: lat, longitude: lng }
      : undefined;

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-7 rounded-3xl border border-[#DDE8DF] bg-white p-5 shadow-sm sm:p-8"
    >
      <div className="border-b border-[#E7EDE5] pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#00845F]">
          Restaurant information
        </p>

        <h2 className="mt-2 text-xl font-extrabold text-[#193D2B] sm:text-2xl">
          {id ? "Update your restaurant" : "Tell us about your restaurant"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#657568]">
          Enter your restaurant details and choose its location so local NGOs
          can find you.
        </p>
      </div>

      <div>
        <label
          htmlFor="restaurantName"
          className="mb-2 block text-sm font-bold text-[#193D2B]"
        >
          Restaurant name
        </label>

        <input
          id="restaurantName"
          value={restaurantName}
          onChange={(event) => setRestaurantName(event.target.value)}
          required
          maxLength={100}
          placeholder="Your restaurant name"
          className="min-h-12 w-full rounded-xl border border-[#D6E1D5] bg-[#FBFCF9] px-4 py-3 text-[#193D2B] outline-none transition focus:border-[#00845F] focus:ring-4 focus:ring-[#00845F]/10"
        />
      </div>

      <div>
        <label
          htmlFor="address"
          className="mb-2 block text-sm font-bold text-[#193D2B]"
        >
          Full address
        </label>

        <textarea
          id="address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          required
          rows={3}
          maxLength={500}
          placeholder="Street, locality, city, state and PIN code"
          className="w-full rounded-xl border border-[#D6E1D5] bg-[#FBFCF9] px-4 py-3 text-[#193D2B] outline-none transition focus:border-[#00845F] focus:ring-4 focus:ring-[#00845F]/10"
        />
      </div>

      <div className="rounded-2xl border border-[#DDE8DF] bg-[#F6F9F4] p-4 sm:p-5">
        <h3 className="font-extrabold text-[#193D2B]">
          Choose restaurant location
        </h3>

        <p className="mt-2 text-sm leading-6 text-[#657568]">
          Search for your restaurant, use your current location, or click the
          map to place a pin. The coordinates below will update automatically.
        </p>

        <div className="mt-4 overflow-hidden rounded-xl">
          <LocationPicker
            initialLocation={initialLocation}
            onLocationSelect={handleLocationSelect}
          />
        </div>
      </div>

      <div>
        <h3 className="font-extrabold text-[#193D2B]">Location coordinates</h3>

        <p className="mt-1 text-sm leading-6 text-[#657568]">
          You can also enter the coordinates manually.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="latitude"
            className="mb-2 block text-sm font-bold text-[#193D2B]"
          >
            Latitude
          </label>

          <input
            id="latitude"
            type="number"
            step="any"
            min="-90"
            max="90"
            value={latitude}
            onChange={(event) => setLatitude(event.target.value)}
            required
            placeholder="e.g. 28.1487"
            className="min-h-12 w-full rounded-xl border border-[#D6E1D5] bg-[#FBFCF9] px-4 py-3 text-[#193D2B] outline-none transition focus:border-[#00845F] focus:ring-4 focus:ring-[#00845F]/10"
          />
        </div>

        <div>
          <label
            htmlFor="longitude"
            className="mb-2 block text-sm font-bold text-[#193D2B]"
          >
            Longitude
          </label>

          <input
            id="longitude"
            type="number"
            step="any"
            min="-180"
            max="180"
            value={longitude}
            onChange={(event) => setLongitude(event.target.value)}
            required
            placeholder="e.g. 77.3200"
            className="min-h-12 w-full rounded-xl border border-[#D6E1D5] bg-[#FBFCF9] px-4 py-3 text-[#193D2B] outline-none transition focus:border-[#00845F] focus:ring-4 focus:ring-[#00845F]/10"
          />
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
        >
          {error}
        </p>
      )}

      {notice && (
        <p
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800"
        >
          {notice}
        </p>
      )}

      <div className="flex flex-col gap-4 border-t border-[#E7EDE5] pt-6 sm:flex-row sm:flex-wrap sm:items-center">
        <PlateButton
          type="submit"
          disabled={loading || deleting}
          className="w-full sm:w-auto"
        >
          {loading
            ? "Saving..."
            : id
              ? "Save Changes"
              : "Create Restaurant Profile"}
        </PlateButton>

        <PlateButton href="/restaurant" className="w-full sm:w-auto">
          Cancel
        </PlateButton>

   
      </div>
    </form>
  );
}

export default function RestaurantProfilePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F8F3] text-[#193D2B]">
      <nav className="border-b border-[#DDE8DF] bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-3 py-3 min-[380px]:px-5 sm:gap-4 sm:px-8 sm:py-5">
          <PlateButton href="/" className="!border-[#00583F]">
            <span className="text-base font-black tracking-tight min-[380px]:text-lg">
              Share<span className="text-[#00845F]">APlate</span>
            </span>
          </PlateButton>

          <PlateButton href="/restaurant">Dashboard</PlateButton>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-white via-white to-[#EAF3E8]">
        <div className="mx-auto max-w-6xl px-4 py-8 min-[380px]:px-5 sm:px-8 sm:py-14">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#00845F] min-[380px]:text-xs sm:text-sm sm:tracking-[0.22em]">
            ShareAPlate · Restaurant
          </p>

          <h1 className="mt-3 text-2xl font-black tracking-tight text-[#193D2B] min-[380px]:text-3xl sm:text-4xl md:text-5xl">
            Set Up Your Restaurant
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#657568] sm:text-base sm:leading-7">
            Keep your restaurant details accurate so your business can
            participate in ShareAPlate, connect with local NGOs, and share
            surplus food with people who need it.
          </p>

          <div className="mt-5 flex flex-col gap-3 min-[480px]:flex-row min-[480px]:flex-wrap sm:mt-6">
            <PlateButton href="/restaurant">Restaurant Dashboard</PlateButton>

            <PlateButton href="/restaurant/donations">My Donations</PlateButton>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-3 pb-8 pt-5 min-[380px]:px-5 sm:px-8 sm:pb-12 sm:pt-10">
        <Suspense
          fallback={
            <div className="rounded-2xl border border-[#DDE8DF] bg-white p-4 text-sm leading-6 text-[#657568] min-[380px]:p-6 sm:p-8">
              Loading restaurant form...
            </div>
          }
        >
          <ProfileForm />
        </Suspense>

        <footer className="mt-7 flex flex-col items-stretch justify-between gap-4 border-t border-[#DDE8DF] pt-5 min-[480px]:flex-row min-[480px]:items-center sm:mt-8 sm:pt-6">
          <PlateButton href="/">Back Home</PlateButton>

          <p className="break-words text-xs leading-5 text-[#718174] min-[380px]:text-sm min-[480px]:text-right">
            ShareAPlate · Good food. Greater impact.
          </p>
        </footer>
      </section>
    </main>
  );
}
