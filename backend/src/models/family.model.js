import mongoose from 'mongoose';

const familySchema = new mongoose.Schema({
    members: {
        type: [],
        required: false,
    },

    rootId: {
        type: String,
        required: false,
    },

    tenantCode: {
        type: String,
        required: false,
    },

    extraWaterDates: {
        type: Map,
        of : Number
    },

    fineDates: {
        type: []
    },

    payments: [
        {
            stripePaymentIntentId: { type: String, required: true },
            amount: { type: Number, required: true },
            month: { type: String, required: true },
            paidAt: { type: Date, default: Date.now },
            status: { type: String, enum: ['paid', 'failed', 'refunded'], default: 'paid' },
            paidBy: { type: String, required: true },
        }
    ],

    waterUsage: {
        type: Map,
        of: Number,
        default: {}
    },

}, {timestamps: true});

export const Family = mongoose.model("Family", familySchema);