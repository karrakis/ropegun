import React, { useState, useCallback, useEffect } from "react";
import {
  APIProvider,
  Map,
  MapControl,
  ControlPosition,
  Marker,
  useMapsLibrary,
  useMap,
} from "@vis.gl/react-google-maps";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LatLng {
  lat: number;
  lng: number;
}

export interface PendingDestination {
  name: string;
  latitude: string;
  longitude: string;
  office: string | null;
  office_x: number | null;
  office_y: number | null;
}

interface DestinationSelectorProps {
  /** Called when the user confirms "Add to Trip". Receives a PendingDestination
   *  (not yet saved to the DB — that happens on trip creation). */
  onDestinationAdded: (location: PendingDestination) => void;
  /** Starting map centre. Defaults to a general US view if omitted. */
  defaultCenter?: LatLng;
}

// ─── Autocomplete search box (internal) ───────────────────────────────────────

const SearchBox = ({
  onPlaceSelected,
}: {
  onPlaceSelected: (name: string, latlng: LatLng) => void;
}) => {
  const placesLibrary = useMapsLibrary("places");
  const map = useMap();
  const [service, setService] =
    useState<google.maps.places.AutocompleteService | null>(null);
  const [results, setResults] = useState<
    google.maps.places.QueryAutocompletePrediction[]
  >([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (placesLibrary) setService(new placesLibrary.AutocompleteService());
    return () => setService(null);
  }, [placesLibrary]);

  const updateResults = (value: string) => {
    if (!service || value.length === 0) {
      setResults([]);
      return;
    }
    service.getQueryPredictions({ input: value }, (res) => {
      setResults(res ?? []);
    });
  };

  const handleSelect = (
    place: google.maps.places.QueryAutocompletePrediction,
  ) => {
    setInputValue(place.description);
    setResults([]);
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ placeId: place.place_id }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        const latlng = results[0].geometry.location.toJSON();
        map?.setCenter(latlng);
        map?.setZoom(13);
        onPlaceSelected(place.description, latlng);
      }
    });
  };

  return (
    <div className="m-2 max-w-xs">
      <input
        className="w-64 h-9 text-night bg-cream border-2 border-night rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-auburn transition-all"
        placeholder="Search for a place…"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          updateResults(e.target.value);
        }}
      />
      {results.length > 0 && (
        <ul className="bg-white shadow-lg rounded mt-1 max-h-48 overflow-y-auto">
          {results.map((place) => (
            <li
              key={place.place_id}
              className="cursor-pointer p-2 hover:bg-slate-100 text-night text-sm whitespace-nowrap overflow-hidden text-ellipsis"
              onClick={() => handleSelect(place)}
            >
              {place.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  onDestinationAdded,
  defaultCenter = { lat: 38.5, lng: -96 },
}) => {
  const [pin, setPin] = useState<LatLng | null>(null);
  const [pinName, setPinName] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When a place is picked from the search box, move the pin there and
  // pre-fill the name.
  const handlePlaceSelected = useCallback((name: string, latlng: LatLng) => {
    setPin(latlng);
    setPinName(name);
    setNameInput(name);
    setError(null);
  }, []);

  // Clicking anywhere on the map drops a pin. The name is cleared so the user
  // can type a custom one (or leave it as coordinates).
  const handleMapClick = useCallback((e: any) => {
    const latlng: LatLng = {
      lat: e.detail.latLng.lat,
      lng: e.detail.latLng.lng,
    };
    setPin(latlng);
    setPinName("");
    setNameInput("");
    setError(null);
  }, []);

  const displayName =
    nameInput.trim() || `${pin?.lat?.toFixed(5)}, ${pin?.lng?.toFixed(5)}`;

  const handleAdd = async () => {
    if (!pin) return;
    setSaving(true);
    setError(null);

    try {
      // Look up NWS grid office for weather (non-fatal — works for US only)
      let office: string | null = null;
      let office_x: number | null = null;
      let office_y: number | null = null;
      try {
        const wx = await fetch(
          `https://api.weather.gov/points/${pin.lat},${pin.lng}`,
          { headers: { Accept: "application/ld+json" } },
        ).then((r) => r.json());
        office = wx.gridId ?? null;
        office_x = wx.gridX ?? null;
        office_y = wx.gridY ?? null;
      } catch {
        // Non-US or off-grid — weather unavailable, that's fine
      }

      onDestinationAdded({
        name: displayName,
        latitude: String(pin.lat),
        longitude: String(pin.lng),
        office,
        office_x,
        office_y,
      });

      // Reset for next pin
      setPin(null);
      setPinName("");
      setNameInput("");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full grow">
      <APIProvider
        apiKey={"AIzaSyByI8LqBihCCEq9uCD-sOjed15Y0x_wREU"}
        libraries={["places"]}
      >
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={4}
          className="w-full grow justify-center rounded shadow-lg"
          onClick={handleMapClick}
          gestureHandling="greedy"
        >
          <MapControl position={ControlPosition.LEFT_BOTTOM}>
            <SearchBox onPlaceSelected={handlePlaceSelected} />
          </MapControl>

          {pin && <Marker position={pin} />}
        </Map>
      </APIProvider>

      {/* Confirmation panel — only shown once a pin exists */}
      {pin && (
        <div className="flex flex-col gap-2 p-3 bg-night text-cream mt-1">
          <div className="text-xs text-ashgray">
            {pin.lat.toFixed(6)}, {pin.lng.toFixed(6)}
          </div>

          <div className="flex gap-2 items-center">
            <input
              className="flex-1 h-9 rounded bg-cream text-night px-3 text-sm focus:outline-none focus:ring-2 focus:ring-auburn"
              placeholder="Name this destination…"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
            <button
              className="bg-auburn text-cream px-4 py-2 rounded text-sm disabled:opacity-50 whitespace-nowrap"
              onClick={handleAdd}
              disabled={saving}
            >
              {saving ? "Saving…" : "Add to Trip"}
            </button>
            <button
              className="text-ashgray text-xs underline"
              onClick={() => {
                setPin(null);
                setPinName("");
                setNameInput("");
              }}
            >
              Clear
            </button>
          </div>

          {error && <div className="text-red-400 text-xs">{error}</div>}
        </div>
      )}

      {!pin && (
        <div className="text-center text-ashgray text-sm py-3 bg-night">
          Click anywhere on the map to drop a pin, or search for a place above.
        </div>
      )}
    </div>
  );
};

export default DestinationSelector;
