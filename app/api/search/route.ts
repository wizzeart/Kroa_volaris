import { NextResponse } from 'next/server'
import { Duffel } from '@duffel/api'

export async function POST(request: Request) {
  try {
    const { origin, destination, departureDate, passengers, cabinClass } = await request.json()

    if (!origin || !destination || !departureDate) {
      return NextResponse.json(
        { error: 'Missing required fields: origin, destination, departureDate' },
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

    const passengersArray = []
    for (let i = 0; i < (passengers || 1); i++) {
      passengersArray.push({ type: 'adult' })
    }

    const offerRequest = await duffel.offerRequests.create({
      slices: [
        {
          origin,
          destination,
          departure_date: departureDate,
        },
      ],
      passengers: passengersArray,
      cabin_class: cabinClass || 'economy',
      return_offers: true,
    })

    const data = offerRequest.data

    if (data.offers && data.offers.length > 0) {
      const firstSegment = data.offers[0].slices?.[0]?.segments?.[0]
      console.log('Segment structure:', JSON.stringify(firstSegment, null, 2))
      console.log('Origin keys:', firstSegment?.origin ? Object.keys(firstSegment.origin) : 'no origin')
      console.log('Destination keys:', firstSegment?.destination ? Object.keys(firstSegment.destination) : 'no destination')
    }

    return NextResponse.json(data)

  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to search flights', details: error?.response?.data },
      { status: 500 }
    )
  }
}