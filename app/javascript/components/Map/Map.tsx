import {
  APIProvider,
  Map,
  MapControl,
  ControlPosition,
  Marker,
} from "@vis.gl/react-google-maps";
import React, { useState } from "react";

import SearchBox from "./SearchBox";

export const GoogleMap = () => {
  const [position, updatePosition] = useState({ lat: -25.344, lng: 131.031 });

  return (
    <APIProvider
      apiKey={"AIzaSyByI8LqBihCCEq9uCD-sOjed15Y0x_wREU"}
      libraries={["places", "marker"]}
    >
      <Map center={position} zoom={10} className="w-full aspect-video">
        <MapControl position={ControlPosition.TOP_LEFT}>
          <SearchBox updatePosition={updatePosition} />
        </MapControl>
      </Map>
    </APIProvider>
  );
};

export default GoogleMap;
