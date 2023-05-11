export default {
  plugin: {
    cache: {
      // maxSize: 5000, // If set this. Need a calculator ('sizeCalculation' property) to measure the value's size.
      max: 500,
      ttl: 1000 * 60 * 5,
      allowStale: false,
      updateAgeOnGet: false,
      updateAgeOnHas: false
    }
  }
}
