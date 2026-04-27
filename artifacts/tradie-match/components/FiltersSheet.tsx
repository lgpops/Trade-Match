import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  useApp,
  type Mode,
  type ShowMe,
} from "@/context/AppContext";
import { TRADES, type TradeKey } from "@/constants/trades";
import { useColors } from "@/hooks/useColors";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const MODE_OPTIONS: {
  value: Mode;
  label: string;
  sub: string;
  icon: keyof typeof Feather.glyphMap;
}[] = [
  {
    value: "dating",
    label: "Dating",
    sub: "Just looking for love",
    icon: "heart",
  },
  {
    value: "mates",
    label: "Mateship",
    sub: "After mates on the tools",
    icon: "users",
  },
];

const SHOW_OPTIONS: { value: ShowMe; label: string }[] = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "everyone", label: "Everyone" },
];

export function FiltersSheet({ visible, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updatePrefs } = useApp();

  const [mode, setMode] = useState<Mode>(user?.mode ?? "dating");
  const [showMe, setShowMe] = useState<ShowMe>(user?.showMe ?? "everyone");
  const [filterTrades, setFilterTrades] = useState<TradeKey[]>(
    user?.filterTrades ?? [],
  );

  React.useEffect(() => {
    if (visible && user) {
      setMode(user.mode);
      setShowMe(user.showMe);
      setFilterTrades(user.filterTrades ?? []);
    }
  }, [visible, user]);

  const toggleTrade = (key: TradeKey) => {
    setFilterTrades((curr) =>
      curr.includes(key) ? curr.filter((k) => k !== key) : [...curr, key],
    );
  };

  const onSave = async () => {
    await updatePrefs({ mode, showMe, filterTrades });
    onClose();
  };

  const activeFiltersCount =
    (mode !== (user?.mode ?? "dating") ? 1 : 0) +
    (showMe !== (user?.showMe ?? "everyone") ? 1 : 0) +
    filterTrades.length;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <Pressable style={styles.backdropTap} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Filters
            </Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 22, paddingBottom: 8 }}
          >
            {/* I'm here for */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                I&apos;M HERE FOR
              </Text>
              <View style={{ gap: 10 }}>
                {MODE_OPTIONS.map((opt) => {
                  const selected = mode === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => setMode(opt.value)}
                      style={({ pressed }) => [
                        styles.modeCard,
                        {
                          backgroundColor: selected ? colors.accent : colors.card,
                          borderColor: selected ? colors.primary : colors.border,
                        },
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <View
                        style={[
                          styles.modeIcon,
                          {
                            backgroundColor: selected
                              ? colors.primary
                              : colors.secondary,
                          },
                        ]}
                      >
                        <Feather
                          name={opt.icon}
                          size={18}
                          color={selected ? "#FFFFFF" : colors.foreground}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.modeLabel, { color: colors.foreground }]}
                        >
                          {opt.label}
                        </Text>
                        <Text
                          style={[styles.modeSub, { color: colors.mutedForeground }]}
                        >
                          {opt.sub}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.radio,
                          {
                            borderColor: selected ? colors.primary : colors.border,
                            backgroundColor: selected ? colors.primary : "transparent",
                          },
                        ]}
                      >
                        {selected ? (
                          <Feather name="check" size={12} color="#FFFFFF" />
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Show me */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                SHOW ME
              </Text>
              <View style={styles.segments}>
                {SHOW_OPTIONS.map((opt) => {
                  const selected = showMe === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => setShowMe(opt.value)}
                      style={({ pressed }) => [
                        styles.segment,
                        {
                          backgroundColor: selected ? colors.primary : colors.card,
                          borderColor: selected ? colors.primary : colors.border,
                        },
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          { color: selected ? "#FFFFFF" : colors.foreground },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Collar / Trade multi-select */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                  COLLAR TYPE
                </Text>
                {filterTrades.length > 0 && (
                  <Pressable onPress={() => setFilterTrades([])} hitSlop={8}>
                    <Text style={[styles.clearText, { color: colors.primary }]}>
                      Clear ({filterTrades.length})
                    </Text>
                  </Pressable>
                )}
              </View>
              <Text style={[styles.tradeHint, { color: colors.mutedForeground }]}>
                {filterTrades.length === 0
                  ? "Showing all collar types"
                  : `Showing ${filterTrades.length} selected`}
              </Text>
              <View style={styles.tradeGrid}>
                {TRADES.map((t) => {
                  const selected = filterTrades.includes(t.key);
                  return (
                    <Pressable
                      key={t.key}
                      onPress={() => toggleTrade(t.key)}
                      style={({ pressed }) => [
                        styles.tradeChip,
                        {
                          backgroundColor: selected ? t.color : colors.card,
                          borderColor: selected ? t.color : colors.border,
                        },
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      {selected && (
                        <Feather name="check" size={11} color="#FFFFFF" />
                      )}
                      <Text
                        style={[
                          styles.tradeChipText,
                          { color: selected ? "#FFFFFF" : colors.foreground },
                        ]}
                        numberOfLines={1}
                      >
                        {t.nickname}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <Pressable
            onPress={onSave}
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.saveText}>
              Apply{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end" },
  backdropTap: { flex: 1 },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 8,
    maxHeight: "85%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignSelf: "center",
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.4,
  },
  section: { gap: 12 },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
  },
  clearText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  tradeHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: -4,
  },
  modeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  modeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modeLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  modeSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  segments: {
    flexDirection: "row",
    gap: 8,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
  },
  segmentText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  tradeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tradeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  tradeChipText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 16,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
