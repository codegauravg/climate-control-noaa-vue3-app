<template>
  <section class="card section-stack">
    <div>
      <h2>Climate Search</h2>
      <p class="muted">Enter coordinates and date range, then fetch raw climate observations.</p>
    </div>

    <div class="card" v-html="apiDescriptionHtml"></div>

    <div class="grid grid--2">
      <div class="form-row">
        <label for="latitude">Latitude</label>
        <input
          id="latitude"
          class="input"
          :value="form.latitude"
          @input="onInput('latitude', $event.target.value)"
          placeholder="e.g. 40.7128"
        />
      </div>

      <div class="form-row">
        <label for="longitude">Longitude</label>
        <input
          id="longitude"
          class="input"
          :value="form.longitude"
          @input="onInput('longitude', $event.target.value)"
          placeholder="e.g. -74.0060"
        />
      </div>

      <div class="form-row">
        <label for="startDate">Start date</label>
        <input
          id="startDate"
          type="date"
          class="input"
          :value="form.startDate"
          @input="onInput('startDate', $event.target.value)"
        />
      </div>

      <div class="form-row">
        <label for="endDate">End date</label>
        <input
          id="endDate"
          type="date"
          class="input"
          :value="form.endDate"
          @input="onInput('endDate', $event.target.value)"
        />
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
        </select>
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
        </select>
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
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  apiDescriptionHtml: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update-field', 'search', 'reset'])

function onInput(field, value) {
  emit('update-field', { field, value })
}
</script>