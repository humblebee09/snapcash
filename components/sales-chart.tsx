"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { name: "Sen", total: 420000 },
  { name: "Sel", total: 350000 },
  { name: "Rab", total: 580000 },
  { name: "Kam", total: 490000 },
  { name: "Jum", total: 620000 },
  { name: "Sab", total: 780000 },
  { name: "Min", total: 520000 },
]

export function SalesChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `Rp${value / 1000}k`}
        />
        <Tooltip
          formatter={(value: number) => [`Rp${value.toLocaleString("id-ID")}`, "Total"]}
          labelFormatter={(label) => `Hari ${label}`}
        />
        <Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
