"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface StatusData {
  name: string
  value: number
  color: string
}

interface StatusDistributionChartProps {
  data: StatusData[]
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number, name: string) => [value, name]}
          />
          <Legend 
            verticalAlign="middle" 
            align="left"
            layout="vertical"
            wrapperStyle={{ fontSize: '11px', left: 0 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
