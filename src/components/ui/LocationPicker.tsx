"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  initialLocation?: Coordinates;
  onLocationSelect: (
    location: Coordinates,
    address?: string
  ) => void;
}

interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

const defaultCenter: [number, number] = [28.1492, 77.332];

function MapClickHandler({
  onSelect,
}: {
  onSelect: (location: Coordinates) => void;
}) {
  useMapEvents({
    click(event) {
      onSelect({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function MapRecenter({
  position,
}: {
  position: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, 15);
  }, [map, position]);

  return null;
}

export default function LocationPicker({
  initialLocation,
  onLocationSelect,
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>(
    initialLocation
      ? [initialLocation.latitude, initialLocation.longitude]
      : defaultCenter
  );

  const [query, setQuery] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (initialLocation) {
      setPosition([
        initialLocation.latitude,
        initialLocation.longitude,
      ]);
    }
  }, [initialLocation?.latitude, initialLocation?.longitude]);

  function selectLocation(
    location: Coordinates,
    selectedAddress?: string
  ) {
    setPosition([location.latitude, location.longitude]);

    if (selectedAddress !== undefined) {
      setAddress(selectedAddress);
    }

    onLocationSelect(location, selectedAddress);
    setMessage("Location selected.");
  }

  async function searchAddress() {
    if (!query.trim()) {
      setMessage("Enter an address or place name.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const url = new URL(
        "https://nominatim.openstreetmap.org/search"
      );

      url.searchParams.set("q", query.trim());
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("limit", "1");

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(
          "Address search is temporarily unavailable. Please try again."
        );
      }

      const results: SearchResult[] = await response.json();

      if (results.length === 0) {
        setMessage(
          "No matching address found. Try a different search."
        );
        return;
      }

      const result = results[0];

      selectLocation(
        {
          latitude: Number(result.lat),
          longitude: Number(result.lon),
        },
        result.display_name
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to search for this address."
      );
    } finally {
      setLoading(false);
    }
  }

  async function findPinAddress() {
    setLoading(true);
    setMessage("");

    try {
      const url = new URL(
        "https://nominatim.openstreetmap.org/reverse"
      );

      url.searchParams.set("lat", String(position[0]));
      url.searchParams.set("lon", String(position[1]));
      url.searchParams.set("format", "jsonv2");

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(
          "Address lookup is temporarily unavailable."
        );
      }

      const result: { display_name?: string } =
        await response.json();

      if (!result.display_name) {
        setMessage("No address could be found for this pin.");
        return;
      }

      setAddress(result.display_name);

      onLocationSelect(
        {
          latitude: position[0],
          longitude: position[1],
        },
        result.display_name
      );

      setMessage("Address found.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to find the address."
      );
    } finally {
      setLoading(false);
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMessage(
        "Your browser does not support location access."
      );
      return;
    }

    setLoading(true);
    setMessage("Finding your current location...");

    navigator.geolocation.getCurrentPosition(
      (result) => {
        selectLocation({
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
        });

        setLoading(false);
      },
      () => {
        setMessage(
          "Location access failed. Allow location permission or select a point on the map."
        );
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  return (
    <div className="space-y-4">
      {/* Address search — deliberately not a form */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            // Prevent Enter from submitting the parent profile form.
            if (event.key === "Enter") {
              event.preventDefault();
              void searchAddress();
            }
          }}
          placeholder="Search a city, address, or place..."
          aria-label="Search address or place"
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
        />

        <button
          type="button"
          onClick={() => void searchAddress()}
          disabled={loading}
          className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Please wait..." : "Search"}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={loading}
          className="rounded-lg border border-green-700 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Use my current location
        </button>

        <button
          type="button"
          onClick={() => void findPinAddress()}
          disabled={loading}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Find address for pin
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom
          style={{ height: "380px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          <MapClickHandler
            onSelect={(location) => {
              setAddress("");
              selectLocation(location);
            }}
          />

          <MapRecenter position={position} />

          <Marker
            position={position}
            draggable
            eventHandlers={{
              dragend(event) {
                const marker = event.target as L.Marker;
                const point = marker.getLatLng();

                setAddress("");

                selectLocation({
                  latitude: point.lat,
                  longitude: point.lng,
                });
              },
            }}
          />
        </MapContainer>
      </div>

      <div className="rounded-lg bg-gray-50 p-4 text-sm">
        <p className="font-semibold text-gray-800">
          Selected location
        </p>

        {address && (
          <p className="mt-2 break-words text-gray-600">
            {address}
          </p>
        )}

        <p className="mt-2 text-gray-600">
          Latitude: {position[0].toFixed(6)}
        </p>

        <p className="text-gray-600">
          Longitude: {position[1].toFixed(6)}
        </p>

        <p className="mt-2 text-xs text-gray-500">
          Click the map or drag the marker to adjust the pin.
        </p>
      </div>

      {message && (
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-gray-600"
        >
          {message}
        </p>
      )}

      {loading && (
        <p className="text-sm text-gray-500">
          Please wait while we find your location...
        </p>
      )}
    </div>
  );
}
