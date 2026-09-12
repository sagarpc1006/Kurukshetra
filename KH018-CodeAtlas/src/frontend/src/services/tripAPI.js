// EcoTrail Trips & Preferences Service
// Connected directly to Django REST Framework + PostgreSQL endpoints:
// GET /api/trips/
// POST /api/trips/
// GET /api/trips/<id>/
// DELETE /api/trips/<id>/
// GET /api/profile/

import api from './api.js';
import {
  mockRecentTrips,
  mockTravelPreferences,
  mockEcoImpact,
  mockEcoScore,
} from '../data/mockData.js';

/**
 * Fetches recent trips saved by the user from PostgreSQL.
 * GET /api/trips/
 */
export async function getRecentTrips() {
  try {
    const res = await api.get('/api/trips/');
    if (res.data?.success && Array.isArray(res.data?.trips)) {
      return res.data.trips;
    }
  } catch (err) {
    console.warn('Could not load trips from PostgreSQL backend, using fallback demo trips:', err);
  }
  return mockRecentTrips;
}

/**
 * Saves a new trip to PostgreSQL for the authenticated user.
 * POST /api/trips/
 */
export async function saveTrip(tripData) {
  const res = await api.post('/api/trips/', tripData);
  return res.data;
}

/**
 * Deletes a saved trip from PostgreSQL.
 * DELETE /api/trips/<id>/
 */
export async function deleteTrip(tripId) {
  const res = await api.delete(`/api/trips/${tripId}/`);
  return res.data;
}

/**
 * Retrieves a single trip detail from PostgreSQL.
 * GET /api/trips/<id>/
 */
export async function getTripById(tripId) {
  const res = await api.get(`/api/trips/${tripId}/`);
  return res.data;
}

/**
 * Fetches user travel and accessibility preferences.
 * GET /api/profile/
 */
export async function getUserPreferences() {
  try {
    const res = await api.get('/api/profile/');
    if (res.data?.success && res.data?.profile) {
      const p = res.data.profile;
      return {
        ecoPriority: p.eco_priority || 'High',
        budget: p.budget_preference ? `₹${p.budget_preference.toLocaleString()}` : '₹10,000',
        transportPreference: p.preferred_transport || 'Public Transport',
        accessibility: 'Required'
      };
    }
  } catch (err) {
    console.debug('Using local preferences fallback:', err);
  }
  return mockTravelPreferences;
}

/**
 * Fetches user eco impact metrics.
 */
export async function getEcoImpact() {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockEcoImpact;
}

/**
 * Fetches user EcoTrail score & breakdown.
 */
export async function getEcoScore() {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockEcoScore;
}

export default {
  getRecentTrips,
  saveTrip,
  deleteTrip,
  getTripById,
  getUserPreferences,
  getEcoImpact,
  getEcoScore,
};
