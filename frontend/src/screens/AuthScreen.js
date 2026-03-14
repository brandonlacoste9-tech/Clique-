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
// import * as SnapLogin from "react-native-snap-kit-login"; // Using Demo Mock below
import * as Haptics from "expo-haptics";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Text as SvgText,
} from "react-native-svg";

import { useAuthStore } from "../store/cliqueStore";
import { authAPI } from "../api/cliqueApi";
// import { SNAP_CONFIG } from "../services/snapKitService";
import { triggerEliteWelcome } from "../services/eliteGreetingService";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  cliquePhrases,
  shadows,
} from "../theme/cliqueTheme";

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
      setError(cliquePhrases.error[2]); // "Ça marche pas"
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
      setError(cliquePhrases.error[2]); // "Ça marche pas"
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
      setError(cliquePhrases.error[2]); // "Ça marche pas"
    } finally {
      setLoading(false);
    }
  };

  const handleSnapLogin = async () => {
    setLoading(true);
    setError("");

    try {
      // Simulation of a response as if react-native-snap-kit-login returned successfully
      // To run on actual devices, you would configure devportal.snap.com and uncomment real imports
      const result = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            accessToken: "simulated_snap_token_12345",
            user: {
              id: "snapuser.999",
              displayName: "SnapSouverain",
              bitmojiAvatarUrl: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&h=150&fit=crop",
            }
          });
        }, 1500);
      });

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
      setError(cliquePhrases.error[2]); // "Ça marche pas"
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
            {/* Gold Bullion Logo Block */}
            <View style={styles.logoContainer}>
              <View style={styles.bullionBlock}>
                <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                  <Defs>
                    <LinearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                      <Stop offset="0" stopColor="#ffefaf" stopOpacity="1" />
                      <Stop offset="0.5" stopColor="#d4af37" stopOpacity="1" />
                      <Stop offset="1" stopColor="#8c6d1f" stopOpacity="1" />
                    </LinearGradient>
                  </Defs>
                  <Rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="url(#goldGrad)"
                    rx="8"
                  />
                  <SvgText
                    x="50%"
                    y="60%"
                    fontSize="18"
                    fontWeight="900"
                    fill="rgba(0,0,0,0.6)"
                    textAnchor="middle"
                    letterSpacing="1"
                  >
                    CHATSNAP
                  </SvgText>
                  <SvgText
                    x="85%"
                    y="15%"
                    fontSize="8"
                    fontWeight="900"
                    fill="rgba(0,0,0,0.3)"
                    textAnchor="middle"
                  >
                    999.9
                  </SvgText>
                </Svg>
              </View>
              <Text style={styles.title}>CHATSNAP</Text>
              <Text style={styles.tagline}>L'Élite de l'Instant / The Instant Elite</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {step === "phone" && (
                <>
                  <Text style={styles.label}>Ton numéro / Your number</Text>
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
                      {loading ? "..." : "Continuer / Continue"}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.dividerText}>OU / OR</Text>
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
                        {loading ? "Chargement..." : "Snapchat Express"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: colors.accent.orange, marginTop: spacing.md }]}
                      onPress={() => {
                        setToken("demo_bypass_token");
                        setUser({
                          id: "demo.guest",
                          username: "DemoElite",
                          displayName: "Demo Sovereign",
                          avatarUrl: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&h=150&fit=crop",
                        });
                        triggerEliteWelcome("Demo Sovereign");
                      }}
                    >
                      <Text style={styles.buttonText}>DEMO BYPASS: ENTER AS GUEST</Text>
                    </TouchableOpacity>
                  </>
                )}

              {step === "otp" && (
                <>
                   <Text style={styles.label}>Code reçu / Code received</Text>
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
                    <Text style={styles.buttonText}>Vérifier / Verify</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setStep("phone")}>
                    <Text style={styles.link}>Changer de numéro / Change number</Text>
                  </TouchableOpacity>
                </>
              )}

              {step === "username" && (
                <>
                  <Text style={styles.label}>Choisis ton @ / Choose your @</Text>
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
                    <Text style={styles.buttonText}>C'est parti / Let's go</Text>
                  </TouchableOpacity>
                </>
              )}

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>
          </View>

          <Text style={styles.footer}>Bilingue. Sécurisé. Québécois. / Bilingual. Secure. Local.</Text>
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
  bullionBlock: {
    width: 140,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    backgroundColor: colors.gold.DEFAULT,
    ...shadows.gold,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 20,
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
});
