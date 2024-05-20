import {
  APIProvider,
  Map,
  MapControl,
  ControlPosition,
  Marker,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import React, { useState } from "react";

import SearchBox from "./SearchBox";

export const GoogleMap = ({ position, updatePosition }) => {
  // libraries needed: google.maps.RoutesLibrary
  const MapsService = useMapsLibrary("routes") || {
    DirectionsRenderer: () => null,
  };

  const [markers, setMarkers] = useState([]);

  const addMarker = (lat, lng) => {
    setMarkers([...markers, { lat, lng }]);
  };

  const removeMarker = (index) => {
    setMarkers(markers.filter((_, i) => i !== index));
  };

  const clearMarkers = () => {
    setMarkers([]);
  };

  const updateMarkers = (index, lat, lng) => {
    setMarkers(
      markers.map((marker, i) => {
        if (i === index) {
          return { lat, lng };
        }
        return marker;
      })
    );
  };

  const renderMarkers = () => {
    return markers.map((marker, index) => {
      return (
        <Marker
          key={index}
          longitude={marker.lng}
          latitude={marker.lat}
          draggable
          onDragEnd={({ lngLat }) => updateMarkers(index, lngLat[1], lngLat[0])}
        />
      );
    });
  };

  const renderDirections = () => {
    if (markers.length < 2) {
      return null;
    }

    return (
      <MapsService.DirectionsRenderer
        origin={markers[0]}
        destination={markers[1]}
      />
    );
  };

  const renderControls = () => {
    return (
      <div className="absolute top-0 left-0 p-4">
        <button onClick={addMarker}>Add Marker</button>
        <button onClick={clearMarkers}>Clear Markers</button>
      </div>
    );
  };
  return (
    <APIProvider
      apiKey={"AIzaSyByI8LqBihCCEq9uCD-sOjed15Y0x_wREU"}
      libraries={["places", "marker"]}
    >
      <Map
        defaultCenter={position}
        zoom={10}
        className="w-full aspect-video"
        // disableDefaultUI={true}
      >
        <MapControl position={ControlPosition.TOP_LEFT}>
          <SearchBox updatePosition={updatePosition} />
        </MapControl>
        {renderMarkers()}
        {renderDirections()}
        <MapsService.DirectionsRenderer />
        <MapControl position={ControlPosition.LEFT_CENTER}>
          <div className="w-32 h-16 bg-auburn text-night flex">
            <button className="w-full h-full" onClick={addMarker}>
              Add Marker
            </button>
            <button className="w-full h-full" onClick={clearMarkers}>
              Clear Markers
            </button>
          </div>
        </MapControl>
      </Map>
    </APIProvider>
  );
};

export default GoogleMap;
