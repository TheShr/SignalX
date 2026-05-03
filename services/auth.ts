import admin from 'firebase-admin'

const privateKey = process.env.FIREBASE_PRIVATE_KEY
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const projectId = process.env.FIREBASE_PROJECT_ID

if (!privateKey || !clientEmail || !projectId) {
  throw new Error('Missing Firebase service account credentials in environment')
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  })
}

export async function verifyFirebaseToken(idToken: string) {
  try {
    return await admin.auth().verifyIdToken(idToken)
  } catch (error) {
    console.error('Firebase token verification failed', error)
    throw new Error('Unauthorized')
  }
}
