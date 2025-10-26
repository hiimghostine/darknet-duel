/**
 * Tutorial logging utility
 * Respects the TUTORIAL_LOG environment variable to control console output
 */

const isTutorialLogEnabled = import.meta.env.TUTORIAL_LOG === 'true';

/**
 * Conditional logger for tutorial-related messages
 * Only logs when TUTORIAL_LOG=true in .env
 */
export const tutorialLog = (...args: any[]) => {
  if (isTutorialLogEnabled) {
    console.log(...args);
  }
};

/**
 * Conditional error logger for tutorial-related errors
 * Always logs errors regardless of TUTORIAL_LOG setting
 */
export const tutorialError = (...args: any[]) => {
  console.error(...args);
};

/**
 * Conditional warn logger for tutorial-related warnings
 * Always logs warnings regardless of TUTORIAL_LOG setting
 */
export const tutorialWarn = (...args: any[]) => {
  console.warn(...args);
};

export default tutorialLog;