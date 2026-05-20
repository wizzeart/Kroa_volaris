const codeExamples = [
  {
    title: 'Inicialización del Cliente',
    description: 'Configura el cliente Duffel con tu token de acceso',
    code: `import { Duffel } from '@duffel/api'

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN,
  debug: { verbose: true },
})`,
  },
  {
    title: 'Búsqueda de Ofertas',
    description: 'Busca vuelos disponibles con specifying parameters',
    code: `const offerRequest = await duffel.offerRequests.create({
  slices: [
    {
      origin: 'MEX',
      destination: 'GDL',
      departure_date: '2024-07-01',
    },
  ],
  passengers: [
    { type: 'adult', count: 2 },
    { type: 'child', count: 1 },
  ],
  cabin_class: 'economy',
  return_offers: false,
})`,
  },
  {
    title: 'Crear Orden de Vuelo',
    description: 'Confirma y reserva un vuelo seleccionado',
    code: `const order = await duffel.orders.create({
  offer_id: offerId,
  passengers: [
    {
      id: 'passenger_1',
      title: 'mr',
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan@email.com',
      phone_number: '+5215551234567',
    },
  ],
  payments: [
    { type: 'balance' },
  ],
})`,
  },
  {
    title: 'Lista de Aerolíneas',
    description: 'Obtén información de todas las aerolíneas disponibles',
    code: `const airlines = await duffel.airlines.list({
  limit: 50,
})

for await (const airline of 
  duffel.airlines.listWithGenerator()
) {
  console.log(airline.data.name)
}`,
  },
]

export default function CodeExamples() {
  return (
    <section id="code" className="py-24 bg-kroa-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Ejemplos de <span className="text-volaris-red">Código</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Implementa rápidamente con estos ejemplos listos para usar
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {codeExamples.map((example, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700"
            >
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-bold text-white mb-2">{example.title}</h3>
                <p className="text-gray-400">{example.description}</p>
              </div>
              <div className="p-6 bg-gray-900">
                <pre className="text-sm text-green-400 overflow-x-auto">
                  <code>{example.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}