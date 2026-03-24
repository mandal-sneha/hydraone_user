import React, { useState, useEffect } from "react";
import { useTheme } from "../UserDashboard.jsx";
import {
  FiSearch,
  FiPlus,
  FiMoreVertical,
  FiTrash2,
  FiUserPlus,
  FiHome,
} from "react-icons/fi";
import { HiOutlineOfficeBuilding, HiOutlineHome } from "react-icons/hi";
import { axiosInstance } from "../../lib/axios.js";
import desertCactus from "../../assets/desert-cactus.svg";
import AddPropertyForm from "./addpropertycomponents/AddPropertyForm.jsx";
import PropertyTenants from "./addpropertycomponents/PropertyTenants.jsx";
import AddTenantForm from "./addpropertycomponents/AddTenantForm.jsx";

const AddProperty = () => {
  const { darkMode, colors } = useTheme();
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [expandedPropertyId, setExpandedPropertyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddTenantForm, setShowAddTenantForm] = useState(false);
  const [selectedPropertyForTenant, setSelectedPropertyForTenant] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userOwnedProperties, setUserOwnedProperties] = useState([]);
  const [formData, setFormData] = useState({
    propertyName: "",
    state: "",
    district: "",
    municipality: "",
    wardNo: "",
    typeOfProperty: "",
    holdingNo: "",
    flatId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    rootId: null,
    name: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(user);
    fetchProperties();
    fetchUserOwnedProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError("");
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.userId) {
        setError("User not found. Please login again.");
        setLoading(false);
        return;
      }
      const res = await axiosInstance.get(`/property/${user.userId}/view-properties`);
      if (res.data.success) {
        setProperties(res.data.properties);
      } else {
        setError(res.data.message || "Failed to fetch properties");
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError(err.response?.data?.message || "Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOwnedProperties = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.userId) return;
      const res = await axiosInstance.get(`/user/${user.userId}/get-user`);
      if (res.data.success) {
        const ownedProperties = res.data.data?.properties || [];
        setUserOwnedProperties(ownedProperties);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const updateTenantCount = (propertyId, newCount) => {
    setProperties((prev) =>
      prev.map((p) =>
        p._id === propertyId ? { ...p, tenantCount: newCount } : p
      )
    );
  };

  const toggleDropdown = (propertyId) => {
    if (expandedPropertyId === propertyId) {
      setExpandedPropertyId(null);
      setDropdownOpen(null);
    } else {
      setExpandedPropertyId(propertyId);
      setDropdownOpen(propertyId);
    }
  };

  const handleDeleteProperty = async () => {
    if (!confirmDelete.rootId) return;
    try {
      setError("");
      const res = await axiosInstance.delete(`/property/${confirmDelete.rootId}/delete-property`);
      if (res.data.success) {
        setProperties((prev) => prev.filter((p) => p.rootId !== confirmDelete.rootId));
        setConfirmDelete({ open: false, rootId: null, name: "" });
        setDropdownOpen(null);
        setExpandedPropertyId(null);
        fetchUserOwnedProperties();
      } else {
        setError(res.data.message || "Failed to delete property");
        setConfirmDelete({ open: false, rootId: null, name: "" });
      }
    } catch (err) {
      console.error("Delete error:", err);
      const errorMessage = err.response?.data?.message || "Something went wrong while deleting";
      setError(errorMessage);
      setConfirmDelete({ open: false, rootId: null, name: "" });
    }
  };

  const handleAddTenant = (property) => {
    setSelectedPropertyForTenant(property);
    setShowAddTenantForm(true);
  };

  const handleAddTenantSuccess = () => {
    if (selectedPropertyForTenant) {
      const currentCount = selectedPropertyForTenant.tenantCount || 0;
      updateTenantCount(selectedPropertyForTenant._id, currentCount + 1);
      if (expandedPropertyId === selectedPropertyForTenant._id) {
        const propertyTenantsComponent = document.querySelector(
          `[data-property-id="${selectedPropertyForTenant._id}"]`
        );
        if (propertyTenantsComponent) {
          propertyTenantsComponent.dispatchEvent(new CustomEvent("refreshTenants"));
        }
      }
    }
    setShowAddTenantForm(false);
    setSelectedPropertyForTenant(null);
  };

  const getAvatarIcon = (type) =>
    type === "Personal Property" ? (
      <HiOutlineHome className="text-lg" />
    ) : (
      <HiOutlineOfficeBuilding className="text-lg" />
    );

  const isUserOwner = (property) => {
    return userOwnedProperties.includes(property?.rootId);
  };

  const isCurrentResidence = (property) => {
    if (!currentUser?.waterId || !property?.rootId) return false;
    const currentRootId = currentUser.waterId.split("_")[0];
    return currentRootId === property.rootId;
  };

  const getPropertyStatus = (property) => {
    const isOwner = isUserOwner(property);
    const isCurrent = isCurrentResidence(property);
    if (isOwner && isCurrent) return "Owner (Current Residence)";
    if (isOwner) return "Owner";
    if (isCurrent) return "Current Residence";
    return "";
  };

  const getStatusColor = (property) => {
    const isOwner = isUserOwner(property);
    const isCurrent = isCurrentResidence(property);
    if (isOwner && isCurrent) return darkMode ? "text-green-400" : "text-green-600";
    if (isOwner) return darkMode ? "text-blue-400" : "text-blue-600";
    if (isCurrent) return darkMode ? "text-green-400" : "text-green-600";
    return colors.mutedText;
  };

  const getFormattedLocation = (property) => {
    const parts = [];
    if (property.municipality) parts.push(property.municipality);
    if (property.district) parts.push(property.district);
    if (property.state) parts.push(property.state);
    return parts.length > 0 ? parts.join(", ") : "No address";
  };

  const filteredProperties = properties.filter(
    (property) =>
      property.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.municipality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.typeOfProperty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.rootId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="font-sans min-h-screen max-h-screen overflow-hidden flex flex-col"
      style={{ backgroundColor: colors.baseColor }}
    >
      <div className="flex items-center mb-5 gap-4 flex-shrink-0">
        <h1 className="text-2xl font-semibold" style={{ color: colors.textColor }}>
          My Properties
        </h1>
        <div className="ml-auto relative">
          <FiSearch
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base"
            style={{ color: colors.mutedText }}
          />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-70 py-2.5 pl-10 pr-4 border-2 rounded-full text-sm outline-none"
            style={{
              backgroundColor: colors.cardBg,
              color: colors.textColor,
              borderColor: searchTerm ? colors.primaryBg : colors.borderColor,
            }}
          />
        </div>
      </div>

      {error && (
        <div
          className="mb-4 p-3 rounded-lg text-sm"
          style={{ backgroundColor: "#fdecea", color: "#b91c1c", border: "1px solid #fca5a5" }}
        >
          {error}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <div
          className="rounded-2xl overflow-hidden border h-full flex flex-col"
          style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}
        >
          <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: colors.borderColor }}>
            <h2 className="text-lg font-semibold" style={{ color: colors.textColor }}>
              Properties List
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-white border-none rounded-lg py-2.5 px-5 text-xs font-semibold flex items-center gap-1.5"
              style={{ backgroundColor: colors.primaryBg }}
            >
              <FiPlus className="text-sm font-bold" />
              Add New Property
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colors.primaryBg }}></div>
              <p className="text-sm font-medium" style={{ color: colors.mutedText }}>
                Loading properties...
              </p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-12 text-center">
              <img src={desertCactus} alt="No properties" className="max-w-xs w-full" />
              <p className="text-base font-medium" style={{ color: colors.mutedText }}>
                You don't have any properties added yet.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-10" style={{ backgroundColor: colors.baseColor }}>
                  <tr>
                    {["Property Name", "Root ID", "Address", "No. of Tenants", "Property Type", "Status", "Action"].map(
                      (head, idx) => (
                        <th
                          key={idx}
                          className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider border-b"
                          style={{ color: colors.mutedText, borderColor: colors.borderColor }}
                        >
                          {head}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: colors.cardBg }}>
                  {filteredProperties.map((property) => (
                    <React.Fragment key={property._id}>
                      <tr
                        className={`border-b ${
                          isCurrentResidence(property) ? (darkMode ? "bg-green-900/20" : "bg-green-50") : ""
                        }`}
                        style={{ borderColor: colors.borderColor }}
                      >
                        <td className="py-4 px-6 text-sm">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{
                                  backgroundColor: darkMode ? "#404040" : "#f3f4f6",
                                  color: colors.textColor,
                                }}
                              >
                                {getAvatarIcon(property.typeOfProperty)}
                              </div>
                              {isCurrentResidence(property) && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                  <FiHome className="text-xs text-white" />
                                </div>
                              )}
                            </div>
                            <div className="font-semibold text-sm" style={{ color: colors.textColor }}>
                              {property.propertyName || "Unnamed Property"}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm font-mono" style={{ color: colors.textColor }}>
                          {property.rootId || "N/A"}
                        </td>
                        <td className="py-4 px-6 text-sm" style={{ color: colors.textColor }}>
                          {getFormattedLocation(property)}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium" style={{ color: colors.textColor }}>
                          {property.tenantCount || 0}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium" style={{ color: colors.textColor }}>
                          {property.typeOfProperty || "Unknown"}
                        </td>
                        <td className="py-4 px-6 text-sm">
                          <span
                            className="font-medium text-xs px-2 py-1 rounded-full"
                            style={{
                              color: getStatusColor(property),
                              backgroundColor: isCurrentResidence(property)
                                ? darkMode
                                  ? "rgba(34, 197, 94, 0.2)"
                                  : "rgba(34, 197, 94, 0.1)"
                                : isUserOwner(property)
                                ? darkMode
                                  ? "rgba(59, 130, 246, 0.2)"
                                  : "rgba(59, 130, 246, 0.1)"
                                : "transparent",
                            }}
                          >
                            {getPropertyStatus(property)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm flex items-center gap-2">
                          {isUserOwner(property) ? (
                            <>
                              <button
                                onClick={() => handleAddTenant(property)}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  darkMode
                                    ? "text-green-400 hover:bg-green-900/30 hover:text-green-300"
                                    : "text-green-600 hover:bg-green-50 hover:text-green-700"
                                }`}
                                title="Add Tenant"
                              >
                                <FiUserPlus className="text-base" />
                              </button>
                              <button
                                className={`p-2 rounded-lg rotate-90 transition-all duration-200 ${
                                  darkMode
                                    ? "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-600"
                                }`}
                                onClick={() => toggleDropdown(property._id)}
                              >
                                <FiMoreVertical className="text-base" />
                              </button>
                              <button
                                onClick={() =>
                                  setConfirmDelete({
                                    open: true,
                                    rootId: property.rootId,
                                    name: property.propertyName,
                                  })
                                }
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  darkMode
                                    ? "text-red-400 hover:bg-red-900/30 hover:text-red-300"
                                    : "text-red-500 hover:bg-red-50 hover:text-red-600"
                                }`}
                                title="Delete Property"
                              >
                                <FiTrash2 className="text-base" />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-500 italic">View Only</span>
                          )}
                        </td>
                      </tr>
                      {expandedPropertyId === property._id && isUserOwner(property) && (
                        <tr>
                          <td colSpan={7} className="p-0">
                            <PropertyTenants property={property} updateTenantCount={updateTenantCount} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddPropertyForm
          colors={colors}
          formData={formData}
          setFormData={setFormData}
          submitting={submitting}
          setSubmitting={setSubmitting}
          error={error}
          setError={setError}
          closeModal={() => {
            setShowAddModal(false);
            setFormData({
              propertyName: "",
              state: "",
              district: "",
              municipality: "",
              wardNo: "",
              typeOfProperty: "",
              holdingNo: "",
              flatId: "",
            });
            setError("");
          }}
          setProperties={setProperties}
          onSuccess={() => {
            fetchUserOwnedProperties();
            fetchProperties();
          }}
        />
      )}

      {showAddTenantForm && selectedPropertyForTenant && (
        <AddTenantForm
          isOpen={showAddTenantForm}
          onClose={() => {
            setShowAddTenantForm(false);
            setSelectedPropertyForTenant(null);
          }}
          onSuccess={handleAddTenantSuccess}
          propertyId={selectedPropertyForTenant.rootId}
          axiosInstance={axiosInstance}
        />
      )}

      {confirmDelete.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl shadow-2xl max-w-md w-full p-6 border transform transition-all duration-300 scale-100"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.borderColor,
              boxShadow: darkMode
                ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-full ${darkMode ? "bg-red-900/30" : "bg-red-50"}`}>
                <FiTrash2 className={`text-xl ${darkMode ? "text-red-400" : "text-red-500"}`} />
              </div>
              <h2 className="text-xl font-semibold" style={{ color: colors.textColor }}>
                Delete Property
              </h2>
            </div>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: colors.mutedText }}>
              Are you sure you want to delete{" "}
              <span className="font-semibold" style={{ color: colors.textColor }}>
                "{confirmDelete.name}"
              </span>
              ? This action cannot be undone and will permanently remove all associated data.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete({ open: false, rootId: null, name: "" })}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProperty}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-200 ${
                  darkMode ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600"
                } shadow-lg hover:shadow-xl`}
              >
                Delete Property
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProperty;