import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { TradeBadge } from "@/components/TradeBadge";
import { useApp, type Match } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function MatchesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { matches, messages } = useApp();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 + 20 : 84 + insets.bottom;

  const newMatches = matches.filter((m) => {
    const has = messages.some((msg) => msg.matchId === m.id);
    return !has;
  });
  const conversations = matches.filter((m) =>
    messages.some((msg) => msg.matchId === m.id),
  );

  if (matches.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: topInset },
        ]}
      >
        <Header colors={colors} title="Matches" />
        <EmptyState
          icon="message-circle"
          title="No matches yet"
          body="Head back to Discover and start swiping. Once both of you are keen, you'll see them here."
          ctaLabel="Back to Discover"
          onCtaPress={() => router.replace("/(tabs)")}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: topInset },
      ]}
    >
      <Header colors={colors} title="Matches" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {newMatches.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              NEW · {newMatches.length}
            </Text>
            <FlatList
              data={newMatches}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(m) => m.id}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => router.push(`/chat/${item.id}` as never)}
                  style={({ pressed }) => [
                    styles.newCard,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Image
                    source={item.profile.photo}
                    style={styles.newPhoto}
                    contentFit="cover"
                  />
                  <View style={styles.newOverlay}>
                    <Text style={styles.newName} numberOfLines={1}>
                      {item.profile.name}
                    </Text>
                    <TradeBadge trade={item.profile.trade} size="sm" />
                  </View>
                </Pressable>
              )}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            CHATS
          </Text>
          {conversations.length === 0 ? (
            <Text
              style={[
                styles.hint,
                { color: colors.mutedForeground },
              ]}
            >
              Tap a new match above to break the ice.
            </Text>
          ) : (
            conversations.map((m) => (
              <ConversationRow
                key={m.id}
                match={m}
                lastMessage={
                  messages
                    .filter((msg) => msg.matchId === m.id)
                    .sort((a, b) => b.createdAt - a.createdAt)[0]
                }
                unread={messages.some(
                  (msg) =>
                    msg.matchId === m.id && !msg.fromMe && msg.createdAt > m.lastReadAt,
                )}
                colors={colors}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Header({
  colors,
  title,
}: {
  colors: ReturnType<typeof useColors>;
  title: string;
}) {
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
    </View>
  );
}

function ConversationRow({
  match,
  lastMessage,
  unread,
  colors,
}: {
  match: Match;
  lastMessage: { text: string; fromMe: boolean; createdAt: number } | undefined;
  unread: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable
      onPress={() => router.push(`/chat/${match.id}` as never)}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.border },
        pressed && { backgroundColor: colors.secondary },
      ]}
    >
      <Image
        source={match.profile.photo}
        style={styles.rowAvatar}
        contentFit="cover"
      />
      <View style={{ flex: 1, gap: 4 }}>
        <View style={styles.rowTop}>
          <Text style={[styles.rowName, { color: colors.foreground }]}>
            {match.profile.name}
          </Text>
          <TradeBadge trade={match.profile.trade} size="sm" />
        </View>
        <Text
          style={[
            styles.rowPreview,
            {
              color: unread ? colors.foreground : colors.mutedForeground,
              fontFamily: unread ? "Inter_600SemiBold" : "Inter_400Regular",
            },
          ]}
          numberOfLines={1}
        >
          {lastMessage
            ? `${lastMessage.fromMe ? "You: " : ""}${lastMessage.text}`
            : "Say g'day"}
        </Text>
      </View>
      {unread ? (
        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
      ) : (
        <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  title: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.8,
  },
  section: {
    marginTop: 16,
    gap: 10,
  },
  sectionTitle: {
    paddingHorizontal: 24,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
  },
  hint: {
    paddingHorizontal: 24,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  newCard: {
    width: 130,
    height: 170,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  newPhoto: { width: "100%", height: "100%" },
  newOverlay: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 8,
    gap: 6,
  },
  newName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowRadius: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowAvatar: { width: 56, height: 56, borderRadius: 28 },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  rowPreview: {
    fontSize: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
