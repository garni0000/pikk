import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { nanoid } from "nanoid";

// Configuration Firebase directe (pour test)
const firebaseConfig = {
  apiKey: "AIzaSyCioo-wvVjNdvjZyvnLjLL-0MH-bjmXhFg",
  authDomain: "chatt-3f532.firebaseapp.com",
  projectId: "chatt-3f532",
  storageBucket: "chatt-3f532.firebasestorage.app",
  appId: "1:914545949633:web:d189481c81af0037830d40",
};

console.log('Firebase Config (Direct):', {
  apiKey: firebaseConfig.apiKey ? 'Set' : 'Missing',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId ? 'Set' : 'Missing'
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    console.log('Starting Google sign-in (direct config)...');
    const result = await signInWithPopup(auth, provider);
    console.log('Google sign-in successful:', result.user.email);
    return result;
  } catch (error) {
    console.error('Google sign-in failed:', error);
    throw error;
  }
};

export const uploadPhoto = async (file: File, userId: string): Promise<string> => {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${userId}/${nanoid()}.${fileExtension}`;
  const storageRef = ref(storage, `profile-photos/${fileName}`);
  
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
};

