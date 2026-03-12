/**
 * languageService.js — Trilingual Language System for Clique
 *
 * Supports:
 *   - Français Canadien (fr-CA) — default
 *   - English (en)
 *   - Español (es)
 *
 * Uses Zustand for reactive language state + AsyncStorage for persistence.
 * All translations are accessed via t("key") function.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Translation Dictionary ────────────────────────────────
const translations = {
  // ── General ──────────────────────
  "app.name": { fr: "CLIQUE", en: "CLIQUE", es: "CLIQUE" },
  "app.tagline": {
    fr: "Bilingue. Sécurisé. Québécois.",
    en: "Bilingual. Secure. Local.",
    es: "Bilingüe. Seguro. Local.",
  },

  // ── Auth ──────────────────────────
  "auth.welcome": { fr: "Bienvenue à L'Élite", en: "Welcome to The Elite", es: "Bienvenido a La Élite" },
  "auth.phone": { fr: "Numéro de téléphone", en: "Phone number", es: "Número de teléfono" },
  "auth.code": { fr: "Code de vérification", en: "Verification code", es: "Código de verificación" },
  "auth.login": { fr: "Connexion", en: "Login", es: "Iniciar sesión" },
  "auth.logout": { fr: "Déconnexion", en: "Logout", es: "Cerrar sesión" },

  // ── Navigation ───────────────────
  "nav.camera": { fr: "Caméra", en: "Camera", es: "Cámara" },
  "nav.chat": { fr: "Messages", en: "Messages", es: "Mensajes" },
  "nav.stories": { fr: "Histoires", en: "Stories", es: "Historias" },
  "nav.map": { fr: "Territoire", en: "Territory", es: "Territorio" },
  "nav.profile": { fr: "Profil", en: "Profile", es: "Perfil" },

  // ── Chat ─────────────────────────
  "chat.placeholder": { fr: "Écrire un message...", en: "Type a message...", es: "Escribe un mensaje..." },
  "chat.send": { fr: "Envoyer", en: "Send", es: "Enviar" },
  "chat.typing": { fr: "écrit...", en: "typing...", es: "escribiendo..." },
  "chat.search": { fr: "Chercher...", en: "Search...", es: "Buscar..." },
  "chat.noResults": { fr: "Aucun résultat", en: "No results found", es: "Sin resultados" },
  "chat.empty": { fr: "Commence la conversation", en: "Start chatting", es: "Inicia la conversación" },

  // ── Media ────────────────────────
  "media.share": { fr: "PARTAGER", en: "SHARE", es: "COMPARTIR" },
  "media.camera": { fr: "Caméra", en: "Camera", es: "Cámara" },
  "media.gallery": { fr: "Galerie", en: "Gallery", es: "Galería" },
  "media.location": { fr: "Position", en: "Location", es: "Ubicación" },
  "media.send": { fr: "Envoyer", en: "Send", es: "Enviar" },
  "media.cancel": { fr: "Annuler", en: "Cancel", es: "Cancelar" },
  "media.photo": { fr: "Photo", en: "Photo", es: "Foto" },
  "media.video": { fr: "Vidéo", en: "Video", es: "Video" },

  // ── Voice ────────────────────────
  "voice.record": { fr: "Enregistrer", en: "Record", es: "Grabar" },
  "voice.stop": { fr: "Arrêter", en: "Stop", es: "Detener" },
  "voice.send": { fr: "Envoyer la note", en: "Send note", es: "Enviar nota" },
  "voice.retry": { fr: "Recommencer", en: "Retry", es: "Reintentar" },

  // ── Stickers ─────────────────────
  "sticker.title": { fr: "STICKERS DE L'ÉLITE", en: "ELITE STICKERS", es: "STICKERS DE LA ÉLITE" },
  "sticker.reactions": { fr: "Réactions", en: "Reactions", es: "Reacciones" },
  "sticker.quebecois": { fr: "Québécois", en: "Québécois", es: "Quebequense" },
  "sticker.elite": { fr: "L'Élite", en: "The Elite", es: "La Élite" },
  "sticker.vibes": { fr: "Vibes", en: "Vibes", es: "Vibras" },

  // ── Profile ──────────────────────
  "profile.friends": { fr: "Mes amis", en: "My Friends", es: "Mis amigos" },
  "profile.streaks": { fr: "Streaks actifs", en: "Active Streaks", es: "Rachas activas" },
  "profile.score": { fr: "Score Élite", en: "Elite Score", es: "Puntuación Élite" },
  "profile.settings": { fr: "Paramètres", en: "Settings", es: "Ajustes" },
  "profile.privacy": { fr: "Confidentialité", en: "Privacy", es: "Privacidad" },
  "profile.help": { fr: "Aide", en: "Help", es: "Ayuda" },
  "profile.status": { fr: "Statut", en: "Status", es: "Estado" },
  "profile.theme": { fr: "Thème", en: "Theme", es: "Tema" },
  "profile.language": { fr: "Langue", en: "Language", es: "Idioma" },
  "profile.editStatus": { fr: "Modifier le statut", en: "Edit status", es: "Editar estado" },
  "profile.ghostMode": { fr: "Mode Fantôme", en: "Ghost Mode", es: "Modo Fantasma" },
  "profile.ghostOn": { fr: "Invisible sur la carte.", en: "Invisible on the map.", es: "Invisible en el mapa." },
  "profile.ghostOff": { fr: "Visible pour tes amis.", en: "Visible to friends.", es: "Visible para tus amigos." },
  "profile.customize": { fr: "Personnaliser", en: "Customize", es: "Personalizar" },
  "profile.selectTheme": { fr: "Choisir un thème", en: "Select a theme", es: "Elegir un tema" },
  "profile.customStatus": { fr: "Statut personnalisé", en: "Custom status", es: "Estado personalizado" },

  // ── Status Presets ───────────────
  "status.available": { fr: "Disponible", en: "Available", es: "Disponible" },
  "status.busy": { fr: "Occupé", en: "Busy", es: "Ocupado" },
  "status.away": { fr: "Absent", en: "Away", es: "Ausente" },
  "status.doNotDisturb": { fr: "Ne pas déranger", en: "Do Not Disturb", es: "No molestar" },
  "status.atSchool": { fr: "À l'école", en: "At School", es: "En la escuela" },
  "status.gaming": { fr: "En jeu", en: "Gaming", es: "Jugando" },
  "status.sleeping": { fr: "Dodo", en: "Sleeping", es: "Durmiendo" },
  "status.vibing": { fr: "En mode chill", en: "Vibing", es: "En buena onda" },

  // ── Encryption ───────────────────
  "e2e.active": { fr: "Chiffrement actif", en: "Encryption active", es: "Cifrado activo" },
  "e2e.inactive": { fr: "Non chiffré", en: "Not encrypted", es: "Sin cifrar" },
  "e2e.fingerprint": { fr: "Empreinte de sécurité", en: "Security fingerprint", es: "Huella de seguridad" },

  // ── Disappearing ─────────────────
  "disappear.title": { fr: "Messages éphémères", en: "Disappearing messages", es: "Mensajes temporales" },
  "disappear.permanent": { fr: "Permanent", en: "Permanent", es: "Permanente" },
  "disappear.afterRead": { fr: "Après lecture", en: "After read", es: "Después de leer" },

  // ── Notifications ────────────────
  "notif.newMessage": { fr: "Nouveau message", en: "New message", es: "Nuevo mensaje" },
  "notif.voiceNote": { fr: "Note vocale reçue", en: "Voice note received", es: "Nota de voz recibida" },
  "notif.streakWarning": { fr: "Streak en danger!", en: "Streak at risk!", es: "¡Racha en peligro!" },

  // ── Common ───────────────────────
  "common.close": { fr: "Fermer", en: "Close", es: "Cerrar" },
  "common.save": { fr: "Sauvegarder", en: "Save", es: "Guardar" },
  "common.confirm": { fr: "Confirmer", en: "Confirm", es: "Confirmar" },
  "common.loading": { fr: "Chargement...", en: "Loading...", es: "Cargando..." },
  "common.error": { fr: "Erreur", en: "Error", es: "Error" },
  "common.success": { fr: "Succès", en: "Success", es: "Éxito" },
  "common.comingSoon": { fr: "BIENTÔT", en: "COMING SOON", es: "PRÓXIMAMENTE" },
};

// ─── Zustand Store ──────────────────────────────────────────
export const useLanguageStore = create(
  persist(
    (set, get) => ({
      language: "fr", // Default: French Canadian

      setLanguage: (lang) => {
        set({ language: lang });
        console.log(`[i18n] Language set to: ${lang}`);
      },

      // Cycle: fr → en → es → fr
      toggleLanguage: () => {
        const current = get().language;
        const cycle = { fr: "en", en: "es", es: "fr" };
        const next = cycle[current] || "fr";
        set({ language: next });
        console.log(`[i18n] Toggled to: ${next}`);
      },

      // Translation function
      t: (key, fallback) => {
        const lang = get().language;
        const entry = translations[key];
        if (!entry) return fallback || key;
        return entry[lang] || entry.fr || fallback || key;
      },
    }),
    {
      name: "clique-language",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ─── Convenience export ─────────────────────────────────────
export function t(key, fallback) {
  return useLanguageStore.getState().t(key, fallback);
}

/**
 * Get trilingual text (all three languages shown).
 * @param {string} key - Translation key
 * @returns {string} "French / English / Español"
 */
export function tBoth(key) {
  const entry = translations[key];
  if (!entry) return key;
  return `${entry.fr} / ${entry.en} / ${entry.es}`;
}

// ─── Language Options ───────────────────────────────────────
export const LANGUAGE_OPTIONS = [
  {
    key: "fr",
    label: "Français (Canada)",
    flag: "🇨🇦",
    sublabel: "French Canadian",
  },
  {
    key: "en",
    label: "English",
    flag: "🇬🇧",
    sublabel: "Anglais / Inglés",
  },
  {
    key: "es",
    label: "Español",
    flag: "🇪🇸",
    sublabel: "Espagnol / Spanish",
  },
];

// ─── Status Presets ─────────────────────────────────────────
export const STATUS_PRESETS = [
  { key: "available", emoji: "🟢", translationKey: "status.available" },
  { key: "busy", emoji: "🔴", translationKey: "status.busy" },
  { key: "away", emoji: "🟡", translationKey: "status.away" },
  { key: "dnd", emoji: "⛔", translationKey: "status.doNotDisturb" },
  { key: "school", emoji: "📚", translationKey: "status.atSchool" },
  { key: "gaming", emoji: "🎮", translationKey: "status.gaming" },
  { key: "sleeping", emoji: "😴", translationKey: "status.sleeping" },
  { key: "vibing", emoji: "✨", translationKey: "status.vibing" },
];

// ─── Theme Presets ──────────────────────────────────────────
export const THEME_PRESETS = [
  {
    key: "imperial_gold",
    label: { fr: "Or Impérial", en: "Imperial Gold", es: "Oro Imperial" },
    accent: "#D4AF37",
    bg: "#0D0D0D",
    preview: "⚜️",
  },
  {
    key: "midnight_blue",
    label: { fr: "Bleu Nuit", en: "Midnight Blue", es: "Azul Medianoche" },
    accent: "#4A90D9",
    bg: "#0A0E1A",
    preview: "🌙",
  },
  {
    key: "emerald",
    label: { fr: "Émeraude", en: "Emerald", es: "Esmeralda" },
    accent: "#50C878",
    bg: "#0A1A0E",
    preview: "💎",
  },
  {
    key: "royal_purple",
    label: { fr: "Violet Royal", en: "Royal Purple", es: "Púrpura Real" },
    accent: "#9B59B6",
    bg: "#12081A",
    preview: "👑",
  },
  {
    key: "rose_gold",
    label: { fr: "Or Rose", en: "Rose Gold", es: "Oro Rosa" },
    accent: "#E8A0BF",
    bg: "#1A0A12",
    preview: "🌸",
  },
  {
    key: "arctic",
    label: { fr: "Arctique", en: "Arctic", es: "Ártico" },
    accent: "#7EC8E3",
    bg: "#0A1418",
    preview: "❄️",
  },
];
