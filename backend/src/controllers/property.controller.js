import { User } from "../models/user.model.js";
import { Family } from "../models/family.model.js";
import { Property } from "../models/property.model.js";

export const viewProperties = async (req, res) => {
 try {
   const { userid } = req.params;
   const user = await User.findOne({ userId: userid });
   if (!user) {
     return res.status(404).json({ success: false, message: 'User not found' });
   }

   const ownedProperties = await Property.find({ rootId: { $in: user.properties || [] } });
   
   let currentResidenceProperty = null;
   if (user.waterId) {
     const currentRootId = user.waterId.split('_')[0];
     
     const isCurrentResidenceOwned = (user.properties || []).includes(currentRootId);
     
     if (!isCurrentResidenceOwned) {
       currentResidenceProperty = await Property.findOne({ rootId: currentRootId });
     }
   }

   let allProperties = [...ownedProperties];
   if (currentResidenceProperty) {
     allProperties.push(currentResidenceProperty);
   }

   allProperties = allProperties.filter((property, index, self) => 
     index === self.findIndex(p => p.rootId === property.rootId)
   );

   const enriched = allProperties.map((prop) => ({
     ...prop.toObject(),
     tenantCount: prop.numberOfTenants || 0
   }));

   return res.status(200).json({ success: true, properties: enriched });
 } catch (error) {
   console.error('Error in viewProperties:', error);
   return res.status(500).json({ success: false, message: 'Internal server error' });
 }
};

const generateRootId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 15; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const addProperty = async (req, res) => {
  try {
    const { userid } = req.params;
    const {
      propertyName,
      state,
      district,
      municipality,
      wardNumber,
      typeOfProperty,
      exactLocation,
      idType,
      id
    } = req.body;

    if (!propertyName || !state || !district || !municipality || !wardNumber || !typeOfProperty) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (typeOfProperty !== "Personal Property" && typeOfProperty !== "Apartment") {
      return res.status(400).json({ success: false, message: "Invalid property type" });
    }

    if (!id || !id.trim()) {
      const fieldName = typeOfProperty === "Personal Property" ? "Holding number" : "Flat ID";
      return res.status(400).json({ success: false, message: `${fieldName} is required` });
    }

    const user = await User.findOne({ userId: userid });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const propertyIdType = typeOfProperty === "Personal Property" ? "holdingNumber" : "flatId";
    const propertyId = id.trim();

    const existingProperty = await Property.findOne({ 
      idType: propertyIdType,
      id: propertyId
    });

    if (existingProperty) {
      const fieldName = typeOfProperty === "Personal Property" ? "holding number" : "flat ID";
      return res.status(400).json({ success: false, message: `A property with this ${fieldName} already exists` });
    }

    const rootId = generateRootId();
    const tenantCode = "000";
    const waterId = `${rootId}_${tenantCode}`;

    let families = [];

    families.push(waterId);

    const newPropertyFields = {
      propertyName: propertyName.trim(),
      state: state.trim(),
      district: district.trim(),
      municipality: municipality.trim(),
      wardNumber: parseInt(wardNumber),
      rootId,
      numberOfTenants: 1,
      families: families,
      typeOfProperty,
      idType: propertyIdType,
      id: propertyId,
      exactLocation: exactLocation
    };

    const newProperty = new Property(newPropertyFields);
    await newProperty.save();

    const updates = {
      properties: [...(user.properties || []), rootId]
    };

    if (!user.tenantCode) {
      updates.tenantCode = tenantCode;
    }

    if (!user.waterId) {
      updates.waterId = waterId;
    }

    await User.updateOne({ userId: userid }, { $set: updates });

    const updatedUser = await User.findOne({ userId: userid });

    return res.status(201).json({
      success: true,
      message: "Property added successfully",
      property: newProperty,
      user: {
        userId: updatedUser.userId,
        waterId: updatedUser.waterId,
        tenantCode: updatedUser.tenantCode,
        properties: updatedUser.properties
      }
    });

  } catch (error) {
    console.error("Error in addProperty:", error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const message = field === 'idType' || field === 'id'
        ? "A property with these details already exists"
        : "A property with these details already exists";
      
      return res.status(400).json({ 
        success: false, 
        message 
      });
    }
    
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const { rootid } = req.params;
    
    if (!rootid) {
      return res.status(400).json({
        success: false,
        message: "Property ID is required"
      });
    }

    const waterId = `${rootid}_000`;

    const users = await User.find({ waterId: new RegExp(`^${rootid}_`) });
    
    if (users.length > 1) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete property while tenants exist. Remove all tenants first."
      });
    }

    for (const user of users) {
      const otherProperties = user.properties.filter(pid => pid !== rootid);

      if (otherProperties.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherProperties.length);
        const newRootId = otherProperties[randomIndex];
        user.waterId = `${newRootId}_000`;
        user.tenantCode = "000";
      } else {
        user.waterId = "";
        user.tenantCode = "";
      }

      user.properties = otherProperties;
      await user.save();
    }

    await Family.deleteMany({ waterId: new RegExp(`^${rootid}_`) });
    
    const deletedProperty = await Property.deleteOne({ rootId: rootid });
    
    if (deletedProperty.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Property deleted successfully and waterId reassigned if needed."
    });
  } catch (err) {
    console.error("Error deleting property:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};