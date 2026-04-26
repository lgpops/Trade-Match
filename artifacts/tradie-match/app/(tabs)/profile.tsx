import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TradeBadge } from "@/components/TradeBadge";
import { useApp, type CollarType } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { getTrade } from "@/constants/trades";

const COLLAR_LABELS: Record<CollarType, string> = {
  blue: "Blue collar",
  white: "White collar",
};

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, matches, decisions, resetUser } = useApp();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 + 20 : 84 + insets.bottom;

  if (!user) return null;
  const trade = getTrade(user.trade);
  const likeCount = Object.values(decisions).filter((d) => d === "like").length;
  const passCount = Object.values(decisions).filter((d) => d === "pass").length;

  const onSignOut = () => {
    if (Platform.OS === "web") {
      void resetUser();
      return;
    }
    Alert.alert(
      "Reset profile",
      "This will clear your profile, swipes and matches.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => void resetUser(),
        },
      ],
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: topInset },
      ]}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[trade.color, colors.background]}
          locations={[0, 0.85]}
          style={styles.heroGradient}
        >
          <View style={styles.avatarRing}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.card, borderColor: colors.background },
              ]}
            >
              <Feather name="user" size={42} color={colors.mutedForeground} />
            </View>
          </View>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {user.name}, {user.age}
          </Text>
          <View style={{ marginTop: 8 }}>
            <TradeBadge trade={user.trade} size="lg" />
          </View>
          <Text style={[styles.suburb, { color: colors.mutedForeground }]}>
            {COLLAR_LABELS[user.collarType]} · {user.suburb} ·{" "}
            {user.yearsOnTools} yrs on the tools
          </Text>
        </LinearGradient>

        <View style={styles.statsRow}>
          <Stat label="Matches" value={matches.length} colors={colors} />
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <Stat label="Keen" value={likeCount} colors={colors} />
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <Stat label="Nah" value={passCount} colors={colors} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            ABOUT YOU
          </Text>
          <Text style={[styles.bio, { color: colors.foreground }]}>{user.bio}</Text>
        </View>

        <View style={styles.section}>
          <DetailRow
            icon="truck"
            label="The rig"
            value={user.rig}
            colors={colors}
          />
          <DetailRow
            icon="sun"
            label="Weekend move"
            value={user.weekendMove}
            colors={colors}
          />
          <DetailRow
            icon="coffee"
            label="Brew of choice"
            value={user.brewOfChoice}
            colors={colors}
          />
        </View>

        <Pressable
          onPress={onSignOut}
          style={({ pressed }) => [
            styles.dangerBtn,
            { borderColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Feather name="log-out" size={16} color={colors.destructive} />
          <Text style={[styles.dangerText, { color: colors.destructive }]}>
            Reset profile
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Stat({
  label,
  value,
  colors,
}: {
  label: string;
  value: number;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.detailRow}>
      <View
        style={[styles.detailIcon, { backgroundColor: colors.accent }]}
      >
        <Feather name={icon} size={16} color={colors.foreground} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
          {label}
        </Text>
        <Text style={[styles.detailValue, { color: colors.foreground }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroGradient: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  avatarRing: {
    padding: 4,
    borderRadius: 60,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
  },
  name: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginTop: 14,
  },
  suburb: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginTop: 8,
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
  },
  bio: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 4,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 24,
    marginTop: 28,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  dangerText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
