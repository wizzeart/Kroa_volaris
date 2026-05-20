import { NextResponse } from 'next/server'
import { Duffel } from '@duffel/api'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const offerId = searchParams.get('id')
    const returnServices = searchParams.get('return_services') === 'true'

    if (!offerId) {
      return NextResponse.json({ error: 'Missing offer ID' }, { status: 400 })
    }

    const token = process.env.DUFFEL_ACCESS_TOKEN
    if (!token) {
      return NextResponse.json({ error: 'DUFFEL_ACCESS_TOKEN not configured' }, { status: 500 })
    }

    const duffel = new Duffel({ token })

    const offer = await duffel.offers.get(offerId, {
      return_available_services: returnServices,
    })

    return NextResponse.json(offer.data)
  } catch (error: any) {
    console.error('Offer error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get offer', details: error?.response?.data },
      { status: 500 }
    )
  }
}