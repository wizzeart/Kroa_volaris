import { NextResponse } from 'next/server'
import { Duffel } from '@duffel/api'

export async function GET() {
  try {
    const token = process.env.DUFFEL_ACCESS_TOKEN
    if (!token) {
      return NextResponse.json({ error: 'DUFFEL_ACCESS_TOKEN not configured' }, { status: 500 })
    }

    const duffel = new Duffel({
      token: token,
      apiVersion: 'v2',
    })

    const orders = await duffel.orders.list({ limit: 50 })

    return NextResponse.json(orders.data)
  } catch (error: any) {
    console.error('Orders error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}