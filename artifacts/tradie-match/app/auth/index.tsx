import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function AuthLanding() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signInWithGoogle, signInWithApple } = useAuth();
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [appleLoading, setAppleLoading] = React.useState(false);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signInWithGoogle();
    setGoogleLoading(false);
  };

  const handleApple = async () => {
    setAppleLoading(true);
    await signInWithApple();
    setAppleLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: "#12121A" }]}>
      <LinearGradient
        colors={["#D6222C", "#12121A"]}
        locations={[0, 0.55]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.hero, { paddingTop: insets.top + 60 }]}>
        <View style={styles.logoWrap}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            contentFit="contain"
          />
        </View>
        <Text style={styles.appName}>Red Collar</Text>
        <Text style={styles.tagline}>
          Find your match on the tools — or off them.
        </Text>
      </View>

      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.card,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
          Get started
        </Text>

        {Platform.OS === "ios" && (
          <SocialButton
            label="Continue with Apple"
            icon="apple"
            onPress={handleApple}
            loading={appleLoading}
            backgroundColor="#000000"
            textColor="#FFFFFF"
          />
        )}

        <SocialButton
          label="Continue with Google"
          icon="google"
          onPress={handleGoogle}
          loading={googleLoading}
          backgroundColor="#FFFFFF"
          textColor="#1A1410"
          borderColor={colors.border}
        />

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>
            or
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        <Pressable
          onPress={() => router.push("/auth/sign-up")}
          style={({ pressed }) => [
            styles.emailBtn,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Feather name="mail" size={18} color="#FFFFFF" />
          <Text style={styles.emailBtnText}>Sign up with Email</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/auth/sign-in")}
          hitSlop={12}
          style={{ alignSelf: "center", marginTop: 8 }}
        >
          <Text style={[styles.signInLink, { color: colors.mutedForeground }]}>
            Already have an account?{" "}
            <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>
              Sign in
            </Text>
          </Text>
        </Pressable>

        <Text style={[styles.legal, { color: colors.mutedForeground }]}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </View>
  );
}

function SocialButton({
  label,
  icon,
  onPress,
  loading,
  backgroundColor,
  textColor,
  borderColor,
}: {
  label: string;
  icon: "apple" | "google";
  onPress: () => void;
  loading: boolean;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.socialBtn,
        { backgroundColor, borderColor: borderColor ?? backgroundColor, borderWidth: 1 },
        pressed && { opacity: 0.85 },
        loading && { opacity: 0.6 },
      ]}
    >
      {icon === "apple" ? (
        <Feather name="smartphone" size={20} color={textColor} />
      ) : (
        <GoogleIcon />
      )}
      <Text style={[styles.socialBtnText, { color: textColor }]}>
        {loading ? "Connecting…" : label}
      </Text>
    </Pressable>
  );
}

function GoogleIcon() {
  return (
    <View style={styles.googleIcon}>
      <Text style={styles.googleIconText}>G</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  logoWrap: {
    width: 100,
    height: 100,
    borderRadius: 26,
    overflow: "hidden",
    marginBottom: 8,
  },
  logo: { width: 100, height: 100 },
  appName: {
    color: "#FFFFFF",
    fontSize: 38,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  tagline: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 14,
  },
  sheetTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 15,
    borderRadius: 14,
  },
  socialBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 2,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  emailBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
    borderRadius: 14,
  },
  emailBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  signInLink: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  legal: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 16,
    marginTop: 4,
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIconText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
});
