import React, { useState, useContext } from 'react';
import { FiX, FiSearch, FiUser, FiPlus, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { ThemeContext } from '../../UserDashboard';

const AddTenantForm = ({ isOpen, onClose, onSuccess, propertyId, axiosInstance }) => {
  const { darkMode, colors } = useContext(ThemeContext);
  const [userId, setUserId] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addingTenant, setAddingTenant] = useState(false);

  const searchUser = async () => {
    if (!userId.trim()) {
      setError('Please enter a User ID');
      return;
    }

    setLoading(true);
    setError('');
    setUserDetails(null);

    try {
      const response = await axiosInstance.get(`/user/${userId}/get-user`);
      if (response.data.success) {
        const userData = response.data.data;

        if (userData.waterId && userData.waterId !== "") {
          setError('User is already registered to some other property');
          return;
        }

        setUserDetails(userData);
      } else {
        setError('User not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'User not found');
    } finally {
      setLoading(false);
    }
  };

  const addTenant = async () => {
    if (!userDetails) return;

    setAddingTenant(true);
    setError('');
    setSuccess('');

    const user = JSON.parse(localStorage.getItem('user'));
    const rootId = user?.waterId?.split("_")[0];

    try {
      const response = await axiosInstance.post(`/tenant/${propertyId}/${userDetails.userId}/add-tenant`, { rootId });
      if (response.data.success) {
        setSuccess('Tenant added successfully!');
        window.dispatchEvent(new CustomEvent('refreshTenants'));
        setTimeout(() => {
          handleClose();
          onSuccess && onSuccess();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add tenant');
    } finally {
      setAddingTenant(false);
    }
  };

  const handleClose = () => {
    setUserId('');
    setUserDetails(null);
    setError('');
    setSuccess('');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchUser();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-xl shadow-2xl w-full max-w-md transform transition-all"
        style={{ backgroundColor: colors.cardBg }}
      >
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: colors.borderColor }}
        >
          <h2 className="text-xl font-semibold" style={{ color: colors.textColor }}>Add Tenant</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full transition-colors"
            style={{ color: colors.mutedText }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.hoverBg}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: colors.textColor }}>Enter User ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter user ID to search..."
                className="flex-1 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                style={{
                  border: `1px solid ${colors.borderColor}`,
                  backgroundColor: colors.baseColor,
                  color: colors.textColor,
                }}
              />
              <button
                onClick={searchUser}
                disabled={loading}
                className="px-4 py-2 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
                style={{ backgroundColor: colors.primaryBg }}
              >
                <FiSearch className="w-4 h-4" />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-lg"
              style={{
                backgroundColor: darkMode ? 'rgba(239,68,68,0.15)' : '#fef2f2',
                border: `1px solid ${darkMode ? 'rgba(239,68,68,0.4)' : '#fecaca'}`,
                color: darkMode ? '#f87171' : '#b91c1c',
              }}
            >
              <FiAlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div
              className="flex items-center gap-2 p-3 rounded-lg"
              style={{
                backgroundColor: darkMode ? 'rgba(34,197,94,0.15)' : '#f0fdf4',
                border: `1px solid ${darkMode ? 'rgba(34,197,94,0.4)' : '#bbf7d0'}`,
                color: darkMode ? '#4ade80' : '#15803d',
              }}
            >
              <FiCheckCircle className="w-4 h-4" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {userDetails && (
            <div
              className="rounded-lg p-4 space-y-3"
              style={{ backgroundColor: colors.baseColor, border: `1px solid ${colors.borderColor}` }}
            >
              <div className="flex items-center gap-3">
                <img
                  src={userDetails.userProfilePhoto || "/assets/blank_pfp.jpg"}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover shadow-sm"
                  style={{ border: `2px solid ${colors.borderColor}` }}
                />
                <div className="flex-1">
                  <h3 className="font-medium" style={{ color: colors.textColor }}>{userDetails.userName}</h3>
                  <p className="text-sm" style={{ color: colors.mutedText }}>{userDetails.userId}</p>
                </div>
                <FiUser className="w-5 h-5" style={{ color: colors.mutedText }} />
              </div>

              <button
                onClick={addTenant}
                disabled={addingTenant}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                {addingTenant ? 'Adding Tenant...' : 'Add as Tenant'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTenantForm;