import { supabase } from "./supabase";

const SESSION_KEY = "stokify_session";
const USER_KEY = "stokify_user";

// Sign in with email and password
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Save session to localStorage for offline access
  if (data.session) {
    saveSessionToLocalStorage(data.session, data.user);
  }

  return { session: data.session, user: data.user };
}

// Sign out
export async function signOut() {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn("Supabase signOut error (may be offline):", e);
  }

  // Clear localStorage
  clearSessionFromLocalStorage();
}

// Get current user from Supabase or localStorage
export async function getCurrentUser() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      saveSessionToLocalStorage(null, user);
      return user;
    }
  } catch (e) {
    console.warn("Failed to get user from Supabase:", e);
  }

  // Fallback to localStorage if offline or Supabase fails
  return getSessionFromLocalStorage();
}

// Get session from Supabase or localStorage
export async function getSession() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      saveSessionToLocalStorage(session, session.user);
      return session;
    }
  } catch (e) {
    console.warn("Failed to get session from Supabase:", e);
  }

  // Fallback to localStorage
  const stored = localStorage.getItem(SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
}

// Save session and user to localStorage for offline support
export function saveSessionToLocalStorage(session, user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn("Failed to save session to localStorage:", e);
  }
}

// Get session from localStorage
export function getSessionFromLocalStorage() {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
}

// Clear session from localStorage
export function clearSessionFromLocalStorage() {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (e) {
    console.warn("Failed to clear session from localStorage:", e);
  }
}

// Check if user is authenticated
export function isAuthenticated() {
  return !!getSessionFromLocalStorage();
}
