export interface UserSessionObject {
    name: string;
    picture: string;
  }

export interface Route {
  path: string;
  name: string;
  }

export interface RouteList {
    dashboard: Route;
  }
  
export interface UserSavedLocation {
    id: number;
    name: string;
    lat: number;
    lng: number;
  }

export interface UserSavedLocations {
    userSavedLocations: UserSavedLocation[];
  }
  
export interface LocalUser {
    id: number;
    name: string;
    email: string;
    picture: string;
    friendships: any[];
  }

export interface AppRootProps {
    routes: RouteList;
    user: UserSessionObject;
    localUser: LocalUser;
    csrf: string;
    userSavedLocations: UserSavedLocations;
  }


export interface Trip {
    name: string;
    locations: Location[];
  }

export interface Location {
    id: number;
    name: string;
    lat: number;
    lng: number;
  }

export interface LocationsSelectorProps {
    locationOptions: Location[];
    updateLocations: (loc: Location) => void;
    trip: Trip;
    updateTrip: (trip: Trip) => void;
  }

export interface DevblogProps {
    user: UserSessionObject;
  }

export interface DevblogState {
    feedbacks: Feedback[];
  }

  