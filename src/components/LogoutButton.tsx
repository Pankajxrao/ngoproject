"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Logout failed.");
      }

      // Replace the current page and refresh server-rendered content.
      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to log out."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed right-4 top-4 z-[1000]">
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="rounded-full border-2 border-[#a7d3b1] bg-white px-5 py-3 font-bold text-[#17492e] shadow-[0_4px_0_#246b45] transition hover:bg-[#eaf5ec] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Logging out..." : "Logout"}
      </button>

      {error && (
        <p
          role="alert"
          className="mt-3 max-w-56 rounded-lg border border-red-200 bg-white p-3 text-sm text-red-600 shadow"
        >
          {error}
        </p>
      )}
    </div>
  );
}