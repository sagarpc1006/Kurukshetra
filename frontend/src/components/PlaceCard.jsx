import React from 'react';

export default function PlaceCard({ place }) {
  if (!place) return null;

  const {
    name = '',
    category = 'Attraction',
    description = '',
    image_url = null,
    status = 'live'
  } = place;

  return (
    <div className="travel-place-card">
      <div className="place-image-wrapper">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="place-image"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="place-image-placeholder"
          style={{ display: image_url ? 'none' : 'flex' }}
        >
          <span className="place-placeholder-icon">🏛️</span>
        </div>
        <span className="place-category-badge">{category}</span>
      </div>

      <div className="place-content">
        <div className="place-header">
          <h4 className="place-name" title={name}>{name}</h4>
          <span className="badge badge-live-small" title="Live data from OpenTripMap">
            LIVE
          </span>
        </div>
        <p className="place-desc">{description}</p>
      </div>
    </div>
  );
}
