import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import { ModelProfile } from "../types";
import { INITIAL_PROFILES } from "../data";

// Fetch all profiles for a given user
export async function getUserProfiles(userId: string): Promise<ModelProfile[]> {
  try {
    const q = query(collection(db, "profiles"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const profiles: ModelProfile[] = [];
    
    querySnapshot.forEach((docSnap) => {
      profiles.push(docSnap.data() as ModelProfile);
    });
    
    // Sort profiles so they always appear in a stable order (by id)
    return profiles.sort((a, b) => a.id.localeCompare(b.id));
  } catch (error) {
    console.error("Error in getUserProfiles:", error);
    throw error;
  }
}

// Save or update a profile in Firestore
export async function saveUserProfile(userId: string, profile: ModelProfile): Promise<void> {
  try {
    const profileDocRef = doc(db, "profiles", profile.id);
    const profileWithUser = {
      ...profile,
      userId
    };
    await setDoc(profileDocRef, profileWithUser);
  } catch (error) {
    console.error("Error in saveUserProfile:", error);
    throw error;
  }
}

// Delete a profile from Firestore
export async function deleteUserProfile(profileId: string): Promise<void> {
  try {
    const profileDocRef = doc(db, "profiles", profileId);
    await deleteDoc(profileDocRef);
  } catch (error) {
    console.error("Error in deleteUserProfile:", error);
    throw error;
  }
}

// Seed default profiles for a new user
export async function seedDefaultProfiles(userId: string): Promise<ModelProfile[]> {
  try {
    const seededProfiles: ModelProfile[] = [];
    for (const original of INITIAL_PROFILES) {
      const cloned = { ...original };
      // Make sure each user gets unique profile IDs if they want, but preserving INITIAL_PROFILES as seed is perfect.
      // Let's modify ID to be user-specific to avoid collision in Firestore if we want, but since they are separate documents
      // with unique IDs, we can use their original ID prefixed with userId or just keep them as-is since they are in a global collection
      // but filtered by userId. Let's make the document ID unique by appending the userId to ensure no overlap if multiple users use default profiles.
      const newId = `${original.id}-${userId}`;
      const newProfile: ModelProfile = {
        ...cloned,
        id: newId,
        logs: [
          {
            id: `log-seed-${Date.now()}`,
            timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
            text: "Perfil padrão inicializado para a sua conta."
          }
        ]
      };
      
      await saveUserProfile(userId, newProfile);
      seededProfiles.push(newProfile);
    }
    return seededProfiles;
  } catch (error) {
    console.error("Error seeding default profiles:", error);
    throw error;
  }
}
