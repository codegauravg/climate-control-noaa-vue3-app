import { storeToRefs } from 'pinia'
import { useClimateStore } from '../store/climate'
import { fetchStationsByExtent, fetchClimateData } from '../services/noaaService'

export function useClimateSearch() {
  const climateStore = useClimateStore()
  const { form, loading, error, station, stations, results } = storeToRefs(climateStore)

  async function runSearch() {
    climateStore.setLoading(true)
    climateStore.setError('')
    climateStore.setStations([])
    climateStore.setResults([])

    try {
      const stationResults = await fetchStationsByExtent({
        latitude: form.value.latitude,
        longitude: form.value.longitude,
        datasetid: form.value.datasetId
      })

      climateStore.setStations(stationResults)

      if (!stationResults.length) {
        throw new Error('No nearby NOAA stations were found for the selected coordinates.')
      }

      const selectedStation = stationResults[0]

      const climateResults = await fetchClimateData({
        datasetid: form.value.datasetId,
        stationid: selectedStation.id,
        startdate: form.value.startDate,
        enddate: form.value.endDate,
        datatypeid: form.value.dataTypeId
      })

      climateStore.setResults(climateResults)
    } catch (err) {
      climateStore.setError(err.message || 'Unknown error while fetching climate data.')
    } finally {
      climateStore.setLoading(false)
    }
  }
  
  function resetSearch() {
    climateStore.resetData()
  }

  return {
    form,
    loading,
    error,
    station,
    stations,
    results,
    runSearch,
    resetSearch,
    updateForm: climateStore.updateForm
  }
}