import React from 'react';

export default function EmptyState({
  icon = '🧭',
  title = 'No items found',
  description = 'There are currently no items to display.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="empty-state-box">
      <div className="empty-state-icon" aria-hidden="true">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionLabel && (
        <button
          type="button"
          className="btn small empty-state-btn"
          onClick={onAction}
        >
          {actionLabel} <b>↗</b>
        </button>
      )}
    </div>
  );
}
