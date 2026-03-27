import { defineStore } from 'pinia'

export const useClimateStore = defineStore('climate', {
  state: () => ({
    loading: false,
    error: '',
    form: {
      latitude: '40.7128',
      longitude: '-74.0060',
      startDate: '2024-01-01',
      endDate: '2024-01-10',
      datasetId: 'GHCND',
      dataTypeId: 'TAVG',
    },
    station: null,
    stations: [],
    results: [],
  }),
  actions: {
    setLoading(value) {
      this.loading = value
    },
    setError(message) {
      this.error = message || ''
    },
    setStations(stations) {
      this.stations = stations
      this.station = stations[0] || null
    },
    setResults(results) {
      this.results = Array.isArray(results) ? results : []
    },
    updateForm(payload) {
      this.form = { ...this.form, ...payload }
    },
    resetData() {
      this.error = ''
      this.station = null
      this.stations = []
      this.results = []
    },
  },
})
