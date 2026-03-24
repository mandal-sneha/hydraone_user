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

    waterUsage: {
        type: Map,
        of: Number,
        default: {}
    },

}, {timestamps: true});

export const Family = mongoose.model("Family", familySchema);