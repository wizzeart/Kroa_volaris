import { NextResponse } from 'next/server'
import { Duffel } from '@duffel/api'

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing required field: orderId' },
        { status: 400 }
      )
    }

    if (!orderId.startsWith('ord_')) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
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

    const cancellation = await (duffel.orderCancellations.create as any)({ order_id: orderId })

    return NextResponse.json(cancellation.data)

  } catch (error: any) {
    console.error('Cancellation creation error:', error)

    let errorMessage = 'Error al procesar la solicitud de cancelación'

    if (error?.errors?.[0]) {
      const apiError = error.errors[0]
      if (apiError.code === 'order_not_cancellable') {
        errorMessage = 'Esta orden no puede ser cancelada. Verifica las condiciones de la tarifa.'
      } else if (apiError.code === 'not_found') {
        errorMessage = 'Orden no encontrada.'
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