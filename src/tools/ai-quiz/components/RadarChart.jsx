import React from 'react'
import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { dimensions } from '../data/questions'

export default function RadarChart({ dimensionScores }) {
  const data = dimensions.map((dim) => ({
    dimension: dim.label,
    score: dimensionScores[dim.id] || 0,
    fullMark: 100,
  }))

  return (
    <div className="w-full h-80 sm:h-96">
      <ResponsiveContainer>
        <RechartsRadar cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#1a1a2e" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#4b5563', fontSize: 10 }}
            tickCount={5}
            axisLine={false}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#13b973"
            fill="#13b973"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0e0e1f',
              border: '1px solid rgba(19, 185, 115, 0.3)',
              borderRadius: '8px',
              color: '#e0e0e0',
              fontSize: '13px',
            }}
            formatter={(value) => [`${value}/100`, 'Score']}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  )
}
