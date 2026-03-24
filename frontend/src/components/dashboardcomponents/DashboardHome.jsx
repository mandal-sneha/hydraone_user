import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../lib/axios.js';
import { FiDroplet, FiFileText, FiTruck, FiCreditCard, FiUsers, FiCheck, FiClock, FiLogIn } from 'react-icons/fi';
import { useTheme } from '../UserDashboard';
import desertCactus from '../../assets/desert-cactus.svg';

const DashboardHome = () => {
  const { colors } = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [guestSlots, setGuestSlots] = useState({ "8am": [], "12pm": [], "3pm": [] });
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const userObject = localStorage.getItem('user');
        const parsed = userObject ? JSON.parse(userObject) : null;
        const userId = parsed?.userId;
        const waterId = parsed?.waterId;

        if (!userId) {
          setLoading(false);
          return;
        }

        const { data } = await axiosInstance.get(`/user/${userId}/dashboard`);
        setDashboardData(data);

        if (waterId) {
          const [gRes, rRes] = await Promise.all([
            axiosInstance.get(`/user/${waterId}/get-currentday-guests`),
            axiosInstance.get(`/waterregistration/${waterId}/get-registration-details`)
          ]);

          setGuestSlots(gRes.data || { "8am": [], "12pm": [], "3pm": [] });

          if (rRes.data.success) {
            setFamilyMembers(rRes.data.data.primaryMembers || []);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatTime = (t) => {
    if (!t || !t.includes(':')) return t || '--:--';
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr === 0 ? 12 : hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.baseColor }}>
        <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{ borderTopColor: colors.primaryBg }}></div>
      </div>
    );
  }

  if (!dashboardData || dashboardData.hasWaterId === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: colors.baseColor }}>
        <div className="rounded-3xl p-12 shadow-xl max-w-md text-center" style={{ backgroundColor: colors.cardBg }}>
          <img src={desertCactus} alt="Empty" className="w-20 mx-auto mb-8" />
          <h3 className="text-3xl font-bold mb-4" style={{ color: colors.textColor }}>Your Water Dashboard</h3>
          <p className="mb-6" style={{ color: colors.mutedText }}>Connect to a property to start tracking water usage.</p>
        </div>
      </div>
    );
  }

  const d = dashboardData;
  const slotLabels = { "8am": "8 AM Slot", "12pm": "12 PM Slot", "3pm": "3 PM Slot" };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.baseColor }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-2xl p-6 shadow-lg border" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(110,142,251,0.1)' }}>
                <FiDroplet className="w-6 h-6" style={{ color: colors.primaryBg }} />
              </div>
              <span className="text-2xl font-bold" style={{ color: colors.textColor }}>{d.waterUsedThisMonth}L</span>
            </div>
            <p className="text-sm font-medium" style={{ color: colors.mutedText }}>Water Used</p>
          </div>

          <div className="rounded-2xl p-6 shadow-lg border" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>
                <FiUsers className="w-6 h-6" style={{ color: colors.accent }} />
              </div>
              <span className="text-2xl font-bold" style={{ color: colors.textColor }}>{d.guestsThisMonth}</span>
            </div>
            <p className="text-sm font-medium" style={{ color: colors.mutedText }}>Guests</p>
          </div>

          <div className="rounded-2xl p-6 shadow-lg border" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(167,119,227,0.1)' }}>
                <FiCreditCard className="w-6 h-6" style={{ color: colors.secondaryBg }} />
              </div>
              <span className="text-2xl font-bold" style={{ color: colors.textColor }}>₹{d.billThisMonth}</span>
            </div>
            <p className="text-sm font-medium" style={{ color: colors.mutedText }}>Current Bill</p>
            <div className="flex items-center gap-1 mt-1">
              <FiCheck className="w-3 h-3" style={{ color: colors.accent }} />
              <p className="text-xs font-medium" style={{ color: colors.accent }}>{d.billStatus.toUpperCase()}</p>
            </div>
          </div>

          <div className="rounded-2xl p-6 shadow-lg border" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(249,115,22,0.1)' }}>
                <FiTruck className="w-6 h-6" style={{ color: '#f97316' }} />
              </div>
              <span className="text-lg font-bold" style={{ color: colors.textColor }}>{d.nextSupplyTime}</span>
            </div>
            <p className="text-sm font-medium" style={{ color: colors.mutedText }}>Next Supply</p>
          </div>
        </div>

        <div className="rounded-2xl p-8 shadow-lg border" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
          <h3 className="text-lg font-semibold mb-6" style={{ color: colors.textColor }}>Today's Guest Slots</h3>
          {Object.keys(slotLabels).map((slot) => (
            <div key={slot} className="mb-6">
              <h4 className="text-sm font-bold mb-3" style={{ color: colors.mutedText }}>{slotLabels[slot]}</h4>
              {guestSlots[slot]?.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {guestSlots[slot].map((guest, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border" style={{ backgroundColor: colors.baseColor, borderColor: colors.borderColor }}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2" style={{ borderColor: colors.primaryBg }}>
                          <img src={guest.userProfilePhoto} alt={guest.userName} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold" style={{ color: colors.textColor }}>{guest.userName}</div>
                          <div className="text-xs" style={{ color: colors.mutedText }}>{guest.userId}</div>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end text-xs mb-1" style={{ color: colors.mutedText }}>
                            <FiClock className="w-3 h-3`" /> Scheduled
                          </div>
                          <div className="font-bold text-sm" style={{ color: colors.textColor }}>{formatTime(guest.arrivalTime)}</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end text-xs mb-1" style={{ color: colors.accent }}>
                            <FiLogIn className="w-3 h-3" /> Actual Entry
                          </div>
                          <div className="font-bold text-sm" style={{ color: guest.actualEntryTime ? colors.accent : colors.mutedText }}>
                            {guest.actualEntryTime ? formatTime(guest.actualEntryTime) : "Not Arrived"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs italic" style={{ color: colors.mutedText }}>No guests scheduled</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;