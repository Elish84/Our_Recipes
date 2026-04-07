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
    setDoc,
    getDoc,
    getDocs,
    or
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
        
        const chunks = [];
        for (let i = 0; i < bookIds.length; i += 30) {
            chunks.push(bookIds.slice(i, i + 30));
        }

        const allBooks = [];
        for (const chunk of chunks) {
            const bQuery = query(booksCollection, where("__name__", "in", chunk));
            const bSnap = await getDocs(bQuery);
            allBooks.push(...bSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
        callback(allBooks);
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
    const docRef = await addDoc(recipesCollection, {
        ...recipe,
        bookId,
        createdByUid: user.uid,
        creatorName: user.displayName || "Unknown",
        creatorPhoto: user.photoURL || "",
        visibility: recipe.visibility || "public",
        createdAt: Date.now()
    });
    return docRef.id;
};

export const updateRecipe = async (recipeId, updates) => {
    const recipeRef = doc(db, "recipes", recipeId);
    // Auto-migrate legacy creatorUID if not yet updated to createdByUid
    const snap = await getDoc(recipeRef);
    if (snap.exists()) {
        const data = snap.data();
        if (!data.createdByUid && data.creatorUID) {
            updates.createdByUid = data.creatorUID;
        }
    }
    await updateDoc(recipeRef, updates);
};

export const deleteRecipe = async (recipeId) => {
    const recipeRef = doc(db, "recipes", recipeId);
    await deleteDoc(recipeRef);
};

export const createBook = async (name, coverImage, userId) => {
    const userDoc = await getDoc(doc(db, "users", userId));
    const userName = userDoc.exists() ? userDoc.data().name : "Owner";
    
    const bRef = await addDoc(booksCollection, {
        name,
        coverImage,
        ownerId: userId,
        createdAt: Date.now()
    });
    await setDoc(doc(db, "members", `${userId}_${bRef.id}`), {
        bookId: bRef.id,
        userId,
        userName,
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

export const approveJoinRequest = async (requestId, bookId, userId, name) => {
    await updateDoc(doc(db, "joinRequests", requestId), { status: "approved" });
    await setDoc(doc(db, "members", `${userId}_${bookId}`), {
        bookId, userId, role: "member", joinedAt: Date.now(), userName: name || "Member"
    });
};

export const rejectJoinRequest = async (requestId) => {
    await updateDoc(doc(db, "joinRequests", requestId), { status: "rejected" });
};

export const subscribeToUserRecipes = (uid, callback) => {
    // Support both new and legacy owner fields
    const q = query(recipesCollection, or(
        where("createdByUid", "==", uid),
        where("creatorUID", "==", uid)
    ));
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
};

export const updateUserProfile = async (uid, updates) => {
    await updateDoc(doc(db, "users", uid), updates);
};

export const subscribeToUserDoc = (uid, callback) => {
    if (!uid) return () => { };
    return onSnapshot(doc(db, "users", uid), (snapshot) => {
        if (snapshot.exists()) callback(snapshot.data());
    });
};

export const getUserDoc = async (uid) => {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
};

export const toggleVisibility = async (recipeId, currentVisibility) => {
    const next = currentVisibility === "public" ? "hidden" : "public";
    await updateDoc(doc(db, "recipes", recipeId), { visibility: next });
};

export const updateBookCover = async (bookId, coverImage) => {
    await updateDoc(doc(db, "recipeBooks", bookId), { coverImage });
};

export const updateBookName = async (bookId, name) => {
    await updateDoc(doc(db, "recipeBooks", bookId), { name });
};

export const removeMember = async (bookId, userId) => {
    await deleteDoc(doc(db, "members", `${userId}_${bookId}`));
};

export const subscribeToStyles = (bookId, callback, onError) => {
    const q = query(stylesCollection, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(s => !s.bookId || s.bookId === bookId);
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

export const addStyle = async (name, bookId) => {
    await addDoc(stylesCollection, { name, bookId, createdAt: Date.now() });
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
        createdByUid: user.uid,
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

export const logInstallEvent = async (eventType, platform) => {
    try {
        const analyticsCol = collection(db, "installAnalytics");
        await addDoc(analyticsCol, {
            eventType,
            platform,
            timestamp: Date.now()
        });
    } catch (e) {
        console.error("Analytics log failed: ", e);
    }
};

export const subscribeToInstallAnalytics = (callback, onError) => {
    const analyticsCol = collection(db, "installAnalytics");
    const q = query(analyticsCol, limit(5000)); // Cap for safety
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
    }, (error) => { if (onError) onError(error); });
};