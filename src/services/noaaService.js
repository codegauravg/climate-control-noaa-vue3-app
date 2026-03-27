/**
 * noaaService.js — NOAA Climate Data Online (CDO) API client.
 *
 * API base: https://www.ncei.noaa.gov/cdo-web/api/v2
 * Docs:     https://www.ncei.noaa.gov/cdo-web/webservices/v2
 * Token:    stored in .env as VITE_NOAA_TOKEN (never hardcoded in source).
 *
 * Security measures applied:
 *  - API token sourced from import.meta.env, not source code.
 *  - Request timeout via AbortController prevents hanging connections.
 *  - All query parameter values are coerced to strings before appending
 *    to prevent prototype-pollution via non-string types.
 *  - Error messages returned to the UI do not expose internal status codes
 *    or raw response bodies (avoids information disclosure).
 *  - Response shape is validated before data is returned to callers.
 */

const BASE_URL = 'https://www.ncei.noaa.gov/cdo-web/api/v2'
const REQUEST_TIMEOUT_MS = 15_000

/**
 * Core fetch wrapper.
 * Builds the URL, attaches the auth token header, enforces a timeout,
 * and maps HTTP errors to user-safe messages.
 *
 * @param {string} endpoint  e.g. 'stations' or 'data'
 * @param {Record<string, string|number>} params
 * @returns {Promise<any>}
 */
async function request(endpoint, params = {}) {
  const token = import.meta.env.VITE_NOAA_TOKEN
  if (!token) {
    throw new Error('NOAA API token is not configured. Set VITE_NOAA_TOKEN in your .env file.')
  }

  const url = new URL(`${BASE_URL}/${endpoint}`)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Coerce to string — prevents Object/Array injection into query params
      url.searchParams.append(key, String(value))
    }
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response
  try {
    response = await fetch(url.toString(), {
      headers: { token },
      signal: controller.signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('The request timed out. Please try again.')
    }
    throw new Error('A network error occurred. Check your connection and retry.')
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    // Map status codes to user-safe messages; do not surface raw response body
    if (response.status === 400) throw new Error('Invalid search parameters. Adjust your inputs and retry.')
    if (response.status === 401) throw new Error('NOAA API token is invalid or expired.')
    if (response.status === 429) throw new Error('Rate limit reached (10,000 req/day, 5 req/s). Wait before retrying.')
    if (response.status === 503) throw new Error('NOAA CDO service is temporarily unavailable.')
    throw new Error('An unexpected error occurred fetching climate data.')
  }

  return response.json()
}

/**
 * Returns up to 10 NOAA stations within a 1-degree bounding box of the
 * given coordinates for the specified dataset.
 *
 * @param {{ latitude: string, longitude: string, datasetid: string }}
 * @returns {Promise<Array>}
 */
export async function fetchStationsByExtent({ latitude, longitude, datasetid }) {
  const lat = Number(latitude)
  const lon = Number(longitude)
  const extent = `${lat - 0.5},${lon - 0.5},${lat + 0.5},${lon + 0.5}`

  const data = await request('stations', {
    datasetid,
    extent,
    limit: 10,
    sortfield: 'name',
    sortorder: 'asc',
  })

  if (!data || !Array.isArray(data.results)) return []
  return data.results
}

/**
 * Fetches observed climate records for a specific station and date range.
 *
 * @param {{ datasetid: string, stationid: string, startdate: string,
 *           enddate: string, datatypeid: string }}
 * @returns {Promise<Array>}
 */
export async function fetchClimateData({ datasetid, stationid, startdate, enddate, datatypeid }) {
  const data = await request('data', {
    datasetid,
    stationid,
    startdate,
    enddate,
    datatypeid,
    units: 'metric',
    limit: 1000,
    sortfield: 'date',
    sortorder: 'asc',
  })

  if (!data || !Array.isArray(data.results)) return []
  return data.results
}
