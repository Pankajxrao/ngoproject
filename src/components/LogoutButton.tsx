
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

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
    <div className="fixed left-3 top-3 z-[1000]">
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        aria-label={loading ? "Logging out" : "Logout"}
        title={loading ? "Logging out..." : "Logout"}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#a7d3b1] bg-white text-[#17492e] shadow-sm transition hover:bg-[#eaf5ec] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogOut size={20} strokeWidth={2} />
      </button>

      {error && (
        <p
          role="alert"
          className="mt-2 max-w-56 rounded-lg border border-red-200 bg-white p-2 text-xs text-red-600 shadow"
        >
          {error}
        </p>
      )}
    </div>
  );
}
