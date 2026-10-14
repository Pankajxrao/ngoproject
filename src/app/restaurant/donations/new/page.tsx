"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const foodTypes = [
  { value: "cooked_food", label: "Cooked food" },
  { value: "packaged_food", label: "Packaged food" },
  { value: "bakery", label: "Bakery items" },
  { value: "fruits", label: "Fruits" },
  { value: "vegetables", label: "Vegetables" },
  { value: "other", label: "Other" },
];

const inputClass =
  "w-full rounded-xl border border-[#DCE8E0] bg-white px-4 py-3.5 text-sm text-[#183D2D] outline-none transition placeholder:text-gray-400 hover:border-[#A8CBB7] focus:border-[#00845F] focus:ring-4 focus:ring-[#00845F]/10";

const labelClass = "mb-2 block text-sm font-semibold text-[#244734]";

function PlateButton({
  children,
  type = "button",
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="group relative w-full rounded-xl bg-[#006B4D] p-[3px] text-sm font-bold text-white transition-all duration-150 hover:bg-[#00583F] active:translate-y-1 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      <span className="flex min-h-12 items-center justify-center gap-2 rounded-[9px] bg-[#00845F] px-6 py-3 transition-all duration-150 group-hover:bg-[#007553] group-active:translate-y-0.5">
        {children}
      </span>
    </button>
  );
}

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E7F5EC] text-sm font-bold text-[#00845F]">
        {number}
      </div>
      <div>
        <h2 className="text-base font-bold text-[#173C2B] sm:text-lg">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-5 text-gray-500">{description}</p>
      </div>
    </div>
  );
}

export default function NewDonationPage() {
  const router = useRouter();

  const [foodName, setFoodName] = useState("");
  const [foodType, setFoodType] = useState("cooked_food");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [preparedAt, setPreparedAt] = useState("");
  const [expiryTime, setExpiryTime] = useState("");
  const [pickupDeadline, setPickupDeadline] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const amount = Number(quantity);
    const expiry = new Date(expiryTime);
    const deadline = new Date(pickupDeadline);
    const prepared = preparedAt ? new Date(preparedAt) : null;

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    if (
      !expiryTime ||
      !pickupDeadline ||
      Number.isNaN(expiry.getTime()) ||
      Number.isNaN(deadline.getTime())
    ) {
      setError("Please enter a valid expiry time and pickup deadline.");
      return;
    }

    if (expiry <= new Date()) {
      setError("Expiry time must be in the future.");
      return;
    }

    if (deadline <= new Date()) {
      setError("Pickup deadline must be in the future.");
      return;
    }

    if (deadline > expiry) {
      setError("Pickup deadline cannot be later than expiry time.");
      return;
    }

    if (
      prepared &&
      (Number.isNaN(prepared.getTime()) ||
        prepared > new Date() ||
        prepared >= expiry)
    ) {
      setError(
        "Preparation time must be valid, not in the future, and before expiry."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          foodName: foodName.trim(),
          foodType,
          quantity: amount,
          unit,
          ...(preparedAt ? { preparedAt: prepared!.toISOString() } : {}),
          expiryTime: expiry.toISOString(),
          pickupDeadline: deadline.toISOString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not create the donation.");
      }

      router.push("/restaurant/donations");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F8F4] text-[#173C2B]">
      {/* Navigation */}
      <nav className="sticky top-0 z-20 border-b border-[#E0EAE2] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00845F] text-xl text-white shadow-sm">
              ♧
            </span>
            <span className="text-xl font-extrabold tracking-tight text-[#173C2B]">
              Share<span className="text-[#00845F]">APlate</span>
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/restaurant/donations"
              className="hidden text-sm font-semibold text-gray-600 transition hover:text-[#00845F] sm:block"
            >
              My donations
            </Link>
            <Link
              href="/restaurant"
              className="rounded-xl border border-[#DCE8E0] px-4 py-2.5 text-sm font-bold text-[#24513A] transition hover:bg-[#F0F7F1]"
            >
              Dashboard <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-8 sm:py-10">
        {/* Breadcrumb */}
       
        {/* Page heading */}
        <section className="relative mt-6 overflow-hidden rounded-3xl bg-[#075B43] px-6 py-8 text-white shadow-sm sm:px-10 sm:py-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full border-[35px] border-white/[0.06]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-[#4CC49A]/10"
          />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#C7F4DD]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#83E7B9]" />
              Share surplus food
            </span>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Turn extra food
              <br className="hidden sm:block" /> into something meaningful.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
              List your available food, set a safe collection window, and help
              local NGOs get good food to the people who need it.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-medium text-white/80 sm:text-sm">
              <span className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-[#A9F0CE]">✓</span>
                Simple listing
              </span>
              <span className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-[#A9F0CE]">✓</span>
                Clear pickup times
              </span>
              <span className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-[#A9F0CE]">✓</span>
                Less food waste
              </span>
            </div>
          </div>
        </section>

        <div className="mt-8 grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="min-w-0 space-y-6">
            {/* Food details */}
            <section className="rounded-2xl border border-[#E2EBE3] bg-white p-5 shadow-[0_4px_24px_rgba(23,60,43,0.035)] sm:p-8">
              <SectionHeading
                number="01"
                title="Food details"
                description="Tell NGOs what you're sharing today."
              />

              <div className="space-y-5">
                <div>
                  <label htmlFor="foodName" className={labelClass}>
                    Food name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="foodName"
                    value={foodName}
                    onChange={(event) => setFoodName(event.target.value)}
                    required
                    maxLength={150}
                    placeholder="e.g. Vegetable rice and curry"
                    className={inputClass}
                  />
                  <p className="mt-2 text-xs text-gray-400">
                    Use a clear name so recipients can identify the food.
                  </p>
                </div>

                <div>
                  <label htmlFor="foodType" className={labelClass}>
                    Food category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="foodType"
                    value={foodType}
                    onChange={(event) => setFoodType(event.target.value)}
                    className={inputClass}
                    required
                  >
                    {foodTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="quantity" className={labelClass}>
                      Available quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="quantity"
                      type="number"
                      min="0.01"
                      step="any"
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                      required
                      placeholder="e.g. 10"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="unit" className={labelClass}>
                      Measurement unit <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="unit"
                      value={unit}
                      onChange={(event) => setUnit(event.target.value)}
                      required
                      className={inputClass}
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="g">Grams (g)</option>
                      <option value="litres">Litres</option>
                      <option value="portions">Portions</option>
                      <option value="packets">Packets</option>
                      <option value="boxes">Boxes</option>
                      <option value="items">Items</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Timing */}
            <section className="rounded-2xl border border-[#E2EBE3] bg-white p-5 shadow-[0_4px_24px_rgba(23,60,43,0.035)] sm:p-8">
              <SectionHeading
                number="02"
                title="Preparation & timing"
                description="Accurate timings help everyone collect food safely."
              />

              <div className="space-y-5">
                <div>
                  <label htmlFor="preparedAt" className={labelClass}>
                    Preparation time{" "}
                    <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <input
                    id="preparedAt"
                    type="datetime-local"
                    value={preparedAt}
                    onChange={(event) => setPreparedAt(event.target.value)}
                    className={inputClass}
                  />
                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    For prepared food, enter when it was made.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="expiryTime" className={labelClass}>
                      Food expiry time{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="expiryTime"
                      type="datetime-local"
                      value={expiryTime}
                      onChange={(event) => setExpiryTime(event.target.value)}
                      required
                      className={inputClass}
                    />
                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      Enter the actual safe-use deadline.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="pickupDeadline" className={labelClass}>
                      Last pickup time{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="pickupDeadline"
                      type="datetime-local"
                      value={pickupDeadline}
                      onChange={(event) => setPickupDeadline(event.target.value)}
                      required
                      className={inputClass}
                    />
                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      Must be in the future and no later than expiry.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <span className="text-lg" aria-hidden="true">⚠</span>
                <div>
                  <p className="font-bold">We couldn't publish this donation</p>
                  <p className="mt-1 leading-5">{error}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 rounded-2xl border border-[#E2EBE3] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <Link
                href="/restaurant/donations"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#DCE8E0] px-6 py-3 text-sm font-bold text-[#385846] transition hover:bg-[#F5F8F4] active:translate-y-0.5"
              >
                Cancel
              </Link>

              <PlateButton type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Publishing donation...
                  </>
                ) : (
                  <>
                    Publish Donation <span aria-hidden="true">↗</span>
                  </>
                )}
              </PlateButton>
            </div>

            <p className="text-center text-xs leading-5 text-gray-400">
              By publishing, make sure your food details and collection times
              are accurate.
            </p>
          </form>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24">
            <section className="overflow-hidden rounded-2xl border border-[#DCEBE0] bg-white shadow-[0_4px_24px_rgba(23,60,43,0.035)]">
              <div className="bg-[#E9F6ED] p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  🌱
                </div>
                <h2 className="mt-4 text-lg font-extrabold text-[#174D36]">
                  Small act. Big impact.
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#527361]">
                  Your surplus could become someone's next meal. Every accurate
                  listing helps make food rescue easier.
                </p>
              </div>

              <div className="space-y-4 p-5">
                <h3 className="text-sm font-bold text-[#244734]">
                  Before you publish
                </h3>

                {[
                  "Describe the food clearly",
                  "Enter the correct quantity",
                  "Set a realistic pickup deadline",
                  "Confirm the food is safe to share",
                ].map((item, index) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E7F5EC] text-xs font-bold text-[#00845F]">
                      {index + 1}
                    </span>
                    <p className="pt-0.5 text-sm leading-5 text-gray-600">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-amber-200/80 bg-[#FFF9E9] p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg">
                  ⏱
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#80551B]">
                    Food safety first
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#8A6B3D]">
                    Give recipients enough time to collect the food before its
                    expiry. Only donate food that has been handled and stored
                    safely.
                  </p>
                </div>
              </div>
            </section>

            <div className="rounded-2xl bg-[#EDF3EF] p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#47735B]">
                Need to go back?
              </p>
              <p className="mt-2 text-sm leading-5 text-[#385846]">
                You can review your existing listings before creating another
                donation.
              </p>
              <Link
                href="/restaurant/donations"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#00845F] hover:underline"
              >
                View my donations <span aria-hidden="true">→</span>
              </Link>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[#DCE8E0] pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-gray-500">
            © 2026 ShareAPlate. Sharing food, spreading care.
          </p>
          <Link
            href="/restaurant"
            className="text-sm font-semibold text-[#00845F] transition hover:text-[#00583F] hover:underline"
          >
            Back to Dashboard ↑
          </Link>
        </footer>
      </div>
    </main>
  );
}
