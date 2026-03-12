import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import Svg, { Defs, LinearGradient, Stop, Rect, Text as SvgText } from "react-native-svg";
import { colors, spacing, typography, shadows } from "../theme/cliqueTheme";
import { eliteAPI } from "../api/cliqueApi";
import { useAuthStore } from "../store/cliqueStore";

const { width, height } = Dimensions.get("window");

/**
 * LandingVIPScreen — The ultra-exclusive entry point for Clique.
 */
export default function LandingVIPScreen({ navigation }) {
  const { setToken, setUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [placesLeft, setPlacesLeft] = useState(99);
  const [submitted, setSubmitted] = useState(false);
  
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(20))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    const fetchCount = async () => {
      try {
        const res = await eliteAPI.getHall();
        if (res.data?.placesLeft) setPlacesLeft(res.data.placesLeft);
      } catch (e) {
        // Fallback
      }
    };
    fetchCount();
  }, []);

  const handleRequestAccess = async () => {
    if (!email || !email.includes("@")) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await eliteAPI.register(email);
      setSubmitted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../../assets/suede_bg.png")}
        style={styles.background}
      >
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flexOne}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.innerContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              
              {/* Bullion Header */}
              <View style={styles.bullionContainer}>
                <Svg height="100" width="280">
                  <Defs>
                    <LinearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="0">
                      <Stop offset="0" stopColor="#EBCB8B" stopOpacity="1" />
                      <Stop offset="0.5" stopColor="#D4AF37" stopOpacity="1" />
                      <Stop offset="1" stopColor="#8F6B29" stopOpacity="1" />
                    </LinearGradient>
                  </Defs>
                  <Rect x="0" y="0" width="280" height="100" fill="url(#goldGrad)" rx="12" />
                  <SvgText
                    x="50%"
                    y="65%"
                    fontSize="48"
                    fontWeight="900"
                    fill="#000"
                    textAnchor="middle"
                    letterSpacing="8"
                  >
                    CLIQUE
                  </SvgText>
                  <SvgText x="140" y="20" fontSize="8" fill="rgba(0,0,0,0.4)" textAnchor="middle" fontWeight="bold">
                    CLIQUE - AU 999.9 FINE GOLD
                  </SvgText>
                </Svg>
              </View>

              <Text style={styles.eliteTagline}>THE ELITE OF THE MOMENT</Text>

              {/* Places Counter Block */}
              <View style={styles.counterBox}>
                <View style={styles.pillContainer}>
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>FIRST 100 FREE</Text>
                  </View>
                </View>
                <Text style={styles.counterTop}>Lifetime access for the first 100 Sovereigns</Text>
                <Text style={styles.counterMain}>
                  <Text style={styles.goldText}>{placesLeft}</Text> places left
                </Text>
              </View>

              {/* Description Text */}
              <View style={styles.descContainer}>
                <Text style={styles.description}>
                  Restore sovereignty over your digital presence. No noise. Only brilliance. Quebec's most exclusive social experience.
                </Text>
              </View>

              {/* Input & Action */}
              {!submitted ? (
                <View style={styles.inputArea}>
                  <TextInput
                    style={styles.input}
                    placeholder="ELITE EMAIL"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                  
                  <TouchableOpacity 
                    style={styles.requestButton} 
                    onPress={() => {
                        console.log("[VIP] Requesting access...");
                        handleRequestAccess();
                    }}
                    disabled={loading}
                  >
                    <Svg height="60" width="220" style={StyleSheet.absoluteFill}>
                      <Rect x="0" y="0" width="100%" height="100%" fill="url(#goldGrad)" rx="8" />
                    </Svg>
                    <Text style={styles.requestButtonText}>
                      {loading ? "PROCESSING..." : "REQUEST ELITE ACCESS"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.secondaryButton, { backgroundColor: 'rgba(212, 175, 55, 0.2)', height: 60 }]} 
                    onPress={() => {
                      console.log("[NAV] Immediate Bypass to Auth triggered");
                      navigation.navigate("Auth");
                    }}
                  >
                    <Text style={[styles.secondaryButtonText, { fontSize: 16, color: '#FFF' }]}>SOVEREIGN LOGIN ▸</Text>
                  </TouchableOpacity>

                  {/* Developer Bypass */}
                  <TouchableOpacity 
                    style={styles.devBypass}
                    onPress={() => {
                      console.log("[NAV] Dev Skip Invite triggered");
                      navigation.navigate("Auth");
                    }}
                  >
                    <Text style={styles.devBypassText}>[DEV] SKIP INVITE</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.accent.orange, marginTop: 10, width: 220, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' }]}
                    onPress={() => {
                      console.log("[BYPASS] Landing God Mode triggered");
                      setToken("guest_god_token");
                      setUser({
                        id: "guest.god",
                        username: "QuickSovereign",
                        displayName: "Guest Sovereign",
                        avatarUrl: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&h=150&fit=crop",
                      });
                    }}
                  >
                    <Text style={{ color: '#000', fontWeight: 'bold' }}>DEMO BYPASS: ENTER NOW</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.successArea}>
                  <Text style={styles.successEmoji}>⚜️</Text>
                  <Text style={styles.successTitle}>REQUEST RECEIVED</Text>
                  <Text style={styles.successDesc}>Your invitation is being forged. We will notify you when your prestige is ready.</Text>
                  <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate("Auth")}>
                    <Text style={styles.backBtnText}>GO TO LOGIN</Text>
                  </TouchableOpacity>
                </View>
              )}

            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  flexOne: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    paddingVertical: 60,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  innerContent: {
    alignItems: "center",
    width: "100%",
  },
  bullionContainer: {
    marginBottom: spacing.xl,
    ...shadows.premium,
  },
  eliteTagline: {
    color: colors.gold.DEFAULT,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 4,
    marginBottom: 30,
    textTransform: "uppercase",
  },
  counterBox: {
    width: "100%",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    alignItems: "center",
    marginBottom: 20,
  },
  pillContainer: {
    marginBottom: 8,
  },
  pill: {
    backgroundColor: colors.gold.DEFAULT,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pillText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#000",
  },
  counterTop: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 6,
  },
  counterMain: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  goldText: {
    color: colors.gold.DEFAULT,
    fontSize: 18,
    fontWeight: "900",
  },
  descContainer: {
    marginBottom: 30,
  },
  description: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    fontWeight: "400",
  },
  inputArea: {
    width: "100%",
    alignItems: "center",
  },
  input: {
    width: "100%",
    height: 60,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 20,
    color: "#FFF",
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 20,
  },
  requestButton: {
    width: 220,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.premium,
  },
  requestButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
  secondaryButton: {
    marginTop: 15,
    width: 220,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(212, 175, 55, 0.05)",
  },
  secondaryButtonText: {
    color: colors.gold.DEFAULT,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  loginButton: {
    marginTop: 20,
    padding: 10,
  },
  loginLink: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    marginTop: 20,
    textDecorationLine: "underline",
  },
  boldLogin: {
    fontWeight: "bold",
  },
  successArea: {
    alignItems: "center",
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  successTitle: {
    color: colors.gold.DEFAULT,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 12,
  },
  successDesc: {
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 30,
  },
  backBtn: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
    borderRadius: 8,
  },
  backBtnText: {
    color: colors.gold.DEFAULT,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  devBypass: {
    marginTop: 30,
    opacity: 0.3,
  },
  devBypassText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  }
});
