import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getDatabase, type Database } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Live sync is optional: if no Firebase project has been configured yet
// (see .env.example), we just skip initialization instead of crashing the app.
export const isLiveSyncConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.databaseURL && firebaseConfig.projectId,
)

let app: FirebaseApp | null = null
let database: Database | null = null

if (isLiveSyncConfigured) {
  app = initializeApp(firebaseConfig)
  database = getDatabase(app)
}

export { database }
