<template>
  <section class="section-stack">
    <div class="card">
      <h2>Selected station</h2>
      <div v-if="station" class="section-stack">
        <div class="kv"><strong>ID</strong><span>{{ station.id }}</span></div>
        <div class="kv"><strong>Name</strong><span>{{ station.name }}</span></div>
        <div class="kv"><strong>Latitude</strong><span>{{ station.latitude }}</span></div>
        <div class="kv"><strong>Longitude</strong><span>{{ station.longitude }}</span></div>
      </div>
      <p v-else class="muted">No station selected yet.</p>
    </div>

    <div class="card">
      <h2>Summary</h2>
      <ul class="summary-list">
        <li><strong>Total records:</strong> {{ summary.totalRecords }}</li>
        <li><strong>First date:</strong> {{ summary.firstDate }}</li>
        <li><strong>Last date:</strong> {{ summary.lastDate }}</li>
        <li><strong>Minimum value:</strong> {{ summary.minValue }}</li>
        <li><strong>Maximum value:</strong> {{ summary.maxValue }}</li>
      </ul>
    </div>

    <div class="card">
      <h2>Raw NOAA response</h2>
      <pre class="raw-box">{{ rawJson }}</pre>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { prettyJson, summarizeResults } from '../../utils/formatters'

const props = defineProps({
  station: {
    type: Object,
    default: null
  },
  results: {
    type: Array,
    default: () => []
  }
})

const summary = computed(() => summarizeResults(props.results))
const rawJson = computed(() => prettyJson(props.results))
</script>