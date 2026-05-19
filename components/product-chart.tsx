"use client"

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "Minuman", value: 55, color: "#16a34a" },
  { name: "Makanan", value: 35, color: "#2563eb" },
  { name: "Lainnya", value: 10, color: "#d97706" },
]

export function ProductChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value}%`, "Persentase"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
