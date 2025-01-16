// firebase.js
import admin from 'firebase-admin';
import serviceAccount from './lib-db-backup-firebase-adminsdk-57ynt-0f5892e257.json'; // Replace with the path to your service account key

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://lib-db-backup-id.firebaseio.com" // Replace with your Firebase project ID
  });
}

const db = admin.firestore();
export default db;

