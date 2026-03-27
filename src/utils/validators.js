/**
 * validators.js — input validation for the NOAA climate search form.
 *
 * All values come from user-controlled form fields and must be validated
 * before being passed to the NOAA CDO API to prevent injection and
 * unexpected API behaviour.
 */

/** Datasets available in the NOAA CDO API (v2). */
export const ALLOWED_DATASET_IDS = new Set([
  'GHCND',        // Global Historical Climatology Network Daily
  'GSOM',         // Global Summary of the Month
  'GSOY',         // Global Summary of the Year
  'NEXRAD2',      // Weather Radar Level II
  'NEXRAD3',      // Weather Radar Level III
  'NORMAL_ANN',   // Normals Annual/Seasonal
  'NORMAL_DLY',   // Normals Daily
  'NORMAL_HLY',   // Normals Hourly
  'NORMAL_MLY',   // Normals Monthly
  'PRECIP_15',    // Precipitation 15 Minute
  'PRECIP_HLY',   // Precipitation Hourly
])

/** Common data types across temperature and precipitation datasets. */
export const ALLOWED_DATATYPE_IDS = new Set([
  'TAVG', // Average Temperature
  'TMAX', // Maximum Temperature
  'TMIN', // Minimum Temperature
  'PRCP', // Precipitation
  'SNOW', // Snowfall
  'SNWD', // Snow Depth
  'AWND', // Average Wind Speed
])

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Validates all form fields required by the climate search.
 * Returns a plain object mapping field names to error strings.
 * An empty object means the form is valid.
 *
 * @param {{ latitude: string, longitude: string, startDate: string,
 *           endDate: string, datasetId: string, dataTypeId: string }} form
 * @returns {Record<string, string>}
 */
export function validateForm(form) {
  const errors = {}

  // --- Latitude ---
  const lat = Number(form.latitude)
  if (form.latitude === '' || isNaN(lat)) {
    errors.latitude = 'Latitude is required and must be a number.'
  } else if (lat < -90 || lat > 90) {
    errors.latitude = 'Latitude must be between -90 and 90.'
  }

  // --- Longitude ---
  const lon = Number(form.longitude)
  if (form.longitude === '' || isNaN(lon)) {
    errors.longitude = 'Longitude is required and must be a number.'
  } else if (lon < -180 || lon > 180) {
    errors.longitude = 'Longitude must be between -180 and 180.'
  }

  // --- Start date ---
  if (!ISO_DATE_RE.test(form.startDate)) {
    errors.startDate = 'Start date must be in YYYY-MM-DD format.'
  } else if (isNaN(Date.parse(form.startDate))) {
    errors.startDate = 'Start date is not a valid calendar date.'
  }

  // --- End date ---
  if (!ISO_DATE_RE.test(form.endDate)) {
    errors.endDate = 'End date must be in YYYY-MM-DD format.'
  } else if (isNaN(Date.parse(form.endDate))) {
    errors.endDate = 'End date is not a valid calendar date.'
  }

  // --- Date range ---
  if (!errors.startDate && !errors.endDate && form.startDate > form.endDate) {
    errors.endDate = 'End date must be on or after start date.'
  }

  // --- Dataset whitelist ---
  if (!ALLOWED_DATASET_IDS.has(form.datasetId)) {
    errors.datasetId = 'Invalid dataset. Please select from the provided options.'
  }

  // --- Data type whitelist ---
  if (!ALLOWED_DATATYPE_IDS.has(form.dataTypeId)) {
    errors.dataTypeId = 'Invalid data type. Please select from the provided options.'
  }

  return errors
}

/** Returns true if the errors object has any entries. */
export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}
