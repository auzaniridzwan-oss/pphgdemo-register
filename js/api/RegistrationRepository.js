/**
 * RegistrationRepository
 *
 * Creates or updates Braze user profiles for demo registration via POST /users/track.
 * Does not use UserProfile.toTrackPayload — omits _update_existing_only so new users are created.
 *
 * @see https://www.braze.com/docs/api/endpoints/user_data/post_user_track/
 */

import { BrazeClient, ApiError } from './BrazeClient.js';
import { AppLogger } from '../core/AppLogger.js';

/** @typedef {'beach'|'mountain'|'city'} DreamDestination */

/**
 * Builds a stable external_id from email for demo deduplication.
 *
 * @param {string} email
 * @returns {string}
 */
export function externalIdFromEmail(email) {
  const normalized = email.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  return `pphg_demo_${normalized || 'guest'}`;
}

/**
 * @param {object} input
 * @param {string} input.firstName
 * @param {string} input.lastName
 * @param {string} input.email
 * @param {DreamDestination} input.dreamDestination
 * @returns {object} Single Braze attributes object for /users/track
 */
export function buildRegistrationTrackPayload(input) {
  const external_id = externalIdFromEmail(input.email);
  return {
    external_id,
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    email: input.email.trim(),
    email_subscribe: 'opted_in',
    pphg_dream_destination: input.dreamDestination,
    pphg_demo_segment: true,
  };
}

async function getConfig() {
  const mod = await import('../../config/app.config.js');
  return mod.default;
}

function _simulateLatency(ms = 600) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @param {Error} err
 * @param {string} fallbackMessage
 * @returns {ApiError}
 */
function _toApiError(err, fallbackMessage) {
  if (err instanceof ApiError) return err;
  return new ApiError({
    status: err.response?.status || 0,
    brazeErrors: err._brazeErrors || [],
    traceId: err._traceId || '',
    humanMessage: err._humanMessage || fallbackMessage,
  });
}

export const RegistrationRepository = {
  /**
   * Registers a demo participant in Braze (live) or simulates success (demo mode).
   *
   * @param {object} params
   * @param {string} params.firstName
   * @param {string} params.lastName
   * @param {string} params.email
   * @param {DreamDestination} params.dreamDestination
   * @returns {Promise<{ externalId: string }>}
   * @throws {ApiError}
   */
  async registerParticipant(params) {
    const config = await getConfig();
    const payload = buildRegistrationTrackPayload(params);

    if (!config.isLiveMode()) {
      AppLogger.info('[API]', 'Demo mode — simulated registration', payload);
      await _simulateLatency();
      return { externalId: payload.external_id };
    }

    try {
      AppLogger.info('[API]', 'Registering participant', {
        external_id: payload.external_id,
        email: payload.email,
      });

      const client = BrazeClient.getInstance();
      const response = await client.post('users/track', {
        json: { attributes: [payload] },
      });
      const text = await response.text();
      if (text) {
        try {
          JSON.parse(text);
        } catch {
          /* non-JSON success body — ignore */
        }
      }

      AppLogger.info('[API]', `Registration complete for ${payload.external_id}`);
      return { externalId: payload.external_id };
    } catch (err) {
      AppLogger.error('[API]', 'registerParticipant failed', err);
      throw _toApiError(err, `Registration failed: ${err.message}`);
    }
  },
};
