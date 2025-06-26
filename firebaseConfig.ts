
import firebase from 'firebase/app';
import 'firebase/firestore'; // For side effects, to make firebase.firestore() available

// Your web app's Firebase configuration
// These environment variables MUST be set in your hosting environment (e.g., Vercel)
// For local development, refer to README.md for setup options.
const firebaseConfigValues = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  // measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID // Optional
};

let app: firebase.app.App | null = null;
let db: firebase.firestore.Firestore | null = null;

if (!firebaseConfigValues.projectId) {
  console.error(
    "Firebase Initialization Failed: Firebase Project ID is not configured. " +
    "Please ensure the REACT_APP_FIREBASE_PROJECT_ID environment variable is set. " +
    "Refer to README.md for local development setup instructions."
  );
  // db remains null
} else if (
    !firebaseConfigValues.apiKey ||
    !firebaseConfigValues.authDomain ||
    // projectId is confirmed present
    !firebaseConfigValues.storageBucket ||
    !firebaseConfigValues.messagingSenderId ||
    !firebaseConfigValues.appId
) {
    console.warn(
        "Firebase Initialization Warning: One or more Firebase configuration values (apiKey, authDomain, etc.) are missing, though a Project ID is present. " +
        "The application might not function correctly with Firebase. " +
        "Please check all REACT_APP_FIREBASE_... environment variables. " +
        "Refer to README.md for setup instructions."
    );
    // Attempt to initialize as projectId is the most critical, but other features might fail.
    try {
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfigValues);
        } else {
            app = firebase.app(); // Get default app if already initialized
        }
        db = firebase.firestore(app);
        console.log("Firebase initialized with a valid Project ID, but other config values might be missing.");
    } catch (error) {
        console.error("Firebase initialization error (even with Project ID present, other config might be invalid/missing):", error);
        app = null; // Ensure app is null on error
        db = null; // Ensure db is null on error
    }
} else {
  // All critical values seem to be present
  try {
    if (!firebase.apps.length) {
        app = firebase.initializeApp(firebaseConfigValues);
    } else {
        app = firebase.app(); // Get default app if already initialized
    }
    db = firebase.firestore(app);
    // console.log("Firebase initialized successfully. Project ID:", firebaseConfigValues.projectId); // Optional: for debugging
  } catch (error) {
    console.error("Firebase initialization error:", error);
    app = null; // Ensure app is null on error
    db = null; // Ensure db is null on error
  }
}

export { db };
