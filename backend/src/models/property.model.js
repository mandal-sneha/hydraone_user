import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  propertyName: {
    type: String,
    required: true,
    trim: true
  },

  rootId: {
    type: String,
    required: true,
    unique: true
  },

  state: {
  type: String,
  required: true
  },

  district: {
    type: String,
    required: true
  },

  municipality: {
    type: String,
    required: true
  },

  wardNumber: {
    type: Number,
    required: true
  },

  numberOfTenants: {
    type: Number,
    required: true
  },

  families: {
    type: [String],
    required: true
  },

  typeOfProperty: {
    type: String,
    enum: ["Personal Property", "Apartment"],
    required: true
  },

  idType: {
    type: String,
    enum: ["holdingNumber", "flatId"],
    required: true
  },

  id: {
    type: String,
    required: true
  },
  
  exactLocation: {
    type: String,
    required: true
  },
  
}, { timestamps: true });

propertySchema.index({ idType: 1, id: 1 }, { unique: true });

export const Property = mongoose.model("Property", propertySchema);