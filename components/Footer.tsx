import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="relative w-16 h-16">
              <Image
                src="/img/icono_kroa.png"
                alt="Logo Kroa"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-white font-bold text-lg">Kroa</p>
              <p className="text-gray-400">Agencia de Viajes</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-gray-500">Powered by</span>
            <div className="relative w-24 h-16">
              <Image
                src="/img/Volaris-logo.svg.png"
                alt="Logo Volaris"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-800" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 Kroa. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Documentación
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              API Reference
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Soporte
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}