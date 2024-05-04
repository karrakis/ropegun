import React, { useState, useEffect } from "react";

((g) => {
  var h,
    a,
    k,
    p = "The Google Maps JavaScript API",
    c = "google",
    l = "importLibrary",
    q = "__ib__",
    m = document,
    b = window;
  b = b[c] || (b[c] = {});
  var d = b.maps || (b.maps = {}),
    r = new Set(),
    e = new URLSearchParams(),
    u = () =>
      h ||
      (h = new Promise(async (f, n) => {
        await (a = m.createElement("script"));
        e.set("libraries", [...r] + "");
        for (k in g)
          e.set(
            k.replace(/[A-Z]/g, (t) => "_" + t[0].toLowerCase()),
            g[k]
          );
        e.set("callback", c + ".maps." + q);
        a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
        d[q] = f;
        a.onerror = () => (h = n(Error(p + " could not load.")));
        a.nonce = m.querySelector("script[nonce]")?.nonce || "";
        m.head.append(a);
      }));
  d[l]
    ? console.warn(p + " only loads once. Ignoring:", g)
    : (d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)));
})({
  key: "AIzaSyByI8LqBihCCEq9uCD-sOjed15Y0x_wREU",
  v: "weekly",
  // Use the 'v' parameter to indicate the version to use (weekly, beta, alpha, etc.).
  // Add other bootstrap parameters as needed, using camel case.
});

export const Distance = ({ locations, localUser }) => {
  const [distances, updateDistances] = useState({});
  const fetchDistanceFromGoogleAPI = async (origin, destination) => {
    console.log("fetchDistanceFromGoogleAPI");
    await google.maps.importLibrary("distanceMatrix");
    var origin1 = new google.maps.LatLng(55.930385, -3.118425);
    var destinationB = new google.maps.LatLng(50.087692, 14.42115);

    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [origin1],
        destinations: [destinationB],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
        avoidHighways: false,
        avoidTolls: false,
      },
      callback
    );
  };
  function callback(response, status) {
    updateDistances(response);
    // See Parsing the Results for
    // the basics of a callback function.
  }

  const handleDistanceSelection = async (loc) => {
    console.log("handleDistanceSelection");
    const origin = localUser.home_address;
    if (!origin) return;
    console.log("origin", origin);
    const destination = loc.location;
    const distance = fetchDistanceFromGoogleAPI(origin, destination);
    updateDistances({ ...distances, [loc.name]: distance });
  };

  useEffect(() => {
    console.log("useEffect running");
    locations.forEach((loc) => {
      handleDistanceSelection(loc);
    });
  }, [locations]);

  useEffect(() => {
    console.log("distances", distances);
  }, [distances]);

  return (
    <div>
      <h1>Distance</h1>
      <p>{JSON.stringify(distances)}</p>
    </div>
  );
};

export default Distance;
