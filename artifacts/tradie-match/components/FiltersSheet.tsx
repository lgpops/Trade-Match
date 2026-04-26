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
  COLLAR_FILTER_OPTIONS,
  DEFAULT_MIN_HEIGHT_CM,
  ETHNICITY_FILTER_OPTIONS,
  formatMinHeightPreference,
  formatHeight,
  type CollarPreference,
  type EthnicityPreference,
} from "@/constants/demographics";
import {
  DEFAULT_DISCOVERY_FILTERS,
  useApp,
  type Mode,
  type ShowMe,
} from "@/context/AppContext";
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
    sub: "Looking for someone special",
    icon: "heart",
  },
  {
    value: "mates",
    label: "Mateship",
    sub: "After mates across work and life",
    icon: "users",
  },
];

const SHOW_OPTIONS: { value: ShowMe; label: string }[] = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "everyone", label: "Everyone" },
];

function defaultShowMeForGender(gender: "male" | "female" | undefined): ShowMe {
  if (gender === "female") return "men";
  if (gender === "male") return "women";
  return "everyone";
}

export function FiltersSheet({ visible, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updatePrefs } = useApp();

  const [mode, setMode] = useState<Mode>(user?.mode ?? "dating");
  const [showMe, setShowMe] = useState<ShowMe>(user?.showMe ?? "everyone");
  const [collarPreference, setCollarPreference] =
    useState<CollarPreference>("everyone");
  const [ethnicityPreference, setEthnicityPreference] =
    useState<EthnicityPreference>("everyone");
  const [minHeightCm, setMinHeightCm] = useState(DEFAULT_MIN_HEIGHT_CM);

  React.useEffect(() => {
    if (visible && user) {
      setMode(user.mode);
      setShowMe(user.showMe);
      setCollarPreference(
        user.filters?.collarPreference ??
          DEFAULT_DISCOVERY_FILTERS.collarPreference,
      );
      setEthnicityPreference(
        user.filters?.ethnicityPreference ??
          DEFAULT_DISCOVERY_FILTERS.ethnicityPreference,
      );
      setMinHeightCm(
        user.filters?.minHeightCm ?? DEFAULT_DISCOVERY_FILTERS.minHeightCm,
      );
    }
  }, [visible, user]);

  const onSave = async () => {
    await updatePrefs({
      mode,
      showMe,
      filters: {
        collarPreference,
        ethnicityPreference,
        minHeightCm,
      },
    });
    onClose();
  };

  const adjustMinHeight = (delta: number) => {
    setMinHeightCm((current) => {
      const next = Math.max(DEFAULT_MIN_HEIGHT_CM, current + delta);
      return next;
    });
  };

  const selectMode = (nextMode: Mode) => {
    setMode(nextMode);
    setShowMe(nextMode === "mates" ? "everyone" : defaultShowMeForGender(user?.gender));
  };

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
            contentContainerStyle={styles.scrollContent}
          >
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
                      onPress={() => selectMode(opt.value)}
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
                          style={[
                            styles.modeLabel,
                            { color: colors.foreground },
                          ]}
                        >
                          {opt.label}
                        </Text>
                        <Text
                          style={[
                            styles.modeSub,
                            { color: colors.mutedForeground },
                          ]}
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

            <View style={styles.filterCard}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                SHOW ME
              </Text>
              <View style={styles.segments}>
                {SHOW_OPTIONS.map((opt) => {
                  const selected = showMe === opt.value;
                  return (
                    <Segment
                      key={opt.value}
                      label={opt.label}
                      selected={selected}
                      onPress={() => setShowMe(opt.value)}
                    />
                  );
                })}
              </View>
            </View>

            <View style={styles.filterCard}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                COLLAR TYPE
              </Text>
              <View style={styles.segments}>
                {COLLAR_FILTER_OPTIONS.map((opt) => (
                  <Segment
                    key={opt.value}
                    label={opt.label}
                    selected={collarPreference === opt.value}
                    onPress={() => setCollarPreference(opt.value)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.filterCard}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                ETHNICITY
              </Text>
              <View style={styles.wrapSegments}>
                {ETHNICITY_FILTER_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    selected={ethnicityPreference === opt.value}
                    onPress={() => setEthnicityPreference(opt.value)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.filterCard}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                HEIGHT
              </Text>
              <Text style={[styles.filterSummary, { color: colors.foreground }]}>
                {formatMinHeightPreference(minHeightCm)}
              </Text>
              <View style={[styles.heightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <HeightStepper
                  label="Minimum height"
                  value={formatHeight(minHeightCm)}
                  onDecrease={() => adjustMinHeight(-5)}
                  onIncrease={() => adjustMinHeight(5)}
                />
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
            <Text style={styles.saveText}>Apply</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Segment({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
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
          {
            color: selected ? "#FFFFFF" : colors.foreground,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.card,
          borderColor: selected ? colors.primary : colors.border,
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: selected ? "#FFFFFF" : colors.foreground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function HeightStepper({
  label,
  value,
  onDecrease,
  onIncrease,
}: {
  label: string;
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.heightStepper}>
      <Text style={[styles.heightLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <View style={styles.heightControls}>
        <Pressable
          onPress={onDecrease}
          style={[styles.heightButton, { backgroundColor: colors.secondary }]}
        >
          <Feather name="minus" size={16} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.heightValue, { color: colors.foreground }]}>
          {value}
        </Text>
        <Pressable
          onPress={onIncrease}
          style={[styles.heightButton, { backgroundColor: colors.secondary }]}
        >
          <Feather name="plus" size={16} color={colors.foreground} />
        </Pressable>
      </View>
    </View>
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
    gap: 22,
    maxHeight: "92%",
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
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.4,
  },
  scrollContent: {
    gap: 22,
    paddingBottom: 2,
  },
  section: { gap: 12 },
  filterCard: {
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(215,38,56,0.18)",
    backgroundColor: "rgba(255,255,255,0.58)",
    padding: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
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
  wrapSegments: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  filterSummary: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  heightCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    gap: 14,
  },
  heightStepper: {
    gap: 8,
  },
  heightLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  heightControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  heightButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  heightValue: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
