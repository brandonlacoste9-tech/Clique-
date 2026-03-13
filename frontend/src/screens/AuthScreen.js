import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Alert,
} from "react-native";
import * as SnapLogin from "../lib/snapLogin";
import * as Haptics from "expo-haptics";

import { useAuthStore } from "../store/chatsnapStore";
import { authAPI } from "../api/chatsnapApi";
import { SNAP_CONFIG } from "../services/snapKitService";
import { triggerEliteWelcome } from "../services/eliteGreetingService";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  chatsnapPhrases,
  shadows,
} from "../theme/chatsnapTheme";

export default function AuthScreen() {
  const [step, setStep] = useState("phone"); // phone, otp, username
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setToken, setUser } = useAuthStore();

  const handleRequestOTP = async () => {
    if (!phone || phone.length < 10) {
      setError("Entre un numéro valide");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authAPI.requestOTP(phone);
      setStep("otp");
    } catch (err) {
      setError(chatsnapPhrases.error[2]); // "Ça marche pas"
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Code à 6 chiffres");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authAPI.verifyOTP(
        phone,
        otp,
        username || undefined,
      );

      if (response.data.user.isNewUser) {
        setStep("username");
      } else {
        setToken(response.data.token);
        setUser(response.data.user);
      }
    } catch (err) {
      setError(chatsnapPhrases.error[2]); // "Ça marche pas"
    } finally {
      setLoading(false);
    }
  };

  const handleSetUsername = async () => {
    if (!username || username.length < 3) {
      setError("Minimum 3 caractères");
      return;
    }

    setLoading(true);

    try {
      // Re-verify with username
      const response = await authAPI.verifyOTP(phone, otp, username);
      setToken(response.data.token);
      setUser(response.data.user);
    } catch (err) {
      setError(chatsnapPhrases.error[2]); // "Ça marche pas"
    } finally {
      setLoading(false);
    }
  };

  const handleSnapLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await SnapLogin.login(SNAP_CONFIG);
      if (result.accessToken) {
        // SUCCESS: Trigger Imperial Haptic
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Seeding the user profile with Snap data
        setToken(result.accessToken);
        setUser({
          ...result.user,
          isAuthenticated: true,
          displayName: result.user.displayName,
          avatarUrl: result.user.bitmojiAvatarUrl,
        });

        // Trigger the Bienvenue Greeting
        triggerEliteWelcome(result.user.displayName || "Elite");
      }
    } catch (err) {
      // QUEBECOIS ERROR LOGIC
      console.log("Ça marche pas:", err);
      setError(chatsnapPhrases.error[2]); // "Ça marche pas"
      Alert.alert("Erreur d'accès", "L'accès à l'Élite a échoué. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ImageBackground
        source={require("../../assets/suede_bg.png")}
        style={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoRing}>
                <View style={styles.logoInner}>
                  <Text style={styles.logoText}>Z</Text>
                </View>
              </View>
              <Text style={styles.title}>ZYEYTÉ</Text>
              <Text style={styles.tagline}>L'Élite de l'Instant</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {step === "phone" && (
                <>
                  <Text style={styles.label}>Ton numéro</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="514 555 0123"
                    placeholderTextColor={colors.text.muted}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    maxLength={14}
                  />
                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleRequestOTP}
                    disabled={loading}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? "..." : "Continuer"}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.dividerText}>OU</Text>
                    <View style={styles.line} />
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.snapButton,
                      loading && styles.buttonDisabled,
                    ]}
                    onPress={handleSnapLogin}
                    disabled={loading}
                  >
                    <Text style={styles.snapButtonText}>
                      {loading ? "Chargement..." : "Continuer avec Snapchat"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {step === "otp" && (
                <>
                  <Text style={styles.label}>Code reçu</Text>
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="123456"
                    placeholderTextColor={colors.text.muted}
                    keyboardType="number-pad"
                    value={otp}
                    onChangeText={setOtp}
                    maxLength={6}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleVerifyOTP}
                    disabled={loading}
                  >
                    <Text style={styles.buttonText}>Vérifier</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setStep("phone")}>
                    <Text style={styles.link}>Changer de numéro</Text>
                  </TouchableOpacity>
                </>
              )}

              {step === "username" && (
                <>
                  <Text style={styles.label}>Choisis ton @</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="@username"
                    placeholderTextColor={colors.text.muted}
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                    maxLength={20}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSetUsername}
                    disabled={loading}
                  >
                    <Text style={styles.buttonText}>C'est parti</Text>
                  </TouchableOpacity>
                </>
              )}

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>
          </View>

          <Text style={styles.footer}>Bilingue. Sécurisé. Québécois.</Text>

          {/* Dev, or production demo: ?demo=1 in URL */}
          {(__DEV__ || (Platform.OS === "web" && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("demo") === "1")) && (
            <TouchableOpacity
              style={styles.devSkip}
              onPress={() => {
                setToken("dev");
                setUser({ id: "dev", displayName: "Dev", username: "dev" });
              }}
            >
              <Text style={styles.devSkipText}>Enter app</Text>
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Darken the suede for focus
    justifyContent: "center",
  },
  content: {
    padding: spacing.lg,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colors.gold.DEFAULT,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    ...shadows.gold,
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gold.DEFAULT,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: typography.sizes["3xl"],
    fontWeight: "bold",
    color: colors.leather.black,
  },
  title: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "bold",
    color: colors.gold.DEFAULT,
    letterSpacing: 4,
  },
  tagline: {
    fontSize: typography.sizes.sm,
    color: colors.gold.DEFAULT,
    marginTop: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontWeight: "600",
  },
  form: {
    gap: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: typography.sizes.lg,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  button: {
    backgroundColor: colors.gold.DEFAULT,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.leather.black,
    fontSize: typography.sizes.base,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  link: {
    color: colors.gold.DEFAULT,
    textAlign: "center",
    marginTop: spacing.md,
  },
  snapButton: {
    backgroundColor: "#FFFC00", // Snapchat Yellow
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  snapButtonText: {
    color: "#000",
    fontSize: typography.sizes.base,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surfaceHighlight,
  },
  dividerText: {
    color: colors.text.muted,
    paddingHorizontal: spacing.md,
    fontSize: 12,
    fontWeight: "bold",
  },
  otpInput: {
    fontFamily: typography.fontFamily.mono,
    letterSpacing: 10,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    textAlign: "center",
    color: colors.text.muted,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  devSkip: {
    position: "absolute",
    top: 50,
    right: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 8,
  },
  devSkipText: {
    color: colors.text.muted,
    fontSize: 12,
  },
});
