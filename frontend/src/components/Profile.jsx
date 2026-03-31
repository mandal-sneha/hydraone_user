import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaCamera } from 'react-icons/fa';
import { axiosInstance } from '../lib/axios.js';
import UserDetails from './profilepagecomponents/UserDetails.jsx';
import CurrentProperty from './profilepagecomponents/CurrentProperty.jsx';
import FamilyMemberDetails from './profilepagecomponents/FamilyMemberDetails.jsx';

const Profile = () => {
  const { userid } = useParams();
  const [user, setUser] = useState({
    userId: '', userName: '', userProfilePhoto: null, aadharNo: '',
    email: '', address: '', waterId: ''
  });
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });
  const [expandedMember, setExpandedMember] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familyMembersLoading, setFamilyMembersLoading] = useState(false);
  const [newMemberUserId, setNewMemberUserId] = useState('');

  const fetchFamilyMembers = async (userIdToFetch) => {
    try {
      setFamilyMembersLoading(true);
      const response = await axiosInstance.get(`/user/${userIdToFetch}/get-family-members`);
      if (response.data.success) {
        const transformedMembers = response.data.members.map(member => ({
          ...member,
          aadharNo: member.adhaarNumber?.toString() || ''
        }));
        setFamilyMembers(transformedMembers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFamilyMembersLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfileDetails = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const userIdToFetch = userid || storedUser?.userId;
        if (!userIdToFetch) {
          setError('User ID not found');
          setLoading(false);
          return;
        }
        const response = await axiosInstance.get(`/user/${userIdToFetch}/get-profile-details`);
        const { user: userData, properties: propertiesData } = response.data;
        const transformedUser = {
          userId: userData.userId,
          userName: userData.userName,
          userProfilePhoto: userData.userProfilePhoto,
          aadharNo: userData.adhaarNumber?.toString() || '',
          email: userData.email || storedUser?.email || '',
          address: '',
          waterId: userData.waterId
        };
        const transformedProperties = propertiesData.map((prop, index) => ({
          id: `property${index + 1}`,
          name: prop.propertyName,
          municipality: prop.municipality,
          district: prop.district,
          wardNumber: prop.wardNumber,
          tenants: prop.numberOfTenants,
          propertyType: prop.typeOfProperty,
          label: prop.label
        }));
        setUser(transformedUser);
        setProperties(transformedProperties);
        setEditedUser(transformedUser);
        if (transformedProperties.length > 0) {
          setSelectedProperty(transformedProperties[0].id);
        }
        await fetchFamilyMembers(userIdToFetch);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch profile details');
        setLoading(false);
      }
    };
    fetchProfileDetails();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({ ...user });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({ ...user });
  };

  const handleInputChange = (field, value) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setUpdateLoading(true);
      const payload = {
        userName: editedUser.userName,
        email: editedUser.email,
        adhaarNumber: editedUser.aadharNo ? Number(editedUser.aadharNo) : undefined,
        userProfilePhoto: editedUser.userProfilePhoto,
      };
      await axiosInstance.put(`/user/${user.userId}/update-profile`, payload);
      setUser(editedUser);
      setIsEditing(false);
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedStoredUser = {
        ...storedUser,
        userName: editedUser.userName,
        email: editedUser.email,
      };
      localStorage.setItem('user', JSON.stringify(updatedStoredUser));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setEditedUser(prev => ({ ...prev, userProfilePhoto: imageUrl }));
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-lg mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 rounded">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
          {(isEditing ? editedUser.userProfilePhoto : user.userProfilePhoto) ? (
            <img src={isEditing ? editedUser.userProfilePhoto : user.userProfilePhoto} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
          ) : (
            <div className="w-32 h-32 rounded-full flex items-center justify-center font-bold text-3xl bg-gray-200 text-gray-600">
              {(isEditing ? editedUser.userName : user.userName) ? (isEditing ? editedUser.userName : user.userName).charAt(0).toUpperCase() : <FaCamera />}
            </div>
          )}
          {isEditing && (
            <label className="absolute bottom-1 right-1 p-3 rounded-full cursor-pointer bg-white shadow-md hover:bg-gray-100 transition-colors">
              <FaCamera size={16} className="text-gray-700" />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{(isEditing ? editedUser.userName : user.userName)}</h1>
          <p>User ID: {user.userId}</p>
          <p>Water ID: {user.waterId}</p>
          <p>{user.email}</p>
        </div>
      </div>
      <UserDetails
        user={user}
        editedUser={editedUser}
        isEditing={isEditing}
        handleEdit={handleEdit}
        handleCancel={handleCancel}
        handleSave={handleSave}
        handleInputChange={handleInputChange}
        updateLoading={updateLoading}
      />
      <CurrentProperty
        properties={properties}
        selectedProperty={selectedProperty}
        setSelectedProperty={setSelectedProperty}
      />
      <FamilyMemberDetails
        familyMembers={familyMembers}
        expandedMember={expandedMember}
        setExpandedMember={setExpandedMember}
        showAddMember={showAddMember}
        setShowAddMember={setShowAddMember}
        newMemberUserId={newMemberUserId}
        setNewMemberUserId={setNewMemberUserId}
        familyMembersLoading={familyMembersLoading}
      />
    </div>
  );
};

export default Profile;