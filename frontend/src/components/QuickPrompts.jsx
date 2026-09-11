import React from 'react';
import { quickPrompts } from '../data/mockData';

export default function QuickPrompts({ onSelectPrompt }) {
  return (
    <div className="quick-prompts-wrapper">
      <span className="quick-prompts-label">Quick Ideas:</span>
      <div className="quick-prompts-chips" role="group" aria-label="Suggested travel prompts">
        {quickPrompts.map((item) => (
          <button
            key={item.id}
            type="button"
            className="prompt-chip"
            onClick={() => onSelectPrompt(item.query)}
            title={`Select: "${item.query}"`}
          >
            <span className="prompt-chip-icon" aria-hidden="true">{item.icon}</span>
            <span className="prompt-chip-tag">{item.tag}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
