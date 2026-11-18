import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiSearch, FiX, FiUsers, FiAlertCircle } from 'react-icons/fi'
import { useApi } from '../hooks/useApi'
import PageHeader from '../components/PageHeader'
import CharacterCard from '../components/CharacterCard'
import Pagination from '../components/Pagination'
import StatusMessage from '../components/StatusMessage'
import '../components/Tags.css'
import './Explore.css'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name', label: 'Name (A–Z)' },
]

function Explore() {
  // Search, tag, sort, and page live in the URL (?search=kai&tag=magic&sort=name&page=2)
  // so the back button and shared links work.
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const tag = searchParams.get('tag') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = Number(searchParams.get('page')) || 1

  const [input, setInput] = useState(search)

  const query = new URLSearchParams({ page, sort })
  if (search) query.set('search', search)
  if (tag) query.set('tag', tag)
  const { data, loading, error } = useApi(`/characters?${query}`)

  const popular = useApi('/characters/tags')

  // Change some filters; any change goes back to page 1 unless a page is given
  const updateUrl = (changes) => {
    const next = { search, tag, sort, page: 1, ...changes }
    const params = {}
    if (next.search) params.search = next.search
    if (next.tag) params.tag = next.tag
    if (next.sort !== 'newest') params.sort = next.sort
    if (next.page > 1) params.page = next.page
    setSearchParams(params)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    updateUrl({ search: input.trim() })
  }

  const clearSearch = () => {
    setInput('')
    updateUrl({ search: '' })
  }

  const handlePageChange = (newPage) => {
    updateUrl({ page: newPage })
    window.scrollTo({ top: 0 })
  }

  // Clicking the active tag again turns the filter off
  const toggleTag = (clicked) => {
    updateUrl({ tag: clicked === tag ? '' : clicked })
  }

  // Popular tags, with the active tag first even if it isn't popular
  let tagChoices = popular.data ? popular.data.tags.map((t) => t.tag) : []
  if (tag && !tagChoices.includes(tag)) {
    tagChoices = [tag, ...tagChoices]
  }

  let resultText = ''
  if (data) {
    resultText = `${data.total} ${data.total === 1 ? 'character' : 'characters'}`
    if (search) resultText += ` matching "${search}"`
    if (tag) resultText += ` tagged "${tag}"`
  }

  const hasFilters = Boolean(search || tag)

  return (
    <div className="page">
      <PageHeader title="Explore" subtitle="Discover original characters from every creator." />

      {/* Row 1: name search + sort */}
      <div className="explore-controls">
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

        <div className="sort-control">
          <label htmlFor="sort" className="muted">
            Sort
          </label>
          <select id="sort" value={sort} onChange={(e) => updateUrl({ sort: e.target.value })}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: tag filter chips */}
      {tagChoices.length > 0 && (
        <div className="tag-filter">
          <span className="tag-filter-label muted">Tags</span>
          <ul className="tag-list">
            {tagChoices.map((choice) => (
              <li key={choice}>
                <button
                  type="button"
                  className={`tag tag-button ${choice === tag ? 'active' : ''}`}
                  onClick={() => toggleTag(choice)}
                  aria-pressed={choice === tag}
                >
                  {choice}
                  {choice === tag && <FiX aria-hidden="true" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

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
              icon={hasFilters ? FiSearch : FiUsers}
              title={hasFilters ? 'No matching characters' : 'No characters yet'}
              action={
                hasFilters && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setInput('')
                      updateUrl({ search: '', tag: '' })
                    }}
                  >
                    Clear filters
                  </button>
                )
              }
            >
              {hasFilters
                ? 'Try a different name or tag.'
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
