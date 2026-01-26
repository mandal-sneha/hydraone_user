import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../lib/axios.js';
import { FiDroplet, FiFileText, FiTruck, FiCreditCard, FiUsers, FiCalendar, FiCheck, FiAlertCircle, FiUser, FiSettings } from 'react-icons/fi';
import { useTheme } from '../UserDashboard';
import desertCactus from '../../assets/desert-cactus.svg';

const DashboardHome = () => {
  const { darkMode, colors } = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [guestData, setGuestData] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const userObject = localStorage.getItem('user');
        const userId = userObject ? JSON.parse(userObject).userId : null;
        const waterId = userObject ? JSON.parse(userObject).waterId : null;
        if (!userId) { setLoading(false); return; }

        const { data } = await axiosInstance.get(`/user/${userId}/dashboard`);
        setDashboardData(data);

        if (waterId) {
          const [gRes, rRes] = await Promise.all([
            axiosInstance.get(`/user/${waterId}/get-currentday-guests`),
            axiosInstance.get(`/waterregistration/${waterId}/get-registration-details`)
          ]);
          setGuestData(Array.isArray(gRes.data) ? gRes.data : []);
          if (rRes.data.success) setFamilyMembers(rRes.data.data.primaryMembers || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatTime = (t) => {
    if (!t || !t.includes(':')) return t;
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr === 0 ? 12 : hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.baseColor }}><div className="w-16 h-16 border-4 rounded-full animate-spin" style={{ borderTopColor: colors.primaryBg }}></div></div>;

  if (!dashboardData || dashboardData.hasWaterId === false) return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: colors.baseColor }}>
      <div className="rounded-3xl p-12 shadow-xl max-w-md text-center" style={{ backgroundColor: colors.cardBg }}>
        <img src={desertCactus} alt="Empty" className="w-20 mx-auto mb-8" />
        <h3 className="text-3xl font-bold mb-4" style={{ color: colors.textColor }}>Your Water Dashboard</h3>
        <p className="mb-6" style={{ color: colors.mutedText }}>Connect to a property to start tracking water usage.</p>
      </div>
    </div>
  );

  const d = dashboardData;

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.baseColor }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-2xl p-6 shadow-lg border" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(110, 142, 251, 0.1)' }}><FiDroplet className="w-6 h-6" style={{ color: colors.primaryBg }} /></div>
              <span className="text-2xl font-bold" style={{ color: colors.textColor }}>{d.waterUsedThisMonth}L</span>
            </div>
            <p className="text-sm font-medium" style={{ color: colors.mutedText }}>Water Used</p>
            <p className="text-xs mt-1" style={{ color: colors.mutedText, opacity: 0.7 }}>This month</p>
          </div>

          <div className="rounded-2xl p-6 shadow-lg border" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}><FiUsers className="w-6 h-6" style={{ color: colors.accent }} /></div>
              <span className="text-2xl font-bold" style={{ color: colors.textColor }}>{d.guestsThisMonth}</span>
            </div>
            <p className="text-sm font-medium" style={{ color: colors.mutedText }}>Guests</p>
            <p className="text-xs mt-1" style={{ color: colors.mutedText, opacity: 0.7 }}>This month</p>
          </div>

          <div className="rounded-2xl p-6 shadow-lg border" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(167, 119, 227, 0.1)' }}><FiCreditCard className="w-6 h-6" style={{ color: colors.secondaryBg }}/></div>
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
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}><FiTruck className="w-6 h-6" style={{ color: '#f97316' }}/></div>
              <span className="text-lg font-bold" style={{ color: colors.textColor }}>{d.nextSupplyTime}</span>
            </div>
            <p className="text-sm font-medium" style={{ color: colors.mutedText }}>Next Supply</p>
            <p className="text-xs mt-1" style={{ color: colors.mutedText, opacity: 0.7 }}>{d.hoursUntilNext > 0 && `In ${d.hoursUntilNext} hours`}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 rounded-2xl p-8 shadow-lg border" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
            <h3 className="text-lg font-semibold mb-6" style={{ color: colors.textColor }}>Today's Guest Details</h3>
            {guestData.length > 0 ? (
              <div className="space-y-4">
                {guestData.map((guest, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: guest.status === 'accepted' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', border: `1px solid ${guest.status === 'accepted' ? colors.accent : '#f59e0b'}` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden"><img src={guest.userProfilePhoto} alt={guest.userName} className="w-full h-full object-cover"/></div>
                      <div>
                        <div className="font-medium" style={{ color: colors.textColor }}>{guest.userName}</div>
                        <div className="text-xs" style={{ color: colors.mutedText }}>{guest.userId}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm" style={{ color: colors.textColor }}>{formatTime(guest.arrivalTime)}</div>
                      <div className="text-xs" style={{ color: colors.mutedText }}>{guest.stayDuration} hours stay</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-center py-8" style={{ color: colors.mutedText }}>No guests for today</p>}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl p-6 shadow-lg border" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(167, 119, 227, 0.1)' }}><FiFileText className="w-5 h-5" style={{ color: colors.secondaryBg }}/></div>
                <h3 className="text-lg font-bold" style={{ color: colors.textColor }}>Billing</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between p-3 rounded-lg" style={{ backgroundColor: colors.hoverBg }}>
                  <span className="text-sm" style={{ color: colors.mutedText }}>Current Bill</span>
                  <span className="font-bold" style={{ color: colors.textColor }}>₹{d.billThisMonth}</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg" style={{ backgroundColor: colors.hoverBg }}>
                  <span className="text-sm" style={{ color: colors.mutedText }}>Last Month</span>
                  <span className="font-bold" style={{ color: colors.textColor }}>₹{d.lastMonthBill}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                  <span className="text-sm" style={{ color: colors.mutedText }}>Status</span>
                  <span className="font-bold" style={{ color: colors.accent }}>PAID</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-6 border shadow-sm" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
              <h4 className="font-bold mb-2 text-red-500" style={{ fontSize: '14px' }}>Fraud Detection Note</h4>
              <p className="text-xs leading-relaxed" style={{ color: colors.mutedText }}> Penalties included for guest stay durations &gt; 24h. Fraud is calculated at 5L per instance with a fine of ₹10 per litre.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;