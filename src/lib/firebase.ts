import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0515765686",
  appId: "1:363629429591:web:75e1a1a1b8a0fbb269b412",
  apiKey: "AIzaSyAmMhTphwHNXVhluBQeMha4wxwOVfCf8Vg",
  authDomain: "gen-lang-client-0515765686.firebaseapp.com",
  storageBucket: "gen-lang-client-0515765686.firebasestorage.app",
  messagingSenderId: "363629429591"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific databaseId as specified in config
const db = initializeFirestore(app, {}, "ai-studio-gpacademyschool-cb27d102-2b85-4353-9abb-b94e653bbb74");

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration: Client is offline.");
    }
  }
}

testConnection();

export { db };
