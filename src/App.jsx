import React, { useEffect, useState } from "react";
import {
    auth, initAuth, signInWithGoogle, signOutUser, subscribeToRecipes, subscribeToStyles, subscribeToReviews,
    addRecipe, updateRecipe, deleteRecipe, addStyle, deleteStyle, addReview,
    subscribeToBooks, subscribeToMembers, subscribeToJoinRequests,
    createBook, requestToJoinBook, approveJoinRequest, rejectJoinRequest,
    uploadRecipeImage, deleteBook, subscribeToUserRecipes, updateUserProfile, uploadProfileImage
} from "./services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import AppHeader from "./components/AppHeader";
import headerBg from "./assets/header_bg.png";

// Translations
const TRANSLATIONS = {
  he: {
    title: "המתכונים שלנו",
    explore: "מתכונים",
    newRecipe: "הוסף מתכון",
    admin: "ניהול",
    devGate: "שער מפתח",
    adminMode: "מצב מנהל פעיל ★",
    recipeTitle: "שם המתכון",
    cookingStyles: "סגנונות בישול",
    heroImage: "תמונה ראשית וסיפור",
    story: "סיפור...",
    imageUrl: "או כתובת תמונה...",
    ingredients: "רכיבים",
    totalIngredients: "🛒 כל הרכיבים",
    stepIngredients: "רכיבי השלב",
    stepInstructions: "הוראות השלב",
    recipeSteps: "🍳 שלבי המתכון",
    addStep: "+ הוסף שלב נוסף",
    addIngredient: "+ רכיב",
    generalInstructions: "הרכבה כללית / הערות סיום",
    publish: "פרסם בספר המתכונים 📖",
    saving: "שומר...",
    emptyState: "אין מתכונים להצגה.",
    noMatch: "אין מתכונים תואמים לסינון.",
    clearAll: "נקה הכל",
    step: "שלב",
    preparation: "הכנה",
    finalNotes: "💡 הערות סיום",
    reviews: "ביקורות",
    addReview: "הוסף ביקורת ★",
    cancel: "ביטול",
    rating: "דירוג",
    feedback: "משוב",
    submit: "שלח",
    stars: "כוכבים",
    justNow: "ממש עכשיו",
    ago: "לפני",
    styleMgmt: "ניהול סגנונות",
    newStyle: "שם סגנון חדש...",
    add: "הוסף",
    inventory: "מלאי מתכונים",
    delete: "מחק",
    uncategorized: "ללא קטגוריה",
    selectStyle: "בחר לפחות סגנון אחד",
    itemPlace: "פריט...",
    units: { teapot: "קנקן", teaspoon: "כפית", tablespoon: "כף", cup: "כוס", ml: "מ\"ל", gram: "גרם", kg: "ק\"ג", liter: "ליטר", pinch: "קורט", slice: "פרוסה", clove: "שן", unit: "יחידה" },
    loginTitle: "ספר המתכונים המשפחתי",
    loginSubtitle: "המקום הבטוח שלכם לכל הטעמים של הבית",
    signIn: "התחברות עם Google",
    signOut: "התנתק",
    myBooks: "הספרים שלי",
    createBook: "צור ספר חדש",
    bookName: "שם הספר",
    coverImage: "תמונת כריכה",
    members: "חברים",
    requests: "בקשות הצטרפות",
    approve: "אשר",
    reject: "דחה",
    roleAdmin: "מנהל",
    roleMember: "חבר",
    noBooks: "עדיין אין לכם ספרי מתכונים.",
    inviteTitle: "הוזמנת להצטרף!",
    requestJoin: "שלח בקשת הצטרפות לספר",
    pendingRequest: "בקשת ההצטרפות שלך ממתינה לאישור המנהל",
    shareInvite: "שתף קישור הזמנה",
    activeBook: "ספר פעיל",
    noAccess: "אין הרשאה / No Access",
    noAccessDetails: "יתכן ואינך חבר בספר זה או שאין לך הרשאות ניהול מתאימות.",
    returnToBooks: "חזרה לרשימת הספרים",
    selectBook: "בחר ספר מתכונים להמשך",
    loading: "טוען...",
    searchPlaceholder: "חפש מתכון בספר זה...",
    uploadImage: "בחר תמונה מהמכשיר",
    prepTime: "זמן הכנה (דקות)",
    difficulty: "רמת קושי",
    easy: "קל",
    medium: "בינוני",
    hard: "מורכב",
    profile: "פרופיל",
    myRecipes: "המתכונים שלי",
    deleteBook: "מחק ספר מתכונים",
    confirmDeleteBook: "האם אתה בטוח שברצונך למחוק את כל ספר המתכונים? פעולה זו היא סופית ותמחק את כל המתכונים והחברים!",
    categories: {
      Main: "מנות עיקריות 🥘",
      Starters: "ראשונות וסלטים 🥗",
      Desserts: "קינוחים ומתוקים 🍰",
      Breakfast: "בוקר ומאפים 🥐",
      Drinks: "משקאות ☕",
      Other: "שונות 🍴"
    },
    category: "קטגוריה",
    by: "מאת",
    editProfile: "ערוך פרופיל",
    changePhoto: "החלף תמונה",
    stats: { recipes: "מתכונים", books: "ספרים" }
  },
  en: {
    title: "Our Recipes",
    explore: "Recipes",
    newRecipe: "Add Recipe",
    admin: "Admin",
    devGate: "Dev Gate",
    adminMode: "Admin Mode Active ★",
    recipeTitle: "Recipe Title",
    cookingStyles: "Cooking Styles",
    heroImage: "Hero Image & Story",
    story: "Story...",
    imageUrl: "Or Image URL...",
    ingredients: "Ingredients",
    totalIngredients: "🛒 Total Ingredients",
    stepIngredients: "Step Ingredients",
    stepInstructions: "Step Instructions",
    recipeSteps: "🍳 Recipe Steps",
    addStep: "+ Add Another Step",
    addIngredient: "+ Ingredient",
    generalInstructions: "General Assembly / Final Notes",
    publish: "Publish Cookbook Entry 📖",
    saving: "Saving...",
    emptyState: "No recipes to show.",
    noMatch: "No recipes match your criteria.",
    clearAll: "Clear All",
    step: "Step",
    preparation: "Preparation",
    finalNotes: "💡 Final Notes",
    reviews: "Reviews",
    addReview: "Add Review ★",
    cancel: "Cancel",
    rating: "Rating",
    feedback: "Feedback",
    submit: "Submit",
    stars: "Stars",
    justNow: "just now",
    ago: "ago",
    styleMgmt: "Styles Management",
    newStyle: "New style name...",
    add: "Add",
    inventory: "Recipes Inventory",
    delete: "Delete",
    uncategorized: "Uncategorized",
    selectStyle: "Select at least one style",
    itemPlace: "Item...",
    units: { teapot: "teapot", teaspoon: "tsp", tablespoon: "tbsp", cup: "cup", ml: "ml", gram: "g", kg: "kg", liter: "L", pinch: "pinch", slice: "slice", clove: "clove", unit: "unit" },
    loginTitle: "Family Recipe Book",
    loginSubtitle: "The safe place for all your home flavors",
    signIn: "Sign in with Google",
    signOut: "Sign Out",
    myBooks: "My Books",
    createBook: "Create New Book",
    bookName: "Book Name",
    coverImage: "Cover Image",
    members: "Members",
    requests: "Join Requests",
    approve: "Approve",
    reject: "Reject",
    roleAdmin: "Admin",
    roleMember: "Member",
    noBooks: "You don't have any recipe books yet.",
    inviteTitle: "You've been invited!",
    requestJoin: "Request to join book",
    pendingRequest: "Your join request is pending approval",
    shareInvite: "Share Invite Link",
    activeBook: "Active Book",
    noAccess: "No Access",
    noAccessDetails: "You might not be a member of this book or lack sufficient administrative permissions.",
    returnToBooks: "Return to Book List",
    selectBook: "Select a recipe book to continue",
    loading: "Loading...",
    searchPlaceholder: "Search recipe in this book...",
    uploadImage: "Choose image from device",
    prepTime: "Prep Time (min)",
    difficulty: "Difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    profile: "Profile",
    myRecipes: "My Recipes",
    deleteBook: "Delete Cookbook",
    confirmDeleteBook: "Are you sure you want to delete the entire cookbook? This action is permanent and will delete all recipes and members!",
    categories: {
      Main: "Main Courses 🥘",
      Starters: "Starters & Salads 🥗",
      Desserts: "Desserts & Sweets 🍰",
      Breakfast: "Breakfast & Bakery 🥐",
      Drinks: "Drinks ☕",
      Other: "Other 🍴"
    },
    category: "Category",
    by: "By",
    editProfile: "Edit Profile",
    changePhoto: "Change Photo",
    stats: { recipes: "Recipes", books: "Books" }
  }
};

// Constants
const UNIT_EMOJIS = { teapot: "🫖", teaspoon: "🥄", tablespoon: "🥄+", cup: "☕", ml: "💧", gram: "⚖️", kg: "📦", liter: "🥛", pinch: "🤏", slice: "🍞", clove: "🧄", unit: "📦" };
const FRACTIONS = { 0.25: "¼", 0.33: "⅓", 0.5: "½", 0.66: "⅔", 0.75: "¾" };

// Helpers
const normalizeCookingStyles = (v) => {
  if (Array.isArray(v)) return [...new Set(v.filter(Boolean))];
  return v ? [v] : [];
};

const normalizeSteps = (recipe, t) => {
  if (recipe.steps && recipe.steps.length > 0) return recipe.steps;
  return [{ 
    title: t.preparation, 
    ingredients: recipe.structuredIngredients || [], 
    instructions: recipe.instructions || "" 
  }];
};

const getAggregatedIngredients = (steps) => {
  const map = {};
  steps.forEach(step => {
    step.ingredients.forEach(ing => {
      const key = `${ing.item.toLowerCase()}-${ing.unit}`;
      if (!map[key]) map[key] = { ...ing };
      else map[key].qty += ing.qty;
    });
  });
  return Object.values(map);
};

const formatQty = (num) => {
  if (!num) return "";
  const integer = Math.floor(num);
  const fraction = num - integer;
  const fractionText = FRACTIONS[parseFloat(fraction.toFixed(2))] || (fraction > 0 ? fraction.toFixed(2).replace(/^0/, '') : "");
  return (integer > 0 ? integer : "") + fractionText;
};

const timeAgo = (date, t) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return t.justNow;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${t.ago}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${t.ago}`;
  return new Date(date).toLocaleDateString();
};

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Quality 0.7
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const ReviewSection = ({ recipeId, t, user }) => {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, feedback: "", resultImageUrl: "" });

  useEffect(() => {
    return subscribeToReviews(recipeId, setReviews);
  }, [recipeId]);

  const handleSubmit = async (e) => {
    e.preventDefault(); e.stopPropagation();
    await addReview(recipeId, newReview, user);
    setNewReview({ rating: 5, feedback: "", resultImageUrl: "" });
    setShowForm(false);
  };

  return (
    <div className="reviews-section" onClick={(e) => e.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4 className="section-title">{t.reviews} ({reviews.length})</h4>
        <button className="add-btn-small" onClick={() => setShowForm(!showForm)}>{showForm ? t.cancel : t.addReview}</button>
      </div>
      {showForm && (
        <form className="recipe-form" onSubmit={handleSubmit} style={{ padding: 16, marginBottom: 20 }}>
          <div className="form-group"><label>{t.rating}</label>
            <select value={newReview.rating} onChange={(e) => setNewReview({...newReview, rating: Number(e.target.value)})}>
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} {t.stars}</option>)}
            </select>
          </div>
          <div className="form-group"><label>{t.feedback}</label>
            <textarea rows="2" value={newReview.feedback} onChange={(e) => setNewReview({...newReview, feedback: e.target.value})} required />
          </div>
          <button className="primary" type="submit">{t.submit}</button>
        </form>
      )}
      {reviews.sort((a,b) => b.createdAt - a.createdAt).map(rev => (
        <div key={rev.id} className="review-card">
          <div className="review-header"><strong>{"★".repeat(rev.rating)}</strong><span>{timeAgo(rev.createdAt, t)}</span></div>
          <p>{rev.feedback}</p>
        </div>
      ))}
    </div>
  );
};

const ProfileView = ({ user, recipes, t, onUpdatePhoto, isSaving }) => {
  return (
    <div className="profile-section" style={{ marginTop: 24 }}>
      <div className="profile-header">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img src={user.photoURL} className="profile-avatar-large" alt={user.displayName} />
          <label className="badge public" style={{ position: 'absolute', bottom: 20, right: 0, padding: '4px 8px', fontSize: '0.6rem', cursor: 'pointer' }}>
            ✎ {t.changePhoto}
            <input type="file" accept="image/*" hidden onChange={(e) => onUpdatePhoto(e.target.files[0])} />
          </label>
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>{user.displayName || "User"}</h2>
        <div className="profile-stats">
          <div className="stat-item"><span className="stat-value">{recipes.length}</span><span className="stat-label">{t.stats.recipes}</span></div>
          <div className="stat-item"><span className="stat-value">{new Set(recipes.map(r => r.bookId)).size}</span><span className="stat-label">{t.stats.books}</span></div>
        </div>
      </div>
      <h3 className="section-title" style={{ marginBottom: 20 }}>{t.myRecipes}</h3>
      <div className="recipe-list">
        {recipes.length === 0 ? <p className="empty-state">{t.emptyState}</p> : 
         recipes.map(r => <RecipeCard key={r.id} recipe={r} styles={[]} isAdmin={true} t={t} />)}
      </div>
    </div>
  );
};

const RecipeCard = ({ recipe, styles, isAdmin, t }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAggregated, setShowAggregated] = useState(false);
  const recipeStyles = normalizeCookingStyles(recipe.styleIds || recipe.styleId);
  const recipeSteps = normalizeSteps(recipe, t);
  const totals = getAggregatedIngredients(recipeSteps);

  return (
    <article className="recipe-card" onClick={() => setIsExpanded(!isExpanded)}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div className="thumbnail-container">
          {recipe.mainImageUrl ? (
            <img className="recipe-thumb" src={recipe.mainImageUrl} alt={recipe.name} />
          ) : (
            <div className="recipe-thumb-placeholder">🍲</div>
          )}
        </div>
        <div className="card-body" style={{ flex: 1, padding: 0 }}>
          <div className="recipe-header">
            <h3 className="recipe-name">{recipe.name}</h3>
            <span className="recipe-date">{timeAgo(recipe.createdAt, t)}</span>
          </div>
          <div className="creator-tag" style={{ marginBottom: 4 }}>
            {recipe.creatorPhoto && <img src={recipe.creatorPhoto} className="creator-avatar" alt={recipe.creatorName} />}
            <span>{t.by} {recipe.creatorName || "Legacy"}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {recipeStyles.map(sid => (
              <span key={sid} className="badge" style={{ background: 'rgba(254, 243, 199, 0.5)', color: '#92400E', fontSize: '0.65rem' }}>
                {styles.find(s => s.id === sid)?.name || "Style"}
              </span>
            ))}
            {recipe.prepTime && <span className="badge" style={{ background: '#F3F4F6', color: '#374151', fontSize: '0.65rem' }}>⏱️ {recipe.prepTime}m</span>}
            {recipe.difficulty && <span className="badge" style={{ background: recipe.difficulty === 'hard' ? '#FEE2E2' : recipe.difficulty === 'medium' ? '#FEF3C7' : '#ECFDF5', color: recipe.difficulty === 'hard' ? '#991B1B' : recipe.difficulty === 'medium' ? '#92400E' : '#065F46', fontSize: '0.65rem' }}>{t[recipe.difficulty]}</span>}
          </div>
          {recipe.story && !isExpanded && <p className="recipe-story" style={{ marginTop: 6, fontSize: '0.8rem' }}>"{recipe.story.substring(0, 60)}..."</p>}
        </div>
      </div>

      {isExpanded && (
        <div className="recipe-content" style={{ marginTop: 24, borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: 20 }}>
          {recipe.mainImageUrl && <img className="hero-image" src={recipe.mainImageUrl} alt={recipe.name} style={{ marginBottom: 20 }} />}
          {recipe.story && <p className="recipe-story" style={{ marginBottom: 20, fontSize: '1rem', textAlign: 'center' }}>"{recipe.story}"</p>}
          
          <div style={{ marginBottom: 24, background: '#F9FAFB', padding: 12, borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setShowAggregated(!showAggregated); }}>
              <div className="section-title" style={{ margin: 0 }}>{t.totalIngredients}</div>
              <span style={{ opacity: 0.5 }}>{showAggregated ? "▴" : "▾"}</span>
            </div>
            {showAggregated && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {totals.map((ing, i) => (
                  <div key={i} className="ingredient-chip">
                    <span className="qty">{formatQty(ing.qty)}</span>
                    <span>{UNIT_EMOJIS[ing.unit]}</span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t.units[ing.unit]}</span>
                    <span>{ing.item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {recipeSteps.map((step, idx) => (
            <div key={idx} style={{ marginBottom: 32 }}>
              <div className="section-title" style={{ color: 'var(--primary)', borderBottom: '2px solid var(--primary)', paddingBottom: 4 }}>
                {t.step} {idx + 1}: {step.title || t.preparation}
              </div>
              {step.ingredients.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, marginTop: 8 }}>
                  {step.ingredients.map((ing, i) => (
                    <div key={i} className="ingredient-chip" style={{ fontSize: '0.85rem' }}>
                      <span className="qty">{formatQty(ing.qty)}</span>
                      <span>{UNIT_EMOJIS[ing.unit]}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{t.units[ing.unit]}</span>
                      <span>{ing.item}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="instructions-text">{step.instructions}</div>
            </div>
          ))}

          {recipe.generalInstructions && (
            <div style={{ marginTop: 24, padding: 16, borderTop: '1px dashed #DDD', fontStyle: 'italic', color: '#666' }}>
              <div className="section-title">{t.finalNotes}</div>
              {recipe.generalInstructions}
            </div>
          )}
          <ReviewSection recipeId={recipeId} t={t} user={user} />
        </div>
      )}
    </article>
  );
};

const AdminDashboard = ({ recipes, styles, t, book, members, requests, onError }) => {
  const [newStyle, setNewStyle] = useState("");
  const handleAddStyle = async (e) => {
    e.preventDefault();
    if (newStyle.trim()) { await addStyle(newStyle).catch(onError); setNewStyle(""); }
  };
  const toggleVisibility = async (recipeId, currentVisibility) => {
    const cycle = { public: 'hidden', hidden: 'private', private: 'public' };
    await updateRecipe(recipeId, { visibility: cycle[currentVisibility || 'public'] }).catch(onError);
  };
  const copyInviteLink = () => {
    const link = `${window.location.origin}${window.location.pathname}?join=${book.id}`;
    navigator.clipboard.writeText(link);
    alert("Invite link copied to clipboard!");
  };

  return (
    <div className="admin-section">
      <div style={{ marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="section-title">{book.name} - {t.admin}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="add-btn-small" style={{ background: '#25D366' }} onClick={() => {
            const link = `${window.location.origin}${window.location.pathname}?join=${book.id}`;
            const text = encodeURIComponent(`הצטרפו לספר המתכונים שלנו "${book.name}": ${link}`);
            window.open(`https://wa.me/?text=${text}`, '_blank');
          }}>WhatsApp Share</button>
          <button className="add-btn-small" onClick={copyInviteLink}>{t.shareInvite}</button>
          <button className="add-btn-small" style={{ background: '#DC2626' }} onClick={async () => {
            if (window.confirm(t.confirmDeleteBook)) {
              await deleteBook(book.id).catch(onError);
              window.location.reload();
            }
          }}>{t.deleteBook}</button>
        </div>
      </div>

      <div className="admin-tabs">
        <h3 className="section-title" style={{ fontSize: '1rem', borderBottom: '2px solid' }}>{t.requests} ({requests.length})</h3>
        {requests.map(req => (
          <div key={req.id} className="recipe-admin-row">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <img src={req.photo} style={{ width: 32, height: 32, borderRadius: '50%' }} alt={req.name} />
              <div>
                <strong>{req.name}</strong>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>{req.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="badge public" onClick={() => approveJoinRequest(req.id, book.id, req.requesterId).catch(onError)}>{t.approve}</button>
              <button className="badge private" onClick={() => rejectJoinRequest(req.id).catch(onError)}>{t.reject}</button>
            </div>
          </div>
        ))}

        <h3 className="section-title" style={{ fontSize: '1rem', borderBottom: '2px solid', marginTop: 32 }}>{t.members} ({members.length})</h3>
        {members.map(m => (
          <div key={m.id} className="recipe-admin-row">
            <span>{m.userId}</span>
            <span className="badge public">{m.role}</span>
          </div>
        ))}
      </div>

      <h2 className="section-title" style={{ marginBottom: 16, marginTop: 40 }}>{t.styleMgmt}</h2>
      <form onSubmit={handleAddStyle} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input placeholder={t.newStyle} value={newStyle} onChange={(e) => setNewStyle(e.target.value)} />
        <button className="primary" style={{ width: '120px', padding: '10px' }}>{t.add}</button>
      </form>
      <div style={{ marginBottom: 32 }}>
        {styles.map(s => (
          <div key={s.id} className="style-chip">{s.name} <button onClick={() => deleteStyle(s.id).catch(onError)}>×</button></div>
        ))}
      </div>
      <h2 className="section-title" style={{ marginBottom: 16 }}>{t.inventory}</h2>
      {recipes.map(r => (
        <div key={r.id} className="recipe-admin-row">
          <div>
            <strong>{r.name}</strong>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>
              {normalizeCookingStyles(r.styleIds || r.styleId).map(sid => styles.find(s => s.id === sid)?.name).join(', ') || t.uncategorized}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`badge ${r.visibility || 'public'}`} onClick={() => toggleVisibility(r.id, r.visibility).catch(onError)}>{r.visibility || 'public'}</button>
            <button className="badge private" onClick={() => deleteRecipe(r.id).catch(onError)}>{t.delete}</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [appError, setAppError] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [styles, setStyles] = useState([]);
  const [books, setBooks] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [isSaving, setIsSaving] = useState(false);
  const [filterStyles, setFilterStyles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [lang, setLang] = useState(localStorage.getItem("lang") || "he");
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [newBookData, setNewBookData] = useState({ name: "", coverImage: "" });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadBookFile, setUploadBookFile] = useState(null);
  const [formData, setFormData] = useState({ 
    name: "", story: "", mainImageUrl: "", 
    styleIds: [], generalInstructions: "",
    prepTime: 30, difficulty: "easy", category: "Main",
    steps: [{ title: "", ingredients: [], instructions: "" }] 
  });
  const [userRecipes, setUserRecipes] = useState([]);

  const t = TRANSLATIONS[lang];

  // Access Repair for Legacy Books
  useEffect(() => {
    if (currentBook && user && currentBook.ownerId === user.uid) {
      const repairAccess = async () => {
        try {
          const { doc, getDoc, setDoc } = await import("firebase/firestore");
          const { db } = await import("./services/firebase");
          const mRef = doc(db, "members", `${user.uid}_${currentBook.id}`);
          const snap = await getDoc(mRef);
          if (!snap.exists()) {
            console.log("Repairing access for owner...");
            await setDoc(mRef, {
              userId: user.uid,
              bookId: currentBook.id,
              role: "owner_admin",
              joinedAt: Date.now()
            });
          }
        } catch (e) { console.error("Repair failed:", e); }
      };
      repairAccess();
    }
  }, [currentBook, user]);

    useEffect(() => {
        let unsubscribeBooks = () => { };
        let unsubscribeAuth = () => { };

        const boot = async () => {
            await initAuth();

            unsubscribeAuth = onAuthStateChanged(auth, (u) => {
                setUser(u);
                setIsAuthLoading(false);

                unsubscribeBooks();

                if (u) {
                    unsubscribeBooks = subscribeToBooks(u.uid, (data) => {
                        setBooks(data);
                        if (data.length === 1 && !currentBook) setCurrentBook(data[0]);
                    });
                } else {
                    setBooks([]);
                    setCurrentBook(null);
                    setAppError(null);
                }
            });
        };

        boot();

        return () => {
            unsubscribeBooks();
            unsubscribeAuth();
        };
    }, []);

  const handlePermError = (err) => {
    if (err?.code === "permission-denied") setAppError("permission-denied");
    else console.error(err);
  };

  const isAdmin = members.find(m => m.userId === user?.uid)?.role.includes("admin");

  useEffect(() => {
    if (!currentBook || !user) return;
    setAppError(null);
    const unsubR = subscribeToRecipes(currentBook.id, setRecipes, handlePermError);
    const unsubS = subscribeToStyles(setStyles, handlePermError);
    const unsubM = subscribeToMembers(currentBook.id, setMembers, handlePermError);
    const unsubUR = subscribeToUserRecipes(user.uid, setUserRecipes);
    let unsubReq = () => {};
    if (isAdmin) {
      unsubReq = subscribeToJoinRequests(currentBook.id, setRequests, handlePermError);
    }
    return () => { unsubR(); unsubS(); unsubM(); unsubReq(); unsubUR(); };
  }, [currentBook, user, isAdmin]);

  // Invite Logic
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinId = params.get("join");
    if (joinId && user) {
      const alreadyIn = books.some(b => b.id === joinId);
      if (!alreadyIn && window.confirm(`${t.inviteTitle} ${t.requestJoin}?`)) {
        requestToJoinBook(joinId, user.uid, user.displayName, user.email, user.photoURL).catch(handlePermError);
        alert("Request sent!");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [user, books, t]);

  const handleCreateBook = async (e) => {
    e.preventDefault();
    if (!newBookData.name.trim()) return;
    try {
      let finalCover = newBookData.coverImage;
      if (uploadBookFile) {
        finalCover = await compressImage(uploadBookFile);
      }
      await createBook(newBookData.name, finalCover, user.uid);
      setIsBookModalOpen(false);
      setNewBookData({ name: "", coverImage: "" });
      setUploadBookFile(null);
    } catch(err) { handlePermError(err); }
  };

  const handleAddRecipe = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.styleIds.length === 0 || !currentBook) return;
    setIsSaving(true);
    try {
      let finalImageUrl = formData.mainImageUrl;
      if (uploadFile) {
        finalImageUrl = await compressImage(uploadFile);
      }
      await addRecipe({ ...formData, mainImageUrl: finalImageUrl }, currentBook.id, user);
      setFormData({ 
        name: "", story: "", mainImageUrl: "", styleIds: [], generalInstructions: "",
        prepTime: 30, difficulty: "easy",
        steps: [{ title: "", ingredients: [], instructions: "" }] 
      });
      setUploadFile(null);
      setActiveTab("home");
    } catch (err) { handlePermError(err); } finally { setIsSaving(false); }
  };

  const updateStep = (idx, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[idx][field] = value;
    setFormData({ ...formData, steps: newSteps });
  };

  const updateStepIngredient = (sIdx, iIdx, field, value) => {
    const newSteps = [...formData.steps];
    const ing = newSteps[sIdx].ingredients[iIdx];
    ing[field] = field === 'qty' ? Number(value) : value;
    setFormData({ ...formData, steps: newSteps });
  };

  const filteredRecipes = recipes.filter(r => {
    const matchesStyle = filterStyles.length === 0 || filterStyles.some(fs => normalizeCookingStyles(r.styleIds || r.styleId).includes(fs));
    const matchesSearch = !searchTerm || r.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStyle && matchesSearch;
  });

  const handleUpdatePhoto = async (file) => {
    if (!file || !user) return;
    setIsSaving(true);
    try {
      const url = await uploadProfileImage(file, user.uid);
      const { updateProfile } = await import("firebase/auth");
      await updateProfile(auth.currentUser, { photoURL: url });
      await updateUserProfile(user.uid, { photo: url });
      setUser({ ...auth.currentUser });
    } catch(err) { handlePermError(err); } finally { setIsSaving(false); }
  };

  const groupedRecipes = filteredRecipes.reduce((acc, r) => {
    const cat = r.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(r);
    return acc;
  }, {});

  if (isAuthLoading) return <div className="container" style={{ textAlign: 'center', paddingTop: 100 }}><h1>{t.loading}</h1></div>;

  if (!user) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 100 }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: 16 }}>{t.loginTitle}</h1>
        <p style={{ color: '#666', marginBottom: 40 }}>{t.loginSubtitle}</p>
        <button className="primary" onClick={signInWithGoogle} style={{ maxWidth: 300 }}>{t.signIn}</button>
      </div>
    );
  }

  return (
    <div className="container" dir={lang === "he" ? "rtl" : "ltr"}>
      <AppHeader title={t.title} subtitle={t.loginSubtitle} backgroundImage={headerBg} />
      
      <nav className="header-toolbar">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <img src={user.photoURL} alt={user.displayName} className="creator-avatar" style={{ width: 34, height: 34 }} />
          <button className="lang-switcher" onClick={signOutUser} style={{ fontSize: '0.65rem' }}>{t.signOut}</button>
          <div className="lang-switcher" onClick={() => setLang(lang === "he" ? "en" : "he")}>{lang === "he" ? "EN" : "עב"}</div>
        </div>
        
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1 }}>
          <select value={currentBook?.id || ""} onChange={(e) => setCurrentBook(books.find(b => b.id === e.target.value))} style={{ flex: 1, height: 38, borderRadius: 12, fontSize: '0.85rem' }}>
            <option value="">{t.selectBook}</option>
            {books.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <button className="add-btn-small" style={{ height: 38, width: 38, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }} onClick={() => { setAppError(null); setIsBookModalOpen(true); }}>+</button>
        </div>
      </nav>

      {isBookModalOpen && (
        <div className="admin-section" style={{ position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, width: '90%', maxWidth: 400, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: '1px solid var(--primary)', borderRadius: 24 }}>
          <h2 className="section-title">{t.createBook}</h2>
          <form onSubmit={handleCreateBook}>
            <div className="form-group"><label>{t.bookName}</label><input value={newBookData.name} onChange={e => setNewBookData({...newBookData, name: e.target.value})} required /></div>
            <div className="form-group"><label>{t.coverImage}</label>
              <div style={{ background: 'rgba(0,0,0,0.05)', padding: 12, borderRadius: 12 }}>
                <label className="primary" style={{ display: 'inline-block', width: 'auto', padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>
                  📁 {uploadBookFile ? uploadBookFile.name : t.uploadImage}
                  <input type="file" accept="image/*" hidden onChange={(e) => setUploadBookFile(e.target.files[0])} />
                </label>
                <input style={{ marginTop: 8 }} value={newBookData.coverImage} onChange={(e) => setNewBookData({...newBookData, coverImage: e.target.value})} placeholder={t.imageUrl} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="primary" type="submit">{t.submit}</button>
              <button className="primary" style={{ background: '#666' }} type="button" onClick={() => setIsBookModalOpen(false)}>{t.cancel}</button>
            </div>
          </form>
        </div>
      )}

      {appError === "permission-denied" ? (
        <div className="admin-section" style={{ textAlign: 'center', padding: '60px 20px', background: '#FEF2F2' }}>
          <h2 className="section-title" style={{ color: '#DC2626' }}>{t.noAccess}</h2>
          <p style={{ color: '#991B1B', marginBottom: 24 }}>{t.noAccessDetails}</p>
          <button className="primary" onClick={() => { setAppError(null); setCurrentBook(null); }}>{t.returnToBooks}</button>
        </div>
      ) : !currentBook ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2 className="section-title" style={{ color: 'var(--text-muted)' }}>{t.selectBook}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
            {books.map(b => (
              <div key={b.id} className="recipe-card" style={{ cursor: 'pointer', padding: 16 }} onClick={() => setCurrentBook(b)}>
                {b.coverImage ? (
                   <img src={b.coverImage} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 12, marginBottom: 8 }} />
                ) : (
                   <div style={{ width: '100%', height: 80, background: 'var(--accent)', borderRadius: 12, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📖</div>
                )}
                <strong style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{b.name}</strong>
              </div>
            ))}
            <div className="recipe-card" style={{ cursor: 'pointer', padding: 16, border: '2px dashed var(--primary)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsBookModalOpen(true)}>
              <span style={{ fontSize: '2rem', color: 'var(--primary)' }}>+</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="nav-tabs">
            <div className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>{t.explore}</div>
            <div className={`nav-tab ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>{t.newRecipe}</div>
            <div className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>{t.profile}</div>
            {isAdmin && <div className={`nav-tab ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>{t.admin}</div>}
          </div>

          <div className="book-hero-header">
            {currentBook.coverImage ? (
              <img src={currentBook.coverImage} className="book-hero-bg" alt={currentBook.name} />
            ) : (
              <div className="book-hero-bg-placeholder" />
            )}
            <div className="book-hero-overlay">
              <h2 className="book-hero-title">{currentBook.name}</h2>
            </div>
          </div>

          {activeTab === 'home' && (
            <>
              <div style={{ padding: '0 4px', marginBottom: 20 }}>
                <input 
                  className="search-input"
                  placeholder={t.searchPlaceholder} 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 16, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.5)' }}
                />
              </div>
              <div className="filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24, padding: '0 4px' }}>
                {styles.map(s => (
                  <span key={s.id} onClick={() => setFilterStyles(prev => prev.includes(s.id)?prev.filter(x=>x!==s.id):[...prev,s.id])} 
                    className={`badge ${filterStyles.includes(s.id) ? 'public' : ''}`} style={{ cursor: 'pointer', background: filterStyles.includes(s.id) ? '' : '#EEE', color: filterStyles.includes(s.id) ? '' : '#666', padding: '6px 12px' }}>
                    {s.name}
                  </span>
                ))}
                {(filterStyles.length > 0 || searchTerm) && <span onClick={() => {setFilterStyles([]); setSearchTerm("");}} style={{ cursor: 'pointer', padding: '6px 12px', fontSize: '0.8rem', color: '#DC2626' }}>{t.clearAll}</span>}
              </div>
              <div className="recipe-list">
                {filteredRecipes.length === 0 ? <p className="empty-state">{(filterStyles.length > 0 || searchTerm) ? t.noMatch : t.emptyState}</p> : 
                  Object.keys(groupedRecipes).sort().map(cat => (
                    <div key={cat} className="category-group">
                      <h3 className="category-title">{t.categories[cat] || cat}</h3>
                      {groupedRecipes[cat].map(r => <RecipeCard key={r.id} recipe={r} styles={styles} isAdmin={isAdmin} t={t} />)}
                    </div>
                  ))
                }
              </div>
            </>
          )}

          {activeTab === 'profile' && (
            <ProfileView user={user} recipes={userRecipes} t={t} onUpdatePhoto={handleUpdatePhoto} isSaving={isSaving} />
          )}

          {activeTab === 'add' && (
            <form className="recipe-form" onSubmit={handleAddRecipe}>
              <div className="form-group"><label>{t.recipeTitle}</label>
                <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder={t.recipeTitle} required />
              </div>
              <div className="form-group"><label>{t.cookingStyles}</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {styles.map(s => (
                    <span key={s.id} onClick={() => setFormData(p => ({...p, styleIds: p.styleIds.includes(s.id)?p.styleIds.filter(x=>x!==s.id):[...p.styleIds,s.id]}))} 
                      className={`badge ${formData.styleIds.includes(s.id) ? 'public' : ''}`} style={{ cursor: 'pointer', background: formData.styleIds.includes(s.id) ? '' : '#EEE', color: formData.styleIds.includes(s.id) ? '' : '#666', padding: '8px 14px' }}>
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div className="form-group" style={{ flex: 1 }}><label>{t.prepTime}</label>
                  <input type="number" value={formData.prepTime} onChange={(e) => setFormData({...formData, prepTime: Number(e.target.value)})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}><label>{t.difficulty}</label>
                  <select value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})}>
                    <option value="easy">{t.easy}</option>
                    <option value="medium">{t.medium}</option>
                    <option value="hard">{t.hard}</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>{t.heroImage}</label>
                <div style={{ background: 'rgba(255,255,255,0.5)', padding: 16, borderRadius: 16, border: '1px dashed rgba(0,0,0,0.1)' }}>
                  <label className="primary" style={{ display: 'inline-block', width: 'auto', padding: '8px 16px', fontSize: '0.9rem', cursor: 'pointer', borderRadius: 8 }}>
                    📁 {uploadFile ? uploadFile.name : t.uploadImage}
                    <input type="file" accept="image/*" hidden onChange={(e) => setUploadFile(e.target.files[0])} />
                  </label>
                  <div style={{ marginTop: 12 }}>
                    <input value={formData.mainImageUrl} onChange={(e) => setFormData({...formData, mainImageUrl: e.target.value})} placeholder={t.imageUrl} />
                  </div>
                  <input style={{ marginTop: 12 }} value={formData.story} onChange={(e) => setFormData({...formData, story: e.target.value})} placeholder={t.story} />
                </div>
              </div>
              <div className="form-group"><label>{t.category}</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  {Object.keys(t.categories).map(cat => <option key={cat} value={cat}>{t.categories[cat]}</option>)}
                </select>
              </div>
              <div style={{ marginTop: 32 }}>
                <label style={{ fontSize: '1.1rem', color: 'var(--primary)', borderBottom: '2px solid var(--primary)', display: 'block', marginBottom: 20 }}>{t.recipeSteps}</label>
                {formData.steps.map((step, sIdx) => (
                  <div key={sIdx} className="admin-section" style={{ background: '#FFF7ED', marginBottom: 24, padding: 20 }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                      <input style={{ fontWeight: 700 }} placeholder={`${t.step} ${sIdx+1}`} value={step.title} onChange={(e) => updateStep(sIdx, 'title', e.target.value)} />
                      <button type="button" className="badge private" style={{ height: '40px' }} onClick={() => setFormData({...formData, steps: formData.steps.filter((_,i)=>i!==sIdx)})}>×</button>
                    </div>
                    <div className="form-group">
                      <label>{t.stepIngredients}</label>
                      {step.ingredients.map((ing, iIdx) => (
                        <div key={iIdx} className="builder-row">
                          <input type="number" step="0.25" value={ing.qty} onChange={(e) => updateStepIngredient(sIdx, iIdx, 'qty', e.target.value)} />
                          <select value={ing.unit} onChange={(e) => updateStepIngredient(sIdx, iIdx, 'unit', e.target.value)}>
                            {Object.keys(UNIT_EMOJIS).map(u => <option key={u} value={u}>{t.units[u]}</option>)}
                          </select>
                          <input value={ing.item} onChange={(e) => updateStepIngredient(sIdx, iIdx, 'item', e.target.value)} placeholder={t.itemPlace} />
                          <button type="button" onClick={() => {
                            const n = [...formData.steps]; n[sIdx].ingredients = n[sIdx].ingredients.filter((_, i)=>i!==iIdx); setFormData({...formData, steps: n});
                          }}>×</button>
                        </div>
                      ))}
                      <button type="button" className="add-btn-small" onClick={() => {
                        const n = [...formData.steps]; n[sIdx].ingredients.push({qty:1, unit:'cup', item:''}); setFormData({...formData, steps: n});
                      }}>{t.addIngredient}</button>
                    </div>
                    <div className="form-group">
                      <label>{t.stepInstructions}</label>
                      <textarea rows="2" value={step.instructions} onChange={(e) => updateStep(sIdx, 'instructions', e.target.value)} placeholder={t.stepInstructions} />
                    </div>
                  </div>
                ))}
                <button type="button" className="primary" style={{ background: '#065F46', marginBottom: 32 }} onClick={() => setFormData({...formData, steps: [...formData.steps, {title:"", ingredients:[], instructions:""}]})}>{t.addStep}</button>
              </div>
              <div className="form-group">
                <label>{t.generalInstructions}</label>
                <textarea value={formData.generalInstructions} onChange={(e) => setFormData({...formData, generalInstructions: e.target.value})} rows="3" placeholder={t.generalInstructions} />
              </div>
              <button className="primary" type="submit" disabled={isSaving || formData.styleIds.length === 0}>{isSaving ? t.saving : t.publish}</button>
            </form>
          )}

          {activeTab === 'admin' && isAdmin && (
            <AdminDashboard recipes={recipes} styles={styles} t={t} book={currentBook} members={members} requests={requests} onError={handlePermError} />
          )}
        </>
      )}
    </div>
  );
}
