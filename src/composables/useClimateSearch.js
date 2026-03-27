import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useClimateStore } from '../store/climate'
import { fetchStationsByExtent, fetchClimateData } from '../services/noaaService'
import { validateForm, hasErrors } from '../utils/validators'

export function useClimateSearch() {
  const climateStore = useClimateStore()
  const { form, loading, error, station, stations, results } = storeToRefs(climateStore)

  const validationErrors = ref({})

  async function runSearch() {
    // Validate all inputs before making any network requests
    validationErrors.value = validateForm(form.value)
    if (hasErrors(validationErrors.value)) return

    climateStore.setLoading(true)
    climateStore.setError('')
    climateStore.setStations([])
    climateStore.setResults([])

    try {
      const stationResults = await fetchStationsByExtent({
        latitude: form.value.latitude,
        longitude: form.value.longitude,
        datasetid: form.value.datasetId,
      })

      climateStore.setStations(stationResults)

      if (!stationResults.length) {
        throw new Error('No NOAA stations found for the selected coordinates and dataset.')
      }

      const climateResults = await fetchClimateData({
        datasetid: form.value.datasetId,
        stationid: stationResults[0].id,
        startdate: form.value.startDate,
        enddate: form.value.endDate,
        datatypeid: form.value.dataTypeId,
      })

      climateStore.setResults(climateResults)
    } catch (err) {
      climateStore.setError(err.message || 'An unexpected error occurred.')
    } finally {
      climateStore.setLoading(false)
    }
  }

  function resetSearch() {
    validationErrors.value = {}
    climateStore.resetData()
  }

  return {
    form,
    loading,
    error,
    station,
    stations,
    results,
    validationErrors,
    runSearch,
    resetSearch,
    updateForm: climateStore.updateForm,
  }
}
