'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

type ViewMode = 'list' | 'collapsed' | 'bubbles'

interface Segment {
  departing_at: string
  arriving_at: string
  duration: string
  marketing_carrier: { name: string; logo_symbol: string }
  operating_carrier: { name: string; logo_symbol: string }
  origin: { city_name: string; iata_code: string; name: string; city?: { name: string } }
  destination: { city_name: string; iata_code: string; name: string; city?: { name: string } }
  stops: any[]
}

interface Slice {
  segments: Segment[]
}

interface Offer {
  id: string
  total_amount: string
  total_currency: string
  cabin_class: string
  slices: Slice[]
  passengers: Array<{ type: string; fare: string }>
  fare_brand_name?: string
}

interface Filters {
  maxPrice: string
  maxDuration: string
  maxStops: number | null
  carrier: string
  cabinClass: string
}

export default function OffersPage() {
  const router = useRouter()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    maxPrice: '',
    maxDuration: '',
    maxStops: null,
    carrier: '',
    cabinClass: '',
  })

  useEffect(() => {
    const results = sessionStorage.getItem('searchResults')
    if (results) {
      const data = JSON.parse(results)
      setOffers(data.offers || [])
    }
    setLoading(false)
  }, [])

  const carriers = useMemo(() => {
    const set = new Set<string>()
    offers.forEach(offer => {
      const carrier = offer.slices[0]?.segments[0]?.marketing_carrier?.name
      if (carrier) set.add(carrier)
    })
    return Array.from(set)
  }, [offers])

  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      if (filters.maxPrice && parseFloat(offer.total_amount) > parseFloat(filters.maxPrice)) return false
      if (filters.carrier) {
        const carrier = offer.slices[0]?.segments[0]?.marketing_carrier?.name
        if (carrier !== filters.carrier) return false
      }
      if (filters.cabinClass && offer.cabin_class !== filters.cabinClass) return false
      if (filters.maxStops !== null) {
        const stops = (offer.slices[0]?.segments?.length || 1) - 1
        if (stops > filters.maxStops) return false
      }
      return true
    })
  }, [offers, filters])

  const handleSelectOffer = (offer: Offer) => {
    sessionStorage.setItem('selectedOffer', JSON.stringify(offer))
    router.push('/booking')
  }

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--'
    return new Date(isoString).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDuration = (duration?: string) => {
    if (!duration) return '--'
    const match = duration.match(/PT(\d+)H(\d+)?M?/)
    if (match) return `${match[1]}h ${match[2] || '0'}m`
    return duration
  }

  const getStopsText = (segments?: Segment[]) => {
    if (!segments || segments.length === 0) return 'Directo'
    const stops = segments.length - 1
    if (stops === 0) return 'Directo'
    return `${stops} escala${stops > 1 ? 's' : ''}`
  }

  const getCarrierName = (segment?: Segment) => segment?.marketing_carrier?.name || segment?.operating_carrier?.name || 'N/A'
  const getOriginCode = (segment?: Segment) => segment?.origin?.iata_code || 'N/A'
  const getDestinationCode = (segment?: Segment) => segment?.destination?.iata_code || 'N/A'
  const getOriginCity = (segment?: Segment) => segment?.origin?.city_name || 'N/A'
  const getDestinationCity = (segment?: Segment) => segment?.destination?.city_name || 'N/A'

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-volaris-red/30 border-t-volaris-red rounded-full animate-spin"></div>
          <div className="text-white/80 text-lg">Cargando resultados...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/search" className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image src="/img/icono_kroa.png" alt="Kroatravel" fill className="object-contain" />
            </div>
            <span className="text-white font-bold text-xl">Kroatravel</span>
          </Link>
          <Link href="/search" className="text-white/60 hover:text-white">
            ← Nueva búsqueda
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {filteredOffers.length} <span className="text-volaris-red">vuelos</span> encontrados
            </h1>
            <p className="text-white/60 text-sm mt-1">
              {filteredOffers.length !== offers.length && `(filtrado de ${offers.length} totales)`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                showFilters ? 'bg-volaris-red text-white' : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros
            </button>

            <div className="flex bg-white/5 rounded-xl p-1">
              {[
                { mode: 'list' as ViewMode, icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
                { mode: 'collapsed' as ViewMode, icon: 'M4 6h16M4 10h16M4 14h16' },
                { mode: 'bubbles' as ViewMode, icon: 'M12 12m-8 0a8 8 0 1 0 16 0 8 8 0 0 0-16 0' },
              ].map(({ mode, icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-volaris-red text-white' : 'text-white/60 hover:text-white'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-white/60 text-sm mb-2 block">Precio máximo (USD)</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  placeholder="Ej: 200"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-volaris-red/50"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">Aerolínea</label>
                <select
                  value={filters.carrier}
                  onChange={(e) => setFilters({ ...filters, carrier: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-volaris-red/50"
                >
                  <option value="" className="bg-slate-800">Todas</option>
                  {carriers.map(c => (
                    <option key={c} value={c} className="bg-slate-800">{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">Clase</label>
                <select
                  value={filters.cabinClass}
                  onChange={(e) => setFilters({ ...filters, cabinClass: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-volaris-red/50"
                >
                  <option value="" className="bg-slate-800">Todas</option>
                  <option value="economy" className="bg-slate-800">Económica</option>
                  <option value="premium_economy" className="bg-slate-800">Premium</option>
                  <option value="business" className="bg-slate-800">Ejecutiva</option>
                </select>
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">Escalas</label>
                <select
                  value={filters.maxStops ?? ''}
                  onChange={(e) => setFilters({ ...filters, maxStops: e.target.value === '' ? null : parseInt(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-volaris-red/50"
                >
                  <option value="" className="bg-slate-800">Cualquiera</option>
                  <option value="0" className="bg-slate-800">Directo</option>
                  <option value="1" className="bg-slate-800">1 escala</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => setFilters({ maxPrice: '', maxDuration: '', maxStops: null, carrier: '', cabinClass: '' })}
              className="mt-4 text-white/60 hover:text-white text-sm"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {filteredOffers.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <p className="text-white/80 text-lg mb-4">No hay vuelos con esos filtros.</p>
            <button onClick={() => setFilters({ maxPrice: '', maxDuration: '', maxStops: null, carrier: '', cabinClass: '' })} className="text-volaris-red hover:underline">
              Limpiar filtros
            </button>
          </div>
        ) : viewMode === 'bubbles' ? (
          <div className="flex flex-wrap justify-center gap-8 py-8">
            {filteredOffers.map((offer) => {
              const segment = offer.slices[0]?.segments[0]
              const prices = filteredOffers.map(o => parseFloat(o.total_amount))
              const minPrice = Math.min(...prices)
              const maxPrice = Math.max(...prices)
              const size = 80 + ((parseFloat(offer.total_amount) - minPrice) / (maxPrice - minPrice || 1)) * 120
              return (
                <div
                  key={offer.id}
                  style={{ width: `${size}px`, height: `${size}px` }}
                  onClick={() => handleSelectOffer(offer)}
                  className="bg-gradient-to-br from-volaris-red/80 to-red-900/80 rounded-full flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform border-2 border-white/30"
                >
                  <span className="text-white font-bold text-lg">${offer.total_amount}</span>
                  <span className="text-white/80 text-xs">{getCarrierName(segment)}</span>
                  <span className="text-white/60 text-xs">{getOriginCode(segment)} → {getDestinationCode(segment)}</span>
                </div>
              )
            })}
          </div>
        ) : viewMode === 'collapsed' ? (
          <div className="space-y-2">
            {filteredOffers.map((offer) => {
              const segment = offer.slices[0]?.segments[0]
              return (
                <div
                  key={offer.id}
                  onClick={() => handleSelectOffer(offer)}
                  className="bg-white/5 backdrop-blur-xl rounded-xl px-6 py-4 border border-white/10 flex items-center justify-between cursor-pointer hover:border-volaris-red/50 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <span className="text-white font-medium">{getCarrierName(segment)}</span>
                    <span className="text-white/80">{getOriginCode(segment)} → {getDestinationCode(segment)}</span>
                    <span className="text-white/60 text-sm">{getStopsText(offer.slices[0]?.segments)}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-volaris-red font-bold">${offer.total_amount}</span>
                    <button className="bg-volaris-red text-white px-4 py-1.5 rounded-lg text-sm">Seleccionar</button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => {
              const firstSegment = offer.slices[0]?.segments[0]
              const lastSegment = offer.slices[0]?.segments[offer.slices[0].segments.length - 1]

              return (
                <div
                  key={offer.id}
                  onClick={() => handleSelectOffer(offer)}
                  className="group bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-volaris-red/50 hover:shadow-xl hover:shadow-volaris-red/10 transition-all cursor-pointer"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-white rounded-lg px-3 py-1.5">
                        <span className="text-volaris-red font-bold">{getCarrierName(firstSegment)}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-volaris-red">${offer.total_amount}</div>
                        <div className="text-white/60 text-xs">{offer.total_currency}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{getOriginCode(firstSegment)}</div>
                        <div className="text-xs text-white/60 mt-1">{formatTime(firstSegment?.departing_at)}</div>
                      </div>

                      <div className="flex-1 px-4">
                        <div className="relative flex items-center justify-center">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-2 h-2 rounded-full bg-volaris-red"></div>
                            <div className="flex-1 h-0.5 bg-gradient-to-r from-volaris-red to-white/30"></div>
                            <svg className="w-5 h-5 text-volaris-red" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-center text-xs text-white/60 mt-2">
                          {getStopsText(offer.slices[0]?.segments)}
                        </div>
                        <div className="text-center text-xs text-white/40">
                          {formatDuration(firstSegment?.duration)}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{getDestinationCode(lastSegment)}</div>
                        <div className="text-xs text-white/60 mt-1">{formatTime(lastSegment?.arriving_at)}</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                      <span className="text-white/60 text-sm">{offer.passengers?.length || 1} {offer.passengers?.length === 1 ? 'pasajero' : 'pasajeros'}</span>
                      <button className="bg-volaris-red text-white px-4 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Seleccionar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}