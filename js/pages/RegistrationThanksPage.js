/**
 * RegistrationThanksPage — Screen 3: post-registration confirmation.
 */

import { StorageManager } from '../core/StorageManager.js';
import { AppLogger } from '../core/AppLogger.js';

export const RegistrationThanksPage = {
  /**
   * Renders the thank-you screen into #registration-outlet.
   */
  render() {
    const outlet = document.getElementById('registration-outlet');
    if (!outlet) return;

    const firstName = StorageManager.get('reg_first_name', '') || '';

    AppLogger.info('[UI]', 'RegistrationThanksPage.render()');

    const greeting = firstName
      ? `Thank you, ${escapeHtml(firstName)}, for registering.`
      : 'Thank you for registering.';

    outlet.innerHTML = `
      <div class="reg-screen reg-screen-thanks">
        <div class="reg-thanks-icon" aria-hidden="true">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <h1 class="reg-headline">You are all set</h1>
        <p class="reg-lead">${greeting}</p>
        <p class="reg-body">
          We look forward to your participation in the interactive demo.
        </p>
      </div>
    `;
  },
};

/**
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
