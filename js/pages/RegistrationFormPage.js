/**
 * RegistrationFormPage — Screen 2: registration form and dream destination picker.
 */

import { goToRegistrationScreen } from '../core/registrationNavigate.js';
import { RegistrationRepository } from '../api/RegistrationRepository.js';
import { StorageManager } from '../core/StorageManager.js';
import { AppLogger } from '../core/AppLogger.js';
import { Toast } from '../components/Toast.js';

/** @type {import('../api/RegistrationRepository.js').DreamDestination|null} */
let _selectedDestination = null;

const DESTINATION_OPTIONS = [
  {
    value: 'beach',
    label: 'Beach',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80&auto=format&fit=crop',
    alt: 'Tropical beach and ocean',
  },
  {
    value: 'mountain',
    label: 'Mountain',
    image:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80&auto=format&fit=crop',
    alt: 'Snowy mountain peaks',
  },
  {
    value: 'city',
    label: 'City',
    image:
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80&auto=format&fit=crop',
    alt: 'Urban city skyline',
  },
];

export const RegistrationFormPage = {
  /**
   * Renders the registration form into #registration-outlet.
   */
  render() {
    const outlet = document.getElementById('registration-outlet');
    if (!outlet) return;

    _selectedDestination = null;
    AppLogger.info('[UI]', 'RegistrationFormPage.render()');

    outlet.innerHTML = `
      <div class="reg-screen reg-screen-form">
        <h1 class="reg-headline">Register</h1>
        <p class="reg-body reg-form-intro">Enter your details to join the demo.</p>

        <form id="reg-form" class="reg-form" novalidate>
          <div class="reg-field">
            <label class="reg-label" for="reg-first-name">First name</label>
            <input
              id="reg-first-name"
              name="firstName"
              type="text"
              class="reg-input"
              autocomplete="given-name"
              required
            />
          </div>
          <div class="reg-field">
            <label class="reg-label" for="reg-last-name">Last name</label>
            <input
              id="reg-last-name"
              name="lastName"
              type="text"
              class="reg-input"
              autocomplete="family-name"
              required
            />
          </div>
          <div class="reg-field">
            <label class="reg-label" for="reg-email">Email</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              class="reg-input"
              autocomplete="email"
              required
            />
          </div>

          <fieldset class="reg-fieldset">
            <legend class="reg-legend">What is your dream destination?</legend>
            <div class="reg-destination-grid" role="radiogroup" aria-label="Dream destination">
              ${DESTINATION_OPTIONS.map(
                opt => `
                <label class="reg-destination-card">
                  <input type="radio" name="dreamDestination" value="${opt.value}" class="reg-destination-input" />
                  <span class="reg-destination-visual">
                    <img src="${opt.image}" alt="" loading="lazy" width="400" height="240" />
                  </span>
                  <span class="reg-destination-label">${opt.label}</span>
                </label>
              `,
              ).join('')}
            </div>
          </fieldset>

          <p id="reg-form-error" class="reg-inline-error" role="alert" hidden></p>

          <button type="submit" class="reg-btn reg-btn-primary" id="reg-submit">
            Register
          </button>
        </form>
      </div>
    `;

    const form = outlet.querySelector('#reg-form');
    const submitBtn = outlet.querySelector('#reg-submit');
    const errorEl = outlet.querySelector('#reg-form-error');

    outlet.querySelectorAll('input[name="dreamDestination"]').forEach(radio => {
      radio.addEventListener('change', () => {
        _selectedDestination = /** @type {typeof _selectedDestination} */ (radio.value);
        outlet.querySelectorAll('.reg-destination-card').forEach(card => {
          const input = card.querySelector('input[type="radio"]');
          card.classList.toggle('reg-destination-card--selected', input?.checked === true);
        });
      });
    });

    form?.addEventListener('submit', async e => {
      e.preventDefault();
      if (!submitBtn || !errorEl) return;

      errorEl.hidden = true;
      errorEl.textContent = '';

      const firstName = /** @type {HTMLInputElement} */ (outlet.querySelector('#reg-first-name')).value;
      const lastName = /** @type {HTMLInputElement} */ (outlet.querySelector('#reg-last-name')).value;
      const email = /** @type {HTMLInputElement} */ (outlet.querySelector('#reg-email')).value;

      if (!firstName.trim() || !lastName.trim()) {
        errorEl.textContent = 'Please enter your first and last name.';
        errorEl.hidden = false;
        Toast.show('Please enter your first and last name.', 'warning');
        return;
      }

      if (!_selectedDestination) {
        errorEl.textContent = 'Please choose a dream destination.';
        errorEl.hidden = false;
        Toast.show('Please choose a dream destination.', 'warning');
        return;
      }

      if (!isValidEmail(email)) {
        errorEl.textContent = 'Please enter a valid email address.';
        errorEl.hidden = false;
        Toast.show('Please enter a valid email address.', 'warning');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.classList.add('reg-btn--loading');

      try {
        await RegistrationRepository.registerParticipant({
          firstName,
          lastName,
          email,
          dreamDestination: _selectedDestination,
        });

        StorageManager.set('reg_first_name', firstName.trim());
        AppLogger.info('[UI]', 'Registration succeeded — navigating to thanks');
        goToRegistrationScreen('thanks');
      } catch (err) {
        const msg = err.humanMessage || err.message || 'Something went wrong. Please try again.';
        errorEl.textContent = msg;
        errorEl.hidden = false;
        Toast.show(msg, 'error', 5000);
        AppLogger.error('[UI]', 'Registration failed', err);
      } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('reg-btn--loading');
      }
    });
  },
};

/**
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const t = email.trim();
  if (!t) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}
