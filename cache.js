class Cache {
  constructor() {
    this.cache = {}
  }

  set(key, value, ttl) {
    if (this.cache[key]) {
      clearTimeout(this.cache[key].timeout)
    }

    const timeout = setTimeout(() => {
      delete this.cache[key]
    }, ttl)

    this.cache[key] = {
      value,
      timeout,
    }
  }

  get(key) {
    const entry = this.cache[key]
    return entry ? entry.value : undefined
  }
}

export { Cache }
