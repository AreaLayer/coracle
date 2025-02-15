import pluck from "ramda/src/pluck"
import Fuse from "fuse.js/dist/fuse.min.js"

export const fuzzy = (data, opts = {}) => {
  const fuse = new Fuse(data, opts)

  // Slice pattern because the docs warn that it"ll crash if too long
  return q => (q ? pluck("item", fuse.search(q.slice(0, 32))) : data)
}

export const hash = s =>
  Math.abs(s.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0))

export const getLocalJson = k => {
  try {
    return JSON.parse(localStorage.getItem(k))
  } catch (e) {
    return null
  }
}

export const setLocalJson = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch (e) {
    // pass
  }
}

export const now = () => Math.round(new Date().valueOf() / 1000)

export const timedelta = (n, unit = 'seconds') => {
  switch (unit) {
    case 'seconds': return n
    case 'minutes': return n * 60
    case 'hours': return n * 60 * 60
    case 'days': return n * 60 * 60 * 24
    default: throw new Error(`Invalid unit ${unit}`)
  }
}

export const formatTimestamp = ts => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return formatter.format(new Date(ts * 1000))
}

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

