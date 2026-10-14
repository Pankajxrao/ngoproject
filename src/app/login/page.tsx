"use client";

import Link from "next/link";
import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRegistered(params.get("registered") === "true");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to log in.");
      }

      const role =
        data.data?.role ??
        data.data?.user?.role ??
        data.role ??
        data.user?.role;

      if (role === "restaurant") {
        router.push("/restaurant");
      } else if (role === "ngo") {
        router.push("/ngo");
      } else if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
<main className="relative min-h-screen overflow-x-clip bg-[#faf9f6] text-[#173c2b]">
  {/* Decorative background */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#dceee2]/70 blur-3xl sm:-right-32 sm:-top-32 sm:h-80 sm:w-80"
  />
  <div
    aria-hidden="true"
    className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-[#f0e8d5]/70 blur-3xl sm:-bottom-32 sm:-left-32 sm:h-72 sm:w-72 md:h-96 md:w-96"
  />

  {/* Navigation */}
  <nav className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
    <Link
      href="/"
      className="shrink-0 text-lg font-extrabold tracking-tight sm:text-2xl"
    >
      Share<span className="text-[#00845F]">APlate</span>
      <span className="ml-2 hidden align-middle text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6b7b71] sm:inline">
        Good food. Shared.
      </span>
    </Link>

    <Link
      href="/register"
      className="shrink-0 rounded-full border border-[#d6e5d9] bg-white/70 px-3 py-2 text-xs font-bold text-[#00845F] transition hover:border-[#00845F] hover:bg-[#edf7f1] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00845F] sm:px-5 sm:py-2.5 sm:text-sm"
    >
      Create account <span aria-hidden="true">↗</span>
    </Link>
  </nav>

  {/* Main content */}
  <section className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-8 px-4 pb-8 pt-5 sm:gap-10 sm:px-6 sm:pb-12 sm:pt-8 md:min-h-[calc(100vh-80px)] md:grid-cols-2 md:gap-8 lg:gap-16 lg:px-10">
    {/* Welcome panel */}
    <div className="mx-auto w-full max-w-lg md:mx-0">
      <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-[#d5e7d9] bg-white/80 px-3 py-2 text-[10px] font-bold text-[#176447] shadow-sm sm:mb-7 sm:text-sm">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00845F]/40" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00845F]" />
        </span>
        GOOD FOOD, GREATER GOOD
      </div>

      <h1 className="max-w-xl text-[2.5rem] font-extrabold leading-[1.08] tracking-[-0.045em] min-[380px]:text-[2.75rem] sm:text-5xl sm:leading-[1.08] lg:text-6xl">
        Welcome back.
        <br />
        <span className="text-[#00845F]">Let&apos;s spread</span>
        <br />
        a little good.
      </h1>

      <p className="mt-5 max-w-md text-sm leading-7 text-[#5d6b63] sm:mt-6 sm:text-base sm:leading-8">
        Every shared meal means less food wasted and more people cared for.
        Sign in and keep the goodness going.
      </p>

      {/* Food-sharing visual */}
      <div className="relative mt-7 overflow-hidden rounded-3xl border border-[#dce8df] bg-[#edf5ed] p-4 sm:mt-9 sm:p-6">
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/50 sm:h-40 sm:w-40" />

        <div className="relative flex items-center gap-3 min-[380px]:gap-4 sm:gap-5">
          <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm min-[380px]:h-[76px] min-[380px]:w-[76px] min-[380px]:text-4xl sm:h-24 sm:w-24 sm:text-5xl">
            🥗
          </div>

          <div className="min-w-0">
            <p className="text-base font-extrabold tracking-tight sm:text-lg">
              A little extra.
              <br />
              <span className="text-[#00845F]">A lot of good.</span>
            </p>
            <p className="mt-1.5 text-xs leading-5 text-[#5d6b63] sm:text-sm">
              Good food deserves a place at every table.
            </p>
          </div>
        </div>

        <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#d4e4d6] pt-4 text-xs font-semibold text-[#38644b] min-[380px]:gap-x-6 sm:mt-5 sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true">♡</span> Care for people
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true">♻</span> Waste less
          </span>
        </div>
      </div>

      <p className="mt-5 hidden text-sm italic text-[#718075] md:block">
        “No one should go hungry while good food goes to waste.”
      </p>
    </div>

    {/* Login card */}
    <div className="mx-auto w-full max-w-md md:ml-auto">
      <div className="rounded-3xl border border-[#e0e8df] bg-white/95 p-4 shadow-[0_12px_45px_rgba(23,60,43,0.07)] min-[380px]:p-5 sm:p-8 md:p-9">
        <div className="mb-6 sm:mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf4ed] text-2xl sm:h-14 sm:w-14">
            <span aria-hidden="true">🌱</span>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Log in
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#718075] sm:text-base">
            Good to see you again. Let&apos;s pick up where you left off.
          </p>
        </div>

        {registered && (
          <p
            role="status"
            className="mb-5 break-words rounded-xl border border-[#b8d9c8] bg-[#edf7f1] p-3 text-sm leading-5 text-[#176447]"
          >
            Account created successfully. Please log in.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="min-w-0">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-bold text-[#254b36]"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="min-h-12 w-full min-w-0 rounded-xl border border-[#d8e2d9] bg-[#fafcf9] px-3 py-3 text-base text-[#173c2b] outline-none transition placeholder:text-[#9aa59b] focus:border-[#00845F] focus:bg-white focus:ring-4 focus:ring-[#00845F]/10 sm:px-4"
            />
          </div>

          <div className="min-w-0">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-bold text-[#254b36]"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="min-h-12 w-full min-w-0 rounded-xl border border-[#d8e2d9] bg-[#fafcf9] px-3 py-3 text-base text-[#173c2b] outline-none transition placeholder:text-[#9aa59b] focus:border-[#00845F] focus:bg-white focus:ring-4 focus:ring-[#00845F]/10 sm:px-4"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="break-words rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700"
            >
              {error}
            </p>
          )}

          {/* Original button styling preserved */}
          <button
            type="submit"
            disabled={loading}
            className="relative min-h-12 w-full cursor-pointer rounded-full border-[4px] border-[#00845F] bg-[#f8f8fd] px-3 py-3.5 text-base font-bold text-[#00845F] shadow-[0_6px_0_#00845F] transition-all active:top-1.5 active:border-[#006B4D] active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 sm:border-[6px] sm:px-5 sm:text-lg sm:shadow-[0_8px_0_#00845F] sm:active:top-2"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-2 min-[380px]:gap-3 sm:my-7">
          <div className="h-px min-w-0 flex-1 bg-[#e7ece6]" />
          <span className="shrink-0 text-[10px] text-[#8a978e] min-[380px]:text-xs">
            A community that cares
          </span>
          <div className="h-px min-w-0 flex-1 bg-[#e7ece6]" />
        </div>

        <p className="text-center text-sm leading-6 text-[#718075]">
          New to ShareAPlate?{" "}
          <Link
            href="/register"
            className="font-extrabold text-[#00845F] underline decoration-[#b8d9c8] decoration-2 underline-offset-4 transition hover:text-[#006B4D] hover:decoration-[#006B4D] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00845F]"
          >
            Join the community
          </Link>
        </p>
      </div>

      <p className="mt-4 text-center text-xs leading-5 text-[#89948a]">
        Made with care for people and the planet.{" "}
        <span aria-hidden="true">♡</span>
      </p>
    </div>
  </section>

  {/* Footer */}
  <footer className="relative z-10 px-4 pb-5 pt-2 text-center text-xs text-[#718075] md:hidden">
    Every plate shared makes a difference.
  </footer>
</main>
  );
}
