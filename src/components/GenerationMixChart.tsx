import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'
import type { GenerationMixPoint } from '../types'
import { format } from 'date-fns'

type Props = { data: GenerationMixPoint[] }

export default function GenerationMixChart({ data }: Props) {
  console.log('CO2 Emissions Chart received data:', data)
  console.log('Data length:', data?.length)
  console.log('First data point:', data?.[0])
  
  if (!data || data.length === 0) {
    console.log('No data available for CO2 Emissions Chart')
    return (
      <div style={{ 
        height: 360, 
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

  // Calculate CO2 emissions for each data point
  const chartData = data.map(d => {
    const windEmissions = d.mix.wind * 12 // 12 gCO2/kWh for wind
    const solarEmissions = d.mix.solar * 50 // 50 gCO2/kWh for solar
    const hydroEmissions = d.mix.hydro * 24 // 24 gCO2/kWh for hydro
    const gasEmissions = d.mix.gas * 400 // 400 gCO2/kWh for gas
    const coalEmissions = d.mix.coal * 900 // 900 gCO2/kWh for coal
    const biomassEmissions = d.mix.biomass * 230 // 230 gCO2/kWh for biomass
    const importsEmissions = d.mix.imports * 300 // 300 gCO2/kWh for imports
    
    const totalEmissions = windEmissions + solarEmissions + hydroEmissions + gasEmissions + coalEmissions + biomassEmissions + importsEmissions
    
    return {
      time: d.timestamp.getTime(),
      total: Math.round(totalEmissions),
      wind: Math.round(windEmissions),
      solar: Math.round(solarEmissions),
      hydro: Math.round(hydroEmissions),
      gas: Math.round(gasEmissions),
      coal: Math.round(coalEmissions),
      biomass: Math.round(biomassEmissions),
      imports: Math.round(importsEmissions),
    }
  })

  console.log('Chart data prepared:', chartData.slice(0, 3))
  console.log('First emissions data:', chartData[0])

  return (
    <div>
      <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
        Debug: {chartData.length} data points | Total CO₂: {chartData[0]?.total} gCO₂/kWh | Wind: {chartData[0]?.wind} | Gas: {chartData[0]?.gas} | Coal: {chartData[0]?.coal}
      </div>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <defs>
            <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#764ba2" stopOpacity={0.6}/>
            </linearGradient>
            <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#0891b2" stopOpacity={0.6}/>
            </linearGradient>
            <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#dc2626" stopOpacity={0.6}/>
            </linearGradient>
            <linearGradient id="coalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6b7280" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#4b5563" stopOpacity={0.6}/>
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
            width={60} 
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
            formatter={(value, name) => [`${value} gCO₂/kWh`, name]}
          />
          <Legend 
            wrapperStyle={{
              paddingTop: '10px',
              fontSize: '12px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#667eea" 
            strokeWidth={3}
            strokeOpacity={0.8}
            dot={false}
            name="Total CO₂"
          />
          <Line 
            type="monotone" 
            dataKey="wind" 
            stroke="#06b6d4" 
            strokeWidth={2}
            strokeOpacity={0.7}
            dot={false}
            name="Wind"
          />
          <Line 
            type="monotone" 
            dataKey="gas" 
            stroke="#ef4444" 
            strokeWidth={2}
            strokeOpacity={0.7}
            dot={false}
            name="Gas"
          />
          <Line 
            type="monotone" 
            dataKey="coal" 
            stroke="#6b7280" 
            strokeWidth={2}
            strokeOpacity={0.7}
            dot={false}
            name="Coal"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


