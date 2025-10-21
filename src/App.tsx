import { useState, useEffect } from 'react'
import { generateMockSeries } from './data/mock'
import { fetchRealEirGridData } from './data/eirgrid'
import CarbonIntensityChart from './components/CarbonIntensityChart'
import GenerationMixChart from './components/GenerationMixChart'
import type { DateRange } from './types'
import './App.css'

type Provider = 'Mock (offline)' | 'EirGrid (real-time)' | 'ENTSO-E (real-time)'

// Create different mock data for different providers
function generateProviderSpecificData(provider: Provider, dateRange: DateRange) {
  const baseData = generateMockSeries(dateRange)
  
  if (provider === 'Mock (offline)') {
    return baseData
  } else if (provider === 'EirGrid (real-time)') {
    // Modify the data to simulate real EirGrid data (higher wind, lower coal)
    return {
      intensity: baseData.intensity.map(point => ({
        ...point,
        gramsCO2PerKWh: Math.round(point.gramsCO2PerKWh * 0.8) // Lower carbon intensity
      })),
      generation: baseData.generation.map(point => {
        // Apply multipliers to simulate more renewable energy
        const modifiedMix = {
          wind: point.mix.wind * 1.3, // More wind
          solar: point.mix.solar * 1.2, // More solar
          hydro: point.mix.hydro,
          gas: point.mix.gas * 0.9, // Less gas
          coal: point.mix.coal * 0.5, // Much less coal
          biomass: point.mix.biomass,
          imports: point.mix.imports * 0.8 // Less imports
        }
        
        // Normalize to ensure values sum to 1
        const total = Object.values(modifiedMix).reduce((sum, val) => sum + val, 0)
        const normalizedMix = {
          wind: modifiedMix.wind / total,
          solar: modifiedMix.solar / total,
          hydro: modifiedMix.hydro / total,
          gas: modifiedMix.gas / total,
          coal: modifiedMix.coal / total,
          biomass: modifiedMix.biomass / total,
          imports: modifiedMix.imports / total
        }
        
        return {
          ...point,
          mix: normalizedMix
        }
      })
    }
  } else {
    // ENTSO-E data (European mix - more nuclear, less coal)
    return {
      intensity: baseData.intensity.map(point => ({
        ...point,
        gramsCO2PerKWh: Math.round(point.gramsCO2PerKWh * 0.6) // Much lower carbon intensity
      })),
      generation: baseData.generation.map(point => {
        // Apply multipliers to simulate European energy mix
        const modifiedMix = {
          wind: point.mix.wind * 1.5, // Much more wind
          solar: point.mix.solar * 1.8, // Much more solar
          hydro: point.mix.hydro * 1.2, // More hydro
          gas: point.mix.gas * 0.7, // Less gas
          coal: point.mix.coal * 0.2, // Much less coal
          biomass: point.mix.biomass * 1.3, // More biomass
          imports: point.mix.imports * 0.6 // Less imports
        }
        
        // Normalize to ensure values sum to 1
        const total = Object.values(modifiedMix).reduce((sum, val) => sum + val, 0)
        const normalizedMix = {
          wind: modifiedMix.wind / total,
          solar: modifiedMix.solar / total,
          hydro: modifiedMix.hydro / total,
          gas: modifiedMix.gas / total,
          coal: modifiedMix.coal / total,
          biomass: modifiedMix.biomass / total,
          imports: modifiedMix.imports / total
        }
        
        return {
          ...point,
          mix: normalizedMix
        }
      })
    }
  }
}

function App() {
  const [dateRange, setDateRange] = useState<DateRange>('24h')
  const [provider, setProvider] = useState<Provider>('Mock (offline)')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        let result
        if (provider === 'Mock (offline)') {
          result = generateProviderSpecificData(provider, dateRange)
        } else if (provider === 'EirGrid (real-time)') {
          // Fetch real EirGrid data
          console.log('Fetching real EirGrid data...')
          result = await fetchRealEirGridData(dateRange)
          console.log('Real EirGrid data received:', result)
        } else {
          // ENTSO-E would require API key
          throw new Error('ENTSO-E integration requires API key setup')
        }
        console.log('Data loaded:', result)
        console.log('Intensity points:', result.intensity?.length)
        console.log('Generation points:', result.generation?.length)
        console.log('First generation mix:', result.generation?.[0]?.mix)
        setData(result)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch data')
        // Fallback to mock data
        const fallbackData = generateProviderSpecificData('Mock (offline)', dateRange)
        console.log('Fallback data:', fallbackData)
        setData(fallbackData)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange, provider])

  const getDataSourceIndicator = () => {
    if (provider === 'Mock (offline)') {
      return 'Mock (offline) data';
    } else if (provider === 'EirGrid (real-time)') {
      return 'Real-time EirGrid data from transparency platform';
    } else {
      return 'ENTSO-E (real-time) data (requires API key)';
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-title-section">
            <h1 className="header-title">Electricity Carbon Emissions</h1>
            <p className="header-subtitle">Part of application for MSc in Statistics and Sustainability at Trinity College Dublin</p>
          </div>
          <div className="controls">
            <div className="control-group">
              <label className="control-label">Date range</label>
              <select
                className="control-select"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRange)}
                disabled={loading}
              >
                <option value="24h">24 hours</option>
                <option value="48h">48 hours</option>
                <option value="7d">7 days</option>
              </select>
            </div>
            <div className="control-group">
              <label className="control-label">Data source</label>
              <select
                className="control-select"
                value={provider}
                onChange={(e) => setProvider(e.target.value as Provider)}
                disabled={loading}
              >
                <option value="Mock (offline)">Mock (offline)</option>
                <option value="EirGrid (real-time)">EirGrid (real-time)</option>
                <option value="ENTSO-E (real-time)">ENTSO-E (real-time)</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
            <p>Falling back to mock data for demonstration.</p>
          </div>
        )}
        
        {loading && (
          <div className="loading-message">
            <p>🔄 Loading {provider.toLowerCase()} data...</p>
          </div>
        )}

        {data && (
          <>
            <div className="chart-card" style={{ marginBottom: '1rem' }}>
              <h3>Debug Info</h3>
              <p><strong>Data Source:</strong> {getDataSourceIndicator()}</p>
              <p>Provider: {provider}</p>
              <p>Date Range: {dateRange}</p>
              <p>Intensity data points: {data.intensity?.length || 0}</p>
              <p>Generation data points: {data.generation?.length || 0}</p>
              {data.intensity && data.intensity.length > 0 && (
                <p>First intensity value: {data.intensity[0].gramsCO2PerKWh} gCO₂/kWh</p>
              )}
              {data.generation && data.generation.length > 0 && (
                <div>
                  <p>First generation mix:</p>
                  <ul style={{ marginLeft: '20px', fontSize: '0.9em' }}>
                    <li>Wind: {(data.generation[0].mix.wind * 100).toFixed(1)}%</li>
                    <li>Solar: {(data.generation[0].mix.solar * 100).toFixed(1)}%</li>
                    <li>Hydro: {(data.generation[0].mix.hydro * 100).toFixed(1)}%</li>
                    <li>Gas: {(data.generation[0].mix.gas * 100).toFixed(1)}%</li>
                    <li>Coal: {(data.generation[0].mix.coal * 100).toFixed(1)}%</li>
                    <li>Biomass: {(data.generation[0].mix.biomass * 100).toFixed(1)}%</li>
                    <li>Imports: {(data.generation[0].mix.imports * 100).toFixed(1)}%</li>
                  </ul>
                  <p>Total: {((data.generation[0].mix.wind + data.generation[0].mix.solar + data.generation[0].mix.hydro + data.generation[0].mix.gas + data.generation[0].mix.coal + data.generation[0].mix.biomass + data.generation[0].mix.imports) * 100).toFixed(1)}%</p>
                </div>
              )}
            </div>

            <section className="chart-section">
              <div className="chart-card">
                <h2 className="section-title">Carbon Intensity</h2>
                {data.intensity && data.intensity.length > 0 ? (
                  <CarbonIntensityChart data={data.intensity} />
                ) : (
                  <div className="loading-placeholder">No intensity data available</div>
                )}
              </div>
            </section>
            
            <section className="chart-section">
              <div className="chart-card">
                <h2 className="section-title">CO₂ Emissions by Source</h2>
                {data.generation && data.generation.length > 0 ? (
                  <GenerationMixChart data={data.generation} />
                ) : (
                  <div className="loading-placeholder">No generation data available</div>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="footer">
        <small>
          Data source: {provider === 'Mock (offline)' ? 'mock offline' : provider}. 
          {provider !== 'Mock (offline)' && ' Real-time data from EirGrid transparency platform.'}
        </small>
      </footer>
    </div>
  )
}

export default App
