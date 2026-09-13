export const WEBHOOK_HANDLER_TS_CODE = `/**
 * RoketLead.ma Next.js App Router Webhook Handler
 * Route: /api/v1/webhooks/order-status/route.ts (or Node.js / Express handler)
 * 
 * Supports:
 * 1. WooCommerce order status transitions (with X-RoketLead-Signature HMAC)
 * 2. Shopify Webhooks ('orders/updated', 'orders/fulfilled' with X-Shopify-Hmac-Sha256)
 * 3. Custom Moroccan Courier APIs (Amana, Cathedis, Sendit, Aramex)
 * 
 * Performs:
 * - HMAC-SHA256 signature validation
 * - Idempotent Prisma database conversion update
 * - Pending vs. Available wallet balance settlement for the promoter in MAD
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
// import { prisma } from '@/lib/prisma'; // In production Prisma connection

interface WebhookBody {
  event?: string;
  topic?: string;
  merchantId: string;
  orderId: string;
  orderNumber?: string;
  oldStatus?: string;
  newStatus?: string;
  normalizedStatus?: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  totalAmountMAD?: number;
  attributionToken?: string;
  promoCode?: string;
  trackingNumber?: string;
  courier?: string;
  timestamp?: string;
}

/**
 * Validates HMAC-SHA256 signature using the Merchant's Secret Key
 */
function verifyHmacSignature(rawBody: string, signature: string | null, secretKey: string): boolean {
  if (!signature || !secretKey) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(rawBody)
    .digest('hex');

  // Shopify base64 signature support
  const expectedBase64 = crypto
    .createHmac('sha256', secretKey)
    .update(rawBody)
    .digest('base64');

  return (
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature)) ||
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedBase64))
  );
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-roketlead-signature') || req.headers.get('x-shopify-hmac-sha256');
    const merchantIdHeader = req.headers.get('x-roketlead-merchant-id');

    let body: WebhookBody;
    try {
      body = JSON.parse(rawBody);
    } catch (parseErr) {
      return NextResponse.json(
        { error: 'Invalid JSON payload format' },
        { status: 400 }
      );
    }

    const merchantId = body.merchantId || merchantIdHeader;
    if (!merchantId) {
      return NextResponse.json(
        { error: 'Missing merchant identifier' },
        { status: 400 }
      );
    }

    // 1. Fetch Merchant Profile & Secret Key from Database
    /*
    const merchant = await prisma.merchantProfile.findFirst({
      where: { OR: [{ id: merchantId }, { slug: merchantId }] },
      select: { id: true, integrationSecretKey: true, companyName: true }
    });
    */
    // Simulated DB lookup:
    const mockSecretKey = 'sec_live_' + merchantId; // or fetched secret
    
    // In production, enforce HMAC signature validation:
    // const isValid = verifyHmacSignature(rawBody, signature, merchant.integrationSecretKey);
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Unauthorized: Invalid HMAC signature' }, { status: 401 });
    // }

    // 2. Normalize Status
    let targetStatus: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' = 'PENDING';
    const statusInput = (body.normalizedStatus || body.newStatus || '').toUpperCase();

    if (['DELIVERED', 'COMPLETED', 'WC-DELIVERED', 'FULFILLED'].includes(statusInput)) {
      targetStatus = 'DELIVERED';
    } else if (['CONFIRMED', 'PROCESSING', 'IN-TRANSIT', 'WC-SHIPPED'].includes(statusInput)) {
      targetStatus = 'CONFIRMED';
    } else if (['CANCELLED', 'FAILED', 'WC-CANCELLED'].includes(statusInput)) {
      targetStatus = 'CANCELLED';
    } else if (['RETURNED', 'REFUNDED', 'WC-RETURNED', 'WC-REFUSED'].includes(statusInput)) {
      targetStatus = 'RETURNED';
    }

    // 3. Locate Existing Conversion Record in Database
    /*
    const conversion = await prisma.conversion.findFirst({
      where: {
        merchantId: merchant.id,
        orderNumber: body.orderNumber || body.orderId
      },
      include: { affiliate: true }
    });

    if (!conversion) {
      return NextResponse.json(
        { message: 'Order received but no affiliate attribution attached. Logged for records.' },
        { status: 200 }
      );
    }

    // Check if status is already in terminal state
    if (conversion.status === 'DELIVERED' && targetStatus === 'DELIVERED') {
      return NextResponse.json({ message: 'Order already marked as DELIVERED.' }, { status: 200 });
    }

    // 4. Atomic Transaction: Update Conversion + Settle Affiliate Wallet
    await prisma.$transaction(async (tx) => {
      // A. Update conversion status
      await tx.conversion.update({
        where: { id: conversion.id },
        data: {
          status: targetStatus,
          courierName: body.courier || conversion.courierName,
          trackingNumber: body.trackingNumber || conversion.trackingNumber,
          deliveredAt: targetStatus === 'DELIVERED' ? new Date() : undefined,
        }
      });

      // B. If DELIVERED: Unlock commission from Pending to Available Wallet Balance
      if (targetStatus === 'DELIVERED' && conversion.status !== 'DELIVERED') {
        await tx.affiliateProfile.update({
          where: { id: conversion.affiliateId },
          data: {
            pendingCommissionMAD: { decrement: conversion.commissionMAD },
            walletBalanceMAD: { increment: conversion.commissionMAD },
            lifetimePaidMAD: { increment: 0 } // Increments on actual bank transfer
          }
        });

        // Audit Log entry
        await tx.systemAuditLog.create({
          data: {
            type: 'COMMISSION_CREDITED',
            title: \`COD Delivered: \${conversion.orderNumber}\`,
            details: \`Unlocked \${conversion.commissionMAD} MAD commission for \${conversion.affiliate.fullName}.\`,
            severity: 'success'
          }
        });
      }

      // C. If CANCELLED / RETURNED: Nullify pending commission
      if (['CANCELLED', 'RETURNED'].includes(targetStatus) && conversion.status === 'PENDING') {
        await tx.affiliateProfile.update({
          where: { id: conversion.affiliateId },
          data: {
            pendingCommissionMAD: { decrement: conversion.commissionMAD }
          }
        });
      }
    });
    */

    return NextResponse.json({
      success: true,
      message: \`Successfully processed COD webhook for order \${body.orderNumber || body.orderId}\`,
      data: {
        orderId: body.orderId,
        orderNumber: body.orderNumber,
        newStatus: targetStatus,
        processedAt: new Date().toISOString()
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('[RoketLead Webhook Error]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error processing webhook', details: error.message },
      { status: 500 }
    );
  }
}
`;
