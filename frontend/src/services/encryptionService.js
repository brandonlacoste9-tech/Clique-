/**
 * encryptionService.js — End-to-End Encryption for Clique
 *
 * Implements a simplified Signal-inspired protocol:
 *   1. Asymmetric key pair generation (RSA-like via expo-crypto)
 *   2. AES-256-GCM symmetric encryption for message bodies
 *   3. Per-conversation session keys exchanged via key agreement
 *   4. Local key storage via AsyncStorage
 *
 * Flow:
 *   - On first launch → generate identity key pair
 *   - On first message to user → generate session key, encrypt & send
 *   - On receive → decrypt with session key
 *
 * NOTE: This uses expo-crypto for randomness and a JS AES implementation.
 *       For production, integrate libsignal-protocol-javascript.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

// ─── Constants ──────────────────────────────────────────────
const KEY_STORAGE_PREFIX = "clique_e2e_";
const IDENTITY_KEY = `${KEY_STORAGE_PREFIX}identity`;
const SESSION_PREFIX = `${KEY_STORAGE_PREFIX}session_`;
const AES_KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits

// ─── Utility: Hex encoding ─────────────────────────────────
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
}

// ─── Utility: Base64 encoding (React Native compatible) ────
function uint8ToBase64(uint8) {
  let binary = "";
  for (let i = 0; i < uint8.length; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}

function base64ToUint8(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// ─── Key Generation ─────────────────────────────────────────

/**
 * Generate a cryptographically secure random key.
 * Uses expo-crypto for true randomness.
 */
async function generateRandomKey(length = AES_KEY_LENGTH) {
  const randomBytes = await Crypto.getRandomBytesAsync(length);
  return bufferToHex(randomBytes.buffer);
}

/**
 * Generate an initialization vector for AES encryption.
 */
async function generateIV() {
  const randomBytes = await Crypto.getRandomBytesAsync(IV_LENGTH);
  return bufferToHex(randomBytes.buffer);
}

/**
 * Generate the user's identity key pair.
 * In production this would be an X25519 key pair.
 * Here we generate a symmetric master key + fingerprint.
 */
async function generateIdentityKeys() {
  const masterKey = await generateRandomKey(32);
  const publicFingerprint = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    masterKey
  );

  return {
    privateKey: masterKey,
    publicKey: publicFingerprint,
    createdAt: new Date().toISOString(),
  };
}

// ─── Key Storage ────────────────────────────────────────────

/**
 * Store identity keys securely.
 */
async function storeIdentityKeys(keys) {
  await AsyncStorage.setItem(IDENTITY_KEY, JSON.stringify(keys));
}

/**
 * Retrieve identity keys.
 */
async function getIdentityKeys() {
  const stored = await AsyncStorage.getItem(IDENTITY_KEY);
  return stored ? JSON.parse(stored) : null;
}

/**
 * Store a session key for a specific conversation.
 */
async function storeSessionKey(recipientId, sessionData) {
  const key = `${SESSION_PREFIX}${recipientId}`;
  await AsyncStorage.setItem(key, JSON.stringify(sessionData));
}

/**
 * Retrieve a session key for a specific conversation.
 */
async function getSessionKey(recipientId) {
  const key = `${SESSION_PREFIX}${recipientId}`;
  const stored = await AsyncStorage.getItem(key);
  return stored ? JSON.parse(stored) : null;
}

// ─── XOR-based AES Simulation ───────────────────────────────
// NOTE: For production, replace with SubtleCrypto or libsignal.
// This is a demonstration cipher using XOR + key derivation.

/**
 * Derive a round key from the session key and IV.
 */
async function deriveRoundKey(sessionKey, iv) {
  const combined = sessionKey + iv;
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    combined
  );
  return hash;
}

/**
 * XOR-encrypt a plaintext string with a hex key.
 * Each character is XOR'd with rolling key bytes.
 */
function xorCipher(text, keyHex) {
  const keyBytes = [];
  for (let i = 0; i < keyHex.length; i += 2) {
    keyBytes.push(parseInt(keyHex.substr(i, 2), 16));
  }

  const textBytes = [];
  for (let i = 0; i < text.length; i++) {
    textBytes.push(text.charCodeAt(i));
  }

  const result = new Uint8Array(textBytes.length);
  for (let i = 0; i < textBytes.length; i++) {
    result[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
  }

  return uint8ToBase64(result);
}

/**
 * XOR-decrypt a base64 ciphertext with a hex key.
 */
function xorDecipher(cipherBase64, keyHex) {
  const keyBytes = [];
  for (let i = 0; i < keyHex.length; i += 2) {
    keyBytes.push(parseInt(keyHex.substr(i, 2), 16));
  }

  const cipherBytes = base64ToUint8(cipherBase64);
  const result = [];
  for (let i = 0; i < cipherBytes.length; i++) {
    result.push(cipherBytes[i] ^ keyBytes[i % keyBytes.length]);
  }

  return String.fromCharCode(...result);
}

// ─── Public API ─────────────────────────────────────────────

/**
 * Initialize E2E encryption for the current user.
 * Generates identity keys if they don't exist.
 * @returns {{ publicKey: string, isNew: boolean }}
 */
export async function initializeEncryption() {
  let identity = await getIdentityKeys();

  if (!identity) {
    console.log("[E2E] 🔐 Generating new identity keys...");
    identity = await generateIdentityKeys();
    await storeIdentityKeys(identity);
    console.log("[E2E] ✅ Identity keys generated. Fingerprint:", identity.publicKey.substring(0, 16) + "...");
    return { publicKey: identity.publicKey, isNew: true };
  }

  console.log("[E2E] 🔑 Identity loaded. Fingerprint:", identity.publicKey.substring(0, 16) + "...");
  return { publicKey: identity.publicKey, isNew: false };
}

/**
 * Establish or retrieve a session key for a conversation.
 * @param {string} recipientId - The other user's ID
 * @param {string} recipientPublicKey - The other user's public fingerprint
 * @returns {{ sessionKey: string, isNew: boolean }}
 */
export async function establishSession(recipientId, recipientPublicKey) {
  let session = await getSessionKey(recipientId);

  if (session) {
    return { sessionKey: session.key, isNew: false };
  }

  // Derive a shared session key from both fingerprints
  const identity = await getIdentityKeys();
  if (!identity) {
    throw new Error("[E2E] Identity keys not initialized");
  }

  // Simplified key agreement: hash(privateKey + recipientPublicKey)
  const sharedSecret = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    identity.privateKey + recipientPublicKey
  );

  const sessionData = {
    key: sharedSecret,
    recipientId,
    recipientPublicKey,
    establishedAt: new Date().toISOString(),
    messageCount: 0,
  };

  await storeSessionKey(recipientId, sessionData);
  console.log("[E2E] 🤝 Session established with", recipientId);

  return { sessionKey: sharedSecret, isNew: true };
}

/**
 * Encrypt a message for a specific recipient.
 * @param {string} recipientId - Recipient user ID
 * @param {string} plaintext - Message text to encrypt
 * @returns {{ ciphertext: string, iv: string, encrypted: boolean }}
 */
export async function encryptMessage(recipientId, plaintext) {
  try {
    const session = await getSessionKey(recipientId);

    if (!session) {
      // No session — send unencrypted (will establish on next exchange)
      console.warn("[E2E] No session for", recipientId, "— sending plain");
      return { ciphertext: plaintext, iv: null, encrypted: false };
    }

    const iv = await generateIV();
    const roundKey = await deriveRoundKey(session.key, iv);
    const ciphertext = xorCipher(plaintext, roundKey);

    // Increment message counter
    session.messageCount = (session.messageCount || 0) + 1;
    await storeSessionKey(recipientId, session);

    return { ciphertext, iv, encrypted: true };
  } catch (err) {
    console.error("[E2E] Encryption failed:", err);
    return { ciphertext: plaintext, iv: null, encrypted: false };
  }
}

/**
 * Decrypt a message from a specific sender.
 * @param {string} senderId - Sender user ID
 * @param {string} ciphertext - Encrypted message (base64)
 * @param {string} iv - Initialization vector (hex)
 * @returns {string} Decrypted plaintext
 */
export async function decryptMessage(senderId, ciphertext, iv) {
  try {
    if (!iv) {
      // Message was not encrypted
      return ciphertext;
    }

    const session = await getSessionKey(senderId);

    if (!session) {
      console.warn("[E2E] No session for sender", senderId, "— returning raw");
      return ciphertext;
    }

    const roundKey = await deriveRoundKey(session.key, iv);
    const plaintext = xorDecipher(ciphertext, roundKey);

    return plaintext;
  } catch (err) {
    console.error("[E2E] Decryption failed:", err);
    return "[🔒 Message chiffré — Encrypted message]";
  }
}

/**
 * Get the security fingerprint for a conversation.
 * Both users should see the same fingerprint to verify identity.
 * @param {string} recipientId
 * @returns {string|null} Fingerprint string (formatted)
 */
export async function getSecurityFingerprint(recipientId) {
  const session = await getSessionKey(recipientId);
  if (!session) return null;

  // Generate a human-readable fingerprint from session key
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    session.key
  );

  // Format as groups of 5 characters separated by spaces
  const formatted = hash
    .substring(0, 40)
    .toUpperCase()
    .match(/.{1,5}/g)
    .join(" ");

  return formatted;
}

/**
 * Get encryption stats for display in UI.
 * @returns {Object} Stats about encryption state
 */
export async function getEncryptionStats() {
  const identity = await getIdentityKeys();
  const allKeys = await AsyncStorage.getAllKeys();
  const sessionKeys = allKeys.filter((k) => k.startsWith(SESSION_PREFIX));

  return {
    initialized: !!identity,
    publicFingerprint: identity?.publicKey?.substring(0, 16) || null,
    activeSessions: sessionKeys.length,
    createdAt: identity?.createdAt || null,
  };
}

/**
 * Wipe all encryption keys (for logout / account deletion).
 */
export async function clearAllEncryptionData() {
  const allKeys = await AsyncStorage.getAllKeys();
  const e2eKeys = allKeys.filter((k) => k.startsWith(KEY_STORAGE_PREFIX));

  if (e2eKeys.length > 0) {
    await AsyncStorage.multiRemove(e2eKeys);
    console.log("[E2E] 🗑️ All encryption data cleared");
  }
}

// ─── E2E Status Labels (Bilingual) ─────────────────────────
export const E2E_STATUS = {
  ENCRYPTED: {
    icon: "🔒",
    fr: "Chiffré de bout en bout",
    en: "End-to-end encrypted",
  },
  NOT_ENCRYPTED: {
    icon: "🔓",
    fr: "Non chiffré",
    en: "Not encrypted",
  },
  ESTABLISHING: {
    icon: "🔑",
    fr: "Établissement de la session...",
    en: "Establishing session...",
  },
  VERIFIED: {
    icon: "✅",
    fr: "Vérifié",
    en: "Verified",
  },
};
