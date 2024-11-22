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

export interface Location {
    id?: number;
    name: string;
    latitude: number;
    longitude: number;
    office?: string;
    office_x?: number;
    office_y?: number;
  }
  
export interface LocalUser {
    id: number;
    name: string;
    email: string;
    picture: string;
    friendships: any[];
    trips: Trip[];
  }

export interface AppRootProps {
    routes: RouteList;
    user: UserSessionObject;
    localUser: LocalUser;
    csrf: string;
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

export interface localUserType {
    id: number;
    name: string;
    email: string;
    friendships: any[];
  }
  
export interface TripPlanProps {
    localUser: localUserType;
    tripLocations?: Location[];
  }

export interface TripEditProps {
  trip: Trip;
  setTrip: (trip: Trip) => void;
  updateTrip: (trip: Trip) => void;
  trips: Trip[];
  position: any;
  updatePosition: (position: any) => void;
  handleWeatherSelection: (loc: Location) => void;
  localUser: localUserType;
}

export interface MapControlProps {
  position: any;
  updatePosition: (position: any) => void;
  weatherTargets: Location[];
  updateWeatherTargets: (loc: Location) => void;
  localUser: localUserType;
}
    
export interface Trip {
    id?: number;
    name: string;
    owner: localUserType;
    locations: Location[];
    trip_invitations?: any[];
  }

  export interface Trips {
    trips: Trip[];
  }