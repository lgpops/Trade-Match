import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TradeBadge } from "@/components/TradeBadge";
import { useApp, type Message } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const ICEBREAKERS = [
  "Oi, what site you on this week?",
  "Beers Friday after knock-off?",
  "Worst job you've ever quoted?",
];

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { matches, messages, sendMessage, markMatchRead } = useApp();
  const [text, setText] = useState("");
  const listRef = useRef<FlatList<Message>>(null);

  const match = matches.find((m) => m.id === id);

  const data = useMemo(
    () =>
      messages
        .filter((m) => m.matchId === id)
        .sort((a, b) => b.createdAt - a.createdAt),
    [messages, id],
  );

  useEffect(() => {
    if (match) markMatchRead(match.id);
  }, [match, markMatchRead]);

  if (!match) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground, padding: 24 }}>
          Match not found
        </Text>
      </View>
    );
  }

  const onSend = (override?: string) => {
    const t = override ?? text;
    if (!t.trim()) return;
    sendMessage(match.id, t);
    setText("");
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={0}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: topInset + 8,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Feather name="chevron-left" size={26} color={colors.foreground} />
        </Pressable>
        <Image
          source={match.profile.photo}
          style={styles.avatar}
          contentFit="cover"
        />
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerName, { color: colors.foreground }]}>
            {match.profile.name}
          </Text>
          <Text
            style={[styles.headerSub, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {match.profile.suburb} · {match.profile.distanceKm} km away
          </Text>
        </View>
        <TradeBadge trade={match.profile.trade} size="sm" />
      </View>

      <FlatList
        ref={listRef}
        data={data}
        inverted
        keyExtractor={(m) => m.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 16,
        }}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => <Bubble message={item} colors={colors} />}
        ListFooterComponent={
          data.length === 0 ? (
            <View style={styles.intro}>
              <View
                style={[styles.introCard, { backgroundColor: colors.accent }]}
              >
                <Feather name="zap" size={20} color={colors.primary} />
                <Text
                  style={[
                    styles.introTitle,
                    { color: colors.foreground },
                  ]}
                >
                  You matched with {match.profile.name}
                </Text>
                <Text
                  style={[
                    styles.introBody,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Try one of these to get the ball rolling
                </Text>
              </View>
              <View style={{ gap: 8, marginTop: 12 }}>
                {ICEBREAKERS.map((line) => (
                  <Pressable
                    key={line}
                    onPress={() => onSend(line)}
                    style={({ pressed }) => [
                      styles.iceCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.iceText,
                        { color: colors.foreground },
                      ]}
                    >
                      {line}
                    </Text>
                    <Feather
                      name="send"
                      size={14}
                      color={colors.mutedForeground}
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null
        }
      />

      <View
        style={[
          styles.composer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 10,
          },
        ]}
      >
        <View
          style={[
            styles.inputWrap,
            { backgroundColor: colors.secondary },
          ]}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Send a message"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            multiline
          />
        </View>
        <Pressable
          onPress={() => onSend()}
          disabled={!text.trim()}
          style={({ pressed }) => [
            styles.sendBtn,
            {
              backgroundColor: text.trim() ? colors.primary : colors.muted,
            },
            pressed && text.trim() && { opacity: 0.85 },
          ]}
        >
          <Feather
            name="send"
            size={18}
            color={text.trim() ? "#FFFFFF" : colors.mutedForeground}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function Bubble({
  message,
  colors,
}: {
  message: Message;
  colors: ReturnType<typeof useColors>;
}) {
  const mine = message.fromMe;
  return (
    <View
      style={[
        styles.bubbleRow,
        { justifyContent: mine ? "flex-end" : "flex-start" },
      ]}
    >
      <View
        style={[
          styles.bubble,
          mine
            ? { backgroundColor: colors.primary, borderBottomRightRadius: 6 }
            : {
                backgroundColor: colors.card,
                borderBottomLeftRadius: 6,
                borderColor: colors.border,
                borderWidth: StyleSheet.hairlineWidth,
              },
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            { color: mine ? "#FFFFFF" : colors.foreground },
          ]}
        >
          {message.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 4 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  headerName: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginTop: 1,
  },
  intro: {
    alignItems: "stretch",
    paddingVertical: 12,
  },
  introCard: {
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    gap: 8,
  },
  introTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  introBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  iceCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  iceText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    flex: 1,
    paddingRight: 12,
  },
  bubbleRow: {
    flexDirection: "row",
    marginVertical: 4,
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputWrap: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 4,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: "center",
  },
  input: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
