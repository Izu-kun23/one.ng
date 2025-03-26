import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, addDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "./firebaseConfig";  // Your Firebase App Config file

// Initialize Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

class Fire {
  constructor() {
    this.auth = auth;         // ✅ Attach auth instance
    this.firestore = firestore;  // ✅ Attach firestore instance
    this.storage = storage;      // ✅ Attach storage instance
  }

  /**
   * Add a post to Firestore
   */
  addPost = async ({ text, localUri, name, avatar }) => {
    if (!this.uid) {
      console.error("🔥 User UID is not available!");
      return;
    }

    let remoteUri = null;

    if (localUri) {
      const photoPath = `photos/${this.uid}/${Date.now()}`;
      remoteUri = await this.uploadPhotoAsync(localUri, photoPath);
    }

    try {
      const docRef = await addDoc(collection(firestore, "posts"), {
        text,
        name,  // Use the name from the user data
        avatar, // Include avatar in the post
        uid: this.uid,
        timestamp: this.timestamp,
        image: remoteUri,
      });

      console.log("✅ Post added with ID:", docRef.id);
    } catch (error) {
      console.error("❌ Error adding post:", error);
    }
  };

  /**
   * Create a new user in Firebase Authentication and Firestore
   */
  createUser = async (user) => {
    let remoteUri = null;

    try {
      // Step 1: Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      const { uid } = userCredential.user;

      console.log("✅ User created successfully in Firebase Auth:", uid);

      // Step 2: Reference to Firestore document (users collection)
      const userDocRef = doc(firestore, "users", uid);

      // Step 3: Store user details in Firestore
      await setDoc(userDocRef, {
        uid,
        name: user.name,
        email: user.email,
        avatar: null,  // Default avatar is null
        createdAt: new Date().toISOString(),
      });

      console.log("✅ User document created in Firestore:", uid);

      // Step 4: Upload avatar (if provided)
      if (user.avatar) {
        remoteUri = await this.uploadPhotoAsync(user.avatar, `avatars/${uid}`);
        
        // Step 5: Update Firestore with avatar URL
        await setDoc(userDocRef, { avatar: remoteUri }, { merge: true });

        console.log("✅ Avatar uploaded & Firestore updated:", remoteUri);
      }
      
    } catch (error) {
      console.error("❌ Error creating user:", error);
      alert("Error: " + error.message);
    }
  };

  /**
   * Uploads an image to Firebase Storage and returns the download URL
   */
  uploadPhotoAsync = async (uri, filename) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(storage, filename);
      const metadata = { contentType: "image/jpeg" };
      const uploadTask = uploadBytesResumable(storageRef, blob, metadata);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`📤 Upload Progress: ${progress}%`);
          },
          (error) => {
            console.error("❌ Upload error:", error.message);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      throw error;
    }
  };

    // Fetch user data including name and avatar
   getUserData = async (uid) => {
      try {
        const userDocRef = doc(firestore, "users", uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          return userDoc.data(); // Return user data (name, avatar, etc.)
        } else {
          console.error("User document not found!");
          return null;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
      }
    };


  /**
   * Log the user out of Firebase Authentication
   */
  signOut = () => {
    signOut(auth)
      .then(() => {
        console.log("✅ User signed out successfully");
      })
      .catch((error) => {
        console.error("❌ Error signing out:", error);
      });
  };

  /**
   * Returns the currently logged-in user's UID
   */
  get uid() {
    return auth.currentUser ? auth.currentUser.uid : null;
  }

  /**
   * Returns the current timestamp
   */
  get timestamp() {
    return Date.now();
  }
}

// Singleton instance of Fire class
Fire.shared = new Fire();
export default Fire;