/* Firebase App Check (reCAPTCHA v3)

   Protects Firebase API calls (Realtime Database, etc.) by attaching an App Check token
   to requests. This only has effect once App Check is enabled/enforced in Firebase Console.

   IMPORTANT:
   - Use your reCAPTCHA v3 SITE KEY here (public).
   - Never put the reCAPTCHA SECRET key in frontend code.
   - For local dev, you can enable a debug token (see commented line below).
*/

// Uncomment for local debugging ONLY (do not leave enabled for production):
// self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

const RECAPTCHA_V3_SITE_KEY = "6LfApWIsAAAAAB4ZLGYZOlViU0ZTOW0EPXOr8wSS";

try {
  if (firebase?.appCheck) {
    // compat API: activate(siteKey, isTokenAutoRefreshEnabled)
    firebase.appCheck().activate(RECAPTCHA_V3_SITE_KEY, true);
  } else {
    console.warn("Firebase App Check SDK not loaded. Did you include firebase-app-check-compat.js?");
  }
} catch (err) {
  console.warn("App Check init failed:", err);
}
