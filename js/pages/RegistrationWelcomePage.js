/**
 * RegistrationWelcomePage — Screen 1: welcome and legal copy.
 */

import { goToRegistrationScreen } from '../core/registrationNavigate.js';
import { AppLogger } from '../core/AppLogger.js';

export const RegistrationWelcomePage = {
  /**
   * Renders the welcome screen into #registration-outlet.
   */
  render() {
    const outlet = document.getElementById('registration-outlet');
    if (!outlet) return;

    AppLogger.info('[UI]', 'RegistrationWelcomePage.render()');

    outlet.innerHTML = `
      <div class="reg-screen reg-screen-welcome">
        <h1 class="reg-headline">Welcome</h1>
        <p class="reg-lead">
          You are invited to take part in an interactive Braze platform demonstration.
          Register your details to begin the experience tailored for this session.
        </p>
        <div class="reg-legal" role="note">
          <p>
            All information collected here is used only for this demo session and may be removed when the session ends.
            Your participation is private and confidential to this demonstration.
          </p>
        </div>
        <button type="button" class="reg-btn reg-btn-primary" id="reg-welcome-next">
          Next
        </button>
      </div>
    `;

    const next = outlet.querySelector('#reg-welcome-next');
    next?.addEventListener('click', () => goToRegistrationScreen('register'));
  },
};
