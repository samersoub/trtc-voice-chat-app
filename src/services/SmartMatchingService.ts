"use client";

import { NotificationHelper } from "@/utils/NotificationHelper";

export type MatchingPreferences = {
  interests: string[];
  location: string;
  onlineTime: number; // hours per day
  minCompatibility?: number; // 0..1
};

export type MatchCandidate = {
  id: string;
  name: string;
  interests: string[];
  location: string;
  onlineTime: number; // hours per day
  compatibility: number; // base compatibility score 0..1
  avatarUrl?: string;
};

export type ScoredCandidate = MatchCandidate & { score: number };

const WEIGHTS = {
  interests: 0.3,
  location: 0.2,
  onlineTime: 0.2,
  compatibility: 0.3,
};

const CANDIDATES: MatchCandidate[] = [
  {
    id: "u_alex",
    name: "Alex",
    interests: ["music", "gaming", "travel"],
    location: "US",
    onlineTime: 3,
    compatibility: 0.72,
  },
  {
    id: "u_lina",
    name: "Lina",
    interests: ["singing", "movies", "fitness"],
    location: "AE",
    onlineTime: 4,
    compatibility: 0.81,
  },
  {
    id: "u_saad",
    name: "Saad",
    interests: ["gaming", "football", "tech"],
    location: "SA",
    onlineTime: 2,
    compatibility: 0.69,
  },
  {
    id: "u_maya",
    name: "Maya",
    interests: ["art", "travel", "books"],
    location: "EG",
    onlineTime: 5,
    compatibility: 0.77,
  },
  {
    id: "u_nora",
    name: "Nora",
    interests: ["dance", "podcasts", "cooking"],
    location: "AE",
    onlineTime: 1,
    compatibility: 0.66,
  },
];

function jaccard(a: string[], b: string[]) {
  const sa = new Set(a.map((x) => x.toLowerCase()));
  const sb = new Set(b.map((x) => x.toLowerCase()));
  const inter = Array.from(sa).filter((x) => sb.has(x)).length;
  const uni = new Set([...Array.from(sa), ...Array.from(sb)]).size;
  return uni === 0 ? 0 : inter / uni;
}

function locationScore(pref: string, cand: string) {
  if (!pref || !cand) return 0;
  return pref.toLowerCase() === cand.toLowerCase() ? 1 : 0;
}

function onlineTimeScore(pref: number, cand: number) {
  // closeness score based on difference, normalized by 6 hours
  const diff = Math.abs(pref - cand);
  const norm = Math.max(0, 1 - diff / 6);
  return norm;
}

const STORAGE_KEYS = {
  calls: "matching:calls",
  ratings: "matching:ratings",
};

function read<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const SmartMatchingService = {
  getCandidates(): MatchCandidate[] {
    return CANDIDATES.slice();
  },
  getCandidateById(id: string): MatchCandidate | undefined {
    return CANDIDATES.find((c) => c.id === id);
  },
  suggest(prefs: MatchingPreferences, limit = 10): ScoredCandidate[] {
    const minCompat = prefs.minCompatibility ?? 0;
    const scored = CANDIDATES.map((c) => {
      const sInterests = jaccard(prefs.interests, c.interests);
      const sLoc = locationScore(prefs.location, c.location);
      const sTime = onlineTimeScore(prefs.onlineTime, c.onlineTime);
      const sCompat = c.compatibility;

      const score =
        WEIGHTS.interests * sInterests +
        WEIGHTS.location * sLoc +
        WEIGHTS.onlineTime * sTime +
        WEIGHTS.compatibility * sCompat;

      return { ...c, score };
    })
      .filter((c) => c.compatibility >= minCompat)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    return scored;
  },
  startPrivateCall(currentUid: string, targetUid: string) {
    const callId = `call_${Math.random().toString(36).slice(2, 10)}`;
    const calls = read<{ id: string; from: string; to: string; at: number }[]>(
      STORAGE_KEYS.calls,
      [],
    );
    calls.push({ id: callId, from: currentUid, to: targetUid, at: Date.now() });
    write(STORAGE_KEYS.calls, calls);
    NotificationHelper.notify("Private Call Started", `Call with ${targetUid}`);
    return callId;
  },
  rate(targetUid: string, rating: number, feedback?: string) {
    const ratings = read<
      { to: string; rating: number; feedback?: string; at: number }[]
    >(STORAGE_KEYS.ratings, []);
    ratings.push({ to: targetUid, rating, feedback, at: Date.now() });
    write(STORAGE_KEYS.ratings, ratings);
  },
};