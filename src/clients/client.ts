import {
  Dog,
  Location,
  Match,
  SearchDogsResponse,
  SearchLocationsResponse,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_URL;
export class UnauthorizedError extends Error {}

/**
 * Fetch wrapper for the API
 * @param endpoint - The endpoint to request
 * @param options - The options for the request
 * @returns The response from the API
 * @throws If the request is unauthorized
 */
async function request(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 401) {
    throw new UnauthorizedError();
  } else if (!res.ok) {
    throw res;
  }

  return res;
}

/**
 * Check if an error is an API error, and not just a fetch error
 * @param e - The error to check
 * @returns True if the error is an API error
 */
// export function isApiError(e: unknown): e is Response {
//   return e instanceof Response;
// }

/**
 * Login to the API
 * @param name - The name of the user
 * @param email - The email of the user
 * @returns The response from the API
 * @throws If the login fails
 */
async function login({
  name,
  email,
}: {
  name: string;
  email: string;
}): Promise<void> {
  const res = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ name, email }),
  });
}

/**
 * Logout from the API
 * @returns The response from the API
 * @throws If the logout fails
 */
async function logout(): Promise<void> {
  await request("/auth/logout", { method: "POST" });
}

/**
 * Get the breeds from the API
 * @returns The response from the API
 */
async function getBreeds(): Promise<string[]> {
  const res = await request("/dogs/breeds");
  return res.json();
}

/**
 * Search for dogs from the API
 * @param params - The parameters for the search
 * @returns The response from the API
 */
async function searchDogs(params: {
  breeds?: string[];
  zipCodes?: string[];
  ageMin?: number;
  ageMax?: number;
  size?: number;
  from?: string;
  sort?: string;
}): Promise<SearchDogsResponse> {
  const searchParams = new URLSearchParams();

  // Add breeds to the search params
  params.breeds?.forEach((breed) => {
    searchParams.append("breeds", breed);
  });

  // Add zip codes to the search params
  params.zipCodes?.forEach((zipCode) => {
    searchParams.append("zipCodes", zipCode);
  });

  // Add age min to the search params
  if (params.ageMin) {
    searchParams.append("ageMin", params.ageMin.toString());
  }
  if (params.ageMax) {
    searchParams.append("ageMax", params.ageMax.toString());
  }
  if (params.size) {
    searchParams.append("size", params.size.toString());
  }
  if (params.from) {
    searchParams.append("from", params.from);
  }
  if (params.sort) {
    searchParams.append("sort", params.sort);
  }

  const res = await request(`/dogs/search?${searchParams}`);
  return res.json();
}

/**
 * Get dogs from the API
 * @param dogIds - The IDs of the dogs to get
 * @returns The response from the API
 */
async function getDogs(dogIds: string[]): Promise<Dog[]> {
  // if (!dogIds.length) {
  //   return Promise.resolve([]);
  // }

  const res = await request("/dogs", {
    method: "POST",
    body: JSON.stringify(dogIds),
  });

  return res.json();
}

/**
 * Match a dog from the API
 * @param dogIds - The IDs of the dogs to match
 * @returns The response from the API
 */
async function matchDog(dogIds: string[]): Promise<Match> {
  const res = await request("/dogs/match", {
    method: "POST",
    body: JSON.stringify(dogIds),
  });

  return res.json();
}

/**
 * Get locations from the API
 * @param zipCodes - The zip codes to get
 * @returns The response from the API
 */
async function getLocations(zipCodes: string[]): Promise<Location[]> {
  const res = await request("/locations", {
    method: "POST",
    body: JSON.stringify(zipCodes),
  });

  return res.json();
}

/**
 * Search for locations from the API
 * @param params - The parameters for the search
 * @returns The response from the API
 */
async function searchLocations(params: {
  city?: string;
  states?: string[];
  geoBoundingBox?: {
    top?: { lat: number; lon: number };
    left?: { lat: number; lon: number };
    bottom?: { lat: number; lon: number };
    right?: { lat: number; lon: number };
    bottom_left?: { lat: number; lon: number };
    top_right?: { lat: number; lon: number };
  };
  size?: number;
  from?: number;
}): Promise<SearchLocationsResponse> {
  const res = await request("/locations/search", {
    method: "POST",
    body: JSON.stringify(params),
  });

  return res.json();
}

export const client = {
  login,
  logout,
  getBreeds,
  searchDogs,
  getDogs,
  matchDog,
  getLocations,
  searchLocations,
};
