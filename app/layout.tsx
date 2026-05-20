import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kroatravel x Volaris - Integración Duffel API',
  description: 'Portal de integración de la API de Volaris mediante la plataforma Duffel para la agencia Kroatravel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  )
}