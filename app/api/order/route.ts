import { NextResponse } from 'next/server'
import { Duffel } from '@duffel/api'

export async function POST(request: Request) {
  try {
    const { offerId, passengers, contact, totalAmount, totalCurrency, offerPassengers } = await request.json()

    if (!offerId || !passengers || passengers.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: offerId, passengers' },
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
      const offerP = offerPassengers?.[index]
      return {
        id: offerP?.passenger_id || offerP?.id || undefined,
        type: 'adult',
        title: 'mr',
        given_name: String(p.first_name || ''),
        family_name: String(p.last_name || ''),
        gender: 'M',
        born_on: String(p.born_on || ''),
        email: String(contact?.email || 'cliente@example.com'),
        phone_number: formattedPhone,
        document_type: String(p.document_type || 'passport'),
        document_number: String(p.document_number || ''),
      }
    })

    console.log('Phone formatted:', formattedPhone)

    const order = await duffel.orders.create({
      selected_offers: [{ id: offerId }],
      passengers: passengersForApi,
      payments: [{
        type: 'balance' as const,
        currency: totalCurrency || 'USD',
        amount: totalAmount || '0',
      }],
      metadata: { agency: 'Kroatravel' },
    })

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