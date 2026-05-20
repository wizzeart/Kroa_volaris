import { NextResponse } from 'next/server'
import { Duffel } from '@duffel/api'

export async function GET() {
  const token = process.env.DUFFEL_ACCESS_TOKEN

  if (!token) {
    return NextResponse.json({
      success: false,
      error: 'Token no encontrado en variables de entorno',
      envKeys: Object.keys(process.env).filter(k => k.includes('DUFFEL'))
    })
  }

  try {
    const duffel = new Duffel({ token })

    const airlines = await duffel.airlines.list({ limit: 3 })

    return NextResponse.json({
      success: true,
      tokenPrefix: token.substring(0, 15) + '...',
      airlinesCount: airlines.data.length,
      sampleAirline: airlines.data[0]?.name || 'N/A'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      responseData: error?.response?.data
    })
  }
}