import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { nanoid } from "nanoid";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);

const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  return signInWithRedirect(auth, provider);
};

export const handleRedirectResult = () => {
  return getRedirectResult(auth);
};

export const uploadPhoto = async (file: File, userId: string): Promise<string> => {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${userId}/${nanoid()}.${fileExtension}`;
  const storageRef = ref(storage, `profile-photos/${fileName}`);
  
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
};
