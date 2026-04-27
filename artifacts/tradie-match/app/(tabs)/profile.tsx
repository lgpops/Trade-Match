import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  formatCollarType,
  formatEthnicity,
  formatHeight,
  HEIGHT_SLIDER_MAX_CM,
  HEIGHT_SLIDER_MIN_CM,
} from "@/constants/demographics";
import { getTrade } from "@/constants/trades";
import { HeightSlider } from "@/components/HeightSlider";
import { TradeBadge } from "@/components/TradeBadge";
import { useApp } from "@/context/AppContext";
import type { UserMedia, UserProfile } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const MAX_EXTRA_MEDIA = 5;

const COLLAR_LABELS: Record<CollarType, string> = {
  blue: "Blue collar",
  white: "White collar",
};

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, matches, decisions, resetUser, saveUser } = useApp();
  const [editVisible, setEditVisible] = React.useState(false);
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 + 20 : 84 + insets.bottom;

  if (!user) return null;
  const trade = getTrade(user.trade);
  const likeCount = Object.values(decisions).filter((d) => d === "like").length;
  const passCount = Object.values(decisions).filter((d) => d === "pass").length;

  const onSignOut = () => {
    if (Platform.OS === "web") {
      void signOut();
      return;
    }
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: () => void signOut(),
        },
      ],
    );
  };

  const onResetProfile = () => {
    if (Platform.OS === "web") {
      void resetUser();
      return;
    }
    Alert.alert(
      "Reset profile",
      "This will clear your profile, swipes and matches. You'll stay signed in.",
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
                {
                  backgroundColor: colors.card,
                  borderColor: colors.background,
                },
              ]}
            >
              {user.profilePhotoUri ? (
                <Image
                  source={{ uri: user.profilePhotoUri }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <Feather name="user" size={42} color={colors.mutedForeground} />
              )}
            </View>
          </View>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {user.name}, {user.age}
          </Text>
          <View style={{ marginTop: 8 }}>
<<<<<<< HEAD
<<<<<<< HEAD
            <TradeBadge job={user.trade} customJobTitle={user.customJobTitle} size="lg" />
=======
            <TradeBadge
              trade={user.trade}
              size="lg"
              customLabel={
                user.trade === "red_collar" && user.jobTitle
                  ? user.jobTitle
                  : undefined
              }
            />
>>>>>>> cursor/red-collar-job-title-love-ca07
=======
            <TradeBadge job={user.trade} customJobTitle={user.customJobTitle} size="lg" />
>>>>>>> 86bc71ba47104bb273cfbbd6fcb9b043dd022ef9
          </View>
          <Text style={[styles.region, { color: colors.mutedForeground }]}>
            {user.region} · {formatCollarType(user.collarType)}
          </Text>
          <Text style={[styles.region, { color: colors.mutedForeground }]}>
            {user.yearsOnTools} yrs experience · {formatHeight(user.heightCm)}
          </Text>
          <Pressable
            onPress={() => setEditVisible(true)}
            style={({ pressed }) => [
              styles.editBtn,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Feather name="edit-2" size={15} color="#FFFFFF" />
            <Text style={styles.editBtnText}>Edit profile</Text>
          </Pressable>
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
          <Text
            style={[styles.sectionLabel, { color: colors.mutedForeground }]}
          >
            ABOUT YOU
          </Text>
          <Text style={[styles.bio, { color: colors.foreground }]}>
            {user.bio}
          </Text>
        </View>

        {user.media.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              PHOTOS
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mediaRow}
            >
              {user.media.map((item) => (
                <View key={item.id} style={styles.mediaTile}>
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.mediaImage}
                    contentFit="cover"
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.section}>
          <DetailRow
            icon="briefcase"
            label="Collar type"
            value={formatCollarType(user.collarType)}
            colors={colors}
          />
          <DetailRow
            icon="briefcase"
            label="Job title"
            value={user.customJobTitle ?? trade.name}
            colors={colors}
          />
          <DetailRow
            icon="globe"
            label="Ethnicity"
            value={formatEthnicity(user.ethnicity)}
            colors={colors}
          />
          <DetailRow
            icon="maximize-2"
            label="Height"
            value={formatHeight(user.heightCm)}
            colors={colors}
          />
          {user.rig.trim() ? (
            <DetailRow
              icon="truck"
              label="The rig"
              value={user.rig}
              colors={colors}
            />
          ) : null}
          {user.weekendMove.trim() ? (
            <DetailRow
              icon="sun"
              label="Weekend move"
              value={user.weekendMove}
              colors={colors}
            />
          ) : null}
          {user.brewOfChoice.trim() ? (
            <DetailRow
              icon="coffee"
              label="Brew of choice"
              value={user.brewOfChoice}
              colors={colors}
            />
          ) : null}
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
            Sign out
          </Text>
        </Pressable>

        <Pressable
          onPress={onResetProfile}
          style={({ pressed }) => [
            styles.dangerBtn,
            { borderColor: colors.border, marginTop: 10 },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Feather name="trash-2" size={16} color={colors.mutedForeground} />
          <Text style={[styles.dangerText, { color: colors.mutedForeground }]}>
            Reset profile
          </Text>
        </Pressable>
      </ScrollView>
      <EditProfileModal
        visible={editVisible}
        user={user}
        onClose={() => setEditVisible(false)}
        onSave={async (next) => {
          await saveUser(next);
          setEditVisible(false);
        }}
      />
    </View>
  );
}

function EditProfileModal({
  visible,
  user,
  onClose,
  onSave,
}: {
  visible: boolean;
  user: UserProfile;
  onClose: () => void;
  onSave: (user: UserProfile) => Promise<void>;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = React.useState(user);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (visible) setDraft(user);
  }, [visible, user]);

  const setField = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const pickProfilePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) {
      setField("profilePhotoUri", result.assets[0]?.uri);
    }
  };

  const addMedia = async () => {
    if (draft.media.length >= MAX_EXTRA_MEDIA) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.85,
        allowsMultipleSelection: true,
        selectionLimit: MAX_EXTRA_MEDIA - draft.media.length,
      });
      if (result.canceled) return;
      const nextItems: UserMedia[] = result.assets
        .slice(0, MAX_EXTRA_MEDIA - draft.media.length)
        .map((asset) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          uri: asset.uri,
          type: "image",
        }));
      if (nextItems.length > 0) {
        setField("media", [...draft.media, ...nextItems]);
      }
    } catch {
      Alert.alert("Could not open photos", "Please try selecting photos again.");
    }
  };

  const removeMedia = (id: string) => {
    setField("media", draft.media.filter((item) => item.id !== id));
  };

  const save = async () => {
    if (
      !draft.name.trim() ||
      !draft.region.trim() ||
      !draft.bio.trim() ||
      !draft.profilePhotoUri
    ) {
      return;
    }
    setSaving(true);
    try {
      await onSave({
        ...draft,
        name: draft.name.trim(),
        region: draft.region.trim(),
        bio: draft.bio.trim(),
        customJobTitle: draft.customJobTitle?.trim() || undefined,
        rig: draft.rig.trim(),
        weekendMove: draft.weekendMove.trim(),
        brewOfChoice: draft.brewOfChoice.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
        <Pressable style={styles.modalBackdropTap} onPress={onClose} />
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Edit profile
            </Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalContent}
          >
            <EditField label="Name">
              <EditInput
                value={draft.name}
                onChangeText={(text) => setField("name", text)}
                placeholder="Your name"
              />
            </EditField>
            <EditField label="Age">
              <EditInput
                value={String(draft.age || "")}
                onChangeText={(text) =>
                  setField("age", Number(text.replace(/[^0-9]/g, "").slice(0, 2)))
                }
                keyboardType="number-pad"
                placeholder="28"
              />
            </EditField>
            <EditField label="Profile photo">
              <View style={styles.profilePhotoEditor}>
                <View
                  style={[
                    styles.profilePhotoPreview,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  {draft.profilePhotoUri ? (
                    <Image
                      source={{ uri: draft.profilePhotoUri }}
                      style={styles.profilePhotoImage}
                      contentFit="cover"
                    />
                  ) : (
                    <Feather name="user" size={28} color={colors.mutedForeground} />
                  )}
                </View>
                <View style={{ flex: 1, gap: 8 }}>
                  <Pressable
                    onPress={pickProfilePhoto}
                    style={({ pressed }) => [
                      styles.mediaPickerBtn,
                      { borderColor: colors.border, backgroundColor: colors.card },
                      pressed && { opacity: 0.75 },
                    ]}
                  >
                    <Feather name="image" size={16} color={colors.primary} />
                    <Text style={[styles.mediaPickerText, { color: colors.primary }]}>
                      Choose profile photo
                    </Text>
                  </Pressable>
                  <Text style={[styles.mediaHint, { color: colors.mutedForeground }]}>
                    Required
                  </Text>
                </View>
              </View>
            </EditField>
            <EditField label="Region">
              <EditInput
                value={draft.region}
                onChangeText={(text) => setField("region", text)}
                placeholder="City, region or area"
              />
            </EditField>
            <EditField label="Height">
              <View
                style={[
                  styles.heightSliderCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <HeightSlider
                  label="Your height"
                  value={draft.heightCm}
                  min={HEIGHT_SLIDER_MIN_CM}
                  max={HEIGHT_SLIDER_MAX_CM}
                  onChange={(value) => setField("heightCm", value)}
                />
              </View>
            </EditField>
            <EditField label="Bio">
              <EditInput
                value={draft.bio}
                onChangeText={(text) => setField("bio", text)}
                placeholder="Tell people about yourself"
                multiline
              />
            </EditField>
            <EditField label="Additional photos">
              <Text style={[styles.mediaHint, { color: colors.mutedForeground }]}>
                Add up to 5 extra photos.
              </Text>
              <View style={styles.mediaEditGrid}>
                {draft.media.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.mediaEditTile,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                  >
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.mediaEditImage}
                      contentFit="cover"
                    />
                    <Pressable
                      onPress={() => removeMedia(item.id)}
                      style={styles.removeMediaBtn}
                    >
                      <Feather name="x" size={14} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ))}
                {draft.media.length < MAX_EXTRA_MEDIA ? (
                  <Pressable
                    onPress={addMedia}
                    style={({ pressed }) => [
                      styles.mediaAddTile,
                      { borderColor: colors.border, backgroundColor: colors.card },
                      pressed && { opacity: 0.75 },
                    ]}
                  >
                    <Feather name="plus" size={24} color={colors.primary} />
                    <Text style={[styles.mediaAddText, { color: colors.primary }]}>
                      Add media
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </EditField>
            <EditField label="The rig / work setup (optional)">
              <EditInput
                value={draft.rig}
                onChangeText={(text) => setField("rig", text)}
                placeholder="Leave blank to hide"
              />
            </EditField>
            <EditField label="Weekend move (optional)">
              <EditInput
                value={draft.weekendMove}
                onChangeText={(text) => setField("weekendMove", text)}
                placeholder="Leave blank to hide"
              />
            </EditField>
            <EditField label="Brew of choice (optional)">
              <EditInput
                value={draft.brewOfChoice}
                onChangeText={(text) => setField("brewOfChoice", text)}
                placeholder="Leave blank to hide"
              />
            </EditField>
          </ScrollView>
          <Pressable
            onPress={save}
            disabled={saving}
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: colors.primary },
              (pressed || saving) && { opacity: 0.75 },
            ]}
          >
            <Text style={styles.saveBtnText}>
              {saving ? "Saving..." : "Save changes"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function EditField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={{ gap: 8 }}>
      <Text style={[styles.editFieldLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      {children}
    </View>
  );
}

function EditInput(props: React.ComponentProps<typeof TextInput>) {
  const colors = useColors();
  return (
    <TextInput
      placeholderTextColor={colors.mutedForeground}
      {...props}
      style={[
        styles.editInput,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          color: colors.foreground,
        },
        props.multiline && { minHeight: 110, textAlignVertical: "top" },
        props.style,
      ]}
    />
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
      <Text style={[styles.statValue, { color: colors.foreground }]}>
        {value}
      </Text>
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
      <View style={[styles.detailIcon, { backgroundColor: colors.accent }]}>
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
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  name: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginTop: 14,
  },
  region: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginTop: 8,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  editBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
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
  mediaRow: {
    gap: 12,
    paddingRight: 24,
  },
  mediaTile: {
    width: 118,
    height: 150,
    borderRadius: 18,
    overflow: "hidden",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
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
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdropTap: {
    flex: 1,
  },
  modalSheet: {
    maxHeight: "92%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 18,
    gap: 18,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.4,
  },
  modalContent: {
    gap: 16,
    paddingBottom: 8,
  },
  editFieldLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  editInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  profilePhotoEditor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  profilePhotoPreview: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  profilePhotoImage: {
    width: "100%",
    height: "100%",
  },
  mediaPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  mediaPickerText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  mediaRemoveText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  mediaEditGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  mediaEditTile: {
    width: 96,
    height: 120,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  mediaEditImage: {
    width: "100%",
    height: "100%",
  },
  removeMediaBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  mediaHint: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  mediaAddTile: {
    width: 96,
    height: 120,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mediaAddText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  heightSliderCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
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
