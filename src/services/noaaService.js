import axios from 'axios';

const BASE_URL = 'https://www.ncei.noaa.gov/cdo-web/api/v2/data'
const TOKEN = 'AtYlxrPdVaflDXyYMXfgKoGFNTqtKNAG'

async function request(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}/${endpoint}`)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value)
    }
  })

  const response = await fetch(url.toString(), {
    headers: {
      token: TOKEN
    }
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`NOAA request failed: ${response.status} ${message}`)
  }

  return response.json()
}

export async function fetchStationsByExtent({ latitude, longitude, datasetid }) {
  const lat = Number(latitude)
  const lon = Number(longitude)

  const extent = `${lat - 0.5},${lon - 0.5},${lat + 0.5},${lon + 0.5}`

  const data = await request('stations', {
    datasetid,
    extent,
    limit: 10,
    sortfield: 'name',
    sortorder: 'asc'
  })

  return data.results || []
}

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
    sortorder: 'asc'
  })

  return data.results || []
}