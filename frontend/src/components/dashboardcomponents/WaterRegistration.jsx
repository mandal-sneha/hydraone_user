import React, { useState, useEffect, useContext, useRef } from 'react';
import { FaUsers, FaUserPlus, FaClock, FaEdit, FaTrash, FaCheck, FaTimes, FaTint, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { axiosInstance } from "../../lib/axios.js";
import { ThemeContext } from '../UserDashboard';

const useTheme = () => {
  const { darkMode, colors: themeColors } = useContext(ThemeContext);
  return { darkMode, colors: themeColors };
};

const WaterRegistration = () => {
  const { darkMode, colors } = useTheme();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [spMembers, setSpMembers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState([]);
  const [newGuest, setNewGuest] = useState({ name: '', entryTime: '', stayTime: '' });
  const [editingGuest, setEditingGuest] = useState(null);
  const [requestExtraWater, setRequestExtraWater] = useState(false);
  const [guestSearchLoading, setGuestSearchLoading] = useState(false);
  const [guestSearchError, setGuestSearchError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });
  const popupRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        setLoading(true);
        const userId = currentUser?.userId;
        const response = await axiosInstance.get(`/user/${userId}/get-family-members`);
        if (response.data.success) {
          setFamilyMembers(response.data.members);
        }
      } catch (error) {
        console.error('Error fetching family members:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFamilyMembers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setPopup({ ...popup, show: false });
      }
    };
    if (popup.show) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [popup.show]);

  const showPopup = (message, type = 'success') => {
    setPopup({ show: true, message, type });
  };

  const isFamilyMember = (userId) => familyMembers.some(member => member.userId === userId) || userId === currentUser.userId;

  const toggleSpMember = (userId) => {
    const newSpMembers = new Set(spMembers);
    if (newSpMembers.has(userId)) newSpMembers.delete(userId);
    else newSpMembers.add(userId);
    setSpMembers(newSpMembers);
  };

  const fetchGuestUser = async (userId) => {
    try {
      setGuestSearchLoading(true);
      setGuestSearchError('');
      const response = await axiosInstance.get(`/user/${userId}/get-user`);
      if (response.data.success) return response.data.data;
      else throw new Error(response.data.message || 'User not found');
    } catch (error) {
      setGuestSearchError(error.response?.data?.message || 'User not found');
      throw error;
    } finally {
      setGuestSearchLoading(false);
    }
  };

  const addGuest = async () => {
    if (newGuest.name.trim() && newGuest.entryTime && newGuest.stayTime) {
      try {
        if (guests.find(g => g.userId === newGuest.name.trim())) {
          setGuestSearchError('Guest is already added');
          return;
        }
        if (isFamilyMember(newGuest.name.trim())) {
          setGuestSearchError('User is a family member');
          return;
        }
        const guestUserData = await fetchGuestUser(newGuest.name.trim());
        const newGuestEntry = {
          id: Date.now(),
          userId: guestUserData.userId,
          userName: guestUserData.userName,
          userProfilePhoto: guestUserData.userProfilePhoto,
          entryTime: newGuest.entryTime,
          stayTime: newGuest.stayTime
        };
        setGuests([...guests, newGuestEntry]);
        setNewGuest({ name: '', entryTime: '', stayTime: '' });
      } catch (error) {}
    }
  };

  const handleRegisterForWater = async () => {
    try {
      setIsRegistering(true);
      const allFamilyMembers = [...familyMembers, { userId: currentUser.userId, userName: currentUser.userName }];
      const primaryMembers = allFamilyMembers.map(member => member.userId);
      const waterId = currentUser.waterId;

      const waterRes = await axiosInstance.post(`/waterregistration/${waterId}/register-for-water`, {
        primaryMembers,
        specialMembers: Array.from(spMembers),
        extraWaterRequested: requestExtraWater
      });

      if (!waterRes.data.success) return;

      if (guests.length > 0) {
        const arrivalTime = {};
        const stayDuration = {};
        guests.forEach(g => {
          arrivalTime[g.userId] = g.entryTime;
          stayDuration[g.userId] = g.stayTime;
        });

        const inviteRes = await axiosInstance.post(`/invitation/${currentUser.userId}/${currentUser.waterId}/register-invitation`, {
          guests: guests.map(g => g.userId),
          arrivalTime,
          stayDuration
        });

        if (inviteRes.data.success) showPopup('Water registration and guest invitations successful');
        else showPopup('Registration successful but invitation failed', 'error');
      } else {
        showPopup('Water registration submitted successfully');
      }
      setSpMembers(new Set());
      setGuests([]);
      setRequestExtraWater(false);
    } catch (error) {
      showPopup(error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.baseColor }}>
      <FaSpinner className="animate-spin" size={48} style={{ color: colors.primaryBg }} />
    </div>
  );

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.baseColor }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-2xl p-6 border shadow-lg" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl" style={{ backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(110, 142, 251, 0.1)' }}>
                <FaUsers style={{ color: colors.primaryBg }} size={24} />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: colors.textColor }}>Family Members</h2>
            </div>
            <div className="space-y-4">
              {familyMembers.map(member => (
                <div key={member.userId} className="rounded-xl p-4 border flex items-center justify-between" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
                  <div className="flex items-center gap-4">
                    <img src={member.userProfilePhoto || "https://via.placeholder.com/48"} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h3 className="font-semibold" style={{ color: colors.textColor }}>{member.userName}</h3>
                      <p className="text-xs" style={{ color: colors.mutedText }}>{member.userId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={spMembers.has(member.userId)} onChange={() => toggleSpMember(member.userId)} style={{ accentColor: colors.primaryBg }} className="w-5 h-5 rounded" />
                    <label className="text-sm font-medium" style={{ color: colors.textColor }}>SP Member</label>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 space-y-4">
              <button onClick={() => setRequestExtraWater(!requestExtraWater)} className="w-full py-4 rounded-xl font-semibold border-2 transition-all" style={{ backgroundColor: requestExtraWater ? colors.primaryBg : 'transparent', color: requestExtraWater ? '#fff' : colors.textColor, borderColor: requestExtraWater ? colors.primaryBg : colors.borderColor }}>
                {requestExtraWater ? '✓ Extra Water Requested' : 'Request Extra Water'}
              </button>
              <button onClick={handleRegisterForWater} disabled={isRegistering} className="w-full py-5 rounded-xl font-bold text-xl text-white shadow-lg disabled:opacity-50" style={{ background: colors.sidebarBg }}>
                {isRegistering ? 'Processing...' : 'Register for Water'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl p-6 border shadow-lg" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl" style={{ backgroundColor: darkMode ? 'rgba(167, 119, 227, 0.1)' : 'rgba(205, 184, 242, 0.1)' }}>
                <FaUserPlus style={{ color: colors.secondaryBg }} size={24} />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: colors.textColor }}>Guest Management</h2>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto mb-8">
              {guests.map(guest => (
                <div key={guest.id} className="p-4 rounded-xl border flex items-center justify-between" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
                  <div className="flex items-center gap-3">
                    <img src={guest.userProfilePhoto || "https://via.placeholder.com/40"} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold" style={{ color: colors.textColor }}>{guest.userName}</h4>
                      <p className="text-xs" style={{ color: colors.mutedText }}>Entry: {guest.entryTime} • {guest.stayTime}</p>
                    </div>
                  </div>
                  <button onClick={() => setGuests(guests.filter(g => g.id !== guest.id))} className="text-red-500 p-2"><FaTrash /></button>
                </div>
              ))}
            </div>
            <div className="space-y-4 border-t pt-6" style={{ borderColor: colors.borderColor }}>
              <input type="text" placeholder="Guest User ID" value={newGuest.name} onChange={(e) => setNewGuest({...newGuest, name: e.target.value})} className="w-full p-4 rounded-xl border outline-none" style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderColor: colors.borderColor, color: colors.textColor }} />
              <div className="grid grid-cols-2 gap-4">
                <input type="time" value={newGuest.entryTime} onChange={(e) => setNewGuest({...newGuest, entryTime: e.target.value})} className="p-4 rounded-xl border outline-none" style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderColor: colors.borderColor, color: colors.textColor }} />
                <input type="text" placeholder="Stay Duration" value={newGuest.stayTime} onChange={(e) => setNewGuest({...newGuest, stayTime: e.target.value})} className="p-4 rounded-xl border outline-none" style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderColor: colors.borderColor, color: colors.textColor }} />
              </div>
              <button onClick={addGuest} className="w-full py-4 rounded-xl text-white font-bold" style={{ backgroundColor: colors.secondaryBg }}>Add Guest</button>
            </div>
          </div>
        </div>
      </div>

      {popup.show && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4 bg-black/50">
          <div ref={popupRef} className="max-w-sm w-full p-6 rounded-2xl shadow-2xl text-center" style={{ backgroundColor: colors.cardBg }}>
            {popup.type === 'error' ? <FaExclamationTriangle className="mx-auto mb-4 text-red-500" size={48} /> : <FaCheck className="mx-auto mb-4 text-green-500" size={48} />}
            <p className="text-lg font-bold mb-6" style={{ color: colors.textColor }}>{popup.message}</p>
            <button onClick={() => setPopup({...popup, show: false})} className="w-full py-3 rounded-xl text-white font-bold" style={{ backgroundColor: colors.primaryBg }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaterRegistration;