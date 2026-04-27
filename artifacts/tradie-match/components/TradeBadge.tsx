import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { getTrade, type TradeKey } from "@/constants/trades";

type Props = {
  trade: TradeKey;
  size?: "sm" | "md" | "lg";
  jobTitle?: string;
};

<<<<<<< HEAD
export function TradeBadge({ trade, size = "md", jobTitle }: Props) {
  const t = getTrade(trade);
=======
export function TradeBadge({ job, trade, customJobTitle, label: labelOverride, size = "md" }: Props) {
  const jobKey = job ?? trade ?? "other";
  const t = getTrade(jobKey);
>>>>>>> 86bc71ba47104bb273cfbbd6fcb9b043dd022ef9
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
<<<<<<< HEAD
        {jobTitle ?? t.nickname}
=======
        {label}
>>>>>>> 86bc71ba47104bb273cfbbd6fcb9b043dd022ef9
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
