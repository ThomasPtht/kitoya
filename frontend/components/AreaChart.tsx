import React, { useState } from "react";
import { View, Text, StyleSheet, LayoutChangeEvent } from "react-native";
import { LineChart } from "react-native-gifted-charts";

interface DataPoint {
  month: string;
  value: number;
}

interface AreaChartProps {
  data: DataPoint[];
  color?: string;
  unit?: string;
}

export default function AreaChart({
  data,
  color = "#05C785",
  unit = "",
}: AreaChartProps) {
  const chartData = data.map((d) => ({
    value: d.value,
    label: d.month,
  }));

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Pas encore de données</Text>
      </View>
    );
  }

  return (
    <LineChart
      data={chartData}
      height={160}
      adjustToWidth
      color={color}
      initialSpacing={0}
      endSpacing={25}
      thickness={2}
      areaChart
      startFillColor={color}
      startOpacity={0.25}
      endFillColor={color}
      endOpacity={0.02}
      curved
      hideDataPoints
      rulesColor="rgba(255,255,255,0.05)"
      rulesType="solid"
      yAxisTextStyle={{ color: "#666666", fontSize: 10 }}
      yAxisColor="transparent"
      yAxisLabelWidth={40}
      xAxisColor="transparent"
      xAxisLabelTextStyle={{
        color: "#666666",
        fontSize: 9,
      }}
      noOfSections={3}
      pointerConfig={{
        pointerStripHeight: 160,
        pointerStripColor: "rgba(255,255,255,0.2)",
        pointerStripWidth: 1,
        pointerColor: color,
        radius: 5,
        pointerLabelWidth: 100,
        pointerLabelHeight: 40,
        activatePointersOnLongPress: false,
        autoAdjustPointerLabelPosition: true,
        pointerVanishDelay: 150,
        pointerLabelComponent: (items: any) => {
          const item = items[0];
          return (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipMonth}>{item.label}</Text>
              <Text style={[styles.tooltipValue, { color }]}>
                {item.value} {unit}
              </Text>
            </View>
          );
        },
      }}
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#666666",
    fontSize: 13,
  },
  tooltip: {
    position: "absolute",
    top: -10,
    right: 0,
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "rgba(5, 199, 133, 0.4)",
    borderRadius: 10,
    padding: 8,
    zIndex: 10,
  },
  tooltipMonth: {
    color: "#888888",
    fontSize: 10,
    fontWeight: "bold",
  },
  tooltipValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
});
