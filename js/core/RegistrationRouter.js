/**
 * RegistrationRouter
 *
 * Hash routes for the Braze Platform Demonstration registration flow.
 *
 * Routes:
 *   #/  #/welcome  → Welcome
 *   #/register     → Registration form
 *   #/thanks       → Thank you
 */

import { AppLogger } from './AppLogger.js';
import { goToRegistrationScreen, REGISTRATION_HASH } from './registrationNavigate.js';
import { RegistrationWelcomePage } from '../pages/RegistrationWelcomePage.js';
import { RegistrationFormPage } from '../pages/RegistrationFormPage.js';
import { RegistrationThanksPage } from '../pages/RegistrationThanksPage.js';

/** @type {Array<{ pattern: RegExp, handler: () => void }>} */
const routes = [
  {
    pattern: /^#\/welcome$/,
    handler: () => {
      AppLogger.info('[SYSTEM]', 'Route → /welcome');
      RegistrationWelcomePage.render();
    },
  },
  {
    pattern: /^#\/register$/,
    handler: () => {
      AppLogger.info('[SYSTEM]', 'Route → /register');
      RegistrationFormPage.render();
    },
  },
  {
    pattern: /^#\/thanks$/,
    handler: () => {
      AppLogger.info('[SYSTEM]', 'Route → /thanks');
      RegistrationThanksPage.render();
    },
  },
];

function goWelcome() {
  window.location.hash = REGISTRATION_HASH.welcome;
}

function resolve() {
  const hash = window.location.hash || '';

  if (!hash || hash === '#' || hash === '#/') {
    goWelcome();
    return;
  }

  for (const route of routes) {
    if (route.pattern.test(hash)) {
      route.handler();
      return;
    }
  }

  AppLogger.warn('[SYSTEM]', 'Unknown route — redirecting to welcome');
  goWelcome();
}

export const RegistrationRouter = {
  /**
   * Initialises hash routing for the registration SPA.
   */
  init() {
    AppLogger.info('[SYSTEM]', 'RegistrationRouter initialised');
    window.addEventListener('hashchange', resolve);
    resolve();
  },

  /**
   * @param {'welcome'|'register'|'thanks'} screen
   */
  navigate: goToRegistrationScreen,
};
