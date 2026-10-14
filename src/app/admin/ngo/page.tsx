
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NGO = {
  _id: string;
  ngoName: string;
  address: string;
  verified: boolean;
  createdAt?: string;
};

export default function AdminNGOsPage() {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadNGOs() {
      try {
        const res = await fetch("/api/ngo");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load NGOs");
        }

        setNgos(Array.isArray(data.ngos) ? data.ngos : []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    loadNGOs();
  }, []);

  const filtered = ngos.filter((ngo) =>
    `${ngo.ngoName} ${ngo.address}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#F7F8F3] text-[#193D2B]">
      <header className="border-b border-[#E2E9DF] bg-white px-5 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/admin" className="text-sm font-semibold text-[#398653]">
            ← Admin dashboard
          </Link>
          <span className="text-sm font-semibold">NGO management</span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <h1 className="text-3xl font-bold">NGOs</h1>
        <p className="mt-2 text-[#657568]">
          Select an NGO to see its full profile.
        </p>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by NGO name or address..."
          className="mt-6 w-full rounded-xl border border-[#DCE5DA] bg-white px-4 py-3 outline-none focus:border-[#398653]"
        />

        {loading ? (
          <p className="mt-8 text-[#657568]">Loading NGOs...</p>
        ) : error ? (
          <p className="mt-8 text-red-600">{error}</p>
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#E2E9DF] bg-white p-8 text-center">
            <p className="font-semibold">No NGOs found</p>
            <p className="mt-2 text-sm text-[#657568]">
              Try another search or check whether any NGO profiles exist.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {filtered.map((ngo) => (
              <Link
                key={ngo._id}
                href={`/admin/ngo/${ngo._id}`}
                className="rounded-2xl border border-[#E2E9DF] bg-white p-5 transition hover:border-[#398653] hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-bold">{ngo.ngoName}</h2>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      ngo.verified
                        ? "bg-[#E5F3E9] text-[#216A3B]"
                        : "bg-[#FFF1D6] text-[#8A5B10]"
                    }`}
                  >
                    {ngo.verified ? "Verified" : "Pending"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[#657568]">{ngo.address}</p>
                <p className="mt-5 text-sm font-semibold text-[#398653]">
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
