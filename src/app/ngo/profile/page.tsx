
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

type NGO = {
  _id: string;
  ngoName: string;
  address: string;
  location?: {
    type?: string;
    coordinates?: number[];
  };
  verified: boolean;
  acceptingDonations: boolean;
  capacity?: number;
  createdAt?: string;
  updatedAt?: string;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

const GREEN = "#00845F";

const LocationPicker = dynamic(
  () => import("@/components/LocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-[#d7e9e1] bg-white text-sm text-black shadow-[5px_5px_12px_#d9e9e1,-5px_-5px_12px_#ffffff] sm:h-80">
        Loading map...
      </div>
    ),
  }
);

function PushButton({
  children,
  type = "button",
  disabled = false,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`group relative isolate inline-flex min-h-12 items-center justify-center rounded-xl border-0 bg-transparent p-0 text-center outline-offset-4 outline-[#00845F] transition-[filter] duration-200 [-webkit-tap-highlight-color:transparent] hover:brightness-105 focus-visible:outline-2 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-xl bg-[#004c38] shadow-[0_2px_3px_#003d2d] [transform:translateY(3px)] transition-transform duration-300 ease-out group-hover:[transform:translateY(5px)] group-active:[transform:translateY(1px)]"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#006b4d] via-[#00845F] to-[#006b4d]"
      />
      <span className="relative flex min-h-12 w-full items-center justify-center rounded-xl bg-[#00845F] px-5 py-3 text-sm font-bold tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-transform duration-300 ease-out group-hover:-translate-y-1 group-active:translate-y-0.5 sm:text-base">
        {children}
      </span>
    </button>
  );
}

function SoftLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center rounded-xl border border-[#b9d9cc] bg-white px-5 py-3 text-center text-sm font-bold text-black shadow-[4px_4px_10px_#d9e9e1,-4px_-4px_10px_#ffffff] transition duration-200 hover:-translate-y-0.5 hover:border-[#00845F] hover:text-[#00845F] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00845F] active:translate-y-0 ${className}`}
    >
      {children}
    </Link>
  );
}

function SoftCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-[#e1eee8] bg-white p-5 shadow-[6px_6px_16px_#dcebe4,-6px_-6px_16px_#ffffff] sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

export default function NGOProfilePage() {
  const [ngo, setNgo] = useState<NGO | null>(null);
  const [ngoName, setNgoName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/ngo/me");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load NGO profile.");
      }

      const profile: NGO = data.ngo;

      if (!profile) {
        throw new Error("NGO profile was not found.");
      }

      setNgo(profile);
      setNgoName(profile.ngoName ?? "");
      setAddress(profile.address ?? "");

      // GeoJSON coordinates are [longitude, latitude].
      const coordinates = profile.location?.coordinates ?? [];
      setLongitude(
        coordinates[0] !== undefined ? String(coordinates[0]) : ""
      );
      setLatitude(
        coordinates[1] !== undefined ? String(coordinates[1]) : ""
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
    void loadProfile();
  }, [loadProfile]);

  function handleLocationSelect(
    coordinates: Coordinates,
    selectedAddress?: string
  ) {
    setLatitude(String(coordinates.latitude));
    setLongitude(String(coordinates.longitude));

    if (selectedAddress) {
      setAddress(selectedAddress);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ngo) return;

    setError("");
    setMessage("");

    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (!ngoName.trim() || !address.trim()) {
      setError("NGO name and address are required.");
      return;
    }

    if (
      !latitude.trim() ||
      !longitude.trim() ||
      !Number.isFinite(parsedLatitude) ||
      !Number.isFinite(parsedLongitude) ||
      parsedLatitude < -90 ||
      parsedLatitude > 90 ||
      parsedLongitude < -180 ||
      parsedLongitude > 180
    ) {
      setError("Please select a valid location on the map before saving.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`/api/ngo/${ngo._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ngoName: ngoName.trim(),
          address: address.trim(),
          latitude: parsedLatitude,
          longitude: parsedLongitude,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update NGO profile.");
      }

      if (data.ngo) {
        setNgo((current) =>
          current
            ? {
                ...current,
                ...data.ngo,
                location: data.ngo.location ?? current.location,
              }
            : current
        );
      }

      await loadProfile();

      setMessage(
        data.message ||
          "Profile updated successfully. Address or location changes may require re-verification."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  const initialLocation =
    latitude.trim() !== "" &&
    longitude.trim() !== "" &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude))
      ? {
          latitude: Number(latitude),
          longitude: Number(longitude),
        }
      : undefined;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4 text-black">
        <div className="w-full max-w-sm rounded-2xl border border-[#e1eee8] bg-white p-8 text-center shadow-[6px_6px_16px_#dcebe4,-6px_-6px_16px_#ffffff]">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#d9e9e1] border-t-[#00845F]" />
          <h1 className="text-lg font-bold">Loading your profile</h1>
          <p className="mt-2 text-sm text-black">
            Getting your organisation details ready...
          </p>
        </div>
      </main>
    );
  }

  if (!ngo) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10 text-black">
        <SoftCard className="w-full max-w-lg text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f5ef] text-2xl">
            !
          </div>
          <h1 className="mt-4 text-2xl font-extrabold">
            NGO profile unavailable
          </h1>
          <p className="mt-3 text-sm leading-6 text-black">
            {error || "Your NGO profile could not be loaded."}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <PushButton onClick={() => void loadProfile()}>
              Try again
            </PushButton>
            <SoftLink href="/ngo">Back to dashboard</SoftLink>
          </div>
        </SoftCard>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white px-4 py-5 text-black sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="relative mb-7 overflow-hidden rounded-3xl bg-[#00845F] p-5 text-white shadow-[0_10px_28px_rgba(0,132,95,0.18)] sm:mb-9 sm:p-8">
          <div
            aria-hidden="true"
            className="absolute -right-12 -top-16 h-48 w-48 rounded-full border-[24px] border-white/10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-white/10"
          />

          <div className="relative z-10">
            <SoftLink
              href="/ngo"
              className="min-h-10 border-white/40 bg-white/10 px-3 py-2 text-white shadow-none hover:border-white hover:bg-white hover:text-[#00845F]"
            >
              ← Dashboard
            </SoftLink>

            <div className="mt-6 flex flex-col gap-5 sm:mt-8 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">
                  ShareAPlate · Organisation settings
                </p>
                <h1 className="mt-2 break-words text-3xl font-black tracking-tight sm:text-4xl">
                  NGO Profile
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/95 sm:text-base">
                  Keep your organisation details accurate so your community
                  can find you and support your mission.
                </p>
              </div>

              <div className="w-fit rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/90">
                  Profile status
                </p>
                <p className="mt-1 font-bold">
                  {ngo.verified ? "✓ Verified organisation" : "Verification pending"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Status cards */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SoftCard className="relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f5ef] text-xl text-[#00845F]">
                ✓
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-black">
                  Verification
                </p>
                <h2 className="mt-1 text-lg font-extrabold">
                  {ngo.verified ? "Verified NGO" : "Pending verification"}
                </h2>
                <p className="mt-2 text-sm leading-5 text-black">
                  {ngo.verified
                    ? "Your organisation has been verified."
                    : "Your organisation must be verified before it can accept donations."}
                </p>
              </div>
            </div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#e8f5ef]">
              <div
                className={`h-full rounded-full transition-all ${
                  ngo.verified ? "w-full bg-[#00845F]" : "w-1/2 bg-[#00845F]"
                }`}
              />
            </div>
          </SoftCard>

          <SoftCard>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f5ef] text-xl text-[#00845F]">
                ♡
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-black">
                  Donation availability
                </p>
                <h2 className="mt-1 text-lg font-extrabold">
                  {ngo.acceptingDonations
                    ? "Accepting donations"
                    : "Not accepting donations"}
                </h2>
                <p className="mt-2 text-sm leading-5 text-black">
                  {ngo.acceptingDonations
                    ? "Your organisation is currently listed as accepting donations."
                    : "Donation availability can be managed from your dashboard."}
                </p>
                <SoftLink
                  href="/ngo"
                  className="mt-4 min-h-10 px-3 py-2 text-xs"
                >
                  Manage availability →
                </SoftLink>
              </div>
            </div>
          </SoftCard>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-2xl border border-[#00845F]/40 bg-white p-4 text-sm font-medium text-black shadow-[4px_4px_10px_#d9e9e1,-4px_-4px_10px_#ffffff]"
          >
            <span className="font-extrabold text-[#00845F]">Please note: </span>
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mb-5 rounded-2xl border border-[#00845F]/40 bg-[#f2faf6] p-4 text-sm font-medium text-black"
          >
            <span className="font-extrabold text-[#00845F]">✓ Saved: </span>
            {message}
          </div>
        )}

        {/* Main form card */}
        <form
          onSubmit={handleSubmit}
          className="space-y-7 rounded-3xl border border-[#e1eee8] bg-white p-4 shadow-[8px_8px_20px_#dcebe4,-8px_-8px_20px_#ffffff] sm:space-y-8 sm:p-7 lg:p-9"
        >
          <div className="flex flex-col gap-3 border-b border-[#e1eee8] pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#00845F]">
                Your information
              </p>
              <h2 className="mt-1 text-xl font-extrabold sm:text-2xl">
                Organisation details
              </h2>
              <p className="mt-2 text-sm leading-5 text-black">
                Update the name, address and location linked to your NGO.
              </p>
            </div>
            <div className="w-fit rounded-xl border border-[#d7e9e1] bg-white px-3 py-2 text-xs font-semibold text-black shadow-[3px_3px_8px_#dcebe4,-3px_-3px_8px_#ffffff]">
              Required fields marked *
            </div>
          </div>

          {/* NGO name */}
          <div>
            <label
              htmlFor="ngoName"
              className="mb-2 block text-sm font-bold text-black"
            >
              Organisation name <span className="text-[#00845F]">*</span>
            </label>
            <input
              id="ngoName"
              name="ngoName"
              type="text"
              required
              maxLength={150}
              value={ngoName}
              onChange={(event) => setNgoName(event.target.value)}
              placeholder="e.g. Helping Hands Foundation"
              className="w-full min-w-0 rounded-xl border border-[#cfe3d9] bg-white px-4 py-3.5 text-base text-black outline-none transition placeholder:text-black/50 focus:border-[#00845F] focus:ring-4 focus:ring-[#00845F]/10"
            />
            <p className="mt-2 text-xs text-black">
              Use the official name your donors will recognise.
            </p>
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="address"
              className="mb-2 block text-sm font-bold text-black"
            >
              Full address <span className="text-[#00845F]">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              required
              rows={3}
              maxLength={500}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Enter your organisation's complete address"
              className="w-full min-w-0 resize-y rounded-xl border border-[#cfe3d9] bg-white px-4 py-3.5 text-base text-black outline-none transition placeholder:text-black/50 focus:border-[#00845F] focus:ring-4 focus:ring-[#00845F]/10"
            />
          </div>

          {/* Location picker */}
          <section className="space-y-4 border-t border-[#e1eee8] pt-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ef] text-xl text-[#00845F]">
                ⌖
              </div>
              <div>
                <h2 className="text-lg font-extrabold sm:text-xl">
                  Pin your location
                </h2>
                <p className="mt-1 text-sm leading-6 text-black">
                  Search for your address, click the map to place a pin, or
                  use your current location. Check that the pin marks your
                  organisation&apos;s actual location.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#d7e9e1] bg-white p-2 shadow-[4px_4px_12px_#dcebe4,-4px_-4px_12px_#ffffff] sm:p-3">
              <LocationPicker
                initialLocation={initialLocation}
                onLocationSelect={handleLocationSelect}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="min-w-0 rounded-xl border border-[#e1eee8] bg-[#f8fcfa] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-black">
                  Latitude
                </p>
                <p className="mt-2 break-all font-mono text-sm font-semibold text-black">
                  {latitude || "No location selected"}
                </p>
              </div>
              <div className="min-w-0 rounded-xl border border-[#e1eee8] bg-[#f8fcfa] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-black">
                  Longitude
                </p>
                <p className="mt-2 break-all font-mono text-sm font-semibold text-black">
                  {longitude || "No location selected"}
                </p>
              </div>
            </div>

            {!latitude || !longitude ? (
              <p className="rounded-xl border border-[#d7e9e1] bg-white p-3 text-sm font-medium text-black">
                <span className="font-extrabold text-[#00845F]">Tip: </span>
                Select a point on the map before saving your profile.
              </p>
            ) : (
              <p className="text-sm font-semibold text-[#00845F]">
                ✓ Location coordinates selected
              </p>
            )}
          </section>

          {/* Form actions */}
          <div className="flex flex-col-reverse gap-4 border-t border-[#e1eee8] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-sm text-xs leading-5 text-black">
              Changes to your address or location may require your organisation
              to be verified again.
            </p>

            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:flex sm:shrink-0">
              <SoftLink href="/ngo" className="w-full sm:w-auto">
                Cancel
              </SoftLink>
              <PushButton
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto"
              >
                {saving ? "Saving changes..." : "Save profile"}
              </PushButton>
            </div>
          </div>
        </form>

        {/* Footer metadata */}
        <footer className="mt-6 flex flex-col gap-2 pb-4 text-xs text-black sm:flex-row sm:items-center sm:justify-between">
          <p>ShareAPlate · Helping communities share more.</p>
          {ngo.createdAt && (
            <p>
              Profile created:{" "}
              {new Date(ngo.createdAt).toLocaleDateString()}
            </p>
          )}
        </footer>
      </div>
    </main>
  );
}
