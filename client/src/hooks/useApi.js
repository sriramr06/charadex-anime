import { useEffect, useState } from 'react'
import api, { getErrorMessage } from '../api/axios'

// Fetch data from a GET endpoint, e.g. useApi('/characters/mine').
// Returns { data, error, loading } and fetches again whenever `path` changes.
//
// `loading` is worked out from the saved path instead of being set at the
// start of the effect, which avoids an extra render each time.
export function useApi(path) {
  const [result, setResult] = useState({ path: null, data: null, error: '' })

  useEffect(() => {
    let ignore = false // ignore old responses if the path changes quickly

    api
      .get(path)
      .then((res) => {
        if (!ignore) setResult({ path, data: res.data, error: '' })
      })
      .catch((err) => {
        if (!ignore) setResult({ path, data: null, error: getErrorMessage(err) })
      })

    return () => {
      ignore = true
    }
  }, [path])

  const loading = result.path !== path

  return {
    data: loading ? null : result.data,
    error: loading ? '' : result.error,
    loading,
  }
}
