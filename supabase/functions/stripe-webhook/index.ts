// =====================================================
// Stripe Webhook Handler - Supabase Edge Function
// معالج Webhook من Stripe
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!stripeSecretKey || !stripeWebhookSecret) {
      throw new Error('Missing Stripe configuration')
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Get webhook signature
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      throw new Error('Missing stripe-signature header')
    }

    // Get raw body
    const body = await req.text()

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        stripeWebhookSecret
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Processing Stripe event:', event.type)

    // Log webhook event
    await supabase.from('payment_webhooks').insert({
      provider: 'stripe',
      event_type: event.type,
      event_data: event.data,
      event_id: event.id,
    })

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(supabase, session)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSucceeded(supabase, paymentIntent)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailed(supabase, paymentIntent)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        await handleChargeRefunded(supabase, charge)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
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
// Event Handlers
// =====================================================

async function handleCheckoutCompleted(supabase: any, session: any) {
  console.log('Checkout completed:', session.id)

  const metadata = session.metadata
  if (!metadata?.userId || !metadata?.transactionId) {
    console.error('Missing metadata in session')
    return
  }

  // Update transaction status
  const { error: updateError } = await supabase
    .from('payment_transactions')
    .update({
      status: 'completed',
      external_transaction_id: session.payment_intent,
      completed_at: new Date().toISOString(),
    })
    .eq('id', metadata.transactionId)

  if (updateError) {
    console.error('Failed to update transaction:', updateError)
    return
  }

  // Add coins to user account
  const { error: coinsError } = await supabase.rpc('add_coins_from_payment', {
    p_user_id: metadata.userId,
    p_transaction_id: metadata.transactionId,
    p_package_id: metadata.packageId,
  })

  if (coinsError) {
    console.error('Failed to add coins:', coinsError)
    return
  }

  console.log(`Successfully added coins to user ${metadata.userId}`)
}

async function handlePaymentSucceeded(supabase: any, paymentIntent: any) {
  console.log('Payment succeeded:', paymentIntent.id)

  const metadata = paymentIntent.metadata
  if (!metadata?.transactionId) {
    console.error('Missing transaction ID in payment intent')
    return
  }

  await supabase
    .from('payment_transactions')
    .update({
      status: 'completed',
      external_transaction_id: paymentIntent.id,
      completed_at: new Date().toISOString(),
    })
    .eq('id', metadata.transactionId)
}

async function handlePaymentFailed(supabase: any, paymentIntent: any) {
  console.log('Payment failed:', paymentIntent.id)

  const metadata = paymentIntent.metadata
  if (!metadata?.transactionId) {
    console.error('Missing transaction ID in payment intent')
    return
  }

  await supabase
    .from('payment_transactions')
    .update({
      status: 'failed',
      external_transaction_id: paymentIntent.id,
      error_message: paymentIntent.last_payment_error?.message,
    })
    .eq('id', metadata.transactionId)
}

async function handleChargeRefunded(supabase: any, charge: any) {
  console.log('Charge refunded:', charge.id)

  // Find transaction by external ID
  const { data: transaction } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('external_transaction_id', charge.payment_intent)
    .single()

  if (!transaction) {
    console.error('Transaction not found for refund')
    return
  }

  // Process refund
  await supabase.rpc('process_payment_refund', {
    p_transaction_id: transaction.id,
    p_admin_id: null, // System refund
    p_reason: 'Stripe refund',
  })

  console.log(`Refund processed for transaction ${transaction.id}`)
}
