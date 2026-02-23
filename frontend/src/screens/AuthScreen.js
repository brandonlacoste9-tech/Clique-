import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

import { useAuthStore } from '../store/cliqueStore';
import { authAPI } from '../api/cliqueApi';
import { colors, typography, spacing, borderRadius } from '../theme/cliqueTheme';

export default function AuthScreen() {
  const [step, setStep] = useState('phone'); // phone, otp, username
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { setToken, setUser } = useAuthStore();

  const handleRequestOTP = async () => {
    if (!phone || phone.length < 10) {
      setError('Entre un numéro valide');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await authAPI.requestOTP(phone);
      setStep('otp');
    } catch (err) {
      setError('Ça marche pas, réessaie');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Code à 6 chiffres');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await authAPI.verifyOTP(phone, otp, username || undefined);
      
      if (response.data.user.isNewUser) {
        setStep('username');
      } else {
        setToken(response.data.token);
        setUser(response.data.user);
      }
    } catch (err) {
      setError('Code invalide');
    } finally {
      setLoading(false);
    }
  };

  const handleSetUsername = async () => {
    if (!username || username.length < 3) {
      setError('Minimum 3 caractères');
      return;
    }
    
    setLoading(true);
    
    try {
      // Re-verify with username
      const response = await authAPI.verifyOTP(phone, otp, username);
      setToken(response.data.token);
      setUser(response.data.user);
    } catch (err) {
      setError('Nom pris ou invalide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoRing}>
            <View style={styles.logoInner}>
              <Text style={styles.logoText}>C</Text>
            </View>
          </View>
          <Text style={styles.title}>CLIQUE</Text>
          <Text style={styles.subtitle}>Le réseau des nôtres</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {step === 'phone' && (
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
                  {loading ? '...' : 'Continuer'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {step === 'otp' && (
            <>
              <Text style={styles.label}>Code reçu</Text>
              <TextInput
                style={styles.input}
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
              
              <TouchableOpacity onPress={() => setStep('phone')}>
                <Text style={styles.link}>Changer de numéro</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 'username' && (
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing['2xl']
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.gold.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gold.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoText: {
    fontSize: typography.sizes['3xl'],
    fontWeight: 'bold',
    color: colors.leather.black
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: 'bold',
    color: colors.gold.DEFAULT,
    letterSpacing: 4
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    marginTop: spacing.xs
  },
  form: {
    gap: spacing.md
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: typography.sizes.lg,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight
  },
  button: {
    backgroundColor: colors.gold.DEFAULT,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonText: {
    color: colors.leather.black,
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  link: {
    color: colors.gold.DEFAULT,
    textAlign: 'center',
    marginTop: spacing.md
  },
  error: {
    color: colors.accent.red,
    textAlign: 'center',
    marginTop: spacing.sm
  }
});
