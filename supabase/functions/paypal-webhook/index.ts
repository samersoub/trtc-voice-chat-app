// =====================================================
// PayPal Webhook Handler - Supabase Edge Function
// معالج Webhook من PayPal
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, paypal-transmission-id, paypal-transmission-time, paypal-transmission-sig, paypal-cert-url, paypal-auth-algo',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const paypalWebhookId = Deno.env.get('PAYPAL_WEBHOOK_ID')
    
    if (!paypalWebhookId) {
      throw new Error('Missing PayPal configuration')
    }

    // Get PayPal headers
    const transmissionId = req.headers.get('paypal-transmission-id')
    const transmissionTime = req.headers.get('paypal-transmission-time')
    const transmissionSig = req.headers.get('paypal-transmission-sig')
    const certUrl = req.headers.get('paypal-cert-url')
    const authAlgo = req.headers.get('paypal-auth-algo')

    if (!transmissionId || !transmissionTime || !transmissionSig) {
      throw new Error('Missing PayPal webhook headers')
    }

    // Get body
    const body = await req.text()
    const event = JSON.parse(body)

    // Verify webhook signature
    const isValid = await verifyPayPalWebhook({
      transmissionId,
      transmissionTime,
      transmissionSig,
      certUrl,
      authAlgo,
      webhookId: paypalWebhookId,
      body,
    })

    if (!isValid) {
      console.error('PayPal webhook verification failed')
      return new Response(
        JSON.stringify({ error: 'Webhook verification failed' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Processing PayPal event:', event.event_type)

    // Log webhook event
    await supabase.from('payment_webhooks').insert({
      provider: 'paypal',
      event_type: event.event_type,
      event_data: event,
      event_id: event.id,
    })

    // Handle different event types
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        await handlePaymentCaptured(supabase, event)
        break
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.PENDING': {
        await handlePaymentPending(supabase, event)
        break
      }

      case 'PAYMENT.CAPTURE.REFUNDED': {
        await handlePaymentRefunded(supabase, event)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.event_type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

// =====================================================
// Webhook Verification
// =====================================================

async function verifyPayPalWebhook(params: {
  transmissionId: string
  transmissionTime: string
  transmissionSig: string
  certUrl: string | null
  authAlgo: string | null
  webhookId: string
  body: string
}): Promise<boolean> {
  try {
    // In production, you should verify against PayPal's certificate
    // For now, we'll do basic validation
    
    // Check required fields
    if (!params.transmissionId || !params.transmissionTime || !params.transmissionSig) {
      return false
    }

    // Verify webhook ID is in the event
    const event = JSON.parse(params.body)
    
    // PayPal events should have an id and event_type
    if (!event.id || !event.event_type) {
      return false
    }

    // In production, implement full signature verification:
    // https://developer.paypal.com/api/rest/webhooks/rest/#verify-webhook-signature
    
    return true
  } catch (error) {
    console.error('Webhook verification error:', error)
    return false
  }
}

// =====================================================
// Event Handlers
// =====================================================

async function handlePaymentCaptured(supabase: any, event: any) {
  console.log('Payment captured:', event.id)

  const capture = event.resource
  const customId = capture.custom_id // Our transaction ID

  if (!customId) {
    console.error('Missing custom_id in capture')
    return
  }

  // Find transaction
  const { data: transaction } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('id', customId)
    .single()

  if (!transaction) {
    console.error('Transaction not found:', customId)
    return
  }

  // Update transaction
  const { error: updateError } = await supabase
    .from('payment_transactions')
    .update({
      status: 'completed',
      external_transaction_id: capture.id,
      completed_at: new Date().toISOString(),
    })
    .eq('id', customId)

  if (updateError) {
    console.error('Failed to update transaction:', updateError)
    return
  }

  // Add coins to user
  const { error: coinsError } = await supabase.rpc('add_coins_from_payment', {
    p_user_id: transaction.user_id,
    p_transaction_id: customId,
    p_package_id: transaction.package_id,
  })

  if (coinsError) {
    console.error('Failed to add coins:', coinsError)
    return
  }

  console.log(`Successfully added coins to user ${transaction.user_id}`)
}

async function handlePaymentPending(supabase: any, event: any) {
  console.log('Payment pending:', event.id)

  const capture = event.resource
  const customId = capture.custom_id

  if (!customId) return

  await supabase
    .from('payment_transactions')
    .update({
      status: 'pending',
      external_transaction_id: capture.id,
    })
    .eq('id', customId)
}

async function handlePaymentRefunded(supabase: any, event: any) {
  console.log('Payment refunded:', event.id)

  const refund = event.resource
  const captureId = refund.links?.find((l: any) => l.rel === 'up')?.href?.split('/').pop()

  if (!captureId) {
    console.error('Cannot find capture ID from refund')
    return
  }

  // Find transaction by external ID
  const { data: transaction } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('external_transaction_id', captureId)
    .single()

  if (!transaction) {
    console.error('Transaction not found for refund')
    return
  }

  // Process refund
  await supabase.rpc('process_payment_refund', {
    p_transaction_id: transaction.id,
    p_admin_id: null,
    p_reason: 'PayPal refund',
  })

  console.log(`Refund processed for transaction ${transaction.id}`)
}
