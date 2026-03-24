import React, { useState, useEffect, useRef } from 'react';
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer
} from 'recharts';
import {
  ChevronDown, ChevronRight, Calendar, AlertTriangle,
  RefreshCw, AlertCircle, User, Clock, DollarSign, Users, Droplets
} from 'lucide-react';
import { useTheme } from '../UserDashboard';
import { axiosInstance } from '../../lib/axios';

const UsageInsights = () => {
  const { darkMode, colors } = useTheme();
  const [expandedMonths, setExpandedMonths] = useState({});
  const [dailyUsageData, setDailyUsageData] = useState([]);
  const [thirtyDayTrend, setThirtyDayTrend] = useState([]);
  const [yearlyOverview, setYearlyOverview] = useState([]);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState({});
  const [todaySummary, setTodaySummary] = useState({ numGuests: 0, numPrimaryMembers: 0, totalUsageToday: 0 });
  const [todayFraudDetails, setTodayFraudDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.waterId) throw new Error("Water ID missing");
        const [insightsRes, breakdownRes] = await Promise.all([
          axiosInstance.get(`/user/${user.waterId}/get-insights-page-graph-data`),
          axiosInstance.get(`/user/${user.waterId}/get-monthly-usage-details`),
        ]);
        if (insightsRes.data.success) {
          const {
            dailyUsage,
            thirtyDayTrend,
            yearlyOverview,
            numGuests,
            numPrimaryMembers,
            totalUsageToday,
            todayFraudDetails: fraudDetails,
          } = insightsRes.data.data;
          const pieColors = {
            'Primary Members': colors.primaryBg,
            'Extra Water': '#f59e0b',
            'Water by Guests': colors.accent || '#10b981',
          };
          const totalWater = dailyUsage.reduce((s, d) => s + d.value, 0);
          let pieData;
          if (totalWater === 0 && (numPrimaryMembers > 0 || numGuests > 0)) {
            pieData = [
              { name: 'Primary Members', value: numPrimaryMembers, color: pieColors['Primary Members'] },
              { name: 'Water by Guests', value: numGuests, color: pieColors['Water by Guests'] },
            ].filter((d) => d.value > 0);
            if (pieData.length === 0) {
              pieData = [{ name: 'No Data Yet', value: 1, color: colors.borderColor }];
            }
          } else if (totalWater === 0) {
            pieData = [{ name: 'No Data Yet', value: 1, color: colors.borderColor }];
          } else {
            pieData = dailyUsage
              .filter((d) => d.value > 0)
              .map((item) => ({ ...item, color: pieColors[item.name] || '#ccc' }));
          }
          setDailyUsageData(pieData);
          setThirtyDayTrend(thirtyDayTrend);
          setYearlyOverview(yearlyOverview);
          setTodaySummary({ numGuests, numPrimaryMembers, totalUsageToday });
          setTodayFraudDetails(fraudDetails || []);
        }
        if (breakdownRes.data.success) {
          setMonthlyBreakdown(breakdownRes.data.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [colors.primaryBg, colors.accent]);

  const toggleMonth = (month) => {
    setExpandedMonths((prev) => ({ ...prev, [month]: !prev[month] }));
  };

  const handleMouseEnter = (event, fraudulentGuests, dayDate) => {
    if (fraudulentGuests && fraudulentGuests.length > 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipData({ fraudulentGuests, dayDate });
      setTooltipPosition({ x: rect.right + 10, y: rect.top });
    }
  };

  const handleMouseLeave = () => {
    setTooltipData(null);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="p-3 rounded-lg shadow-md border"
          style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}
        >
          <p className="font-medium" style={{ color: colors.textColor }}>
            {`${label}: ${payload[0].value}L`}
          </p>
        </div>
      );
    }
    return null;
  };

  const FraudTooltip = ({ data, position }) => {
    if (!data) return null;
    return (
      <div
        className="fixed z-50 p-4 rounded-lg shadow-2xl border min-w-[280px] max-w-[320px]"
        style={{
          backgroundColor: colors.cardBg,
          borderColor: colors.borderColor,
          left: `${position.x}px`,
          top: `${position.y}px`,
          boxShadow: darkMode
            ? '0 20px 25px -5px rgba(0,0,0,0.5)'
            : '0 20px 25px -5px rgba(0,0,0,0.2)',
        }}
      >
        <div
          className="flex items-center gap-2 mb-3 pb-2 border-b"
          style={{ borderColor: colors.borderColor }}
        >
          <AlertTriangle size={16} style={{ color: '#ef4444' }} />
          <h4 className="font-bold text-sm" style={{ color: colors.textColor }}>
            Early Exit Detected — Day {data.dayDate}
          </h4>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {data.fraudulentGuests.map((fraud, idx) => (
            <div
              key={idx}
              className="p-2 rounded-lg"
              style={{ backgroundColor: darkMode ? 'rgba(239,68,68,0.1)' : '#fef2f2' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <User size={14} style={{ color: '#ef4444' }} />
                <span className="font-semibold text-sm" style={{ color: colors.textColor }}>
                  {fraud.guestName}
                </span>
              </div>
              <div className="text-xs space-y-1" style={{ color: colors.mutedText }}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">ID:</span>
                  <span>{fraud.guestId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={12} />
                  <span>Scheduled: {fraud.scheduledExit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={12} />
                  <span>Actual: {fraud.actualExit}</span>
                </div>
                <div
                  className="flex items-center gap-2 mt-1 pt-1 border-t"
                  style={{ borderColor: colors.borderColor }}
                >
                  <DollarSign size={12} style={{ color: '#ef4444' }} />
                  <span className="font-bold" style={{ color: '#ef4444' }}>
                    Fine: ₹{fraud.fine}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.baseColor }}
      >
        <RefreshCw className="w-12 h-12 animate-spin" style={{ color: colors.primaryBg }} />
      </div>
    );

  if (error)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.baseColor }}
      >
        <div
          className="text-center p-8 rounded-xl border"
          style={{ backgroundColor: colors.cardBg, borderColor: colors.danger }}
        >
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: colors.danger }} />
          <p style={{ color: colors.textColor }}>{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.baseColor }}>
      <FraudTooltip data={tooltipData} position={tooltipPosition} />
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          <div
            className="rounded-xl p-5 border"
            style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}
          >
            <h3 className="text-lg font-semibold mb-1" style={{ color: colors.textColor }}>
              Today's Usage
            </h3>
            <div className="flex gap-4 mb-3 text-xs" style={{ color: colors.mutedText }}>
              <span className="flex items-center gap-1">
                <Users size={12} /> {todaySummary.numPrimaryMembers} members
              </span>
              <span className="flex items-center gap-1">
                <User size={12} /> {todaySummary.numGuests} guests
              </span>
              <span className="flex items-center gap-1">
                <Droplets size={12} /> {todaySummary.totalUsageToday}L total
              </span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={dailyUsageData}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {dailyUsageData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) =>
                    todaySummary.totalUsageToday === 0
                      ? [`${value} ${name === 'No Data Yet' ? '' : 'person/people'}`, name]
                      : [`${value}L`, name]
                  }
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div
            className="rounded-xl p-5 border"
            style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textColor }}>
              30-Day Trend
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={thirtyDayTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.borderColor} vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.mutedText, fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.mutedText, fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="usage" stroke="#4fd1c5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div
            className="rounded-xl p-5 border"
            style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textColor }}>
              Yearly Overview
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={yearlyOverview}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.borderColor} vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.mutedText, fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.mutedText, fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="usage" fill={colors.secondaryBg} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {todayFraudDetails.length > 0 && (
          <div
            className="rounded-xl p-5 mb-8 border"
            style={{
              backgroundColor: darkMode ? 'rgba(239,68,68,0.1)' : '#fef2f2',
              borderColor: '#ef4444',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#ef4444' }}>
                Fraud Early Exits Today ({todayFraudDetails.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {todayFraudDetails.map((fraud, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: darkMode ? 'rgba(239,68,68,0.15)' : '#fee2e2',
                    borderColor: '#ef4444',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <User size={14} style={{ color: '#ef4444' }} />
                    <span className="font-semibold text-sm" style={{ color: colors.textColor }}>
                      {fraud.guestName}
                    </span>
                  </div>
                  <div className="text-xs space-y-1" style={{ color: colors.mutedText }}>
                    <p>
                      <span className="font-medium">User ID:</span> {fraud.guestId}
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock size={11} />
                      <span>Scheduled: {fraud.scheduledExit}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock size={11} />
                      <span>Actual: {fraud.actualExit}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className="rounded-xl p-5 mb-8 border"
          style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}
        >
          <div className="flex items-center mb-6">
            <Calendar className="w-5 h-5 mr-3" style={{ color: colors.primaryBg }} />
            <h2 className="text-xl font-semibold" style={{ color: colors.textColor }}>
              Monthly Breakdown
            </h2>
          </div>
          <div className="space-y-3">
            {Object.entries(monthlyBreakdown).map(([month, data]) => (
              <div
                key={month}
                className="rounded-lg overflow-hidden border"
                style={{ borderColor: colors.borderColor }}
              >
                <button
                  onClick={() => toggleMonth(month)}
                  className="w-full p-4 flex items-center justify-between hover:bg-opacity-10 transition-colors"
                  style={{ backgroundColor: expandedMonths[month] ? colors.hoverBg : 'transparent' }}
                >
                  <div className="flex items-center">
                    <span className="font-medium mr-4 w-24 text-left" style={{ color: colors.textColor }}>
                      {month}
                    </span>
                    <div className="flex space-x-4">
                      <span className="text-sm" style={{ color: colors.mutedText }}>
                        {data.totalUsage}L Total
                      </span>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: data.totalFines > 0 ? '#ef4444' : colors.mutedText }}
                      >
                        {data.totalFines} Fines
                      </span>
                    </div>
                  </div>
                  {expandedMonths[month] ? (
                    <ChevronDown className="w-4 h-4" style={{ color: colors.mutedText }} />
                  ) : (
                    <ChevronRight className="w-4 h-4" style={{ color: colors.mutedText }} />
                  )}
                </button>

                {expandedMonths[month] && (
                  <div
                    className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3"
                    style={{ backgroundColor: colors.hoverBg }}
                  >
                    {data.days &&
                      data.days.map((day) => (
                        <div
                          key={day.date}
                          className="p-3 rounded-lg border transition-all hover:shadow-md relative"
                          style={{
                            backgroundColor: day.hasFine
                              ? darkMode
                                ? 'rgba(239,68,68,0.2)'
                                : '#fee2e2'
                              : colors.cardBg,
                            borderColor: day.hasFine ? '#ef4444' : colors.borderColor,
                            boxShadow: day.hasFine ? '0 0 0 1px #ef4444' : 'none',
                            cursor:
                              day.fraudulentGuests && day.fraudulentGuests.length > 0
                                ? 'help'
                                : 'default',
                          }}
                          onMouseEnter={(e) => handleMouseEnter(e, day.fraudulentGuests, day.date)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold" style={{ color: colors.textColor }}>
                              Day {day.date}
                            </span>
                            {day.hasFine && (
                              <AlertTriangle size={14} style={{ color: '#ef4444' }} />
                            )}
                          </div>
                          <div className="text-xs space-y-1" style={{ color: colors.mutedText }}>
                            <p>Usage: {day.waterUsed}L</p>
                            <p>Guests: {day.normalGuests}</p>
                            {day.fraudulentGuests && day.fraudulentGuests.length > 0 && (
                              <p
                                className="flex items-center gap-1 mt-1 pt-1 border-t"
                                style={{ borderColor: colors.borderColor, color: '#ef4444' }}
                              >
                                <AlertTriangle size={10} style={{ color: '#ef4444' }} />
                                Fraudulent exits: {day.fraudulentGuests.length} — hover for details
                              </p>
                            )}
                            {day.hasFine && (
                              <p className="font-bold" style={{ color: '#ef4444' }}>
                                Fine: ₹{day.fineAmount}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageInsights;