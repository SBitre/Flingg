/**
 * mockStore.js — localStorage-backed data layer.
 * Replaces all API/socket calls for the frontend-only version.
 */
import {
  MOCK_PROFILES,
  AUTO_REPLIES,
  buildMatchId,
  getInitialMatches,
  getInitialMessages,
} from '../data/mockData';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const read = (key, fallback = null) => {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('localStorage write error', e);
  }
};

// ─── Auth / User ─────────────────────────────────────────────────────────────
const USERS_KEY = 'flingg_users';       // { email: userObject }
const SESSION_KEY = 'flingg_session';   // currently-logged-in email

const getUsers = () => read(USERS_KEY, {});
const saveUsers = (users) => write(USERS_KEY, users);

export const authRegister = (name, email, password) => {
  const users = getUsers();
  if (users[email]) throw new Error('Email already registered');

  const user = {
    _id: `uid_${Date.now()}`,
    email,
    name,
    age: null,
    gender: null,
    interestedIn: ['everyone'],
    bio: '',
    photos: [],
    location: 'Other',
    profileComplete: false,
  };
  users[email] = user;
  saveUsers(users);
  write(SESSION_KEY, email);
  return user;
};

export const authLogin = (email, password) => {
  const users = getUsers();
  const user = users[email];
  if (!user) throw new Error('Invalid email or password');
  write(SESSION_KEY, email);
  return user;
};

export const authLogout = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const authGetCurrentUser = () => {
  const email = read(SESSION_KEY);
  if (!email) return null;
  const users = getUsers();
  return users[email] || null;
};

export const authUpdateUser = (updatedUser) => {
  const users = getUsers();
  users[updatedUser.email] = updatedUser;
  saveUsers(users);
  return updatedUser;
};

// ─── Image Compression ───────────────────────────────────────────────────────
export const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const blobUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(blobUrl);
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      const maxW = 400;
      const maxH = 600;
      // Scale down proportionally
      if (w / h > maxW / maxH) {
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      } else {
        if (h > maxH) { w = Math.round(w * maxH / h); h = maxH; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = () => { URL.revokeObjectURL(blobUrl); reject(new Error('Image load failed')); };
    img.src = blobUrl;
  });

// ─── Swipes ──────────────────────────────────────────────────────────────────
const SWIPES_KEY = 'flingg_swipes';

const getSwipes = () => read(SWIPES_KEY, { liked: [], passed: [] });
const saveSwipes = (s) => write(SWIPES_KEY, s);

// ─── Matches ─────────────────────────────────────────────────────────────────
const MATCHES_KEY = 'flingg_matches';

export const getMatches = (userId) => {
  let matches = read(MATCHES_KEY);
  if (!matches) {
    matches = getInitialMatches(userId);
    write(MATCHES_KEY, matches);
    // Also seed the initial messages
    const allMsgs = getInitialMessages(userId);
    Object.entries(allMsgs).forEach(([mid, msgs]) => {
      write(`flingg_msgs_${mid}`, msgs);
    });
  }
  return matches;
};

const saveMatches = (matches) => write(MATCHES_KEY, matches);

const addMatch = (userId, profile) => {
  const matches = getMatches(userId);
  const matchId = buildMatchId(userId, profile._id);
  if (!matches.find((m) => m.matchId === matchId)) {
    matches.unshift({ matchId, user: profile, lastMessage: null, unreadCount: 0 });
    saveMatches(matches);
  }
  return matchId;
};

// ─── Discover (swipe deck) ────────────────────────────────────────────────────
export const getDiscoverProfiles = (userId, locationFilter = 'All') => {
  const swipes = getSwipes();
  const matches = getMatches(userId);
  const matchedProfileIds = matches.map((m) =>
    m.matchId.split('|').find((id) => id !== userId)
  );
  const exclude = new Set([...swipes.liked, ...swipes.passed, ...matchedProfileIds]);

  return MOCK_PROFILES.filter((p) => {
    if (exclude.has(p._id)) return false;
    if (locationFilter !== 'All' && p.location !== locationFilter) return false;
    return true;
  });
};

export const swipeLike = (userId, profileId) => {
  const swipes = getSwipes();
  if (!swipes.liked.includes(profileId)) {
    swipes.liked.push(profileId);
    saveSwipes(swipes);
  }
  // ~40% match chance
  if (Math.random() < 0.4) {
    const profile = MOCK_PROFILES.find((p) => p._id === profileId);
    if (profile) {
      const matchId = addMatch(userId, profile);
      return { match: true, matchId, matchedUser: profile };
    }
  }
  return { match: false };
};

export const swipePass = (profileId) => {
  const swipes = getSwipes();
  if (!swipes.passed.includes(profileId)) {
    swipes.passed.push(profileId);
    saveSwipes(swipes);
  }
};

// ─── Messages ─────────────────────────────────────────────────────────────────
export const getMessages = (userId, matchId) => {
  const key = `flingg_msgs_${matchId}`;
  let msgs = read(key);
  if (!msgs) {
    // Seed initial messages if any
    const initial = getInitialMessages(userId);
    msgs = initial[matchId] || [];
    write(key, msgs);
  }
  return msgs;
};

export const addMessage = (matchId, message) => {
  const key = `flingg_msgs_${matchId}`;
  const msgs = read(key, []);
  msgs.push(message);
  write(key, msgs);

  // Update lastMessage in matches list
  const allMatches = read(MATCHES_KEY, []);
  const match = allMatches.find((m) => m.matchId === matchId);
  if (match) {
    match.lastMessage = message;
    write(MATCHES_KEY, allMatches);
  }
  return msgs;
};

export const clearUnread = (userId, matchId) => {
  const matches = getMatches(userId);
  const match = matches.find((m) => m.matchId === matchId);
  if (match) {
    match.unreadCount = 0;
    saveMatches(matches);
  }
};

export const incrementUnread = (userId, matchId) => {
  const matches = getMatches(userId);
  const match = matches.find((m) => m.matchId === matchId);
  if (match) {
    match.unreadCount = (match.unreadCount || 0) + 1;
    saveMatches(matches);
  }
};

export const getRandomReply = () =>
  AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];

// ─── Get a profile by ID (mock or user) ──────────────────────────────────────
export const getProfileById = (profileId) =>
  MOCK_PROFILES.find((p) => p._id === profileId) || null;
