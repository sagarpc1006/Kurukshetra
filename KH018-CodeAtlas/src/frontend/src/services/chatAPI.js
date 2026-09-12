// EcoTrail Chat & Travel Assistant Service
// Connected to Django REST API (POST /api/chat/) and Gemini AI intent extraction

import api from './api.js';

/**
 * Sends user prompt to the Django backend AI travel assistant endpoint.
 * @param {string} message - User natural language travel prompt.
 * @returns {Promise<object>} Structured response with success flag, message, and extracted intent.
 */
export async function sendChatMessage(message) {
  const response = await api.post('/api/chat/', { message });
  return response.data;
}

export default {
  sendChatMessage,
};
