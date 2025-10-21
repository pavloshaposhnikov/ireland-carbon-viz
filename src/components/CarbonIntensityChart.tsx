import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from 'recharts'
import type { CarbonIntensityPoint } from '../types'
import { format } from 'date-fns'

export default function CarbonIntensityChart({ data }: { data: CarbonIntensityPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        height: 320, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#6b7280',
        fontSize: '1.125rem'
      }}>
        No data available
      </div>
    )
  }

  const chartData = data.map(d => ({
    time: d.timestamp.getTime(),
    label: d.timestamp,
    ci: d.gramsCO2PerKWh,
  }))

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <defs>
          <linearGradient id="carbonGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#667eea" stopOpacity={0.05}/>
          </linearGradient>
          <linearGradient id="carbonLineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#667eea"/>
            <stop offset="50%" stopColor="#764ba2"/>
            <stop offset="100%" stopColor="#667eea"/>
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" opacity={0.5} />
        <XAxis
          dataKey="time"
          type="number"
          domain={[chartData[0]?.time ?? 'dataMin', chartData[chartData.length - 1]?.time ?? 'dataMax']}
          tickFormatter={(v) => format(new Date(v), 'HH:mm')}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
        />
        <YAxis 
          width={56} 
          tickFormatter={(v) => `${v}`} 
          label={{ value: 'gCO₂/kWh', position: 'insideLeft', angle: -90, style: { textAnchor: 'middle', fill: '#374151', fontSize: 12 } }}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(209, 213, 219, 0.5)',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
          labelFormatter={(v) => format(new Date(v), 'EEE HH:mm')}
          formatter={(value) => [`${value} gCO₂/kWh`, 'Intensity']}
        />
        <Area 
          type="monotone" 
          dataKey="ci" 
          stroke="url(#carbonLineGradient)" 
          fill="url(#carbonGradient)" 
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 6, fill: '#667eea', stroke: '#ffffff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}


