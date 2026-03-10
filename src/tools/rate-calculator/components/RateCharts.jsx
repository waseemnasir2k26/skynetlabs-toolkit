import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#13b973', '#0ed4e6', '#6366f1', '#f59e0b', '#ef4444']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-200 border border-white/10 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-gray-400">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
            ${Number(p.value).toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function RateCharts({ calculations, nicheLabel }) {
  const { hourlyRate, projectRate, monthlyRetainer, annualRevenue, totalExpenses, taxAmount, desiredIncome } = calculations

  const rateComparisonData = [
    { name: 'Hourly', rate: Math.round(hourlyRate) },
    { name: 'Effective\n(Project)', rate: Math.round(projectRate / 40) },
    { name: 'Effective\n(Retainer)', rate: Math.round(monthlyRetainer / 80) },
  ]

  const revenueBreakdown = [
    { name: 'Take-Home Income', value: Math.round(desiredIncome) },
    { name: 'Taxes', value: Math.round(taxAmount) },
    { name: 'Business Expenses', value: Math.round(totalExpenses) },
  ]

  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    revenue: Math.round(annualRevenue / 12),
    expenses: Math.round(totalExpenses / 12),
    profit: Math.round((annualRevenue - totalExpenses) / 12),
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        className="glass-card p-6"
      >
        <div className="text-sm font-semibold text-gray-300 mb-4">Revenue Breakdown</div>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={revenueBreakdown}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {revenueBreakdown.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
              formatter={(value) => <span className="text-gray-400">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="glass-card p-6"
      >
        <div className="text-sm font-semibold text-gray-300 mb-4">Monthly Projection</div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222230" />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#222230' }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#222230' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="profit" fill="#13b973" radius={[4, 4, 0, 0]} name="Profit" />
            <Bar dataKey="expenses" fill="#6366f1" radius={[4, 4, 0, 0]} name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
