import './StatusMessage.css'

// Used for loading, error, and empty states so they all look the same.
//   <StatusMessage icon={FiUsers} title="No characters yet" action={<Link .../>}>
//     Some explanation
//   </StatusMessage>
function StatusMessage({ icon: Icon, title, children, action, role }) {
  return (
    <div className="status-message" role={role}>
      {Icon && <Icon className="status-icon" aria-hidden="true" />}
      {title && <p className="status-title">{title}</p>}
      {children && <p className="status-text muted">{children}</p>}
      {action && <div className="status-action">{action}</div>}
    </div>
  )
}

export default StatusMessage
