import React, { useEffect } from "react";
import { initAutocomplete } from "./searchBoxInit";

// Initialize and add the map
let map;
async function initMap(): Promise<void> {
  // The location of Uluru
  const position = { lat: -25.344, lng: 131.031 };

  // Request needed libraries.
  //@ts-ignore
  const { Map } = (await google.maps.importLibrary(
    "maps"
  )) as google.maps.MapsLibrary;
  const { AdvancedMarkerElement } = (await google.maps.importLibrary(
    "marker"
  )) as google.maps.MarkerLibrary;

  // The map, centered at Uluru
  map = new Map(document.getElementById("map") as HTMLElement, {
    zoom: 4,
    center: position,
    mapId: "DEMO_MAP_ID",
  });

  // The marker, positioned at Uluru
  const marker = new AdvancedMarkerElement({
    map: map,
    position: position,
    title: "Uluru",
  });
}

initMap();

export const Map = () => {
  useEffect(() => {
    initMap().then(() => {
      initAutocomplete();
    });
  }, []);

  return (
    <>
      <input
        id="pac-input"
        className="w-64 h-8 text-night bg-cream border-2 border-night rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-night focus:border-transparent"
        type="text"
        placeholder="Find Climbing Areas..."
      />
      <div id="map" className="w-full aspect-square sm:aspect-video"></div>
    </>
  );
};

export default Map;
