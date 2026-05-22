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

    const passengersForApi = passengers.map((p: any, index: number) => {
      return {
        type: 'adult',
        title: p.title || 'mr',
        given_name: String(p.first_name || p.given_name || ''),
        family_name: String(p.last_name || p.family_name || ''),
        gender: p.gender || 'M',
        born_on: String(p.born_on || ''),
        email: String(contact?.email || ''),
        phone_number: formattedPhone,
        document_type: String(p.document_type || 'passport'),
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
      selected_offers: [{ id: offerId }],
      passengers: passengersForApi,
      payments: [{
        type: 'balance',
        currency: totalCurrency || 'USD',
        amount: totalAmount || '0',
      }],
      metadata: { agency: 'Kroatravel' },
    }
    console.log('Order payload:', JSON.stringify(orderPayload, null, 2))

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