import { NextResponse } from 'next/server'
import { Duffel } from '@duffel/api'

export async function POST(request: Request) {
  try {
    const { offerId, passengers, contact, totalAmount, totalCurrency, offerPassengers } = await request.json()

    if (!offerId || !passengers || passengers.length === 0) {
      console.error('Validation failed:', { offerId, passengersCount: passengers?.length })
      return NextResponse.json(
        { error: 'Missing required fields: offerId, passengers' },
        { status: 400 }
      )
    }

    if (!offerId.startsWith('off_')) {
      console.error('Invalid offer ID format:', offerId)
      return NextResponse.json(
        { error: 'Invalid offer ID format' },
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

    const phoneRaw = contact?.phone || ''
    let phoneDigits = phoneRaw.replace(/\D/g, '')

    if (phoneDigits.length < 10) {
      phoneDigits = '55' + phoneDigits.padStart(8, '0').slice(-8)
    }

    let formattedPhone: string
    if (phoneDigits.startsWith('521')) {
      formattedPhone = '+' + phoneDigits
    } else if (phoneDigits.startsWith('52')) {
      formattedPhone = '+' + phoneDigits
    } else if (phoneDigits.startsWith('1') && phoneDigits.length === 11) {
      formattedPhone = '+' + phoneDigits
    } else {
      formattedPhone = '+52' + phoneDigits
    }

    if (formattedPhone.length < 12) {
      formattedPhone = '+525555555555'
    }

    const passengersForApi = passengers.map((p: any) => {
      return {
        given_name: String(p.given_name || p.first_name || ''),
        family_name: String(p.family_name || p.last_name || ''),
        title: (p.title || 'mr').toLowerCase(),
        gender: (p.gender || 'm').toUpperCase(),
        born_on: String(p.born_on || ''),
        email: String(contact?.email || ''),
        phone_number: formattedPhone,
        document_type: String(p.document_type || 'passport').toLowerCase(),
        document_number: String(p.document_number || ''),
      }
    })

    console.log('Phone formatted:', formattedPhone)
    console.log('Offer ID:', offerId)
    console.log('Offer ID type:', typeof offerId)
    console.log('Offer ID starts with off_:', offerId?.startsWith('off_'))
    console.log('Passengers count:', passengers?.length)
    console.log('Passengers sample:', JSON.stringify(passengersForApi[0], null, 2))

    const orderPayload = {
      selected_offers: [offerId],
      passengers: passengersForApi,
      metadata: { agency: 'Kroatravel' },
    }
    console.log('Order payload:', JSON.stringify(orderPayload, null, 2))

    // First verify the offer still exists and is valid
    try {
      const offerCheck = await (duffel.offers.get as any)(offerId)
      console.log('Offer still valid, expires_at:', offerCheck.data?.expires_at)
    } catch (offerError: any) {
      console.error('Offer check failed:', offerError.message)
    }

    const order = await (duffel.orders.create as any)(orderPayload)

    console.log('Order created:', order.data.id)
    return NextResponse.json(order.data)

  } catch (error: any) {
    console.error('Booking error:', error)
    const errorDetails = error?.response?.data || error?.message
    return NextResponse.json(
      { error: error.message || 'Failed to create booking', details: errorDetails },
      { status: 500 }
    )
  }
}