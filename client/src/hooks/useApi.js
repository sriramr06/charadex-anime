import { useEffect, useState } from 'react'
import api, { getErrorMessage } from '../api/axios'

// Fetch data from a GET endpoint, e.g. useApi('/characters/mine').
// Returns { data, error, loading } and fetches again whenever `path` changes.
//
// Optional `refreshKey`: change it (e.g. add 1) to fetch the same path again,
// for example after following someone so a followers list is up to date.
//
// `loading` is worked out from the saved request instead of being set at the
// start of the effect, which avoids an extra render each time.
export function useApi(path, refreshKey = 0) {
  const [result, setResult] = useState({ key: null, data: null, error: '' })

  // Identifies one request: the same path with a new refreshKey counts as new
  const requestKey = `${path}#${refreshKey}`

  useEffect(() => {
    let ignore = false // ignore old responses if the request changes quickly

    api
      .get(path)
      .then((res) => {
        if (!ignore) setResult({ key: requestKey, data: res.data, error: '' })
      })
      .catch((err) => {
        if (!ignore) setResult({ key: requestKey, data: null, error: getErrorMessage(err) })
      })

    return () => {
      ignore = true
    }
  }, [path, requestKey])

  const loading = result.key !== requestKey

  return {
    data: loading ? null : result.data,
    error: loading ? '' : result.error,
    loading,
  }
}
