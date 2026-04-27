import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { getTrade, type JobKey } from "@/constants/trades";

type Props = {
  job?: JobKey;
  trade?: JobKey;
  customJobTitle?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  customLabel?: string;
};

export function TradeBadge({ job, trade, customJobTitle, label: labelOverride, size = "md" }: Props) {
  const jobKey = job ?? trade ?? "other";
  const t = getTrade(jobKey);
  const padV = size === "sm" ? 4 : size === "lg" ? 8 : 6;
  const padH = size === "sm" ? 8 : size === "lg" ? 14 : 10;
  const fontSize = size === "sm" ? 11 : size === "lg" ? 14 : 12;
  const iconSize = size === "sm" ? 10 : size === "lg" ? 14 : 12;
  const label = labelOverride ?? (jobKey === "other" && customJobTitle ? customJobTitle : t.nickname);

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
        {label}
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
