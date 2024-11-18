export interface localUserType {
  id: number;
  name: string;
  email: string;
  friendships: any[];
}

export interface userSavedLocationsType {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  office: string;
  office_x: number;
  office_y: number;
}

export interface tripSavedLocationsType {
  id: number;
  name: string;
  location: { lat: number; lng: number };
  office: string;
  office_x: number;
  office_y: number;
}

export interface TripPlanPropsType {
  localUser: localUserType;
  userSavedLocations: userSavedLocationsType[];
  tripSavedLocations?: tripSavedLocationsType[];
}

export interface locationType {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  office: string;
  office_x: number;
  office_y: number;
}

export interface tripsType {
  name: string;
  locations: locationType[];
}

export interface parsedLocationType {
  name: string;
  location: { lat: number; lng: number };
}

export interface tripType {
  id?: number;
  name: string;
  locations: parsedLocationType[];
  trip_invitations?: any[];
}
