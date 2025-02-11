/** User object representing a user of the application */
export interface User {
  /** Name of the user */
  name: string;
  /** Email of the user */
  email: string;
}

/** Dog object representing a shelter dog available for adoption */
export interface Dog {
  id: string;
  /** URL to dog's image */
  img: string;
  /** Name of the dog */
  name: string;
  /** Age in years */
  age: number;
  /** ZIP code where dog is located */
  zip_code: string;
  /** Breed of the dog */
  breed: string;
}

/** Location data for filtering dogs by geographic area */
export interface Location {
  zip_code: string;
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
  /** City name */
  city: string;
  /** Two-letter state/territory abbreviation */
  state: string;
  /** County name */
  county: string;
}

/** Geographic coordinates */
export interface Coordinates {
  /** Latitude coordinate */
  lat: number;
  /** Longitude coordinate */
  lon: number;
}

/** Response from generating a match from favorited dogs */
export interface Match {
  /** ID of the matched dog */
  match: string;
}

/** Response from searching locations */
export interface SearchLocationsResponse {
  /** Array of location objects matching search criteria */
  results: Location[];
  /** Total number of results (not just current page) */
  total: number;
}

/** Response from searching dogs */
export interface SearchDogsResponse {
  /** Array of dog IDs matching search criteria */
  resultIds: string[];
  /** Total number of results (not just current page) */
  total: number;
  /** Query string for next page of results */
  next?: string;
  /** Query string for previous page of results */
  prev?: string;
}

/** Parameters for searching dogs */
export interface SearchDogsParams {
  /** Array of breeds to search for */
  breeds?: string[];
  /** Array of ZIP codes to search for */
  zipCodes?: string[];
  /** Minimum age of dogs to search for */
  ageMin?: number;
  /** Maximum age of dogs to search for */
  ageMax?: number;
  /** Number of results to return */
  size?: number;
  /** Starting index of results to return */
  from?: number;
  /** Sort order of results */
  sort?: ModelSortDirections<Dog> & (string & {}); // Cool intellisense trick ;)
}

/**
 * Helper type to provide a sort direction for any given model.
 * TODO: Under the assumption you can do this for any field.
 */
export type ModelSortDirections<T> = SortDirection<
  keyof T extends string ? keyof T : never
>;
export type SortDirection<T extends string> = `${T}:asc` | `${T}:desc`;
