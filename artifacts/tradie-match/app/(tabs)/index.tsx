import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { FiltersSheet } from "@/components/FiltersSheet";
import { MatchModal } from "@/components/MatchModal";
import { ProfileSheet } from "@/components/ProfileSheet";
import { SwipeCard } from "@/components/SwipeCard";
import type { SeedProfile } from "@/constants/seedProfiles";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function DiscoverScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profiles, decideOnProfile, resetUser, user } = useApp();
  const [matchedProfile, setMatchedProfile] = useState<SeedProfile | null>(
    null,
  );
  const [matchVisible, setMatchVisible] = useState(false);
  const [previewProfile, setPreviewProfile] = useState<SeedProfile | null>(
    null,
  );
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [activeDecisionId, setActiveDecisionId] = useState<string | null>(null);

  const topProfile = profiles[0];

  const handleSwipe = (dir: "left" | "right", profileId = topProfile?.id) => {
    if (!profileId || activeDecisionId) return;
    setActiveDecisionId(profileId);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(
        dir === "right"
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light,
      ).catch(() => {});
    }
    const result = decideOnProfile(
      profileId,
      dir === "right" ? "like" : "pass",
    );
    setActiveDecisionId(null);
    if (result.matched && result.profile) {
      setMatchedProfile(result.profile);
      setMatchVisible(true);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
      }
    }
  };

  const handleButtonAction = (action: "pass" | "like") => {
    handleSwipe(action === "like" ? "right" : "left");
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 + 20 : 84 + insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 8 }]}>
        <Text style={[styles.brand, { color: colors.foreground }]}>
          Red Collar
        </Text>
        <Pressable
          style={[styles.iconBtn, { backgroundColor: colors.secondary }]}
          onPress={() => setFiltersVisible(true)}
        >
          <Feather name="sliders" size={18} color={colors.foreground} />
        </Pressable>
      </View>

      <View style={[styles.deckArea, { marginBottom: bottomPad }]}>
        {profiles.length === 0 ? (
          <EmptyState
            icon="check-circle"
            title="You've seen the crew"
            body="That's everyone in your area for now. Check back tomorrow, or reset to swipe again."
            ctaLabel="Reset and try again"
            onCtaPress={() => {
              void resetUser();
            }}
          />
        ) : (
          <>
            <View style={styles.cardStack}>
              {profiles
                .slice(0, 3)
                .reverse()
                .map((profile, idxFromBottom, arr) => {
                  const stackOffset = arr.length - 1 - idxFromBottom;
                  const isTop = stackOffset === 0;
                  return (
                    <SwipeCard
                      key={profile.id}
                      profile={profile}
                      isTop={isTop}
                      stackOffset={stackOffset}
                      onSwipe={handleSwipe}
                      onTap={() => setPreviewProfile(profile)}
                    />
                  );
                })}
            </View>

            <View style={styles.actions}>
              <Pressable
                onPress={() => handleButtonAction("pass")}
                disabled={!!activeDecisionId}
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.passBtn,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  activeDecisionId && { opacity: 0.5 },
                  pressed && !activeDecisionId && { opacity: 0.7, transform: [{ scale: 0.96 }] },
                ]}
              >
                <Feather name="x" size={26} color={colors.destructive} />
              </Pressable>

              <Pressable
                onPress={() => topProfile && setPreviewProfile(topProfile)}
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.infoBtn,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] },
                ]}
              >
                <Feather name="info" size={20} color={colors.foreground} />
              </Pressable>

              <Pressable
                onPress={() => handleButtonAction("like")}
                disabled={!!activeDecisionId}
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.likeBtn,
                  { backgroundColor: colors.primary },
                  activeDecisionId && { opacity: 0.5 },
                  pressed && !activeDecisionId && { opacity: 0.85, transform: [{ scale: 0.96 }] },
                ]}
              >
                <Feather name="heart" size={28} color="#FFFFFF" />
              </Pressable>
            </View>
          </>
        )}
      </View>

      <FiltersSheet
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
      />
      <MatchModal
        visible={matchVisible}
        profile={matchedProfile}
        mode={user?.mode ?? "dating"}
        onClose={() => setMatchVisible(false)}
      />
      <ProfileSheet
        visible={!!previewProfile}
        profile={previewProfile}
        onClose={() => setPreviewProfile(null)}
        onPass={() => {
          const p = previewProfile;
          setPreviewProfile(null);
          if (p && p.id === topProfile?.id) handleSwipe("left", p.id);
        }}
        onLike={() => {
          const p = previewProfile;
          setPreviewProfile(null);
          if (p && p.id === topProfile?.id) handleSwipe("right", p.id);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  brand: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  deckArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  cardStack: {
    flex: 1,
    position: "relative",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 22,
    paddingVertical: 20,
  },
  actionBtn: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  passBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
  },
  infoBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  likeBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    shadowColor: "#D72638",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
});
