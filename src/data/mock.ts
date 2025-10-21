import { addMinutes, formatISO9075, subHours } from 'date-fns'
import type { CarbonIntensityPoint, DateRange, GenerationMixBreakdown, GenerationMixPoint } from '../types'

const EMISSION_FACTORS: Record<keyof GenerationMixBreakdown, number> = {
  wind: 12,
  solar: 50,
  hydro: 24,
  gas: 400,
  coal: 900,
  biomass: 230,
  imports: 300,
}

function getRangeHours(range: DateRange): number {
  if (range === '24h') return 24
  if (range === '48h') return 48
  return 24 * 7
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function normalizeMix(raw: Partial<GenerationMixBreakdown>): GenerationMixBreakdown {
  const base: GenerationMixBreakdown = {
    wind: raw.wind ?? 0,
    solar: raw.solar ?? 0,
    hydro: raw.hydro ?? 0,
    gas: raw.gas ?? 0,
    coal: raw.coal ?? 0,
    biomass: raw.biomass ?? 0,
    imports: raw.imports ?? 0,
  }
  const total = Object.values(base).reduce((a, b) => a + b, 0)
  if (total <= 0) {
    return {
      wind: 0.3,
      solar: 0.05,
      hydro: 0.05,
      gas: 0.45,
      coal: 0.05,
      biomass: 0.05,
      imports: 0.05,
    }
  }
  const normalized = Object.fromEntries(
    Object.entries(base).map(([k, v]) => [k, v / total])
  ) as GenerationMixBreakdown
  return normalized
}

function computeIntensity(mix: GenerationMixBreakdown): number {
  let total = 0
  for (const key of Object.keys(mix) as (keyof GenerationMixBreakdown)[]) {
    total += mix[key] * EMISSION_FACTORS[key]
  }
  return Math.round(total)
}

export function generateMockSeries(range: DateRange): {
  intensity: CarbonIntensityPoint[]
  generation: GenerationMixPoint[]
} {
  const hours = getRangeHours(range)
  const stepMinutes = range === '7d' ? 30 : 15
  const points = (hours * 60) / stepMinutes

  const now = new Date()
  const start = subHours(now, hours)

  const intensity: CarbonIntensityPoint[] = []
  const generation: GenerationMixPoint[] = []

  for (let i = 0; i <= points; i++) {
    const t = addMinutes(start, i * stepMinutes)
    const hourOfDay = t.getHours() + t.getMinutes() / 60

    const dayFactor = Math.sin((2 * Math.PI * (hourOfDay - 3)) / 24) // wind tends to be higher overnight
    const wind = clamp(0.35 + 0.2 * dayFactor, 0.1, 0.75)

    const solarBase = Math.max(0, Math.sin((Math.PI * (hourOfDay - 6)) / 12)) // day-only
    const solar = clamp(0.18 * solarBase, 0, 0.25)

    const hydro = 0.05 + 0.02 * Math.sin((2 * Math.PI * i) / (points / 7))
    const coal = 0.04 + 0.01 * Math.sin((2 * Math.PI * i) / (points / 3))
    const biomass = 0.05

    let gas = 0.4 + 0.1 * Math.cos((2 * Math.PI * hourOfDay) / 24) - (wind + solar - 0.3)
    gas = clamp(gas, 0.05, 0.7)

    const imports = clamp(1 - (wind + solar + hydro + gas + coal + biomass), 0.02, 0.2)

    const mix = normalizeMix({ wind, solar, hydro, gas, coal, biomass, imports })
    const ci = computeIntensity(mix)

    intensity.push({ timestamp: t, gramsCO2PerKWh: ci })
    generation.push({ timestamp: t, mix })
  }

  // To keep serialization-friendly, ensure Dates are real Date objects (Recharts can handle JS Date)
  return { intensity, generation }
}

export function formatTickTime(date: Date): string {
  return formatISO9075(date, { representation: 'time' }).slice(0, 5)
}


