import Image from 'next/image'
import Link from 'next/link'

const steps = [
  {
    number: '01',
    title: 'Regístrate en Duffel',
    description: 'Obtén tus credenciales de API desde el dashboard de Duffel',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    number: '02',
    title: 'Configura tu Cliente',
    description: 'Instala el SDK de Duffel y configura tu token de acceso',
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  },
  {
    number: '03',
    title: 'Integra en Kroa',
    description: 'Conecta la API con tu plataforma Kroa usando los ejemplos',
    icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
  },
  {
    number: '04',
    title: 'Comienza a Vender',
    description: 'Ofrece vuelos de Volaris a tus clientes de inmediato',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
]

export default function IntegrationFlow() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Flujo de <span className="text-volaris-red">Integración</span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            4 pasos simples para comenzar a integrar Volaris en tu plataforma
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 h-full transition-all hover:border-volaris-red/30 hover:bg-white/8">
                <div className="text-6xl font-black text-volaris-red/10 absolute -top-2 -left-2">
                  {step.number}
                </div>
                <div className="relative z-10 pt-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-volaris-red to-red-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-volaris-red/20">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-white/60 leading-relaxed">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <svg className="w-8 h-8 text-volaris-red/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}