
const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY!
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET!
const PESAPAL_BASE_URL = process.env.PESAPAL_BASE_URL || 'https://cyb3r.pesapal.com/pesapalv3'

interface PesapalToken {
  token: string
  expiry_in: number
  token_type: string
}

export async function getPesapalToken(): Promise<string> {
  const response = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      consumer_key: PESAPAL_CONSUMER_KEY,
      consumer_secret: PESAPAL_CONSUMER_SECRET,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Pesapal auth failed:', response.status, errorText);
    throw new Error(`Pesapal auth failed: ${response.status}`)
  }

  const data: PesapalToken = await response.json()
  return data.token
}

// Simple in-memory token cache
let cachedToken: { token: string; expiresAt: number } | null = null

export async function getCachedPesapalToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt - 5 * 60 * 1000 > now) {
    return cachedToken.token
  }

  const token = await getPesapalToken()
  cachedToken = { token, expiresAt: now + 3600 * 1000 }
  return token
}

export async function registerPesapalIPN(ipnUrl: string): Promise<string> {
  const token = await getCachedPesapalToken()

  const response = await fetch(`${PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: ipnUrl,
      ipn_notification_type: 'POST',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text();
    console.error('IPN registration failed:', response.status, errorText);
    throw new Error(`IPN registration failed: ${response.status}`)
  }

  const data = await response.json()
  return data.ipn_id as string
}

export interface PesapalOrderRequest {
  orderId: string
  amount: string
  currency: string
  description: string
  callbackUrl: string
  billingEmail: string
  billingName?: string
  countryCode?: string
  items?: Array<{
    itemId: string
    itemName: string
    itemDescription?: string
    itemQuantity: string
    unitAmount: string
  }>
}

export interface PesapalRedirectUrl {
  orderTrackingId: string
  redirectUrl: string
}

export async function submitPesapalOrder(order: PesapalOrderRequest): Promise<PesapalRedirectUrl> {
  const token = await getCachedPesapalToken()

  const response = await fetch(`${PESAPAL_BASE_URL}/api/Orders/SubmitOrderRequest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: order.orderId,
      currency: order.currency,
      amount: order.amount,
      description: order.description,
      callback_url: order.callbackUrl,
      notification_id: undefined,
      billing_address: {
        email_address: order.billingEmail,
        country_code: order.countryCode || 'KE',
        name: order.billingName || '',
      },
      items: order.items || [
        {
          item_id: order.orderId,
          item_name: order.description,
          item_quantity: '1',
          unit_amount: order.amount,
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Order submission failed:', response.status, errorText);
    throw new Error(`Order submission failed: ${response.status}`)
  }

  const data = await response.json()
  return {
    orderTrackingId: data.order_tracking_id,
    redirectUrl: data.redirect_instruction?.url || data.redirect_url,
  }
}

export async function getPesapalTransactionStatus(orderTrackingId: string) {
  const token = await getCachedPesapalToken()

  const response = await fetch(`${PESAPAL_BASE_URL}/api/Orders/GetTransactionStatus`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ order_tracking_id: orderTrackingId }),
  })

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Status check failed:', response.status, errorText);
    throw new Error(`Status check failed: ${response.status}`)
  }

  return response.json()
}
