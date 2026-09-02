
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface DonutSegment {
  name: string;
  count: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel: string;
}

export default function DonutChart({
  data,
  size = 180,
  strokeWidth = 22,
  centerLabel,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {data.map((segment, index) => {
          const percent = total > 0 ? segment.count / total : 0;
          const segmentLength = percent * circumference;
          const dashArray = `${segmentLength} ${circumference - segmentLength}`;
          const dashOffset = -cumulativeOffset;
          cumulativeOffset += segmentLength;

          return (
            <Circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              fill="transparent"
              strokeLinecap="butt"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          );
        })}
      </Svg>
      <View style={styles.centerTextContainer}>
        <Text style={styles.centerValue}>{total}</Text>
        <Text style={styles.centerLabel}>{centerLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerTextContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  centerValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#888888",
    letterSpacing: 1,
    marginTop: 2,
  },
});