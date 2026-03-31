import React from 'react';
import { FaUser, FaEdit, FaSave, FaTimes, FaEnvelope, FaIdCard } from 'react-icons/fa';
import { useTheme } from '../UserDashboard';

const UserDetails = ({
  user,
  isEditing,
  editedUser,
  handleEdit,
  handleSave,
  handleCancel,
  handleInputChange
}) => {
  const theme = useTheme();

  const containerStyle = {
    backgroundColor: theme.colors.cardBg,
    borderColor: theme.colors.borderColor,
    color: theme.colors.textColor
  };

  const headerStyle = {
    backgroundColor: theme.darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    borderBottom: `1px solid ${theme.colors.borderColor}`
  };

  const labelStyle = {
    color: theme.colors.mutedText
  };

  const inputStyle = {
    backgroundColor: theme.colors.baseColor,
    color: theme.colors.textColor,
    borderColor: theme.colors.borderColor
  };

  const readOnlyStyle = {
    backgroundColor: theme.darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.05)',
    color: theme.colors.textColor,
    borderColor: theme.colors.borderColor
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-lg border shadow-sm" style={containerStyle}>
        <div className="px-6 py-4" style={headerStyle}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: theme.colors.primaryBg, color: '#fff' }}>
                <FaUser size={18} />
              </div>
              <h3 className="text-lg font-semibold">Profile Details</h3>
            </div>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-6 py-2.5 text-white rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }}
              >
                <FaEdit size={14} />Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2.5 text-white rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                  style={{ background: 'linear-gradient(to right, #10b981, #059669)' }}
                >
                  <FaSave size={14} />Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-2.5 text-white rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                  style={{ background: 'linear-gradient(to right, #6b7280, #4b5563)' }}
                >
                  <FaTimes size={14} />Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2" style={labelStyle}>
                <FaUser size={12} style={{ color: theme.colors.primaryBg }} />Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedUser?.userName || ''}
                  onChange={(e) => handleInputChange && handleInputChange('userName', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={inputStyle}
                />
              ) : (
                <div className="px-3 py-2 border rounded-md" style={readOnlyStyle}>
                  {user.userName}
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2" style={labelStyle}>
                <FaIdCard size={12} style={{ color: '#10b981' }} />User ID
              </label>
              <div className="px-3 py-2 border rounded-md" style={{ ...readOnlyStyle, opacity: 0.7 }}>
                {user.userId}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2" style={labelStyle}>
                <FaEnvelope size={12} style={{ color: theme.colors.primaryBg }} />Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editedUser?.email || ''}
                  onChange={(e) => handleInputChange && handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={inputStyle}
                  placeholder="Enter email address"
                />
              ) : (
                <div className="px-3 py-2 border rounded-md" style={readOnlyStyle}>
                  {user.email}
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2" style={labelStyle}>
                <FaIdCard size={12} style={{ color: '#f59e0b' }} />Aadhar Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedUser?.aadharNo || ''}
                  onChange={(e) => handleInputChange && handleInputChange('aadharNo', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={inputStyle}
                  placeholder="XXXX XXXX XXXX"
                />
              ) : (
                <div className="px-3 py-2 border rounded-md" style={readOnlyStyle}>
                  {user.aadharNo}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;