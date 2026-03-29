import React, { useState, useEffect } from "react";
import { FiTrash2 } from "react-icons/fi";
import { axiosInstance } from "../../../lib/axios.js";
import blankPfp from "../../../assets/blank_pfp.jpg";
import { useTheme } from '../../UserDashboard.jsx';

const PropertyTenants = ({ property, updateTenantCount }) => {
  const { darkMode, colors } = useTheme();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (property && property._id) {
      fetchTenants();
    }
  }, [property?._id]);

  useEffect(() => {
    const handleRefreshTenants = () => {
      fetchTenants();
    };

    window.addEventListener('refreshTenants', handleRefreshTenants);
    return () => {
      window.removeEventListener('refreshTenants', handleRefreshTenants);
    };
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.get(`/tenant/${property._id}/get-property-tenants`);
      if (res.data.success) {
        setTenants(res.data.tenants || []);
      } else {
        setError(res.data.message || "Failed to fetch tenants");
      }
    } catch (err) {
      console.error("Error fetching tenants:", err);
      setError(err.response?.data?.message || "Failed to fetch tenants");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tenantUserId) => {
    try {
      const res = await axiosInstance.delete(`/tenant/${property._id}/${tenantUserId}/delete-tenant`);
      if (res.data.success) {
        setTenants((prev) => prev.filter((tenant) => tenant.userId !== tenantUserId));
        updateTenantCount(property._id, -1);
      } else {
        alert(res.data.message || "Failed to delete tenant");
      }
    } catch (err) {
      console.error("Error deleting tenant:", err);
      alert(err.response?.data?.message || "Failed to delete tenant");
    }
  };

  if (loading) {
    return (
      <div className="p-4 border-t" style={{ backgroundColor: colors.baseColor, borderColor: colors.borderColor }} data-property-id={property._id}>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primaryBg }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border-t" style={{ backgroundColor: colors.baseColor, borderColor: colors.borderColor }} data-property-id={property._id}>
        <div className="text-center py-4 text-sm" style={{ color: '#ef4444' }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t" style={{ backgroundColor: colors.baseColor, borderColor: colors.borderColor }} data-property-id={property._id}>
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold" style={{ color: colors.textColor }}>
          Tenants for: <span style={{ color: colors.primaryBg }}>{property.propertyName}</span>
        </h4>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm rounded" style={{ borderColor: colors.borderColor }}>
          <thead style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }}>
            <tr>
              <th className="px-4 py-2 text-xs uppercase tracking-wider" style={{ color: colors.mutedText }}>Photo</th>
              <th className="px-4 py-2 text-xs uppercase tracking-wider" style={{ color: colors.mutedText }}>Tenant Name</th>
              <th className="px-4 py-2 text-xs uppercase tracking-wider" style={{ color: colors.mutedText }}>User ID</th>
              <th className="px-4 py-2 text-xs uppercase tracking-wider" style={{ color: colors.mutedText }}>Water ID</th>
              <th className="px-4 py-2 text-xs uppercase tracking-wider" style={{ color: colors.mutedText }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant, idx) => (
              <tr key={idx} className="border-t" style={{ borderColor: colors.borderColor }}>
                <td className="px-4 py-2">
                  <img
                    src={tenant.image || blankPfp}
                    alt={tenant.name}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = blankPfp;
                    }}
                  />
                </td>
                <td className="px-4 py-2" style={{ color: colors.textColor }}>{tenant.name}</td>
                <td className="px-4 py-2" style={{ color: colors.mutedText }}>{tenant.userId}</td>
                <td className="px-4 py-2" style={{ color: colors.mutedText }}>{tenant.waterId}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDelete(tenant.userId)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Delete Tenant"
                  >
                    <FiTrash2 className="text-base" />
                  </button>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="px-4 py-3 text-center" style={{ color: colors.mutedText }}>
                  No tenants added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PropertyTenants;