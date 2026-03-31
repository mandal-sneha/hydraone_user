import Stripe from 'stripe';
import dotenv from 'dotenv';
import { Family } from '../models/family.model.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (amount, currency = 'inr', metadata = {}) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency,
            metadata,
            automatic_payment_methods: { enabled: true }
        });
        return { success: true, clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const recordPayment = async (paymentIntentId, amount, waterId, month, paidBy) => {
    try {
        const [rootId, tenantCode] = waterId.split('_');
        const family = await Family.findOne({ rootId, tenantCode });
        
        if (!family) {
            return { success: false, error: 'Family not found' };
        }

        family.payments.push({
            stripePaymentIntentId: paymentIntentId,
            amount: amount,
            month: month,
            paidAt: new Date(),
            status: 'paid',
            paidBy: paidBy
        });

        await family.save();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};