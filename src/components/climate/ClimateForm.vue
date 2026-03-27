<template>
  <section class="card section-stack">
    <div>
      <h2>Climate Search</h2>
      <p class="muted">Enter coordinates and date range, then fetch raw climate observations.</p>
    </div>

    <!--
      Hardening: static description replaces v-html binding.
      Previously: <div v-html="apiDescriptionHtml"> — flagged by Semgrep
      (javascript.vue.security.audit.xss.templates.avoid-v-html).
      Now: plain template markup; no dynamic HTML parsing at runtime.
    -->
    <div class="card">
      <p><strong>NOAA CDO flow:</strong> coordinates are used to locate the nearest
        weather station; climate observations are then fetched for that station
        over the specified date range.</p>
      <p>Datasets available: Daily Summaries (GHCND), Monthly (GSOM), Yearly (GSOY).</p>
    </div>

    <div class="grid grid--2">
      <div class="form-row">
        <label for="latitude">Latitude</label>
        <input
          id="latitude"
          class="input"
          :class="{ 'input--error': errors.latitude }"
          :value="form.latitude"
          @input="onInput('latitude', $event.target.value)"
          placeholder="e.g. 40.7128"
          autocomplete="off"
        />
        <span v-if="errors.latitude" class="field-error" role="alert">{{ errors.latitude }}</span>
      </div>

      <div class="form-row">
        <label for="longitude">Longitude</label>
        <input
          id="longitude"
          class="input"
          :class="{ 'input--error': errors.longitude }"
          :value="form.longitude"
          @input="onInput('longitude', $event.target.value)"
          placeholder="e.g. -74.0060"
          autocomplete="off"
        />
        <span v-if="errors.longitude" class="field-error" role="alert">{{ errors.longitude }}</span>
      </div>

      <div class="form-row">
        <label for="startDate">Start date</label>
        <input
          id="startDate"
          type="date"
          class="input"
          :class="{ 'input--error': errors.startDate }"
          :value="form.startDate"
          @input="onInput('startDate', $event.target.value)"
        />
        <span v-if="errors.startDate" class="field-error" role="alert">{{ errors.startDate }}</span>
      </div>

      <div class="form-row">
        <label for="endDate">End date</label>
        <input
          id="endDate"
          type="date"
          class="input"
          :class="{ 'input--error': errors.endDate }"
          :value="form.endDate"
          @input="onInput('endDate', $event.target.value)"
        />
        <span v-if="errors.endDate" class="field-error" role="alert">{{ errors.endDate }}</span>
      </div>

      <div class="form-row">
        <label for="datasetId">Dataset</label>
        <select
          id="datasetId"
          class="select"
          :value="form.datasetId"
          @change="onInput('datasetId', $event.target.value)"
        >
          <option value="GHCND">GHCND - Daily Summaries</option>
          <option value="GSOM">GSOM - Global Summary of the Month</option>
          <option value="GSOY">GSOY - Global Summary of the Year</option>
          <option value="NORMAL_DLY">NORMAL_DLY - Normals Daily</option>
          <option value="NORMAL_MLY">NORMAL_MLY - Normals Monthly</option>
          <option value="PRECIP_HLY">PRECIP_HLY - Precipitation Hourly</option>
        </select>
        <span v-if="errors.datasetId" class="field-error" role="alert">{{ errors.datasetId }}</span>
      </div>

      <div class="form-row">
        <label for="dataTypeId">Data type</label>
        <select
          id="dataTypeId"
          class="select"
          :value="form.dataTypeId"
          @change="onInput('dataTypeId', $event.target.value)"
        >
          <option value="TAVG">TAVG - Average Temperature</option>
          <option value="TMAX">TMAX - Maximum Temperature</option>
          <option value="TMIN">TMIN - Minimum Temperature</option>
          <option value="PRCP">PRCP - Precipitation</option>
          <option value="SNOW">SNOW - Snowfall</option>
          <option value="SNWD">SNWD - Snow Depth</option>
          <option value="AWND">AWND - Average Wind Speed</option>
        </select>
        <span v-if="errors.dataTypeId" class="field-error" role="alert">{{ errors.dataTypeId }}</span>
      </div>
    </div>

    <div class="form-actions">
      <button class="button" :disabled="loading" @click="$emit('search')">
        {{ loading ? 'Loading…' : 'Fetch climate data' }}
      </button>
      <button class="button button--secondary" :disabled="loading" @click="$emit('reset')">
        Reset
      </button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  form: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update-field', 'search', 'reset'])

function onInput(field, value) {
  emit('update-field', { field, value })
}
</script>

<style scoped>
.input--error {
  border-color: #c0392b;
}
.field-error {
  display: block;
  color: #c0392b;
  font-size: 0.82rem;
  margin-top: 0.25rem;
}
</style>
