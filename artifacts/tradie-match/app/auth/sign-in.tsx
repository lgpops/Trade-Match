import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function SignIn() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const canSubmit = email.trim().includes("@") && password.length >= 6;

  const handleSignIn = async () => {
    if (!canSubmit) return;
    setLoading(true);
    const err = await signInWithEmail(email.trim(), password);
    setLoading(false);
    if (err) {
      Alert.alert("Sign in failed", err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Sign in</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.foreground,
            },
          ]}
        />

        <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 8 }]}>
          Password
        </Text>
        <View style={styles.passwordWrap}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Min. 6 characters"
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry={!showPass}
            style={[
              styles.input,
              styles.passwordInput,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
          />
          <Pressable
            onPress={() => setShowPass((v) => !v)}
            style={styles.eyeBtn}
            hitSlop={8}
          >
            <Feather
              name={showPass ? "eye-off" : "eye"}
              size={18}
              color={colors.mutedForeground}
            />
          </Pressable>
        </View>

        <Pressable
          onPress={handleSignIn}
          disabled={!canSubmit || loading}
          style={({ pressed }) => [
            styles.submitBtn,
            {
              backgroundColor: canSubmit ? colors.primary : colors.muted,
              marginTop: 24,
            },
            pressed && canSubmit && { opacity: 0.85 },
          ]}
        >
          <Text
            style={[
              styles.submitText,
              { color: canSubmit ? "#FFFFFF" : colors.mutedForeground },
            ]}
          >
            {loading ? "Signing in…" : "Sign in"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/auth/sign-up")}
          style={{ alignSelf: "center", marginTop: 16 }}
          hitSlop={12}
        >
          <Text style={[styles.switchText, { color: colors.mutedForeground }]}>
            No account?{" "}
            <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>
              Sign up
            </Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  back: { width: 24 },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  passwordWrap: { position: "relative" },
  passwordInput: { paddingRight: 48 },
  eyeBtn: {
    position: "absolute",
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  submitText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  switchText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
