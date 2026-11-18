import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiSearch, FiX, FiUsers, FiAlertCircle } from 'react-icons/fi'
import { useApi } from '../hooks/useApi'
import PageHeader from '../components/PageHeader'
import CharacterCard from '../components/CharacterCard'
import Pagination from '../components/Pagination'
import StatusMessage from '../components/StatusMessage'
import './Explore.css'

function Explore() {
  // Search and page live in the URL (?search=kai&page=2),
  // so the back button and shared links work.
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const page = Number(searchParams.get('page')) || 1

  const [input, setInput] = useState(search)

  const query = new URLSearchParams({ page })
  if (search) query.set('search', search)
  const { data, loading, error } = useApi(`/characters?${query}`)

  const updateUrl = (newSearch, newPage) => {
    const params = {}
    if (newSearch) params.search = newSearch
    if (newPage > 1) params.page = newPage
    setSearchParams(params)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    updateUrl(input.trim(), 1)
  }

  const clearSearch = () => {
    setInput('')
    updateUrl('', 1)
  }

  const handlePageChange = (newPage) => {
    updateUrl(search, newPage)
    window.scrollTo({ top: 0 })
  }

  let resultText = ''
  if (data) {
    const count = `${data.total} ${data.total === 1 ? 'character' : 'characters'}`
    resultText = search ? `${count} found for "${search}"` : count
  }

  return (
    <div className="page">
      <PageHeader title="Explore" subtitle="Discover original characters from every creator." />

      <form className="search-bar" role="search" onSubmit={handleSearch}>
        <label htmlFor="search" className="sr-only">
          Search characters by name
        </label>
        <div className="input-wrap search-input">
          <FiSearch className="input-icon" aria-hidden="true" />
          <input
            id="search"
            type="search"
            placeholder="Search by character name"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Search
        </button>
        {search && (
          <button type="button" className="btn btn-outline btn-icon" onClick={clearSearch}>
            <FiX aria-hidden="true" />
            Clear
          </button>
        )}
      </form>

      {loading && <p className="muted">Loading characters...</p>}

      {error && (
        <StatusMessage icon={FiAlertCircle} title="Could not load characters" role="alert">
          {error}
        </StatusMessage>
      )}

      {data && (
        <>
          <p className="result-count muted" aria-live="polite">
            {resultText}
          </p>

          {data.characters.length === 0 ? (
            <StatusMessage
              icon={search ? FiSearch : FiUsers}
              title={search ? 'No matching characters' : 'No characters yet'}
            >
              {search
                ? 'Try a different name or check the spelling.'
                : 'Characters will appear here once creators publish them.'}
            </StatusMessage>
          ) : (
            <div className="character-grid">
              {data.characters.map((character) => (
                <CharacterCard key={character._id} character={character} />
              ))}
            </div>
          )}

          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  )
}

export default Explore
