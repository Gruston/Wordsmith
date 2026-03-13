// tier-service.js
// WordSmith Tier Unlock Service
//
// Pure functions — no React, no I/O, no side effects.
// Safe to call inside useMemo. Never call inside render directly.
//
// TIER STRUCTURE:
//   Tier 1 (Foundational)  — always unlocked
//   Tier 2 (Intermediate)  — unlocks after mastering 50% of Tier 1, capped at 50 words
//   Tier 3 (Advanced)      — unlocks after mastering 50% of Tier 2, capped at 50 words
//   Tier 4 (Expert)        — unlocks after mastering 50% of Tier 3, capped at 50 words
//
// "Mastered" = status === "familiar" OR status === "mastered"
// (Both count — "familiar" is the intermediate SM-2 state before full mastery)

"use strict";

/**
 * Returns the number of mastered words in a tier required to unlock the next tier.
 * Formula: min(50, floor(tierWordCount * 0.5))
 * Tier 1 always unlocked — this function is only used for tiers 2–4.
 *
 * @param {number} tierWordCount - number of words in the current tier
 * @returns {number} mastery threshold
 */
function getTierUnlockThreshold(tierWordCount) {
  if (typeof tierWordCount !== "number" || tierWordCount <= 0) return 0;
  return Math.min(50, Math.floor(tierWordCount * 0.5));
}

/**
 * Returns true if a given tier is unlocked for the user.
 * Tier 1 is always unlocked.
 * Tiers 2–4 require sufficient mastery of the previous tier.
 *
 * @param {number} tier - tier number to check (1–4)
 * @param {Array<{id:number,status:string}>} words - the full merged word array (with current status)
 * @returns {boolean}
 */
function isTierUnlocked(tier, words) {
  if (!Array.isArray(words)) return tier === 1;
  if (tier <= 1) return true;

  const prevTier = tier - 1;
  const prevTierWords = words.filter(function(w) { return w.tier === prevTier; });
  const threshold = getTierUnlockThreshold(prevTierWords.length);

  // No words in previous tier = treat as unlocked (graceful fallback)
  if (prevTierWords.length === 0) return true;

  const masteredCount = prevTierWords.filter(function(w) {
    return w.status === "familiar" || w.status === "mastered";
  }).length;

  return masteredCount >= threshold;
}

/**
 * Returns the set of currently unlocked tier numbers for a user.
 * Computed once after load — never inside render.
 *
 * @param {Array} words - full merged word array with current status
 * @returns {Set<number>}
 */
function getUnlockedTiers(words) {
  var unlocked = new Set();
  for (var t = 1; t <= 4; t++) {
    if (isTierUnlocked(t, words)) {
      unlocked.add(t);
    } else {
      // Tiers are sequential — if tier N is locked, N+1 and N+2 are also locked
      break;
    }
  }
  return unlocked;
}

/**
 * Filters a word array to only include words from unlocked tiers.
 * Words without a `tier` field (legacy words from INITIAL_WORDS_DB) are always included.
 *
 * @param {Array} words - full merged word array
 * @returns {Array} filtered word array
 */
function getUnlockedWords(words) {
  if (!Array.isArray(words) || words.length === 0) return [];
  var unlockedTiers = getUnlockedTiers(words);
  return words.filter(function(w) {
    // Legacy words without tier field are always accessible
    if (w.tier === undefined || w.tier === null) return true;
    return unlockedTiers.has(w.tier);
  });
}

/**
 * Returns a human-readable progress summary for a given tier.
 * Useful for UI display — "12 / 30 mastered to unlock Tier 3"
 *
 * @param {number} tier - the NEXT tier (the one you want to unlock), 2–4
 * @param {Array} words - full merged word array with current status
 * @returns {{ mastered: number, threshold: number, total: number, unlocked: boolean }}
 */
function getTierProgress(tier, words) {
  if (tier <= 1) return { mastered: 0, threshold: 0, total: 0, unlocked: true };
  if (!Array.isArray(words)) return { mastered: 0, threshold: 0, total: 0, unlocked: false };

  var prevTier = tier - 1;
  var prevTierWords = words.filter(function(w) { return w.tier === prevTier; });
  var threshold = getTierUnlockThreshold(prevTierWords.length);
  var mastered = prevTierWords.filter(function(w) {
    return w.status === "familiar" || w.status === "mastered";
  }).length;

  return {
    mastered: mastered,
    threshold: threshold,
    total: prevTierWords.length,
    unlocked: mastered >= threshold,
  };
}

/**
 * Merges the extended word database with INITIAL_WORDS_DB.
 * - Extended words default tier-unlocking: tier 1 words visible immediately,
 *   higher tiers follow tier unlock rules.
 * - Words from extendedWords are appended after existing words.
 * - No duplicate IDs allowed (extendedWords must use IDs >= 1000).
 *
 * Safe to call at app initialisation. Returns a new array (no mutation).
 *
 * @param {Array} initialWords - INITIAL_WORDS_DB from index.html
 * @param {Array} extendedWords - EXTENDED_WORDS_DB from words.js (may be empty if script failed)
 * @returns {Array}
 */
function mergeWordDBs(initialWords, extendedWords) {
  if (!Array.isArray(initialWords)) {
    console.error("[tier-service] mergeWordDBs: initialWords is not an array");
    return [];
  }
  if (!Array.isArray(extendedWords) || extendedWords.length === 0) {
    // words.js failed to load or is empty — fall back gracefully
    return initialWords.slice();
  }

  // Defensive: check for ID collisions (should never happen if IDs are correct)
  var existingIds = new Set(initialWords.map(function(w) { return w.id; }));
  var safeExtended = extendedWords.filter(function(w) {
    if (existingIds.has(w.id)) {
      console.warn("[tier-service] mergeWordDBs: skipping duplicate ID " + w.id + " (" + w.word + ")");
      return false;
    }
    return true;
  });

  return initialWords.concat(safeExtended);
}

// ── Export to window ──
// Available to index.html which loads this file before its <script type="text/babel">
if (typeof window !== "undefined") {
  window.TierService = {
    getTierUnlockThreshold: getTierUnlockThreshold,
    isTierUnlocked: isTierUnlocked,
    getUnlockedTiers: getUnlockedTiers,
    getUnlockedWords: getUnlockedWords,
    getTierProgress: getTierProgress,
    mergeWordDBs: mergeWordDBs,
  };
}
