import {
  APIProvider,
  Map,
  MapControl,
  ControlPosition,
  Marker,
} from "@vis.gl/react-google-maps";
import React, { useState } from "react";

import SearchBox from "./SearchBox";

export const GoogleMap = ({ position, updatePosition }) => {
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
