/**
 * Hash targets for the registration SPA (avoids circular imports with RegistrationRouter).
 */

export const REGISTRATION_HASH = {
  welcome: '#/welcome',
  register: '#/register',
  thanks: '#/thanks',
};

/**
 * @param {'welcome'|'register'|'thanks'} screen
 */
export function goToRegistrationScreen(screen) {
  window.location.hash = REGISTRATION_HASH[screen] || REGISTRATION_HASH.welcome;
}
