import mongoose from "mongoose";

const entryExitSchema = new mongoose.Schema({
    waterId: {
        type: String,
        required: true
    },

    primaryMembersPresent: {
        type: [String]
    },

    arrivedGuests: {
        type: [String]
    },

    guestEntryTimings: {
        type: Map,
        of: String,
    },

    guestExitTimings: {
        type: Map,
        of: String
    },

    fraudulentGuests: {
        type: Map,
        of: {
            guestId: String,
            scheduledExit: String,
            actualExit: String,
            detectedAt: Date,
            type: String
        },
        default: {}
    }
}, { timestamps: true });

export const EntryExitLog = mongoose.model("EntryExitLog", entryExitSchema);