import { Dog, DogsSearch, DogsSearchParams, Match } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL;

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

  // If user is not logged in, reset state and reload.
  if (res.status === 401) {
    localStorage.removeItem("auth.user");
    window.location.reload();
  } else if (!res.ok) {
    throw res;
  }

  return res;
}

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
  await request("/auth/login", {
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
async function searchDogs(params: DogsSearchParams): Promise<DogsSearch> {
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
    searchParams.append("from", params.from.toString());
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
  if (dogIds.length === 0) {
    return Promise.resolve([]);
  }

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
async function matchDogs(dogIds: string[]): Promise<Match> {
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
// async function getLocations(zipCodes: string[]): Promise<Location[]> {
//   const res = await request("/locations", {
//     method: "POST",
//     body: JSON.stringify(zipCodes),
//   });

//   return res.json();
// }

/**
 * Search for locations from the API
 * @param params - The parameters for the search
 * @returns The response from the API
 */
// async function searchLocations(params: {
//   city?: string;
//   states?: string[];
//   geoBoundingBox?: {
//     top?: { lat: number; lon: number };
//     left?: { lat: number; lon: number };
//     bottom?: { lat: number; lon: number };
//     right?: { lat: number; lon: number };
//     bottom_left?: { lat: number; lon: number };
//     top_right?: { lat: number; lon: number };
//   };
//   size?: number;
//   from?: number;
// }): Promise<LocationsSearch> {
//   const res = await request("/locations/search", {
//     method: "POST",
//     body: JSON.stringify(params),
//   });

//   return res.json();
// }

export const client = {
  login,
  logout,
  getBreeds,
  searchDogs,
  getDogs,
  matchDogs,
  // getLocations,
  // searchLocations,
};
