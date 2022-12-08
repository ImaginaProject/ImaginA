import { initializeApp } from 'firebase/app'
// import { getAnalytics } from 'firebase/analytics'

import {
  getDatabase,
  ref,
  onValue,
  get,
  child,
  remove,
} from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_apiKey,
  authDomain: import.meta.env.VITE_APP_authDomain,
  databaseURL: import.meta.env.VITE_APP_databaseURL,
  projectId: import.meta.env.VITE_APP_projectId,
  storageBucket: import.meta.env.VITE_APP_storageBucket,
  messagingSenderId: import.meta.env.VITE_APP_messagingSenderId,
  appId: import.meta.env.VITE_APP_appId,
  measurementId: import.meta.env.VITE_APP_measurementId,
}

const app = initializeApp(firebaseConfig)

const realtimeDB = getDatabase(app)
// const analytics = getAnalytics(app)

export default {
  realtimeDB,
  ref,
  onValue,
  get,
  child,
  remove,
  // analytics,
}
