'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Segment {
  departing_at: string
  arriving_at: string
  duration: string
  marketing_carrier: { name: string; logo_symbol: string }
  operating_carrier: { name: string; logo_symbol: string }
  origin: { city_name: string; iata_code: string; name: string; city?: { name: string } }
  destination: { city_name: string; iata_code: string; name: string; city?: { name: string } }
  stops: any[]
  origin_terminal?: string
  destination_terminal?: string
  passengers?: Array<{ passenger_id: string; cabin_class: string }>
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

interface Passenger {
  firstName: string
  lastName: string
  dateOfBirth: string
  documentType: string
  documentNumber: string
}

export default function BookingPage() {
  const router = useRouter()
  const [offer, setOffer] = useState<Offer | null>(null)
  const [loading, setLoading] = useState(false)
  const [bookingResult, setBookingResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [passengers, setPassengers] = useState<Passenger[]>([
    { firstName: '', lastName: '', dateOfBirth: '', documentType: 'passport', documentNumber: '' }
  ])
  const [contact, setContact] = useState({ email: '', phone: '' })

  useEffect(() => {
    const selected = sessionStorage.getItem('selectedOffer')
    if (selected) {
      setOffer(JSON.parse(selected))
      const params = sessionStorage.getItem('searchParams')
      if (params) {
        const { passengers: count } = JSON.parse(params)
        setPassengers(Array(count).fill(null).map(() => ({
          firstName: '', lastName: '', dateOfBirth: '', documentType: 'passport', documentNumber: ''
        })))
      }
    } else {
      router.push('/search')
    }
  }, [router])

  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    const updated = [...passengers]
    updated[index] = { ...updated[index], [field]: value }
    setPassengers(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const passengersForApi = passengers.map((p, i) => ({
        id: `passenger_${i + 1}`,
        type: 'adult',
        title: 'mr',
        first_name: p.firstName,
        last_name: p.lastName,
        born_on: p.dateOfBirth,
        email: contact.email || 'cliente@example.com',
        phone_number: String(contact.phone.replace(/\D/g, '').startsWith('52') ? '+' + contact.phone.replace(/\D/g, '') : '+52' + contact.phone.replace(/\D/g, '')),
        document_type: p.documentType,
        document_number: p.documentNumber,
      }))

      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: offer?.id,
          passengers: passengersForApi,
          contact,
          totalAmount: offer?.total_amount,
          totalCurrency: offer?.total_currency,
          offerPassengers: offer?.slices?.[0]?.segments?.[0]?.passengers,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setBookingResult(data)
        sessionStorage.removeItem('selectedOffer')
        sessionStorage.removeItem('searchResults')
        sessionStorage.removeItem('searchParams')
      } else {
        setError(data.error || 'Error al realizar la reservación')
      }
    } catch (err) {
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A'
    return new Date(isoString).toLocaleDateString('es-MX', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  const formatDateShort = (isoString?: string) => {
    if (!isoString) return 'N/A'
    return new Date(isoString).toLocaleDateString('es-MX', {
      month: 'short', day: 'numeric'
    })
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

  const getCityName = (segment: Segment, type: 'origin' | 'destination') => {
    if (!segment) return 'N/A'
    const place = type === 'origin' ? segment.origin : segment.destination
    if (!place) return 'N/A'
    return place.city_name || place.city?.name || place.name || 'N/A'
  }

  const getAirportCode = (segment: Segment, type: 'origin' | 'destination') => {
    if (!segment) return '??'
    const place = type === 'origin' ? segment.origin : segment.destination
    if (!place) return '??'
    return place.iata_code || '??'
  }

  const getTerminal = (segment: Segment, type: 'origin' | 'destination') => {
    if (!segment) return undefined
    const key = type === 'origin' ? 'origin_terminal' : 'destination_terminal'
    return (segment as any)[key] || undefined
  }

  const getCarrierName = (segment: Segment) => {
    return segment?.marketing_carrier?.name || segment?.operating_carrier?.name || 'N/A'
  }

  const getCabinClassName = (cabin: string) => {
    const classes: Record<string, string> = {
      economy: 'Económica',
      premium_economy: 'Premium Economy',
      business: 'Ejecutiva',
    }
    return classes[cabin] || cabin
  }

  if (bookingResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <Image src="/img/icono_kroa.png" alt="Kroatravel" fill className="object-contain" />
              </div>
              <span className="text-white font-bold text-xl">Kroatravel</span>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border border-emerald-500/30 rounded-3xl p-8 text-center animate-fade-in">
              <div className="w-20 h-20 mx-auto bg-emerald-500 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">¡Reservación Exitosa!</h1>
              <p className="text-emerald-400 mb-8">Tu vuelo ha sido reservado correctamente</p>

              <div className="bg-black/30 rounded-2xl p-6 text-left mb-6">
                <div className="grid grid-cols-2 gap-6 text-white">
                  <div>
                    <span className="text-white/60 text-sm block mb-1">Booking Ref.</span>
                    <p className="font-bold text-lg font-mono">{bookingResult.id}</p>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm block mb-1">Estado</span>
                    <p className="font-bold text-emerald-400 capitalize">{bookingResult.status}</p>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm block mb-1">Total pagado</span>
                    <p className="font-bold">${bookingResult.total_amount} {bookingResult.total_currency}</p>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm block mb-1">Pasajeros</span>
                    <p className="font-bold">{bookingResult.passengers?.length || passengers.length}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/reservations" className="flex-1 bg-white/10 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors">
                  Ver mis reservaciones
                </Link>
                <button
                  onClick={() => router.push('/search')}
                  className="flex-1 bg-volaris-red text-white font-bold px-6 py-3 rounded-xl hover:bg-red-700 transition-colors"
                >
                  Nueva búsqueda
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!offer) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/offers" className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image src="/img/icono_kroa.png" alt="Kroatravel" fill className="object-contain" />
            </div>
            <span className="text-white font-bold text-xl">Kroatravel</span>
          </Link>
          <Link href="/search" className="text-white/60 hover:text-white text-sm">
            ← Cancelar
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit}>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-volaris-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Datos de contacto
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-sm mb-1 block">Email</label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-volaris-red/50 transition-colors"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-1 block">Teléfono</label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-volaris-red/50 transition-colors"
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                </div>
              </div>

              {passengers.map((passenger, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-7 h-7 bg-volaris-red rounded-full flex items-center justify-center text-sm">{index + 1}</span>
                    Pasajero {index + 1}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Nombre</label>
                      <input
                        type="text"
                        value={passenger.firstName}
                        onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-volaris-red/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Apellido</label>
                      <input
                        type="text"
                        value={passenger.lastName}
                        onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-volaris-red/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Fecha de nacimiento</label>
                      <input
                        type="date"
                        value={passenger.dateOfBirth}
                        onChange={(e) => handlePassengerChange(index, 'dateOfBirth', e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-volaris-red/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Tipo de documento</label>
                      <select
                        value={passenger.documentType}
                        onChange={(e) => handlePassengerChange(index, 'documentType', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-volaris-red/50 transition-colors"
                      >
                        <option value="passport" className="bg-slate-800">Pasaporte</option>
                        <option value="driving_licence" className="bg-slate-800">Licencia</option>
                        <option value="national_identity_document" className="bg-slate-800">INE</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-white/60 text-sm mb-1 block">Número de documento</label>
                      <input
                        type="text"
                        value={passenger.documentNumber}
                        onChange={(e) => handlePassengerChange(index, 'documentNumber', e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-volaris-red/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-volaris-red to-red-600 text-white font-bold py-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-volaris-red/30 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirmar reservación
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl sticky top-4">
              <div className="bg-gradient-to-r from-volaris-red to-red-700 p-4">
                <div className="flex justify-between items-center text-white">
                  <span className="font-bold text-lg">BOARDING PASS</span>
                  <span className="text-white/80 text-sm">{getCarrierName(offer.slices[0]?.segments[0])}</span>
                </div>
              </div>

              <div className="p-6">
                {offer.slices.map((slice, sliceIndex) => (
                  <div key={sliceIndex} className={sliceIndex > 0 ? 'mt-6 pt-6 border-t border-gray-200' : ''}>
                    {slice.segments.map((seg, segIndex) => (
                      <div key={segIndex} className="mb-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">{getAirportCode(seg, 'origin')}</div>
                            <div className="text-xs text-gray-500">{getTerminal(seg, 'origin') ? `Terminal ${getTerminal(seg, 'origin')}` : ''}</div>
                            <div className="text-sm text-gray-600 mt-1">{getCityName(seg, 'origin')}</div>
                            <div className="text-xl font-bold text-gray-900 mt-2">{formatTime(seg?.departing_at)}</div>
                            <div className="text-xs text-gray-500">{formatDateShort(seg?.departing_at)}</div>
                          </div>

                          <div className="flex-1 px-4">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-volaris-red"></div>
                              <div className="flex-1 border-t-2 border-dashed border-gray-300 relative">
                                <svg className="w-5 h-5 text-volaris-red absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-white px-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                              </div>
                              <div className="w-3 h-3 rounded-full bg-volaris-red"></div>
                            </div>
                            <div className="text-center text-xs text-gray-500 mt-2">
                              {formatDuration(seg?.duration)}
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">{getAirportCode(seg, 'destination')}</div>
                            <div className="text-xs text-gray-500">{getTerminal(seg, 'destination') ? `Terminal ${getTerminal(seg, 'destination')}` : ''}</div>
                            <div className="text-sm text-gray-600 mt-1">{getCityName(seg, 'destination')}</div>
                            <div className="text-xl font-bold text-gray-900 mt-2">{formatTime(seg?.arriving_at)}</div>
                            <div className="text-xs text-gray-500">{formatDateShort(seg?.arriving_at)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                <div className="mt-6 pt-6 border-t-2 border-gray-300">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Clase</span>
                      <p className="font-bold text-gray-900">{getCabinClassName(offer.cabin_class)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tarifa</span>
                      <p className="font-bold text-gray-900">{offer.fare_brand_name || 'Standard'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Pasajeros</span>
                      <p className="font-bold text-gray-900">{offer.passengers?.length || 1}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500">Total</span>
                      <p className="font-bold text-xl text-volaris-red">${offer.total_amount} {offer.total_currency}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 p-4 text-center text-xs text-gray-500">
                Kroatravel • {offer.id}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}