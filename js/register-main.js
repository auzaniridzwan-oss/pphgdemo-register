/**
 * Bootstrap for the Braze Platform Demonstration registration SPA.
 */

import { AppLogger } from './core/AppLogger.js';
import { RegistrationRouter } from './core/RegistrationRouter.js';

AppLogger.info('[SYSTEM]', 'Registration app starting', { version: '1.0.0' });
RegistrationRouter.init();
