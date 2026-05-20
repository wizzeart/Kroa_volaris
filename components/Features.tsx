import Image from 'next/image'

const features = [
  {
    icon: '🔍',
    title: 'Búsqueda de Vuelos',
    description: 'Busca ofertas de vuelos en tiempo real con soporte para múltiples destinos y fechas.',
    code: `const offers = await duffel.offerRequests.create({
  slices: [{
    origin: 'MEX',
    destination: 'CUN',
    departure_date: '2024-06-15',
  }],
  passengers: [{ type: 'adult' }],
  cabin_class: 'economy',
})`,
  },
  {
    icon: '✈️',
    title: 'Gestión de Aeronaves',
    description: 'Accede a información detallada de aeronaves y rutas disponibles.',
    code: `const aircraft = await duffel.aircraft.get(
  'arc_00009VMF8AhXSSRnQDI6Hi'
)
console.log(aircraft.data)`,
  },
  {
    icon: '💳',
    title: 'Reservas y Pagos',
    description: 'Procesa reservas de forma segura con integración de pagos integrada.',
    code: `const order = await duffel.orders.create({
  offer_id: offerId,
  passengers: [...],
  payments: [{ type: 'balance' }],
})`,
  },
  {
    icon: '📋',
    title: 'Confirmaciones',
    description: 'Gestiona cancelaciones y obtén confirmaciones al instante.',
    code: `const cancellation = await duffel
  .orderCancellations.confirm(cancellationId)`,
  },
  {
    icon: '🔄',
    title: 'Sincronización',
    description: 'Mantén tus sistemas sincronizados con webhooks en tiempo real.',
    code: `duffel.on('order_updated', (data) => {
  console.log('Orden actualizada:', data)
})`,
  },
  {
    icon: '📊',
    title: 'Reportes',
    description: 'Genera reportes detallados de ventas y comisiones.',
    code: `const orders = await duffel.orders.list({
  limit: 100,
  after: cursor,
})`,
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Funcionalidades de la <span className="text-kroa-blue">API</span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Accede a todas las herramientas necesarias para integrar Volaris en tu plataforma
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-volaris-red/30 transition-all group"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{feature.icon}</span>
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                </div>
                <p className="text-white/60 leading-relaxed">{feature.description}</p>
              </div>
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 border-t border-white/5">
                <pre className="text-xs text-emerald-400/80 overflow-x-auto font-mono">
                  <code>{feature.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}