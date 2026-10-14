"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-xl border-2 border-[#d6ddd7] bg-white px-4 py-3 text-base text-[#173c2b] outline-none transition placeholder:text-gray-400 focus:border-[#246b45] focus:ring-4 focus:ring-[#246b45]/15";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"restaurant" | "ngo">("restaurant");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (name.trim().length < 2 || name.trim().length > 50) {
      setError("Name must be between 2 and 50 characters.");
      return;
    }

    if (!/^[A-Za-z ]+$/.test(name.trim())) {
      setError("Name must contain only English letters and spaces.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create your account."
        );
      }

      router.push("/login?registered=true");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf9f6] text-[#173c2b]">
      {/* Soft background shapes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-[#246b45]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-[#8fd0a8]/30 blur-3xl"
      />

      {/* Navigation */}
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Share<span className="text-[#246b45]">APlate</span>
        </Link>

        <Link
          href="/login"
          className="relative mb-[5px] touch-manipulation rounded-full border-4 border-[#8fd0a8] bg-[#f4faf6] px-4 py-2 text-sm font-bold text-[#246b45] shadow-[0_5px_#246b45] transition-colors duration-150 active:top-[5px] active:border-[#5fb383] active:shadow-none sm:px-5 [@media(hover:hover)]:hover:bg-white"
        >
          <span className="hidden sm:inline">Already a member? </span>Log in
        </Link>
      </nav>

      {/* Main content */}
      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 py-8 sm:px-6 md:min-h-[calc(100vh-80px)] md:grid-cols-2 lg:gap-20 lg:px-10">
        {/* Left section */}
        <div className="max-w-lg">
          <p className="inline-flex items-center gap-2 rounded-full border-2 border-[#246b45]/20 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#246b45]">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-[#246b45]"
            />
            Good food. Greater purpose.
          </p>

          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Make sharing
            <br />
            <span className="text-[#246b45]">count.</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-gray-600">
            Join a community that gives surplus food a second chance
            and helps get it to the people who need it.
          </p>

          <div className="mt-10 space-y-6">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 border-[#8fd0a8] bg-[#f4faf6] font-bold text-[#246b45] shadow-[0_4px_#246b45]">
                <span className="text-sm">01</span>
              </div>
              <div>
                <h2 className="font-semibold">For restaurants</h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Share surplus meals instead of letting good food go to waste.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 border-[#8fd0a8] bg-[#f4faf6] font-bold text-[#246b45] shadow-[0_4px_#246b45]">
                <span className="text-sm">02</span>
              </div>
              <div>
                <h2 className="font-semibold">For NGOs</h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Find food donations and coordinate collections for your community.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-10 border-l-2 border-[#246b45] py-1 pl-4 text-sm italic leading-6 text-gray-600">
            Every meal shared is an opportunity to make a difference.
          </p>
        </div>

        {/* Registration form */}
        <div className="w-full max-w-md rounded-3xl border border-[#e3eae4] bg-white/80 p-6 shadow-[0_20px_60px_rgba(36,107,69,0.12)] backdrop-blur-sm sm:p-8 md:ml-auto">
          <h2 className="text-3xl font-bold tracking-tight">
            Create your account
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            A few details to get your food-sharing journey started.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold"
              >
                Name or organization name
              </label>

              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                maxLength={50}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-semibold"
              >
                Phone number
              </label>

              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                placeholder="10-digit phone number"
                className={inputClass}
              />
            </div>

            {/* Role: pill toggle buttons */}
            <div>
              <p id="role-label" className="mb-3 block text-sm font-semibold">
                I am joining as a
              </p>

              <div
                role="group"
                aria-labelledby="role-label"
                className="grid grid-cols-2 gap-3"
              >
                {(
                  [
                    { value: "restaurant", label: "🍽️ Restaurant" },
                    { value: "ngo", label: "🤝 NGO" },
                  ] as const
                ).map((option) => {
                  const selected = role === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setRole(option.value)}
                      className={`relative mb-1 touch-manipulation rounded-full border-4 px-3 py-2.5 text-sm font-bold transition-colors duration-150 active:top-1 active:shadow-none ${
                        selected
                          ? "border-[#246b45] bg-[#246b45] text-white shadow-[0_4px_#143d27]"
                          : "border-[#8fd0a8] bg-[#f4faf6] text-[#246b45] shadow-[0_4px_#246b45] [@media(hover:hover)]:hover:bg-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                className={inputClass}
              />

              <p className="mt-2 text-xs text-gray-500">
                Use at least 6 characters.
              </p>
            </div>

            {/* API error */}
            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {/* Submit: Uiverse 3D pill button in brand green */}
            <button
              type="submit"
              disabled={loading}
              className="group relative mb-2 w-full touch-manipulation cursor-pointer rounded-full border-[6px] border-[#8fd0a8] bg-[#f4faf6] px-8 py-3 text-lg font-bold text-[#246b45] shadow-[0_8px_#246b45] transition-colors duration-150 active:top-2 active:border-[#5fb383] active:shadow-none disabled:pointer-events-none disabled:opacity-60 [@media(hover:hover)]:hover:border-[#6fbf8e] [@media(hover:hover)]:hover:bg-white"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {loading ? "Creating your account..." : "Create account"}
                {!loading && (
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-150 group-hover:translate-x-1"
                  >
                    →
                  </span>
                )}
              </span>
            </button>

            <p className="text-center text-xs leading-5 text-gray-500">
              By creating an account, you agree to use ShareAPlate
              responsibly and help reduce food waste.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already registered?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#246b45] hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}