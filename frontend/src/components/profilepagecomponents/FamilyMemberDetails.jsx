import React from 'react';
import { FaUsers, FaChevronDown, FaChevronUp, FaCheck, FaTimes } from 'react-icons/fa';
import { MdDelete } from "react-icons/md";
import { IoIosPersonAdd } from "react-icons/io";
import { useTheme } from '../UserDashboard';

const FamilyMemberDetails = ({
  familyMembers,
  expandedMember,
  toggleMemberExpansion,
  handleDeleteMember,
  showAddMember,
  setShowAddMember,
  newMemberUserId,
  setNewMemberUserId,
  handleAddMember
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

  const inputStyle = {
    backgroundColor: theme.colors.baseColor,
    color: theme.colors.textColor,
    borderColor: theme.colors.borderColor
  };

  const memberItemStyle = {
    borderColor: theme.colors.borderColor,
    backgroundColor: theme.colors.cardBg
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-lg border shadow-sm" style={containerStyle}>
        <div className="px-6 py-4" style={headerStyle}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: theme.colors.primaryBg, color: '#fff' }}>
                <FaUsers size={18} />
              </div>
              <h3 className="text-lg font-semibold">Family Members</h3>
            </div>
            <button
              onClick={() => setShowAddMember(!showAddMember)}
              className="p-2.5 text-white rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
              style={{ background: 'linear-gradient(to right, #3b82f6, #6366f1)' }}
              title="Add Family Member"
            >
              <IoIosPersonAdd size={18} />
            </button>
          </div>
        </div>

        <div className="p-6" style={{ minHeight: showAddMember ? '400px' : 'auto' }}>
          {showAddMember && (
            <div className="mb-6 p-6 border-2 rounded-xl shadow-sm" style={{ borderColor: theme.colors.borderColor, backgroundColor: theme.colors.baseColor }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: theme.colors.primaryBg, color: '#fff' }}>
                  <IoIosPersonAdd size={20} />
                </div>
                <h4 className="text-lg font-semibold">Add New Family Member</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.mutedText }}>User ID</label>
                  <input
                    type="text"
                    placeholder="Enter User ID (e.g., USR004)"
                    value={newMemberUserId}
                    onChange={(e) => setNewMemberUserId(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    style={inputStyle}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleAddMember}
                    disabled={!newMemberUserId.trim()}
                    className="flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    style={{ background: 'linear-gradient(to right, #10b981, #059669)' }}
                  >
                    <FaCheck size={14} />Add Member
                  </button>
                  <button
                    onClick={() => { setShowAddMember(false); setNewMemberUserId(''); }}
                    className="flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                    style={{ background: 'linear-gradient(to right, #6b7280, #4b5563)' }}
                  >
                    <FaTimes size={14} />Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {familyMembers.length === 0 ? (
              <div className="text-center py-8" style={{ color: theme.colors.mutedText }}>
                <FaUsers size={32} className="mx-auto mb-2 opacity-50" />
                <p>No family members found</p>
              </div>
            ) : (
              familyMembers.map(member => (
                <div key={member.userId} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200" style={memberItemStyle}>
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer transition-colors"
                    style={{ ':hover': { backgroundColor: theme.colors.hoverBg } }}
                    onClick={() => toggleMemberExpansion(member.userId)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.hoverBg}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="flex items-center gap-3">
                      {member.userProfilePhoto ? (
                        <img
                          src={member.userProfilePhoto}
                          alt={member.userName}
                          className="w-12 h-12 rounded-full object-cover border-2 shadow-sm"
                          style={{ borderColor: theme.colors.borderColor }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg bg-gradient-to-br from-purple-400 to-pink-500 shadow-sm">
                          {member.userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold" style={{ color: theme.colors.textColor }}>{member.userName}</h4>
                        <p className="text-sm" style={{ color: theme.colors.mutedText }}>{member.userId}</p>
                      </div>
                    </div>
                    <div style={{ color: theme.colors.mutedText }}>
                      {expandedMember === member.userId ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                    </div>
                  </div>
                  {expandedMember === member.userId && (
                    <div className="px-4 pb-4 border-t" style={{ borderColor: theme.colors.borderColor, backgroundColor: theme.colors.baseColor }}>
                      <div className="space-y-3 mt-4 text-sm">
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium" style={{ color: theme.colors.mutedText }}>User ID:</span>
                          <span className="font-semibold col-span-2" style={{ color: theme.colors.textColor }}>{member.userId}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium" style={{ color: theme.colors.mutedText }}>Aadhar:</span>
                          <span className="font-semibold col-span-2" style={{ color: theme.colors.textColor }}>{member.aadharNo}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium" style={{ color: theme.colors.mutedText }}>Email:</span>
                          <span className="font-semibold col-span-2 break-all" style={{ color: theme.colors.textColor }}>{member.email}</span>
                        </div>
                        <div className="flex justify-center pt-4 border-t" style={{ borderColor: theme.colors.borderColor }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteMember(member.userId); }}
                            className="p-2.5 text-white rounded-full transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg"
                            style={{ background: 'linear-gradient(to right, #ef4444, #dc2626)' }}
                            title="Delete Member"
                          >
                            <MdDelete size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyMemberDetails;