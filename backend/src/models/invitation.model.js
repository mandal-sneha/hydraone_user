import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema({
    hostwaterId: {
        type: String,
    },

    hostId: {
        type: String,
        required: true
    },

    invitedGuests: {
        type: Map,
        of: {
            type: String,
            enum: ['pending', 'accepted', 'declined', 'arrived'],
            default: 'pending'
        }
    },

    arrivalTime: {
        type: Map,
        of: String
    },

    stayDuration: {
        type: Map,
        of: String
    },

    otp: {
        type: Map, 
        of: String
    },
    
    arrivalOtp: {
        type: Map,
        of: String
    }
}, { timestamps: true }); 

export const Invitation = mongoose.model("Invitation", invitationSchema);