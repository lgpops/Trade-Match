import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
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

import { TradeBadge } from "@/components/TradeBadge";
import { TRADES, type TradeKey } from "@/constants/trades";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type Step = 0 | 1 | 2 | 3;

export default function Onboarding() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { saveUser } = useApp();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [suburb, setSuburb] = useState("");
  const [trade, setTrade] = useState<TradeKey | null>(null);
  const [years, setYears] = useState("");
  const [bio, setBio] = useState("");
  const [rig, setRig] = useState("");
  const [weekendMove, setWeekendMove] = useState("");
  const [brewOfChoice, setBrewOfChoice] = useState("");

  const canContinue = useMemo(() => {
    if (step === 0) return name.trim().length > 0 && Number(age) >= 18;
    if (step === 1) return !!trade && Number(years) >= 0 && suburb.trim().length > 0;
    if (step === 2) return bio.trim().length >= 10;
    return true;
  }, [step, name, age, trade, years, suburb, bio]);

  const onNext = async () => {
    if (step < 3) {
      setStep((s) => (s + 1) as Step);
      return;
    }
    if (!trade) return;
    await saveUser({
      name: name.trim(),
      age: Number(age),
      trade,
      yearsOnTools: Number(years || 0),
      suburb: suburb.trim(),
      bio: bio.trim(),
      rig: rig.trim() || "Just the work van",
      weekendMove: weekendMove.trim() || "Down at the local",
      brewOfChoice: brewOfChoice.trim() || "Whatever's cold",
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
          {[0, 1, 2, 3].map((i) => (
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
            />
          )}
          {step === 1 && (
            <Step1
              colors={colors}
              trade={trade}
              setTrade={setTrade}
              years={years}
              setYears={setYears}
              suburb={suburb}
              setSuburb={setSuburb}
            />
          )}
          {step === 2 && <Step2 colors={colors} bio={bio} setBio={setBio} />}
          {step === 3 && (
            <Step3
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
            {step === 3 ? "Get on the tools" : "Continue"}
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
}: {
  colors: ReturnType<typeof useColors>;
  name: string;
  setName: (s: string) => void;
  age: string;
  setAge: (s: string) => void;
}) {
  return (
    <View style={{ gap: 18 }}>
      <Heading
        eyebrow="STEP 1 OF 4"
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
    </View>
  );
}

function Step1({
  colors,
  trade,
  setTrade,
  years,
  setYears,
  suburb,
  setSuburb,
}: {
  colors: ReturnType<typeof useColors>;
  trade: TradeKey | null;
  setTrade: (t: TradeKey) => void;
  years: string;
  setYears: (s: string) => void;
  suburb: string;
  setSuburb: (s: string) => void;
}) {
  return (
    <View style={{ gap: 18 }}>
      <Heading
        eyebrow="STEP 2 OF 4"
        title="What's your trade?"
        sub="Pick the one that pays the bills."
        colors={colors}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 12 }}
      >
        {TRADES.map((t) => {
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
      {trade && (
        <View style={{ alignItems: "flex-start", marginTop: -4 }}>
          <TradeBadge trade={trade} size="md" />
        </View>
      )}
      <Field label="Years on the tools">
        <Input
          value={years}
          onChangeText={(t) => setYears(t.replace(/[^0-9]/g, "").slice(0, 2))}
          placeholder="8"
          keyboardType="number-pad"
          maxLength={2}
        />
      </Field>
      <Field label="Suburb">
        <Input
          value={suburb}
          onChangeText={setSuburb}
          placeholder="Marrickville"
          autoCapitalize="words"
        />
      </Field>
    </View>
  );
}

function Step2({
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
        eyebrow="STEP 3 OF 4"
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

function Step3({
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
        eyebrow="STEP 4 OF 4"
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
