import { csrfToken } from "./csrfToken";

export const getDistances = async (locations, localUser) => {
    const locationUpdates = locations.map(async (loc) => {
      const origin = localUser.home_address;
      if (!origin) return;
      const destination = loc.location;
  
      let response = await fetch("/api/v1/distance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken(),
        },
        body: JSON.stringify({
          origin,
          destination,
        }),
      });
  
      let data = await response.json();
      return { name: loc.name, data: data };
    });
  
    return locationUpdates;
  };