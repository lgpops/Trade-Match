import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { getTrade, type TradeKey } from "@/constants/trades";

type Props = {
  trade: TradeKey;
  size?: "sm" | "md" | "lg";
  jobTitle?: string;
};

export function TradeBadge({ trade, size = "md", jobTitle }: Props) {
  const t = getTrade(trade);
  const padV = size === "sm" ? 4 : size === "lg" ? 8 : 6;
  const padH = size === "sm" ? 8 : size === "lg" ? 14 : 10;
  const fontSize = size === "sm" ? 11 : size === "lg" ? 14 : 12;
  const iconSize = size === "sm" ? 10 : size === "lg" ? 14 : 12;

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: t.color,
          paddingVertical: padV,
          paddingHorizontal: padH,
        },
      ]}
    >
      <Feather
        name={
          t.collarType === "blue"
            ? "tool"
            : t.collarType === "white"
              ? "briefcase"
              : "star"
        }
        size={iconSize}
        color="#FFFFFF"
      />
      <Text style={[styles.text, { fontSize }]} numberOfLines={1}>
        {jobTitle ?? t.nickname}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  text: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
});
