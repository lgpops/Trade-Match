import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HeightSlider } from "@/components/HeightSlider";
import { TradeBadge } from "@/components/TradeBadge";
import {
  COLLAR_OPTIONS,
  ETHNICITY_OPTIONS,
  HEIGHT_SLIDER_MAX_CM,
  HEIGHT_SLIDER_MIN_CM,
  cmToFeetInches,
  type CollarType,
  type Ethnicity,
} from "@/constants/demographics";
import type { Gender } from "@/constants/seedProfiles";
import { getTradesForCollar, isTradeForCollar, type TradeKey } from "@/constants/trades";
import {
  DEFAULT_DISCOVERY_FILTERS,
  useApp,
  type Mode,
  type ShowMe,
} from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type Step = 0 | 1 | 2 | 3 | 4;
const TOTAL_STEPS = 5;

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Man" },
  { value: "female", label: "Woman" },
];

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
    sub: "After mates across blue or white collar work",
    icon: "users",
  },
];

const REGION_EXAMPLES = [
  "Sydney, Australia",
  "New York, United States",
  "London, United Kingdom",
  "Toronto, Canada",
];

const LEGACY_REGION_PLACEHOLDERS = new Set(["Inner West"]);

const SHOW_OPTIONS: { value: ShowMe; label: string }[] = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "everyone", label: "Everyone" },
];

function defaultShowMeForGender(gender: Gender | null): ShowMe {
  if (gender === "female") return "men";
  if (gender === "male") return "women";
  return "everyone";
}

function formatRegionFromPlace(place: Location.LocationGeocodedAddress): string {
  const locality =
    place.city ||
    place.region ||
    place.subregion ||
    place.district ||
    place.name;
  return [locality, place.country]
    .filter(Boolean)
    .filter((part, index, parts) => parts.indexOf(part) === index)
    .join(", ");
}

export default function Onboarding() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { saveUser } = useApp();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [ethnicity, setEthnicity] = useState<Ethnicity | null>(null);
  const [heightCm, setHeightCm] = useState("175");
  const [collarType, setCollarType] = useState<CollarType>("blue");
  const [region, setRegion] = useState("");
  const [trade, setTrade] = useState<TradeKey | null>(null);
  const [customJobTitle, setCustomJobTitle] = useState("");
  const [years, setYears] = useState("");
  const [mode, setMode] = useState<Mode>("dating");
  const [showMe, setShowMe] = useState<ShowMe>("everyone");
  const [bio, setBio] = useState("");
  const [rig, setRig] = useState("");
  const [weekendMove, setWeekendMove] = useState("");
  const [brewOfChoice, setBrewOfChoice] = useState("");

  useEffect(() => {
    if (LEGACY_REGION_PLACEHOLDERS.has(region.trim())) {
      setRegion("");
    }
    if (step === 2) {
      setShowMe(mode === "mates" ? "everyone" : defaultShowMeForGender(gender));
    }
  }, [gender, mode, region, step]);

  const setGenderAndDefaultPreference = (nextGender: Gender) => {
    setGender(nextGender);
    if (mode === "dating") {
      setShowMe(defaultShowMeForGender(nextGender));
    }
  };

  const setModeAndDefaultPreference = (nextMode: Mode) => {
    setMode(nextMode);
    setShowMe(nextMode === "mates" ? "everyone" : defaultShowMeForGender(gender));
  };

  const canContinue = useMemo(() => {
    if (step === 0) {
      return (
        name.trim().length > 0 &&
        Number(age) >= 18 &&
        !!gender &&
        !!ethnicity &&
        Number(heightCm) >= 140
      );
    }
    if (step === 1) {
      return (
        !!trade &&
        Number(years) >= 0 &&
        region.trim().length > 0 &&
        (trade !== "other" || customJobTitle.trim().length > 0)
      );
    }
    if (step === 2) return !!mode && !!showMe;
    if (step === 3) return bio.trim().length >= 10;
    return true;
  }, [
    step,
    name,
    age,
    gender,
    ethnicity,
    heightCm,
    trade,
    years,
    region,
    customJobTitle,
    mode,
    showMe,
    bio,
  ]);

  const onNext = async () => {
    if (step < 4) {
      setStep((s) => (s + 1) as Step);
      return;
    }
    if (!trade || !gender || !ethnicity) return;
    await saveUser({
      name: name.trim(),
      age: Number(age),
      gender,
      collarType,
      ethnicity,
      heightCm: Number(heightCm),
      trade,
      customJobTitle: trade === "other" ? customJobTitle.trim() : undefined,
      yearsOnTools: Number(years || 0),
      region: region.trim(),
      bio: bio.trim(),
      rig: rig.trim(),
      weekendMove: weekendMove.trim(),
      brewOfChoice: brewOfChoice.trim(),
      mode,
      showMe,
      filters: DEFAULT_DISCOVERY_FILTERS,
    });
  };

  const onBack = () => {
    if (step === 0) return;
    setStep((s) => (s - 1) as Step);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.background]}
        locations={[0, 0.45]}
        style={[StyleSheet.absoluteFill, { opacity: 0.18 }]}
      />

      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable
          onPress={onBack}
          disabled={step === 0}
          style={[styles.backBtn, { opacity: step === 0 ? 0 : 1 }]}
          hitSlop={12}
        >
          <Feather name="chevron-left" size={26} color={colors.foreground} />
        </Pressable>
        <View style={styles.progressTrack}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                {
                  backgroundColor: i <= step ? colors.primary : colors.border,
                  width: i === step ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAwareScrollView
        bottomOffset={80}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>
          {step === 0 && (
            <Step0
              colors={colors}
              name={name}
              setName={setName}
              age={age}
              setAge={setAge}
              gender={gender}
              setGender={setGenderAndDefaultPreference}
              ethnicity={ethnicity}
              setEthnicity={setEthnicity}
              heightCm={heightCm}
              setHeightCm={setHeightCm}
            />
          )}
          {step === 1 && (
            <Step1
              colors={colors}
              trade={trade}
              setTrade={setTrade}
              collarType={collarType}
              setCollarType={(nextCollar) => {
                setCollarType(nextCollar);
                if (trade && !isTradeForCollar(trade, nextCollar)) {
                  setTrade(null);
                  setCustomJobTitle("");
                }
              }}
              customJobTitle={customJobTitle}
              setCustomJobTitle={setCustomJobTitle}
              years={years}
              setYears={setYears}
              region={region}
              setRegion={setRegion}
            />
          )}
          {step === 2 && (
            <Step2
              colors={colors}
              mode={mode}
              setMode={setModeAndDefaultPreference}
              showMe={showMe}
              setShowMe={setShowMe}
              gender={gender}
            />
          )}
          {step === 3 && <Step3 colors={colors} bio={bio} setBio={setBio} />}
          {step === 4 && (
            <Step4
              colors={colors}
              rig={rig}
              setRig={setRig}
              weekendMove={weekendMove}
              setWeekendMove={setWeekendMove}
              brewOfChoice={brewOfChoice}
              setBrewOfChoice={setBrewOfChoice}
            />
          )}
        </View>
      </KeyboardAwareScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: bottomInset + 16,
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={onNext}
          disabled={!canContinue}
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: canContinue ? colors.primary : colors.muted,
            },
            pressed && canContinue && { opacity: 0.85 },
          ]}
        >
          <Text
            style={[
              styles.ctaText,
              { color: canContinue ? "#FFFFFF" : colors.mutedForeground },
            ]}
          >
            {step === 4 ? "Start matching" : "Continue"}
          </Text>
          <Feather
            name="arrow-right"
            size={18}
            color={canContinue ? "#FFFFFF" : colors.mutedForeground}
          />
        </Pressable>
      </View>
    </View>
  );
}

function Heading({
  eyebrow,
  title,
  sub,
  colors,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={{ gap: 8, marginBottom: 24 }}>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.sub, { color: colors.mutedForeground }]}>{sub}</Text>
    </View>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={{ gap: 8 }}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      {children}
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  const colors = useColors();
  return (
    <TextInput
      placeholderTextColor={colors.mutedForeground}
      {...props}
      style={[
        styles.input,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          color: colors.foreground,
        },
        props.multiline && { minHeight: 120, textAlignVertical: "top" },
        props.style,
      ]}
    />
  );
}

function Step0({
  colors,
  name,
  setName,
  age,
  setAge,
  gender,
  setGender,
  ethnicity,
  setEthnicity,
  heightCm,
  setHeightCm,
}: {
  colors: ReturnType<typeof useColors>;
  name: string;
  setName: (s: string) => void;
  age: string;
  setAge: (s: string) => void;
  gender: Gender | null;
  setGender: (g: Gender) => void;
  ethnicity: Ethnicity | null;
  setEthnicity: (e: Ethnicity) => void;
  heightCm: string;
  setHeightCm: (s: string) => void;
}) {
  const parsedHeight = Number(heightCm);
  const { feet, inches } = cmToFeetInches(Number.isFinite(parsedHeight) ? parsedHeight : 0);
  return (
    <View style={{ gap: 18 }}>
      <Heading
        eyebrow="STEP 1 OF 5"
        title="G'day, what's your name?"
        sub="The basics. Real name, real age. We're a no-bullshit kind of crew."
        colors={colors}
      />
      <Field label="Your name">
        <Input
          value={name}
          onChangeText={setName}
          placeholder="Jack"
          autoCapitalize="words"
          maxLength={30}
        />
      </Field>
      <Field label="Age">
        <Input
          value={age}
          onChangeText={(t) => setAge(t.replace(/[^0-9]/g, "").slice(0, 2))}
          placeholder="28"
          keyboardType="number-pad"
          maxLength={2}
        />
      </Field>
      <Field label="I am a">
        <View style={styles.segments}>
          {GENDER_OPTIONS.map((g) => {
            const selected = gender === g.value;
            return (
              <Pressable
                key={g.value}
                onPress={() => setGender(g.value)}
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
                  {g.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Field>
      <Field label="Ethnicity">
        <View style={styles.wrapSegments}>
          {ETHNICITY_OPTIONS.map((option) => {
            const selected = ethnicity === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setEthnicity(option.value)}
                style={({ pressed }) => [
                  styles.optionChip,
                  {
                    backgroundColor: selected ? colors.primary : colors.card,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    { color: selected ? "#FFFFFF" : colors.foreground },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Field>
      <Field label="Height">
        <View
          style={[
            styles.heightSliderCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <HeightSlider
            label="Your height"
            value={parsedHeight}
            min={HEIGHT_SLIDER_MIN_CM}
            max={HEIGHT_SLIDER_MAX_CM}
            onChange={(value) => setHeightCm(String(value))}
          />
        </View>
        <Text style={[styles.fieldHint, { color: colors.mutedForeground }]}>
          Equivalent to {feet} ft {inches} in.
        </Text>
      </Field>
    </View>
  );
}

function Step1({
  colors,
  trade,
  setTrade,
  collarType,
  setCollarType,
  customJobTitle,
  setCustomJobTitle,
  years,
  setYears,
  region,
  setRegion,
}: {
  colors: ReturnType<typeof useColors>;
  trade: TradeKey | null;
  setTrade: (t: TradeKey) => void;
  collarType: CollarType;
  setCollarType: (c: CollarType) => void;
  customJobTitle: string;
  setCustomJobTitle: (s: string) => void;
  years: string;
  setYears: (s: string) => void;
  region: string;
  setRegion: (s: string) => void;
}) {
  const tradeOptions = getTradesForCollar(collarType);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const useCurrentLocation = async () => {
    try {
      setLocationError("");
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Location permission was not granted.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      const [place] = await Location.reverseGeocodeAsync(position.coords);
      const resolvedRegion = [
        place?.district,
        place?.city,
        place?.region,
        place?.country,
      ]
        .filter(Boolean)
        .filter((part, index, arr) => arr.indexOf(part) === index)
        .slice(0, 2)
        .join(", ");
      if (resolvedRegion) {
        setRegion(resolvedRegion);
      } else {
        setLocationError("Could not identify your region from this location.");
      }
    } catch {
      setLocationError("Could not fetch your current location.");
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={{ gap: 18 }}>
      <Heading
        eyebrow="STEP 2 OF 5"
        title="What's your collar?"
        sub="Red Collar is for blue-collar and white-collar people. Pick what fits your work."
        colors={colors}
      />
      <Field label="Collar type">
        <View style={{ gap: 10 }}>
          {COLLAR_OPTIONS.map((option) => {
            const selected = collarType === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setCollarType(option.value)}
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
                      backgroundColor: selected ? colors.primary : colors.secondary,
                    },
                  ]}
                >
                  <Feather
                    name={option.value === "blue" ? "tool" : "briefcase"}
                    size={18}
                    color={selected ? "#FFFFFF" : colors.foreground}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modeLabel, { color: colors.foreground }]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.modeSub, { color: colors.mutedForeground }]}>
                    {option.sub}
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
                  {selected ? <Feather name="check" size={12} color="#FFFFFF" /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </Field>
      <Field label="Work / industry">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 12 }}
        >
          {tradeOptions.map((t) => {
            const selected = t.key === trade;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTrade(t.key)}
                style={({ pressed }) => [
                  styles.tradeChip,
                  {
                    backgroundColor: selected ? t.color : colors.card,
                    borderColor: selected ? t.color : colors.border,
                  },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text
                  style={[
                    styles.tradeChipText,
                    { color: selected ? "#FFFFFF" : colors.foreground },
                  ]}
                >
                  {t.nickname}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Field>
      {trade && (
        <View style={{ alignItems: "flex-start", marginTop: -4 }}>
          <TradeBadge
            job={trade}
            customJobTitle={trade === "other" ? customJobTitle || "Other" : undefined}
            size="md"
          />
        </View>
      )}
      {trade === "other" && (
        <Field label="Your job title">
          <Input
            value={customJobTitle}
            onChangeText={setCustomJobTitle}
            placeholder={collarType === "blue" ? "Scaffolder" : "Product manager"}
            autoCapitalize="words"
            maxLength={40}
          />
        </Field>
      )}
      <Field label="Years experience">
        <Input
          value={years}
          onChangeText={(t) => setYears(t.replace(/[^0-9]/g, "").slice(0, 2))}
          placeholder="8"
          keyboardType="number-pad"
          maxLength={2}
        />
      </Field>
      <Field label="Region">
        <Input
          value={region}
          onChangeText={setRegion}
          placeholder="City, region or area"
          autoCapitalize="words"
        />
        <Pressable
          onPress={useCurrentLocation}
          disabled={locating}
          style={({ pressed }) => [
            styles.locationButton,
            { borderColor: colors.border, backgroundColor: colors.card },
            (pressed || locating) && { opacity: 0.75 },
          ]}
        >
          <Feather name="map-pin" size={16} color={colors.primary} />
          <Text style={[styles.locationButtonText, { color: colors.primary }]}>
            {locating ? "Finding your region..." : "Use current location"}
          </Text>
        </Pressable>
        {locationError ? (
          <Text style={[styles.fieldHint, { color: colors.destructive }]}>
            {locationError}
          </Text>
        ) : (
          <Text style={[styles.fieldHint, { color: colors.mutedForeground }]}>
            Type a region or share your phone location to fill this automatically.
          </Text>
        )}
        <View style={styles.regionExamples}>
          {REGION_EXAMPLES.map((example) => (
            <Pressable
              key={example}
              onPress={() => setRegion(example)}
              style={({ pressed }) => [
                styles.optionChip,
                {
                  backgroundColor: region === example ? colors.primary : colors.card,
                  borderColor: region === example ? colors.primary : colors.border,
                },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text
                style={[
                  styles.optionChipText,
                  { color: region === example ? "#FFFFFF" : colors.foreground },
                ]}
              >
                {example}
              </Text>
            </Pressable>
          ))}
        </View>
      </Field>
    </View>
  );
}

function Step2({
  colors,
  mode,
  setMode,
  showMe,
  setShowMe,
  gender,
}: {
  colors: ReturnType<typeof useColors>;
  mode: Mode;
  setMode: (m: Mode) => void;
  showMe: ShowMe;
  setShowMe: (s: ShowMe) => void;
  gender: Gender | null;
}) {
  React.useEffect(() => {
    if (mode === "dating") {
      setShowMe(defaultShowMeForGender(gender));
    } else {
      setShowMe("everyone");
    }
  }, [gender, mode, setShowMe]);

  const selectedShowMe =
    mode === "dating" && showMe === "everyone"
      ? defaultShowMeForGender(gender)
      : showMe;

  return (
    <View style={{ gap: 22 }}>
      <Heading
        eyebrow="STEP 3 OF 5"
        title="What are you here for?"
        sub="You can change this any time from the filters up top."
        colors={colors}
      />

      <Field label="I'm here for">
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
      </Field>

      <Field label="Show me">
        <View style={styles.segments}>
          {SHOW_OPTIONS.map((opt) => {
            const selected = selectedShowMe === opt.value;
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
      </Field>
    </View>
  );
}

function Step3({
  colors,
  bio,
  setBio,
}: {
  colors: ReturnType<typeof useColors>;
  bio: string;
  setBio: (s: string) => void;
}) {
  return (
    <View style={{ gap: 18 }}>
      <Heading
        eyebrow="STEP 4 OF 5"
        title="Sell yourself"
        sub="A few honest lines beats a list of hobbies. Tell them who they're getting."
        colors={colors}
      />
      <Field label="Your bio">
        <Input
          value={bio}
          onChangeText={setBio}
          placeholder="What you do, what you love, what you're after."
          multiline
          maxLength={280}
        />
      </Field>
      <Text
        style={{
          color: colors.mutedForeground,
          fontSize: 12,
          fontFamily: "Inter_500Medium",
          textAlign: "right",
        }}
      >
        {bio.length} / 280
      </Text>
    </View>
  );
}

function Step4({
  colors,
  rig,
  setRig,
  weekendMove,
  setWeekendMove,
  brewOfChoice,
  setBrewOfChoice,
}: {
  colors: ReturnType<typeof useColors>;
  rig: string;
  setRig: (s: string) => void;
  weekendMove: string;
  setWeekendMove: (s: string) => void;
  brewOfChoice: string;
  setBrewOfChoice: (s: string) => void;
}) {
  return (
    <View style={{ gap: 18 }}>
      <Heading
        eyebrow="STEP 5 OF 5"
        title="The little things"
        sub="Optional, but the good stuff. Skip if you're keen to crack on."
        colors={colors}
      />
      <Field label="The rig">
        <Input
          value={rig}
          onChangeText={setRig}
          placeholder="Twin cab HiLux, white"
        />
      </Field>
      <Field label="Weekend move">
        <Input
          value={weekendMove}
          onChangeText={setWeekendMove}
          placeholder="Surf at sunrise, beers by lunch"
        />
      </Field>
      <Field label="Brew of choice">
        <Input
          value={brewOfChoice}
          onChangeText={setBrewOfChoice}
          placeholder="Cold one after knock-off"
        />
      </Field>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: { width: 26 },
  progressTrack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  eyebrow: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  sub: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  tradeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  tradeChipText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
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
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  optionChipText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  heightSliderCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  fieldHint: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  locationButtonText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  regionExamples: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  ctaText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
