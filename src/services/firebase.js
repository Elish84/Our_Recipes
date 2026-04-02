import { initializeApp } from "firebase/app";
import {
    getFirestore,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    where,
    limit,
    setDoc,
    getDoc,
    getDocs
} from "firebase/firestore";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    setPersistence,
    browserLocalPersistence,
    onAuthStateChanged
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBNH-GD84I3ak02m1Jsb48HxzRS_M0oB_I",
    authDomain: "our-recipes-1ec24.firebaseapp.com",
    projectId: "our-recipes-1ec24",
    storageBucket: "our-recipes-1ec24.firebasestorage.app",
    messagingSenderId: "321450665193",
    appId: "1:321450665193:web:571b3784510a6e06ec7c78",
    measurementId: "G-QBR51WXVDJ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const provider = new GoogleAuthProvider();

let authInitPromise = null;

export const initAuth = async () => {
    if (authInitPromise) return authInitPromise;
    authInitPromise = (async () => {
        await setPersistence(auth, browserLocalPersistence);
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                unsubscribe();
                if (user) {
                    await setDoc(doc(db, "users", user.uid), {
                        uid: user.uid,
                        name: user.displayName || "",
                        email: user.email || "",
                        photo: user.photoURL || "",
                        lastLoginAt: Date.now()
                    }, { merge: true });
                }
                resolve(user || null);
            });
        });
    })();
    return authInitPromise;
};

export const signInWithGoogle = async () => {
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email || "",
        photo: user.photoURL || "",
        lastLoginAt: Date.now()
    }, { merge: true });
    return user;
};

export const signOutUser = () => signOut(auth);

const recipesCollection = collection(db, "recipes");
const stylesCollection = collection(db, "styles");
const booksCollection = collection(db, "recipeBooks");

export const subscribeToRecipes = (bookId, callback, onError) => {
    if (!bookId) return () => { };
    const q = query(recipesCollection, where("bookId", "==", bookId), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
    }, (error) => { if (onError) onError(error); });
};

export const subscribeToBooks = (userId, callback) => {
    if (!userId) return () => { };
    const q = query(collection(db, "members"), where("userId", "==", userId));
    return onSnapshot(q, async (snapshot) => {
        const bookIds = snapshot.docs.map(d => d.data().bookId);
        if (bookIds.length === 0) return callback([]);
        const books = [];
        for (const bid of bookIds) {
            try {
                const bDoc = await getDoc(doc(db, "recipeBooks", bid));
                if (bDoc.exists()) books.push({ id: bid, ...bDoc.data() });
            } catch (err) {
                console.warn(`Access denied or error fetching book ${bid}`, err);
            }
        }
        callback(books);
    }, (error) => console.error("Error in books subscription:", error));
};

export const subscribeToJoinRequests = (bookId, callback) => {
    if (!bookId) return () => { };
    const q = query(collection(db, "joinRequests"), where("bookId", "==", bookId), where("status", "==", "pending"));
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
};

export const subscribeToMembers = (bookId, callback, onError) => {
    if (!bookId) return () => { };
    const q = query(collection(db, "members"), where("bookId", "==", bookId));
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => { if (onError) onError(error); });
};

export const addRecipe = async (recipe, bookId, user) => {
    await addDoc(recipesCollection, {
        ...recipe,
        bookId,
        creatorUID: user.uid,
        creatorName: user.displayName || "Unknown",
        creatorPhoto: user.photoURL || "",
        visibility: recipe.visibility || "public",
        createdAt: Date.now()
    });
};

export const updateRecipe = async (recipeId, updates) => {
    const recipeRef = doc(db, "recipes", recipeId);
    await updateDoc(recipeRef, updates);
};

export const deleteRecipe = async (recipeId) => {
    const recipeRef = doc(db, "recipes", recipeId);
    await deleteDoc(recipeRef);
};

export const createBook = async (name, coverImage, userId) => {
    const bRef = await addDoc(booksCollection, {
        name,
        coverImage,
        ownerId: userId,
        createdAt: Date.now()
    });
    await setDoc(doc(db, "members", `${userId}_${bRef.id}`), {
        bookId: bRef.id,
        userId,
        role: "owner_admin",
        joinedAt: Date.now()
    });
    return bRef.id;
};

export const deleteBook = async (bookId) => {
    await deleteDoc(doc(db, "recipeBooks", bookId));
    const rSnap = await getDocs(query(recipesCollection, where("bookId", "==", bookId)));
    for (const rDoc of rSnap.docs) { await deleteDoc(doc(db, "recipes", rDoc.id)); }
    const mSnap = await getDocs(query(collection(db, "members"), where("bookId", "==", bookId)));
    for (const mDoc of mSnap.docs) { await deleteDoc(doc(db, "members", mDoc.id)); }
    const jrSnap = await getDocs(query(collection(db, "joinRequests"), where("bookId", "==", bookId)));
    for (const jrDoc of jrSnap.docs) { await deleteDoc(doc(db, "joinRequests", jrDoc.id)); }
};

export const requestToJoinBook = async (bookId, userId, name, email, photo) => {
    await addDoc(collection(db, "joinRequests"), {
        bookId, requesterId: userId, name, email, photo,
        status: "pending", createdAt: Date.now()
    });
};

export const approveJoinRequest = async (requestId, bookId, userId) => {
    await updateDoc(doc(db, "joinRequests", requestId), { status: "approved" });
    await setDoc(doc(db, "members", `${userId}_${bookId}`), {
        bookId, userId, role: "member", joinedAt: Date.now()
    });
};

export const rejectJoinRequest = async (requestId) => {
    await updateDoc(doc(db, "joinRequests", requestId), { status: "rejected" });
};

export const subscribeToUserRecipes = (uid, callback) => {
    const q = query(recipesCollection, where("creatorUID", "==", uid), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
};

export const updateUserProfile = async (uid, updates) => {
    await updateDoc(doc(db, "users", uid), updates);
};

export const subscribeToStyles = (callback, onError) => {
    const q = query(stylesCollection, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
    }, (error) => { if (onError) onError(error); });
};

export const subscribeToReviews = (recipeId, callback, onError) => {
    const reviewsCol = collection(db, "recipes", recipeId, "reviews");
    const q = query(reviewsCol, limit(50));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
    }, (error) => { if (onError) onError(error); });
};

export const addStyle = async (name) => {
    await addDoc(stylesCollection, { name, createdAt: Date.now() });
};

export const deleteStyle = async (styleId) => {
    const styleRef = doc(db, "styles", styleId);
    await deleteDoc(styleRef);
};

export const addReview = async (recipeId, review, user) => {
    const reviewsCol = collection(db, "recipes", recipeId, "reviews");
    await addDoc(reviewsCol, {
        ...review,
        userName: user.displayName || "GUEST",
        userPhoto: user.photoURL || "",
        creatorUID: user.uid,
        createdAt: Date.now()
    });
};

export const uploadRecipeImage = async (file, bookId) => {
    if (!file) return null;
    const storageRef = ref(storage, "recipes/" + bookId + "/" + Date.now() + "_" + file.name);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
};

export const uploadProfileImage = async (file, uid) => {
    if (!file) return null;
    const storageRef = ref(storage, "users/" + uid + "/profile_" + Date.now() + ".jpg");
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
};