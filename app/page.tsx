import Link from 'next/link'
import Image from 'next/image'
import Features from '@/components/Features'
import IntegrationFlow from '@/components/IntegrationFlow'

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="absolute top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image src="/img/icono_kroa.png" alt="Kroatravel" fill className="object-contain" />
            </div>
            <span className="text-white font-bold text-xl">Kroatravel</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/reservations" className="text-white/60 hover:text-white transition-colors">
              Mis Reservaciones
            </Link>
            <Link
              href="/search"
              className="px-6 py-2.5 bg-volaris-red text-white font-semibold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-volaris-red/20"
            >
              Buscar Vuelos
            </Link>
          </div>
        </div>
      </header>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/img/kroa_wallpaper.jpg"
            alt="Fondo Kroatravel"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-900/90" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-32 text-center">
          <div className="flex justify-center items-center gap-8 mb-16 animate-fade-in">
            <div className="relative w-36 h-36 md:w-44 md:h-44 transition-transform hover:scale-105">
              <Image src="/img/icono_kroa.png" alt="Logo Kroatravel" fill className="object-contain drop-shadow-2xl" />
            </div>
            <div className="text-white/40 text-5xl font-bold">×</div>
            <div className="relative w-44 h-32 md:w-52 md:h-40 transition-transform hover:scale-105">
              <Image src="/img/Volaris-logo.svg.png" alt="Logo Volaris" fill className="object-contain drop-shadow-2xl" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight animate-slide-up">
            Integración <span className="text-kroa-blue">Kroatravel</span>
            <br />con <span className="text-volaris-red">Volaris</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Potencia tu agencia Kroatravel con las mejores herramientas de booking aéreo en tiempo real
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              href="/search"
              className="px-10 py-5 bg-gradient-to-r from-volaris-red to-red-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-xl shadow-volaris-red/30 flex items-center justify-center gap-3 text-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar Vuelos Ahora
            </Link>
            <a
              href="#features"
              className="px-10 py-5 bg-white/5 backdrop-blur-xl text-white font-semibold rounded-xl hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center gap-3 text-lg"
            >
              Ver Funcionalidades
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      <Features />
      <IntegrationFlow />

      <footer className="py-16 bg-gradient-to-b from-transparent to-slate-900/50 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="relative w-12 h-12">
              <Image src="/img/icono_kroa.png" alt="Kroatravel" fill className="object-contain" />
            </div>
            <span className="text-white font-bold text-xl">Kroatravel</span>
          </div>
          <p className="text-white/40 text-sm mb-2">© 2024 Kroatravel. Todos los derechos reservados.</p>
          <p className="text-white/30 text-xs">Powered by Volaris × Duffel API</p>
        </div>
      </footer>
    </main>
  )
}