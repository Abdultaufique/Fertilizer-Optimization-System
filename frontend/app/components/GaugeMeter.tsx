"use client";
import GaugeChart from "react-gauge-chart";

export default function GaugeMeter({ value }: any) {
  return (
    <GaugeChart
      id="gauge-chart"
      nrOfLevels={20}
      percent={value / 100}
      colors={["#ef4444", "#facc15", "#22c55e"]}
      arcWidth={0.3}
      textColor="#ffffff"
    />
  );
}