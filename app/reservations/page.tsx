'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type ViewMode = 'cards' | 'table' | 'timeline'
type StatusFilter = 'all' | 'confirmed' | 'pending' | 'cancelled'

interface Order {
  id: string
  status: string
  total_amount: string
  total_currency: string
  created_at: string
  passengers: Array<{
    id: string
    given_name: string
    family_name: string
    type: string
  }>
  slices: Array<{
    segments: Array<{
      departing_at: string
      arriving_at: string
      duration: string
      marketing_carrier: { name: string; logo_symbol?: string }
      origin: { iata_code: string; city_name: string; name?: string }
      destination: { iata_code: string; city_name: string; name?: string }
    }>
  }>
}

export default function ReservationsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'year'>('all')

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [cancellationData, setCancellationData] = useState<any>(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      if (response.ok) {
        setOrders(data)
      } else {
        setError(data.error || 'Error al cargar reservaciones')
      }
    } catch (err) {
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelClick = (order: Order) => {
    setSelectedOrder(order)
    setCancellationData(null)
    setCancelError(null)
    setShowCancelModal(true)
  }

  const requestCancellation = async () => {
    if (!selectedOrder) return
    setCancelLoading(true)
    setCancelError(null)
    try {
      const response = await fetch('/api/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedOrder.id }),
      })
      const data = await response.json()
      if (response.ok) {
        setCancellationData(data)
      } else {
        setCancelError(data.error || 'Error al solicitar cancelación')
      }
    } catch (err) {
      setCancelError('Error al conectar con el servidor')
    } finally {
      setCancelLoading(false)
    }
  }

  const confirmCancellation = async () => {
    if (!cancellationData?.id) return
    setCancelLoading(true)
    setCancelError(null)
    try {
      const response = await fetch('/api/cancel/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellationId: cancellationData.id }),
      })
      const data = await response.json()
      if (response.ok) {
        setShowCancelModal(false)
        fetchOrders()
      } else {
        setCancelError(data.error || 'Error al confirmar cancelación')
      }
    } catch (err) {
      setCancelError('Error al conectar con el servidor')
    } finally {
      setCancelLoading(false)
    }
  }

  const closeCancelModal = () => {
    setShowCancelModal(false)
    setSelectedOrder(null)
    setCancellationData(null)
    setCancelError(null)
  }

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          order.id.toLowerCase().includes(query) ||
          order.passengers.some(p =>
            `${p.given_name} ${p.family_name}`.toLowerCase().includes(query)
          ) ||
          order.slices.some(s =>
            s.segments.some(seg =>
              seg.origin.iata_code.toLowerCase().includes(query) ||
              seg.destination.iata_code.toLowerCase().includes(query) ||
              seg.origin.city_name.toLowerCase().includes(query) ||
              seg.destination.city_name.toLowerCase().includes(query)
            )
          )
        if (!matchesSearch) return false
      }

      if (dateFilter !== 'all') {
        const orderDate = new Date(order.created_at)
        const now = new Date()
        const diffDays = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))

        if (dateFilter === 'week' && diffDays > 7) return false
        if (dateFilter === 'month' && diffDays > 30) return false
        if (dateFilter === 'year' && diffDays > 365) return false
      }

      return true
    })
  }, [orders, statusFilter, searchQuery, dateFilter])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateFull = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (duration?: string) => {
    if (!duration) return ''
    const match = duration.match(/PT(\d+)H(\d+)?M?/)
    if (match) return `${match[1]}h ${match[2] || '0'}m`
    return duration
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30',
    }
    return styles[status] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      confirmed: 'Confirmado',
      pending: 'Pendiente',
      cancelled: 'Cancelado',
    }
    return texts[status] || status
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      confirmed: '✓',
      pending: '◐',
      cancelled: '✗',
    }
    return icons[status] || '●'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-volaris-red/30 border-t-volaris-red rounded-full animate-spin"></div>
          <div className="text-white/80 text-lg">Cargando reservaciones...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image src="/img/icono_kroa.png" alt="Kroatravel" fill className="object-contain" />
              </div>
              <span className="text-white font-bold text-xl">Kroatravel</span>
            </Link>
            <Link href="/search" className="text-white/60 hover:text-white transition-colors text-sm">
              ← Nueva búsqueda
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Mis Reservaciones</h1>
            <p className="text-white/60">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'reservación' : 'reservaciones'}
              {filteredOrders.length !== orders.length && ` de ${orders.length} totales`}
            </p>
          <div className="flex items-center gap-4 mt-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30`}>
                <span>✓</span>
                {orders.filter(o => o.status === 'confirmed').length} Confirmados
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30`}>
                <span>◐</span>
                {orders.filter(o => o.status === 'pending').length} Pendientes
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30`}>
                <span>✗</span>
                {orders.filter(o => o.status === 'cancelled').length} Cancelados
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-md text-sm transition-all ${viewMode === 'cards' ? 'bg-volaris-red text-white' : 'text-white/60 hover:text-white'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zm10 0a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-md text-sm transition-all ${viewMode === 'table' ? 'bg-volaris-red text-white' : 'text-white/60 hover:text-white'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 rounded-md text-sm transition-all ${viewMode === 'timeline' ? 'bg-volaris-red text-white' : 'text-white/60 hover:text-white'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por ID, pasajero, ruta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-volaris-red/50 transition-colors"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-volaris-red/50 transition-colors"
            >
              <option value="all" className="bg-slate-800">Todos los estados</option>
              <option value="confirmed" className="bg-slate-800">Confirmados</option>
              <option value="pending" className="bg-slate-800">Pendientes</option>
              <option value="cancelled" className="bg-slate-800">Cancelados</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-volaris-red/50 transition-colors"
            >
              <option value="all" className="bg-slate-800">Cualquier fecha</option>
              <option value="week" className="bg-slate-800">Última semana</option>
              <option value="month" className="bg-slate-800">Último mes</option>
              <option value="year" className="bg-slate-800">Último año</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-white/60 text-lg mb-4">No se encontraron reservaciones</p>
            <Link href="/search" className="text-volaris-red hover:underline">
              Realizar una nueva búsqueda
            </Link>
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left text-xs font-medium text-white/60 uppercase tracking-wider px-6 py-4">Booking Ref</th>
                    <th className="text-left text-xs font-medium text-white/60 uppercase tracking-wider px-6 py-4">Ruta</th>
                    <th className="text-left text-xs font-medium text-white/60 uppercase tracking-wider px-6 py-4">Fecha</th>
                    <th className="text-left text-xs font-medium text-white/60 uppercase tracking-wider px-6 py-4">Pasajeros</th>
                    <th className="text-left text-xs font-medium text-white/60 uppercase tracking-wider px-6 py-4">Estado</th>
                    <th className="text-right text-xs font-medium text-white/60 uppercase tracking-wider px-6 py-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-white font-mono text-sm">{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-white">
                          <span className="font-semibold">{order.slices[0]?.segments[0]?.origin?.iata_code || 'N/A'}</span>
                          <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          <span className="font-semibold">{order.slices[0]?.segments[0]?.destination?.iata_code || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/80 text-sm">{formatDate(order.created_at)}</td>
                      <td className="px-6 py-4 text-white/80 text-sm">
                        {order.passengers.map(p => `${p.given_name} ${p.family_name}`).join(', ')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                          <span>{getStatusIcon(order.status)}</span>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-volaris-red font-bold">${order.total_amount} {order.total_currency}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : viewMode === 'timeline' ? (
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-volaris-red/50 via-volaris-red to-transparent"></div>
            <div className="space-y-8">
              {filteredOrders.map((order) => (
                <div key={order.id} className="relative pl-20">
                  <div className="absolute left-6 w-5 h-5 rounded-full bg-volaris-red border-4 border-slate-900"></div>
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div>
                        <div className="text-white/60 text-sm mb-1">{formatDateFull(order.created_at)}</div>
                        <div className="text-white font-bold text-lg">{order.id}</div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusBadge(order.status)}`}>
                        <span>{getStatusIcon(order.status)}</span>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-white">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{order.slices[0]?.segments[0]?.origin?.iata_code || 'N/A'}</div>
                        <div className="text-sm text-white/60">{order.slices[0]?.segments[0]?.origin?.city_name || 'N/A'}</div>
                      </div>
                      <div className="flex-1 relative">
                        <div className="h-px bg-gradient-to-r from-white/30 via-volaris-red to-white/30"></div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{order.slices[0]?.segments[0]?.destination?.iata_code || 'N/A'}</div>
                        <div className="text-sm text-white/60">{order.slices[0]?.segments[0]?.destination?.city_name || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="group bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-volaris-red/30 hover:shadow-xl hover:shadow-volaris-red/5 transition-all">
                <div className="relative p-6">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-volaris-red via-orange-500 to-volaris-red"></div>

                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Booking Ref.</div>
                      <div className="text-white font-mono font-semibold text-sm">{order.id.length > 20 ? order.id : order.id}</div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                      <span>{getStatusIcon(order.status)}</span>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">{order.slices[0]?.segments[0]?.origin?.iata_code || 'N/A'}</div>
                      <div className="text-xs text-white/60 mt-1">{order.slices[0]?.segments[0]?.origin?.city_name || 'N/A'}</div>
                    </div>

                    <div className="flex-1 px-4">
                      <div className="flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white/30"></div>
                        <div className="flex-1 h-px bg-gradient-to-r from-white/30 via-volaris-red to-white/30"></div>
                        <svg className="w-5 h-5 text-volaris-red" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                      </div>
                      <div className="text-center text-xs text-white/60 mt-1">
                        {order.slices[0]?.segments[0]?.marketing_carrier?.name || 'N/A'}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">{order.slices[0]?.segments[0]?.destination?.iata_code || 'N/A'}</div>
                      <div className="text-xs text-white/60 mt-1">{order.slices[0]?.segments[0]?.destination?.city_name || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/5 rounded-xl p-3">
                      <div className="text-white/60 text-xs mb-1">Salida</div>
                      <div className="text-white font-semibold text-sm">
                        {order.slices[0]?.segments[0] ? formatDate(order.slices[0].segments[0].departing_at) : 'N/A'}
                      </div>
                      <div className="text-volaris-red text-lg font-bold">
                        {order.slices[0]?.segments[0] ? formatTime(order.slices[0].segments[0].departing_at) : '--:--'}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <div className="text-white/60 text-xs mb-1">Llegada</div>
                      <div className="text-white font-semibold text-sm">
                        {order.slices[0]?.segments[0] ? formatDate(order.slices[0].segments[0].arriving_at) : 'N/A'}
                      </div>
                      <div className="text-volaris-red text-lg font-bold">
                        {order.slices[0]?.segments[0] ? formatTime(order.slices[0].segments[0].arriving_at) : '--:--'}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white/60 text-xs mb-1">Pasajeros</div>
                        <div className="text-white text-sm">
                          {order.passengers.map(p => `${p.given_name} ${p.family_name}`).join(', ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white/60 text-xs mb-1">Total</div>
                        <div className="text-2xl font-bold text-volaris-red">
                          ${order.total_amount}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 px-6 py-3 flex justify-between items-center">
                  <span className="text-white/40 text-xs">Creado: {formatDate(order.created_at)}</span>
                  <div className="flex items-center gap-2">
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelClick(order)}
                        className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
                      >
                        Cancelar
                      </button>
                    )}
                    <span className="text-volaris-red text-xs font-medium">Kroatravel</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCancelModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/10 w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-orange-500 p-4">
              <h3 className="text-white font-bold text-lg">Cancelar Reservación</h3>
            </div>
            <div className="p-6">
              {!cancellationData ? (
                <>
                  <p className="text-white/80 mb-4">
                    ¿Estás seguro de que deseas cancelar la reservación <span className="font-mono text-white">{selectedOrder.id}</span>?
                  </p>
                  <p className="text-white/60 text-sm mb-6">Esta acción no se puede deshacer.</p>
                  {cancelError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
                      <p className="text-red-400 text-sm">{cancelError}</p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={closeCancelModal}
                      className="flex-1 px-4 py-2 rounded-xl border border-white/20 text-white/80 hover:bg-white/5 transition-colors"
                    >
                      Cerrar
                    </button>
                    <button
                      onClick={requestCancellation}
                      disabled={cancelLoading}
                      className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {cancelLoading ? 'Procesando...' : 'Solicitar Cancelación'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-white mb-2">
                      {cancellationData.refund_amount} {cancellationData.refund_currency}
                    </div>
                    <p className="text-white/60 text-sm">Monto a reembolsar</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 mb-4">
                    <p className="text-white/60 text-xs mb-1">Expira:</p>
                    <p className="text-white font-medium">
                      {new Date(cancellationData.expires_at).toLocaleString('es-MX')}
                    </p>
                  </div>
                  <p className="text-white/60 text-sm mb-6">
                    El reembolso se procesará a: <span className="text-white">{cancellationData.refund_to}</span>
                  </p>
                  {cancelError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
                      <p className="text-red-400 text-sm">{cancelError}</p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={closeCancelModal}
                      className="flex-1 px-4 py-2 rounded-xl border border-white/20 text-white/80 hover:bg-white/5 transition-colors"
                    >
                      Cerrar
                    </button>
                    <button
                      onClick={confirmCancellation}
                      disabled={cancelLoading}
                      className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {cancelLoading ? 'Confirmando...' : 'Confirmar Cancelación'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}