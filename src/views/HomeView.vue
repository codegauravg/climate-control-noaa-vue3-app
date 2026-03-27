<template>
  <div class="section-stack">
    <ClimateForm
      :form="form"
      :loading="loading"
      :errors="validationErrors"
      @update-field="handleFieldUpdate"
      @search="runSearch"
      @reset="resetSearch"
    />

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :message="error" />
    <ClimateResults v-else :station="station" :results="results" />
  </div>
</template>

<script setup>
import { useClimateSearch } from '../composables/useClimateSearch'
import ClimateForm from '../components/climate/ClimateForm.vue'
import ClimateResults from '../components/climate/ClimateResults.vue'
import LoadingState from '../components/climate/LoadingState.vue'
import ErrorState from '../components/climate/ErrorState.vue'

const { form, loading, error, station, results, validationErrors, runSearch, resetSearch, updateForm } =
  useClimateSearch()

function handleFieldUpdate({ field, value }) {
  updateForm({ [field]: value })
}
</script>
