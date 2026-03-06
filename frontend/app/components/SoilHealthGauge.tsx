"use client";

import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

export default function SoilHealthGauge({ value }: { value: number }) {
  const data = [{ name: "Soil Health", value, fill: "#22c55e" }];

  return (
    <RadialBarChart
      width={250}
      height={250}
      innerRadius="70%"
      outerRadius="100%"
      data={data}
      startAngle={180}
      endAngle={0}
    >
      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
      <RadialBar dataKey="value" cornerRadius={10} />
    </RadialBarChart>
  );
}