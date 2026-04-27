import React, { useMemo, useRef, useState } from "react";
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { formatHeight } from "@/constants/demographics";
import { useColors } from "@/hooks/useColors";

type Props = {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  formatValue?: (value: number) => string;
  onChange: (value: number) => void;
};

export function HeightSlider({
  label = "Height",
  value,
  min,
  max,
  step = 1,
  formatValue = formatHeight,
  onChange,
}: Props) {
  const colors = useColors();
  const [trackWidth, setTrackWidth] = useState(0);
  const startX = useRef(0);
  const latest = useRef({ min, max, step, trackWidth, onChange });
  latest.current = { min, max, step, trackWidth, onChange };

  const percent = useMemo(() => {
    if (max <= min) return 0;
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }, [max, min, value]);

  const setFromX = (x: number) => {
    const { min, max, step, trackWidth, onChange } = latest.current;
    if (!trackWidth) return;
    const ratio = Math.max(0, Math.min(1, x / trackWidth));
    const raw = min + ratio * (max - min);
    const next = Math.round(raw / step) * step;
    onChange(Math.max(min, Math.min(max, next)));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        startX.current = event.nativeEvent.locationX;
        setFromX(startX.current);
      },
      onPanResponderMove: (_, gesture) => {
        setFromX(startX.current + gesture.dx);
      },
    }),
  ).current;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          {label}
        </Text>
        <Text style={[styles.value, { color: colors.foreground }]}>
          {formatValue(value)}
        </Text>
      </View>
      <View
        {...panResponder.panHandlers}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        style={styles.touchArea}
      >
        <View style={[styles.track, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.fill,
              {
                backgroundColor: colors.primary,
                width: `${percent * 100}%`,
              },
            ]}
          />
          <View
            style={[
              styles.thumb,
              {
                backgroundColor: colors.primary,
                borderColor: colors.card,
                left: `${percent * 100}%`,
              },
            ]}
          />
        </View>
      </View>
      <View style={styles.rangeRow}>
        <Text style={[styles.rangeText, { color: colors.mutedForeground }]}>
          {formatValue(min)}
        </Text>
        <Text style={[styles.rangeText, { color: colors.mutedForeground }]}>
          {formatValue(max)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  touchArea: {
    paddingVertical: 12,
  },
  track: {
    height: 8,
    borderRadius: 4,
    position: "relative",
  },
  fill: {
    height: 8,
    borderRadius: 4,
  },
  thumb: {
    position: "absolute",
    top: -8,
    width: 24,
    height: 24,
    marginLeft: -12,
    borderRadius: 12,
    borderWidth: 3,
  },
  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rangeText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
});
