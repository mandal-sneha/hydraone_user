import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronRight, Droplets, Calendar, Users, AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react';
import { useTheme } from '../UserDashboard';
import { axiosInstance } from '../../lib/axios';

const UsageInsights = () => {
  const { darkMode, colors } = useTheme();
  const [expandedMonths, setExpandedMonths] = useState({});
  const [dailyUsageData, setDailyUsageData] = useState([]);
  const [thirtyDayTrend, setThirtyDayTrend] = useState([]);
  const [yearlyOverview, setYearlyOverview] = useState([]);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.waterId) throw new Error("Water ID missing");

        const [insightsRes, breakdownRes] = await Promise.all([
          axiosInstance.get(`/user/${user.waterId}/get-insights`),
          axiosInstance.get(`/user/${user.waterId}/monthly-breakdown-live`)
        ]);

        if (insightsRes.data.success) {
          const { dailyUsage, thirtyDayTrend, yearlyOverview } = insightsRes.data.data;
          const pieColors = { 'Primary Members': colors.primaryBg, 'Extra Water': '#f59e0b', 'Water by Guests': colors.accent || '#10b981' };
          setDailyUsageData(dailyUsage.map(item => ({ ...item, color: pieColors[item.name] || '#ccc' })));
          setThirtyDayTrend(thirtyDayTrend);
          setYearlyOverview(yearlyOverview);
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
    setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-lg shadow-md border" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
          <p className="font-medium" style={{ color: colors.textColor }}>{`${label}: ${payload[0].value}L`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.baseColor }}>
      <RefreshCw className="w-12 h-12 animate-spin" style={{ color: colors.primaryBg }} />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.baseColor }}>
      <div className="text-center p-8 rounded-xl border" style={{ backgroundColor: colors.cardBg, borderColor: colors.danger }}>
        <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: colors.danger }} />
        <p style={{ color: colors.textColor }}>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.baseColor }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          <div className="rounded-xl p-5 border" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textColor }}>Today's Usage</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={dailyUsageData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                  {dailyUsageData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl p-5 border" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textColor }}>30-Day Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={thirtyDayTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.borderColor} vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: colors.mutedText, fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.mutedText, fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="usage" stroke="#4fd1c5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl p-5 border" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textColor }}>Yearly Overview</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={yearlyOverview}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.borderColor} vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: colors.mutedText, fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.mutedText, fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="usage" fill={colors.secondaryBg} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl p-5 mb-8 border" style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}>
          <div className="flex items-center mb-6">
            <Calendar className="w-5 h-5 mr-3" style={{ color: colors.primaryBg }} />
            <h2 className="text-xl font-semibold" style={{ color: colors.textColor }}>Monthly Breakdown</h2>
          </div>
          
          <div className="space-y-3">
            {Object.entries(monthlyBreakdown).map(([month, data]) => (
              <div key={month} className="rounded-lg overflow-hidden border" style={{ borderColor: colors.borderColor }}>
                <button onClick={() => toggleMonth(month)} className="w-full p-4 flex items-center justify-between" style={{ backgroundColor: expandedMonths[month] ? colors.hoverBg : 'transparent' }}>
                  <div className="flex items-center">
                    <span className="font-medium mr-4 w-24 text-left" style={{ color: colors.textColor }}>{month}</span>
                    <div className="flex space-x-4">
                      <span className="text-sm" style={{ color: colors.mutedText }}>{data.totalUsage}L Total</span>
                      <span className="text-sm" style={{ color: colors.mutedText }}>{data.totalFines} Fines</span>
                    </div>
                  </div>
                  {expandedMonths[month] ? <ChevronDown style={{ color: colors.mutedText }} /> : <ChevronRight style={{ color: colors.mutedText }} />}
                </button>
                
                {expandedMonths[month] && (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3" style={{ backgroundColor: colors.hoverBg }}>
                    {data.days.map((day) => (
                      <div key={day.date} className="p-3 rounded-lg border" style={{ backgroundColor: day.hasFine ? 'rgba(239, 68, 68, 0.1)' : colors.cardBg, borderColor: day.hasFine ? colors.danger : colors.borderColor }}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold" style={{ color: colors.textColor }}>Day {day.date}</span>
                          {day.hasFine && <AlertTriangle size={14} style={{ color: colors.danger }} />}
                        </div>
                        <div className="text-xs space-y-1" style={{ color: colors.mutedText }}>
                          <p>Usage: {day.waterUsed}L</p>
                          <p>Guests: {day.guests}</p>
                          {day.hasFine && <p style={{ color: colors.danger }}>Fine: ₹{day.fineAmount}</p>}
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