import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import './Pagination.css'

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <nav className="pagination" aria-label="Pages">
      <button
        type="button"
        className="btn btn-outline btn-icon"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <FiChevronLeft aria-hidden="true" />
        Previous
      </button>

      <span className="pagination-info muted">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        className="btn btn-outline btn-icon"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
        <FiChevronRight aria-hidden="true" />
      </button>
    </nav>
  )
}

export default Pagination
