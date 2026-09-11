import React, { useState } from 'react';
import AccessibilityBadge from './AccessibilityBadge';
import api from '../services/api';

export default function AccessibilityDetailsModal({ isOpen, onClose, optionTitle, accessibility = {} }) {
  const [activeTab, setActiveTab] = useState('evidence'); // 'evidence' | 'verify'

  // Photo verification upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [claimType, setClaimType] = useState('step_free_entrance');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState('');

  if (!isOpen) return null;

  const {
    accessibility_rating = 2.5,
    accessibility_score = 50,
    accessibility_status = 'unknown',
    accessibility_verified = false,
    confidence = 0,
    wheelchair_accessible,
    step_free,
    accessible_vehicle,
    accessible_entry,
    accessible_toilet,
    elevator,
    reduced_walking,
    sources = [],
    evidence_details = [],
    status_label = 'Unknown'
  } = accessibility;

  const renderStatusIcon = (val) => {
    if (val === true) return <span className="acc-val-yes">✓ Yes</span>;
    if (val === false) return <span className="acc-val-no">✕ No</span>;
    return <span className="acc-val-unknown">? Unknown</span>;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size exceeds 10MB limit.');
        setSelectedFile(null);
        setPreviewUrl('');
        return;
      }
      setSelectedFile(file);
      setUploadError('');
      setPreviewUrl(URL.createObjectURL(file));
      setUploadResult(null);
    }
  };

  const handleVerifyUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please choose an image file first.');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setUploadResult(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('claim_type', claimType);

    try {
      const response = await api.post('/api/accessibility/verify-photo/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data?.success) {
        setUploadResult(response.data.verification);
      } else {
        setUploadError(response.data?.message || 'Verification failed.');
      }
    } catch (err) {
      console.error('Photo verification error:', err);
      const msg = err.response?.data?.errors?.image?.[0] || err.response?.data?.errors?.claim_type?.[0] || 'Verification service error. Please try again.';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="acc-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="acc-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="acc-modal-header">
          <div>
            <span className="acc-modal-sup">TRANSPARENT ACCESSIBILITY DATA</span>
            <h3 className="acc-modal-title">{optionTitle || 'Travel Option Accessibility'}</h3>
          </div>
          <button type="button" className="acc-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Top Summary Bar */}
        <div className="acc-summary-strip">
          <div className="acc-score-pill">
            <span className="score-lbl">Rating</span>
            <strong>{accessibility_rating}/5</strong>
            <small>({accessibility_score}/100)</small>
          </div>

          <div className="acc-status-group">
            <span className="status-caption">Verification Level:</span>
            <AccessibilityBadge
              status={accessibility_status}
              confidence={confidence}
              verified={accessibility_verified}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="acc-tabs-bar">
          <button
            type="button"
            className={`acc-tab-btn ${activeTab === 'evidence' ? 'active' : ''}`}
            onClick={() => setActiveTab('evidence')}
          >
            📋 Verified Evidence
          </button>
          <button
            type="button"
            className={`acc-tab-btn ${activeTab === 'verify' ? 'active' : ''}`}
            onClick={() => setActiveTab('verify')}
          >
            📷 Verify by Photo
          </button>
        </div>

        {/* TAB 1: EVIDENCE & CONFIDENCE */}
        {activeTab === 'evidence' && (
          <div className="acc-modal-body">
            <h4 className="body-subhead">Accessibility Features</h4>
            <div className="acc-features-grid">
              <div className="feature-row">
                <span>Wheelchair Accessibility</span>
                {renderStatusIcon(wheelchair_accessible)}
              </div>
              <div className="feature-row">
                <span>Step-Free Access / Ramps</span>
                {renderStatusIcon(step_free)}
              </div>
              <div className="feature-row">
                <span>Accessible Vehicle / Boarding</span>
                {renderStatusIcon(accessible_vehicle)}
              </div>
              <div className="feature-row">
                <span>Accessible Entrance</span>
                {renderStatusIcon(accessible_entry)}
              </div>
              <div className="feature-row">
                <span>Accessible Restroom / Toilet</span>
                {renderStatusIcon(accessible_toilet)}
              </div>
              <div className="feature-row">
                <span>Elevator / Lift</span>
                {renderStatusIcon(elevator)}
              </div>
            </div>

            <h4 className="body-subhead" style={{ marginTop: '1.25rem' }}>Evidence Sources ("Verified, Not Claimed")</h4>
            <div className="acc-sources-list">
              {evidence_details && evidence_details.length > 0 ? (
                evidence_details.map((ev, idx) => (
                  <div key={idx} className="evidence-item">
                    <span className="evidence-bullet">●</span>
                    <div className="evidence-content">
                      <strong>{ev.field.replace(/_/g, ' ')}</strong>
                      <span> · Source: <em>{ev.source}</em></span>
                      <span className="evidence-tag">{ev.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="evidence-item">
                  <span className="evidence-bullet">●</span>
                  <div className="evidence-content">
                    <strong>Primary Source</strong>
                    <span> · {sources.join(', ') || 'Declared standard provider'}</span>
                    <span className="evidence-tag">{status_label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confidence Bar */}
            <div className="acc-confidence-box">
              <div className="conf-header">
                <span>Evidence Confidence</span>
                <strong>{confidence}%</strong>
              </div>
              <div className="conf-meter-track">
                <div
                  className="conf-meter-fill"
                  style={{
                    width: `${Math.max(5, confidence)}%`,
                    backgroundColor: confidence >= 85 ? '#16a34a' : (confidence >= 60 ? '#2563eb' : (confidence >= 40 ? '#d97706' : '#94a3b8'))
                  }}
                />
              </div>
              <small className="conf-desc">
                {confidence >= 85
                  ? 'High Confidence: Supported by independent photo verification or station standards.'
                  : (confidence >= 60
                      ? 'Moderate Confidence: Self-reported by operator or community OSM tags.'
                      : 'Low / Unknown Confidence: Evidence has not been independently verified.')}
              </small>
            </div>
          </div>
        )}

        {/* TAB 2: PHOTO VERIFICATION UPLOAD */}
        {activeTab === 'verify' && (
          <div className="acc-modal-body">
            <div className="verify-intro-card">
              <span className="camera-icon">📷</span>
              <div>
                <strong>Community Photo Verification</strong>
                <p>Upload a clear photo of an accessibility feature (ramp, step-free entrance, elevator, or vehicle) to obtain AI-analyzed evidence.</p>
              </div>
            </div>

            <form onSubmit={handleVerifyUpload} className="verify-form">
              <label className="form-lbl">
                <span>Claim Type to Verify:</span>
                <select
                  value={claimType}
                  onChange={(e) => setClaimType(e.target.value)}
                  className="verify-select"
                >
                  <option value="step_free_entrance">Step-free Entrance (No steps)</option>
                  <option value="ramp">Wheelchair Ramp &amp; Handrails</option>
                  <option value="elevator">Elevator / Lift</option>
                  <option value="accessible_toilet">Accessible Restroom with Grab Rails</option>
                  <option value="accessible_vehicle">Accessible Vehicle / Low-floor Transit</option>
                </select>
              </label>

              <div className="file-drop-zone">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  id="acc-photo-file-input"
                />
                <label htmlFor="acc-photo-file-input" className="file-drop-label">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Upload preview" className="file-preview-img" />
                  ) : (
                    <>
                      <span className="upload-icon">⬆</span>
                      <span>Click to select photo (JPEG, PNG, WebP up to 10MB)</span>
                    </>
                  )}
                </label>
              </div>

              {uploadError && (
                <div className="verify-alert-error" role="alert">
                  ⚠ {uploadError}
                </div>
              )}

              <button
                type="submit"
                className="btn verify-submit-btn"
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? 'Analyzing Photo with Vision Model...' : 'Verify Feature via AI'}
              </button>
            </form>

            {/* Verification Result Display */}
            {uploadResult && (
              <div className="verify-result-card">
                <div className="res-header">
                  <span className="res-badge">✓ AI VERIFICATION RESULT</span>
                  <span className="res-conf">Confidence: {Math.round(uploadResult.confidence * 100)}%</span>
                </div>
                <div className="res-body">
                  <div className="res-row">
                    <span>Feature Claim:</span>
                    <strong>{uploadResult.claim_type.replace(/_/g, ' ')}</strong>
                  </div>
                  <div className="res-row">
                    <span>Verification Status:</span>
                    <span className="res-status-chip verified">{uploadResult.status.toUpperCase()}</span>
                  </div>
                  <div className="res-row">
                    <span>Detected Visual Evidence:</span>
                    <p className="res-evidence">{uploadResult.evidence}</p>
                  </div>
                  {uploadResult.limitations && (
                    <div className="res-limitations">
                      <small><strong>Note:</strong> {uploadResult.limitations}</small>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="acc-modal-footer">
          <button type="button" className="btn light" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
