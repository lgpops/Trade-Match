import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { SeedProfile } from "@/constants/seedProfiles";
import type { Mode } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type Props = {
  visible: boolean;
  profile: SeedProfile | null;
  mode?: Mode;
  onClose: () => void;
};

export function MatchModal({ visible, profile, mode = "dating", onClose }: Props) {
  const colors = useColors();
  if (!profile) return null;
  const isMates = mode === "mates";
  const eyebrow = isMates ? "New mate" : "It's a match";
  const headline = isMates
    ? `You and ${profile.name} are on the same page.`
    : `You and ${profile.name} are keen.`;
  const body = isMates
    ? "Send the first message. Beers, jobs, smoko — kick it off."
    : "Send the first message. No one likes a tradie that doesn't turn up.";

  const goToChat = () => {
    onClose();
    router.push(`/chat/${profile.id}` as never);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <LinearGradient
          colors={["rgba(232,93,26,0.95)", "rgba(26,20,16,0.98)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.content}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.headline}>{headline}</Text>

          <View style={styles.photoRow}>
            <View style={[styles.photoWrap, styles.photoLeft]}>
              <Image source={profile.photo} style={styles.photo} contentFit="cover" />
            </View>
            <View
              style={[
                styles.heart,
                { backgroundColor: colors.background, borderColor: colors.primary },
              ]}
            >
              <Feather
                name={isMates ? "users" : "heart"}
                size={28}
                color={colors.primary}
              />
            </View>
          </View>

          <Text style={styles.body}>{body}</Text>

          <Pressable
            onPress={goToChat}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: colors.background },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Feather name="message-circle" size={18} color={colors.primary} />
            <Text style={[styles.primaryBtnText, { color: colors.primary }]}>
              Send a message
            </Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.secondaryBtnText}>Keep swiping</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    width: "100%",
    paddingHorizontal: 32,
    alignItems: "center",
    gap: 20,
  },
  eyebrow: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  headline: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 36,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
    height: 180,
  },
  photoWrap: {
    width: 150,
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  photoLeft: {
    transform: [{ rotate: "-4deg" }],
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  heart: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  body: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 12,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  secondaryBtn: {
    paddingVertical: 8,
  },
  secondaryBtnText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
