import React from "react";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useMapsLibrary, useMap } from "@vis.gl/react-google-maps";

export const AutocompletePlaces = ({ updatePosition }) => {
  const placesLibrary = useMapsLibrary("places");
  const [service, setService] =
    useState<google.maps.places.AutocompleteService | null>(null);
  const [results, setResults] = useState<
    google.maps.places.QueryAutocompletePrediction[] | null
  >([]);
  const [inputValue, setInputValue] = useState<string>("");

  const map = useMap();

  useEffect(() => {
    if (placesLibrary) setService(new placesLibrary.AutocompleteService());
    return () => setService(null);
  }, [placesLibrary]);

  const updateResults = (inputValue: string) => {
    if (!service || inputValue.length === 0) {
      setResults([]);
      return;
    }
    const request = { input: inputValue };
    service.getQueryPredictions(request, (res) => {
      setResults(res);
    });
  };

  const onInputChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value;
    setInputValue(value);
    updateResults(value);
  };

  const handleSelectedPlace = (
    place: google.maps.places.QueryAutocompletePrediction
  ) => {
    setInputValue(place.description);
    setResults([]);
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ placeId: place.place_id }, (results, status) => {
      if (status === "OK") {
        map?.setCenter(results[0].geometry.location.toJSON());
        updatePosition({
          name: place.description,
          location: results[0].geometry.location.toJSON(),
        });
      }
    });
  };

  if (!service) return null;

  return (
    <div className="max-w-96">
      <input
        className="w-64 h-8 mt-4 text-night bg-cream border-2 border-night rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-night focus:border-transparent transition-all duration-200 ease-in-out"
        value={inputValue}
        onChange={onInputChange}
      />
      {results && results.length > 0 && (
        <ul className="bg-white mt-2">
          {results.map((place) => (
            <li
              className="cursor-pointer whitespace-nowrap p-1 hover:bg-slate-100 overflow-hidden text-night"
              key={place.place_id}
              onClick={() => handleSelectedPlace(place)}
            >
              {place.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompletePlaces;
