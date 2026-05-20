import Image from 'next/image'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/img/kroa_wallpaper.jpg"
          alt="Fondo Kroa"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-kroa-dark/80 via-kroa-dark/60 to-kroa-dark/90" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="flex justify-center items-center gap-8 mb-12">
          <div className="relative w-32 h-32 md:w-40 md:h-40">
            <Image
              src="/img/icono_kroa.png"
              alt="Logo Kroa"
              fill
              className="object-contain"
            />
          </div>
          <div className="text-white text-4xl font-bold">×</div>
          <div className="relative w-40 h-32 md:w-48 md:h-36">
            <Image
              src="/img/Volaris-logo.svg.png"
              alt="Logo Volaris"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Integración <span className="text-volaris-red">Volaris</span>
          <br />con <span className="text-kroa-blue">Duffel API</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-8">
          Potencia tu agencia Kroa con las mejores herramientas de booking aéreo
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#features"
            className="px-8 py-4 bg-volaris-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Ver Funcionalidades
          </a>
          <a
            href="#code"
            className="px-8 py-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/30"
          >
            Ver Código
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}