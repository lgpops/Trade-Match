import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { TradeBadge } from "@/components/TradeBadge";
import type { SeedProfile } from "@/constants/seedProfiles";
import { getTrade } from "@/constants/trades";
import { useColors } from "@/hooks/useColors";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;
const SWIPE_OUT_DURATION = 220;

type Props = {
  profile: SeedProfile;
  isTop: boolean;
  stackOffset: number;
  onSwipe: (dir: "left" | "right") => void;
  onTap: () => void;
};

export function SwipeCard({ profile, isTop, stackOffset, onSwipe, onTap }: Props) {
  const colors = useColors();
  const trade = getTrade(profile.trade);
  const position = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    position.setValue({ x: 0, y: 0 });
  }, [profile.id, position]);

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ["-12deg", "0deg", "12deg"],
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const passOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isTop,
      onMoveShouldSetPanResponder: (_, g) =>
        isTop && (Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5),
      onPanResponderMove: (_, g) => {
        position.setValue({ x: g.dx, y: g.dy });
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: { x: SCREEN_WIDTH * 1.5, y: g.dy },
            duration: SWIPE_OUT_DURATION,
            useNativeDriver: false,
          }).start(() => onSwipe("right"));
        } else if (g.dx < -SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: { x: -SCREEN_WIDTH * 1.5, y: g.dy },
            duration: SWIPE_OUT_DURATION,
            useNativeDriver: false,
          }).start(() => onSwipe("left"));
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  const stackScale = 1 - stackOffset * 0.04;
  const stackTranslate = stackOffset * 12;

  const animatedStyle = isTop
    ? {
        transform: [
          { translateX: position.x },
          { translateY: position.y },
          { rotate },
        ],
      }
    : {
        transform: [{ translateY: stackTranslate }, { scale: stackScale }],
        opacity: 1 - stackOffset * 0.1,
      };

  return (
    <Animated.View
      {...(isTop ? panResponder.panHandlers : {})}
      style={[styles.card, { backgroundColor: colors.card }, animatedStyle]}
    >
      <Image source={profile.photo} style={styles.image} contentFit="cover" />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.0)", "rgba(0,0,0,0.85)"]}
        locations={[0, 0.45, 1]}
        style={styles.gradient}
      />

      {isTop ? (
        <>
          <Animated.View
            style={[styles.stamp, styles.stampLike, { opacity: likeOpacity }]}
          >
            <Text style={styles.stampText}>KEEN</Text>
          </Animated.View>
          <Animated.View
            style={[styles.stamp, styles.stampPass, { opacity: passOpacity }]}
          >
            <Text style={styles.stampText}>NAH</Text>
          </Animated.View>
        </>
      ) : null}

      <View style={styles.info}>
        <View style={styles.row}>
          <TradeBadge trade={profile.trade} size="md" />
          <View style={styles.distance}>
            <Feather name="map-pin" size={12} color="#FFFFFF" />
            <Text style={styles.distanceText}>{profile.distanceKm} km</Text>
          </View>
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {profile.name}, {profile.age}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {profile.yearsOnTools} yrs on the tools · {profile.suburb}
        </Text>
        <Text style={styles.bio} numberOfLines={2}>
          {profile.bio}
        </Text>
        {isTop ? (
          <View style={styles.tapHint}>
            <Feather name="info" size={12} color="rgba(255,255,255,0.85)" />
            <Text
              onPress={onTap}
              style={styles.tapHintText}
              suppressHighlighting
            >
              Tap card for details
            </Text>
          </View>
        ) : null}
      </View>

      <View
        pointerEvents="none"
        style={[
          styles.tradeStripe,
          { backgroundColor: trade.color, ...(Platform.OS === "web" ? {} : {}) },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "65%",
  },
  info: {
    position: "absolute",
    left: 20,
    right: 20,
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
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  name: {
    color: "#FFFFFF",
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  bio: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  tapHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  tapHintText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  stamp: {
    position: "absolute",
    top: 36,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 4,
    borderRadius: 8,
  },
  stampLike: {
    right: 24,
    borderColor: "#2F9E44",
    transform: [{ rotate: "-12deg" }],
  },
  stampPass: {
    left: 24,
    borderColor: "#E03A3A",
    transform: [{ rotate: "12deg" }],
  },
  stampText: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    letterSpacing: 2,
  },
  tradeStripe: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
});
