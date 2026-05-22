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

    // Ensure proper country code
    if (!phoneDigits.startsWith('52')) {
      // If it doesn't start with 52, assume it's a 10-digit Mexican number
      if (phoneDigits.length === 10) {
        phoneDigits = '52' + phoneDigits
      }
    }

    const formattedPhone = '+' + phoneDigits
    const e164Pattern = /^\+52\d{10,11}$/
    
    if (!e164Pattern.test(formattedPhone)) {
      console.error('Phone validation failed:', { original: phoneRaw, formatted: formattedPhone })
    }

    const passengersForApi = passengers.map((p: any, index: number) => {
      // Normalize gender: accept 'male'/'m'/'mr' -> 'm', 'female'/'f'/'mrs'/'ms' -> 'f'
      let gender = String(p.gender || 'm').toLowerCase()
      if (gender === 'mr' || gender === 'male' || gender === 'h') gender = 'm'
      if (gender === 'mrs' || gender === 'female' || gender === 'ms' || gender === 'f' || gender === 'm') {
        gender = gender === 'f' || gender === 'female' || gender === 'mrs' || gender === 'ms' ? 'f' : 'm'
      }
      
      // Build passenger object - don't include id field as Duffel doesn't recognize custom IDs
      const passenger: any = {
        given_name: String(p.given_name || p.first_name || '').trim(),
        family_name: String(p.family_name || p.last_name || '').trim(),
        title: String(p.title || 'mr').toLowerCase(),
        gender: gender,
        born_on: String(p.born_on || '').trim(),
        email: String(contact?.email || '').trim().toLowerCase(),
        phone_number: formattedPhone,
        document_type: String(p.document_type || 'passport').toLowerCase(),
        document_number: String(p.document_number || '').trim(),
      }
      
      // Only add id if it comes from the offer passengers
      if (offerPassengers && offerPassengers[index]?.passenger_id) {
        passenger.id = offerPassengers[index].passenger_id
      }
      
      return passenger
    })

    console.log('Phone formatted:', formattedPhone)
    console.log('Offer ID:', offerId)
    console.log('Offer ID type:', typeof offerId)
    console.log('Offer ID starts with off_:', offerId?.startsWith('off_'))
    console.log('Passengers count:', passengers?.length)
    console.log('Offer passengers:', JSON.stringify(offerPassengers, null, 2))
    console.log('Passengers sample:', JSON.stringify(passengersForApi[0], null, 2))

    const orderPayload = {
      selected_offers: [offerId],
      passengers: passengersForApi,
      payments: [{
        type: 'balance',
        currency: totalCurrency || 'USD',
        amount: totalAmount || '0',
      }],
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