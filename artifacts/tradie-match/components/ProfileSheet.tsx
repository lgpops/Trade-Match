import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TradeBadge } from "@/components/TradeBadge";
import {
  formatCollarType,
  formatEthnicity,
  formatHeight,
} from "@/constants/demographics";
import type { SeedProfile } from "@/constants/seedProfiles";
import { getTrade } from "@/constants/trades";
import { useColors } from "@/hooks/useColors";

type Props = {
  visible: boolean;
  profile: SeedProfile | null;
  onClose: () => void;
  onPass?: () => void;
  onLike?: () => void;
};

export function ProfileSheet({ visible, profile, onClose, onPass, onLike }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  if (!profile) return null;
  const trade = getTrade(profile.trade);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.background },
          ]}
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heroWrap}>
              <Image source={profile.photo} style={styles.hero} contentFit="cover" />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.7)"]}
                style={styles.heroGradient}
              />
              <Pressable
                onPress={onClose}
                style={[styles.closeBtn, { top: insets.top + 12 }]}
              >
                <Feather name="x" size={20} color="#FFFFFF" />
              </Pressable>
              <View style={styles.heroInfo}>
                <View style={styles.row}>
                  <TradeBadge trade={profile.trade} size="lg" />
                  <View style={styles.distance}>
                    <Feather name="map-pin" size={13} color="#FFFFFF" />
                    <Text style={styles.distanceText}>{profile.distanceKm} km</Text>
                  </View>
                </View>
                <Text style={styles.heroName}>
                  {profile.name}, {profile.age}
                </Text>
                <Text style={styles.heroSub}>
                  {formatCollarType(profile.collarType)} · {profile.suburb}
                </Text>
              </View>
              <View style={[styles.tradeStripe, { backgroundColor: trade.color }]} />
            </View>

            <View style={styles.body}>
              <Text style={[styles.bio, { color: colors.foreground }]}>
                {profile.bio}
              </Text>

              <Detail
                icon={profile.collarType === "blue" ? "tool" : "briefcase"}
                label="Collar"
                value={formatCollarType(profile.collarType)}
                color={colors.foreground}
                muted={colors.mutedForeground}
                accent={colors.accent}
              />
              <Detail
                icon="globe"
                label="Ethnicity"
                value={formatEthnicity(profile.ethnicity)}
                color={colors.foreground}
                muted={colors.mutedForeground}
                accent={colors.accent}
              />
              <Detail
                icon="bar-chart-2"
                label="Height"
                value={formatHeight(profile.heightCm)}
                color={colors.foreground}
                muted={colors.mutedForeground}
                accent={colors.accent}
              />
              <Detail
                icon="truck"
                label={profile.collarType === "blue" ? "The rig" : "Work setup"}
                value={profile.rig}
                color={colors.foreground}
                muted={colors.mutedForeground}
                accent={colors.accent}
              />
              <Detail
                icon="sun"
                label="Weekend move"
                value={profile.weekendMove}
                color={colors.foreground}
                muted={colors.mutedForeground}
                accent={colors.accent}
              />
              <Detail
                icon="coffee"
                label="Brew of choice"
                value={profile.brewOfChoice}
                color={colors.foreground}
                muted={colors.mutedForeground}
                accent={colors.accent}
              />
            </View>
          </ScrollView>

          {(onPass || onLike) && (
            <View
              style={[
                styles.actionBar,
                {
                  backgroundColor: colors.background,
                  borderTopColor: colors.border,
                  paddingBottom: insets.bottom + 12,
                },
              ]}
            >
              <Pressable
                onPress={onPass}
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.passBtn,
                  { borderColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Feather name="x" size={26} color={colors.destructive} />
              </Pressable>
              <Pressable
                onPress={onLike}
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.likeBtn,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Feather name="heart" size={26} color="#FFFFFF" />
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function Detail({
  icon,
  label,
  value,
  color,
  muted,
  accent,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  color: string;
  muted: string;
  accent: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={[styles.detailIcon, { backgroundColor: accent }]}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.detailLabel, { color: muted }]}>{label}</Text>
        <Text style={[styles.detailValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end" },
  backdropPressable: { flex: 1 },
  sheet: {
    height: "92%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  heroWrap: {
    height: 460,
    width: "100%",
  },
  hero: { width: "100%", height: "100%" },
  heroGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "55%",
  },
  closeBtn: {
    position: "absolute",
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  tradeStripe: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  heroInfo: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 24,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  distance: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  distanceText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  heroName: {
    color: "#FFFFFF",
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  heroSub: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  body: {
    padding: 24,
    gap: 18,
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Inter_400Regular",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  actionBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  passBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
  },
  likeBtn: {
    shadowColor: "#D72638",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
