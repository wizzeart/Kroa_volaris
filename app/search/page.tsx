'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const airports = [
  { code: 'MEX', name: 'Ciudad de México - AIFA' },
  { code: 'GDL', name: 'Guadalajara' },
  { code: 'CUN', name: 'Cancún' },
  { code: 'TIJ', name: 'Tijuana' },
  { code: 'MTY', name: 'Monterrey' },
  { code: 'QRO', name: 'Querétaro' },
  { code: 'SJD', name: 'Los Cabos' },
  { code: 'PVR', name: 'Puerto Vallarta' },
  { code: 'OAX', name: 'Oaxaca' },
  { code: 'MZT', name: 'Mazatlán' },
  { code: 'HMO', name: 'Hermosillo' },
  { code: 'CUL', name: 'Culiacán' },
  { code: 'TGZ', name: 'Tuxtla Gutiérrez' },
  { code: 'VSA', name: 'Villahermosa' },
]

export default function SearchPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    origin: 'MEX',
    destination: 'CUN',
    departureDate: '',
    passengers: 1,
    cabinClass: 'economy',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (response.ok) {
        sessionStorage.setItem('searchResults', JSON.stringify(data))
        sessionStorage.setItem('searchParams', JSON.stringify(form))
        router.push('/offers')
      } else {
        alert(data.error || 'Error en la búsqueda')
      }
    } catch (error) {
      alert('Error al realizar la búsqueda')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image src="/img/icono_kroa.png" alt="Kroatravel" fill className="object-contain" />
            </div>
            <span className="text-white font-bold text-xl">Kroatravel</span>
          </Link>
          <Link href="/reservations" className="text-white/60 hover:text-white text-sm">
            Mis Reservaciones
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Busca tu <span className="text-volaris-red">vuelo</span>
            </h1>
            <p className="text-white/60 text-lg">
              Encuentra las mejores ofertas en vuelos domésticos e internacionales
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-white/80 text-sm font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Origen
                </label>
                <select
                  value={form.origin}
                  onChange={(e) => setForm({ ...form, origin: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-volaris-red/50 transition-colors"
                >
                  {airports.map((a) => (
                    <option key={a.code} value={a.code} className="bg-slate-800">{a.code} - {a.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-white/80 text-sm font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Destino
                </label>
                <select
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-volaris-red/50 transition-colors"
                >
                  {airports.filter(a => a.code !== form.origin).map((a) => (
                    <option key={a.code} value={a.code} className="bg-slate-800">{a.code} - {a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-white/80 text-sm font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Fecha de salida
                </label>
                <input
                  type="date"
                  value={form.departureDate}
                  onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-volaris-red/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-white/80 text-sm font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Pasajeros
                </label>
                <select
                  value={form.passengers}
                  onChange={(e) => setForm({ ...form, passengers: parseInt(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-volaris-red/50 transition-colors"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n} className="bg-slate-800">{n} {n === 1 ? 'pasajero' : 'pasajeros'}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-8">
              <label className="text-white/80 text-sm font-medium mb-3 block">Clase</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'economy', label: 'Económica', icon: '💺' },
                  { value: 'premium_economy', label: 'Premium', icon: '✨' },
                  { value: 'business', label: 'Ejecutiva', icon: '🛋️' },
                ].map((cabin) => (
                  <button
                    key={cabin.value}
                    type="button"
                    onClick={() => setForm({ ...form, cabinClass: cabin.value })}
                    className={`py-4 rounded-xl font-medium transition-all flex flex-col items-center gap-2 ${
                      form.cabinClass === cabin.value
                        ? 'bg-volaris-red text-white shadow-lg shadow-volaris-red/30'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <span className="text-2xl">{cabin.icon}</span>
                    <span className="text-sm">{cabin.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-volaris-red to-red-600 text-white font-bold py-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-volaris-red/30 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Buscando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Buscar vuelos
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex justify-center gap-8 text-white/40 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-volaris-red" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Mejor precio garantizado
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-volaris-red" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Confirmación inmediata
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}