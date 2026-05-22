import { NextResponse } from 'next/server'
import { Duffel } from '@duffel/api'

export async function POST(request: Request) {
  try {
    const { cancellationId } = await request.json()

    if (!cancellationId) {
      return NextResponse.json(
        { error: 'Missing required field: cancellationId' },
        { status: 400 }
      )
    }

    if (!cancellationId.startsWith('ocan_')) {
      return NextResponse.json(
        { error: 'Invalid cancellation ID format' },
        { status: 400 }
      )
    }

    const token = process.env.DUFFEL_ACCESS_TOKEN
    if (!token) {
      return NextResponse.json({ error: 'DUFFEL_ACCESS_TOKEN not configured' }, { status: 500 })
    }

    const duffel = new Duffel({
      token: token,
      apiVersion: 'v2',
    })

    const confirmation = await (duffel.orderCancellations.confirm as any)(cancellationId)

    return NextResponse.json(confirmation.data)

  } catch (error: any) {
    console.error('Cancellation confirmation error:', error)

    let errorMessage = 'Error al confirmar la cancelación'

    if (error?.errors?.[0]) {
      const apiError = error.errors[0]
      if (apiError.code === 'cancellation_expired') {
        errorMessage = 'La solicitud de cancelación ha expirado. Por favor genera una nueva.'
      } else if (apiError.code === 'not_found') {
        errorMessage = 'Solicitud de cancelación no encontrada.'
      } else {
        errorMessage = apiError.message || errorMessage
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}