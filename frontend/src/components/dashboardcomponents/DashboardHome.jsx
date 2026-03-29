import React, { useState, useEffect, useRef } from 'react';
import { axiosInstance } from '../../lib/axios.js';
import {
  FiDroplet, FiTruck, FiCreditCard, FiUsers, FiCheck,
  FiClock, FiLogIn, FiAlertTriangle, FiX, FiEye, FiCalendar
} from 'react-icons/fi';
import { useTheme } from '../UserDashboard';
import desertCactus from '../../assets/desert-cactus.svg';

const RATES = {
  guestWater: 5,
  extraWater: 10,
  finePerPerson: 500,
  guestWaterLitres: 20,
};

const getMonthLabel = (year, month) => {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(year, month, 1));
};

const getCurrentMonthLabel = () => {
  const now = new Date();
  return getMonthLabel(now.getFullYear(), now.getMonth());
};

const getPrevMonthLabel = () => {
  const now = new Date();
  const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  return getMonthLabel(prevYear, prevMonth);
};

const calcBill = (guests, extraWaterLitres, fraudGuests) => {
  const guestCost = (guests || 0) * RATES.guestWaterLitres * RATES.guestWater;
  const extraCost = (extraWaterLitres || 0) * RATES.extraWater;
  const fineCost = (fraudGuests?.length || 0) * RATES.finePerPerson;
  return { guestCost, extraCost, fineCost, total: guestCost + extraCost + fineCost };
};

const BreakdownModal = ({ title, guests, extraWaterLitres, fraudGuests, colors, darkMode, isPaid, onClose, onPay }) => {
  const overlayRef = useRef(null);
  const { guestCost, extraCost, fineCost, total } = calcBill(guests, extraWaterLitres, fraudGuests);

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  const rows = [
    {
      label: 'Guest Water',
      detail: `${guests || 0} guest(s) × ${RATES.guestWaterLitres}L × ₹${RATES.guestWater}/L`,
      amount: guestCost,
      icon: <FiUsers />,
      color: '#a777e3',
    },
    {
      label: 'Extra Water',
      detail: `${extraWaterLitres || 0}L × ₹${RATES.extraWater}/L`,
      amount: extraCost,
      icon: <FiDroplet />,
      color: '#f59e0b',
    },
    {
      label: 'Fraud Fines',
      detail: `${fraudGuests?.length || 0} person(s) × ₹${RATES.finePerPerson}`,
      amount: fineCost,
      icon: <FiAlertTriangle />,
      color: '#f87171',
    },
  ];

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
    >
      <div className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: colors.cardBg }}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: colors.borderColor }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: colors.textColor }}>Bill Breakdown</h2>
            <p className="text-xs mt-0.5" style={{ color: colors.mutedText }}>{title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{ color: colors.mutedText }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.hoverBg}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-3">
          {rows.filter(row => row.amount > 0).map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ backgroundColor: colors.baseColor, border: `1px solid ${colors.borderColor}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm"
                  style={{ backgroundColor: `${row.color}22`, color: row.color }}
                >
                  {row.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: colors.textColor }}>{row.label}</p>
                  <p className="text-xs" style={{ color: colors.mutedText }}>{row.detail}</p>
                </div>
              </div>
              <p className="text-sm font-bold" style={{ color: row.amount > 0 ? colors.textColor : colors.mutedText }}>
                ₹{row.amount}
              </p>
            </div>
          ))}
          {rows.filter(row => row.amount > 0).length === 0 && (
            <div className="text-center py-8" style={{ color: colors.mutedText }}>
              No charges for this period
            </div>
          )}
        </div>

        <div className="px-6 py-5 border-t flex items-center justify-between" style={{ borderColor: colors.borderColor }}>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.mutedText }}>Total</p>
            <p className="text-3xl font-black mt-0.5" style={{ color: colors.textColor }}>₹{total}</p>
          </div>
          {onPay && !isPaid && total > 0 && (
            <button
              onClick={onPay}
              className="px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #6e8efb, #a777e3)' }}
            >
              Pay Now
            </button>
          )}
          {isPaid && (
            <span
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ backgroundColor: darkMode ? 'rgba(52,211,153,0.15)' : '#d1fae5', color: '#10b981' }}
            >
              <FiCheck className="w-4 h-4" /> Paid
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const CurrentMonthPreview = ({ data, colors, darkMode }) => {
  const [open, setOpen] = useState(false);
  const fraudGuests = data.fraudGuests || [];
  const { guestCost, extraCost, fineCost, total } = calcBill(
    data.guestsThisMonth, 
    data.extraWaterThisMonth || 0, 
    fraudGuests
  );
  const monthLabel = getCurrentMonthLabel();

  return (
    <>
      <div className="rounded-2xl p-6 shadow-lg border" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(110,142,251,0.1)' }}>
              <FiCalendar className="w-5 h-5" style={{ color: colors.primaryBg }} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.mutedText }}>This Month</p>
              <p className="text-sm font-bold" style={{ color: colors.textColor }}>{monthLabel}</p>
            </div>
          </div>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: darkMode ? 'rgba(110,142,251,0.15)' : 'rgba(110,142,251,0.1)', color: colors.primaryBg }}
          >
            Preview
          </span>
        </div>

        <p className="text-3xl font-black mb-1" style={{ color: colors.textColor }}>₹{total}</p>
        <p className="text-xs mb-5" style={{ color: colors.mutedText }}>Accumulated so far · not yet due</p>

        <div className="space-y-2 mb-5">
          {[
            { label: 'Guest Water', value: guestCost, color: '#a777e3' },
            { label: 'Extra Water', value: extraCost, color: '#f59e0b' },
            { label: 'Fines', value: fineCost, color: '#f87171' },
          ].filter(item => item.value > 0).map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs" style={{ color: colors.mutedText }}>{item.label}</span>
              </div>
              <span className="text-xs font-bold" style={{ color: item.value > 0 ? item.color : colors.mutedText }}>₹{item.value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
          style={{ borderColor: colors.borderColor, color: colors.textColor }}
        >
          <FiEye className="w-4 h-4" /> View Breakdown
        </button>
      </div>

      {open && (
        <BreakdownModal
          title={`${monthLabel} · Ongoing Preview`}
          guests={data.guestsThisMonth}
          extraWaterLitres={data.extraWaterThisMonth || 0}
          fraudGuests={fraudGuests}
          colors={colors}
          darkMode={darkMode}
          isPaid={false}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

const LastMonthBillCard = ({ data, colors, darkMode }) => {
  const [open, setOpen] = useState(false);
  const fraudGuests = data.lastMonthFraudGuests || [];
  const isPaid = data.lastMonthBillStatus === 'paid';
  const { guestCost, extraCost, fineCost, total } = calcBill(
    data.lastMonthGuests || 0,
    data.lastMonthExtraWater || 0,
    fraudGuests
  );
  const prevMonthLabel = getPrevMonthLabel();

  return (
    <>
      <div
        className="rounded-2xl p-6 shadow-lg border"
        style={{
          backgroundColor: colors.cardBg,
          borderColor: isPaid ? (darkMode ? 'rgba(52,211,153,0.3)' : '#a7f3d0') : (darkMode ? 'rgba(251,191,36,0.3)' : '#fde68a'),
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: isPaid ? (darkMode ? 'rgba(52,211,153,0.15)' : '#d1fae5') : (darkMode ? 'rgba(251,191,36,0.15)' : '#fef3c7') }}
            >
              <FiCreditCard className="w-5 h-5" style={{ color: isPaid ? '#10b981' : '#d97706' }} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.mutedText }}>Last Month</p>
              <p className="text-sm font-bold" style={{ color: colors.textColor }}>{prevMonthLabel}</p>
            </div>
          </div>
          <span
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: isPaid ? (darkMode ? 'rgba(52,211,153,0.15)' : '#d1fae5') : (darkMode ? 'rgba(251,191,36,0.15)' : '#fef3c7'),
              color: isPaid ? '#10b981' : '#d97706',
            }}
          >
            {isPaid ? <FiCheck className="w-3 h-3" /> : <FiClock className="w-3 h-3" />}
            {isPaid ? 'Paid' : 'Due'}
          </span>
        </div>

        <p className="text-3xl font-black mb-1" style={{ color: colors.textColor }}>₹{total}</p>
        <p className="text-xs mb-5" style={{ color: colors.mutedText }}>
          {isPaid ? 'Payment received · thank you' : 'Payment pending for last month'}
        </p>

        <div className="space-y-2 mb-5">
          {[
            { label: 'Guest Water', value: guestCost, color: '#a777e3' },
            { label: 'Extra Water', value: extraCost, color: '#f59e0b' },
            { label: 'Fines', value: fineCost, color: '#f87171' },
          ].filter(item => item.value > 0).map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs" style={{ color: colors.mutedText }}>{item.label}</span>
              </div>
              <span className="text-xs font-bold" style={{ color: item.value > 0 ? item.color : colors.mutedText }}>₹{item.value}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
            style={{ borderColor: colors.borderColor, color: colors.textColor }}
          >
            <FiEye className="w-4 h-4" /> Details
          </button>
          {!isPaid && total > 0 && (
            <button
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #6e8efb, #a777e3)' }}
            >
              Pay ₹{total}
            </button>
          )}
        </div>
      </div>

      {open && (
        <BreakdownModal
          title={`${prevMonthLabel} · Final Bill`}
          guests={data.lastMonthGuests || 0}
          extraWaterLitres={data.lastMonthExtraWater || 0}
          fraudGuests={fraudGuests}
          colors={colors}
          darkMode={darkMode}
          isPaid={isPaid}
          onClose={() => setOpen(false)}
          onPay={() => {}}
        />
      )}
    </>
  );
};

const DashboardHome = () => {
  const { colors, darkMode } = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [guestSlots, setGuestSlots] = useState({ "8am": [], "12pm": [], "3pm": [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const userObject = localStorage.getItem('user');
        const parsed = userObject ? JSON.parse(userObject) : null;
        const userId = parsed?.userId;
        const waterId = parsed?.waterId;

        if (!userId) { setLoading(false); return; }

        const requests = [
          axiosInstance.get(`/user/${userId}/dashboard`),
          axiosInstance.get(`/user/${userId}/payment-summary`),
        ];

        if (waterId) {
          requests.push(axiosInstance.get(`/user/${waterId}/get-currentday-guests`));
        }

        const results = await Promise.allSettled(requests);

        if (results[0].status === 'fulfilled') {
          setDashboardData(results[0].value.data);
        }

        if (results[1].status === 'fulfilled') {
          setPaymentData(results[1].value.data);
        }

        if (waterId && results[2]?.status === 'fulfilled') {
          setGuestSlots(results[2].value.data || { "8am": [], "12pm": [], "3pm": [] });
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

  const mergedPaymentData = {
    guestsThisMonth: paymentData?.guestsThisMonth ?? d.guestsThisMonth ?? 0,
    extraWaterThisMonth: paymentData?.extraWaterThisMonth ?? 0,
    fraudGuests: paymentData?.fraudGuests ?? [],
    lastMonthGuests: paymentData?.lastMonthGuests ?? 0,
    lastMonthExtraWater: paymentData?.lastMonthExtraWater ?? 0,
    lastMonthFraudGuests: paymentData?.lastMonthFraudGuests ?? [],
    lastMonthBillStatus: paymentData?.lastMonthBillStatus ?? 'due',
  };

  const slotLabels = { "8am": "8 AM Slot", "12pm": "12 PM Slot", "3pm": "3 PM Slot" };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.baseColor }}>
      <div className="max-w-6xl mx-auto px-6 py-8">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="rounded-2xl p-6 shadow-lg border" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(110,142,251,0.1)' }}>
                <FiDroplet className="w-6 h-6" style={{ color: colors.primaryBg }} />
              </div>
              <span className="text-2xl font-bold" style={{ color: colors.textColor }}>{d.waterUsedThisMonth}L</span>
            </div>
            <p className="text-sm font-medium" style={{ color: colors.mutedText }}>Water Used This Month</p>
          </div>

          <div className="rounded-2xl p-6 shadow-lg border" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(167,119,227,0.1)' }}>
                <FiUsers className="w-6 h-6" style={{ color: colors.secondaryBg }} />
              </div>
              <span className="text-2xl font-bold" style={{ color: colors.textColor }}>{mergedPaymentData.guestsThisMonth}</span>
            </div>
            <p className="text-sm font-medium" style={{ color: colors.mutedText }}>Guests This Month</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <CurrentMonthPreview data={mergedPaymentData} colors={colors} darkMode={darkMode} />
          <LastMonthBillCard data={mergedPaymentData} colors={colors} darkMode={darkMode} />
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
                            <FiClock className="w-3 h-3" /> Scheduled
                          </div>
                          <div className="font-bold text-sm" style={{ color: colors.textColor }}>{formatTime(guest.arrivalTime)}</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end text-xs mb-1" style={{ color: colors.accent }}>
                            <FiLogIn className="w-3 h-3" /> Actual Entry
                          </div>
                          <div className="font-bold text-sm" style={{ color: guest.actualEntryTime ? colors.accent : colors.mutedText }}>
                            {guest.actualEntryTime ? formatTime(guest.actualEntryTime) : 'Not Arrived'}
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