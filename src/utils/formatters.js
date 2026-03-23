export function prettyJson(value) {
  return JSON.stringify(value, null, 2)
}

export function summarizeResults(results = []) {
  if (!results.length) {
    return {
      totalRecords: 0,
      firstDate: 'N/A',
      lastDate: 'N/A',
      minValue: 'N/A',
      maxValue: 'N/A'
    }
  }

  const values = results
    .map((item) => Number(item.value))
    .filter((value) => !Number.isNaN(value))

  return {
    totalRecords: results.length,
    firstDate: results[0]?.date || 'N/A',
    lastDate: results[results.length - 1]?.date || 'N/A',
    minValue: values.length ? Math.min(...values) : 'N/A',
    maxValue: values.length ? Math.max(...values) : 'N/A'
  }
}