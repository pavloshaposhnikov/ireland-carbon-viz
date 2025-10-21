export type DateRange = '24h' | '48h' | '7d'

export type CarbonIntensityPoint = {
  timestamp: Date
  gramsCO2PerKWh: number
}

export type GenerationMixBreakdown = {
  wind: number
  solar: number
  hydro: number
  gas: number
  coal: number
  biomass: number
  imports: number
}

export type GenerationMixPoint = {
  timestamp: Date
  mix: GenerationMixBreakdown
}


