import { createPaymentIntent, recordPayment } from '../services/stripe.service.js';
import { User } from '../models/user.model.js';
import { Family } from '../models/family.model.js';

export const createPayment = async (req, res) => {
    try {
        const { waterId, month, amount } = req.body;
        
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const user = await User.findOne({ userId: req.user.userId });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.waterId !== waterId) {
            return res.status(403).json({ success: false, message: 'Unauthorized access to this water account' });
        }

        const result = await createPaymentIntent(amount, 'inr', {
            waterId,
            month,
            userId: user.userId
        });

        if (result.success) {
            res.json({ success: true, clientSecret: result.clientSecret, paymentIntentId: result.paymentIntentId });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const confirmPayment = async (req, res) => {
    try {
        const { paymentIntentId, amount, waterId, month } = req.body;
        
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const user = await User.findOne({ userId: req.user.userId });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const result = await recordPayment(paymentIntentId, amount, waterId, month, user.userId);

        if (result.success) {
            res.json({ success: true, message: 'Payment recorded successfully' });
        } else {
            res.status(400).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('Confirm payment error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getPaymentHistory = async (req, res) => {
    try {
        const { waterId } = req.params;
        
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const user = await User.findOne({ userId: req.user.userId });

        if (!user || user.waterId !== waterId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const [rootId, tenantCode] = waterId.split('_');
        const family = await Family.findOne({ rootId, tenantCode });

        if (!family) {
            return res.status(404).json({ success: false, message: 'Family not found' });
        }

        res.json({ success: true, payments: family.payments });
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};