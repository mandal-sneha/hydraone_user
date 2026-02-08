import React from 'react';
import { FaHome, FaUsers, FaBuilding } from 'react-icons/fa';
import { useTheme } from '../UserDashboard';

const CurrentProperty = ({ selectedProperty, setSelectedProperty, properties }) => {
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

  const selectStyle = {
    backgroundColor: theme.colors.baseColor,
    color: theme.colors.textColor,
    borderColor: theme.colors.borderColor
  };

  const cardStyle = {
    backgroundColor: theme.darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
    borderColor: theme.colors.borderColor,
    color: theme.colors.textColor
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-lg border shadow-sm" style={containerStyle}>
        <div className="px-6 py-3" style={headerStyle}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: theme.colors.primaryBg, color: '#fff' }}>
              <FaHome size={18} />
            </div>
            <h3 className="text-lg font-semibold">Current Property</h3>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={labelStyle}>
                Select your current residence:
              </label>
              <div className="relative max-w-md">
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm font-medium appearance-none cursor-pointer hover:border-blue-300 transition-colors"
                  style={{
                    ...selectStyle,
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(theme.colors.textColor)}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '20px'
                  }}
                >
                  {properties.map(property => (
                    <option
                      key={property.id}
                      value={property.id}
                      className="py-2"
                      style={{ backgroundColor: theme.colors.cardBg, color: theme.colors.textColor }}
                    >
                      {property.name} ({property.district}, Ward {property.wardNumber})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-4">
                  <span></span>
                  {selectedProperty && (
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold mr-8
                      ${properties.find(p => p.id === selectedProperty)?.label === 'owner'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'}`}>
                      {properties.find(p => p.id === selectedProperty)?.label === 'owner' ? 'Owner' : 'Tenant'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {selectedProperty && (
              <div className="p-4 rounded-xl shadow-sm border-2" style={{ borderColor: theme.colors.borderColor }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: theme.colors.primaryBg, color: '#fff' }}>
                    <FaHome size={20} />
                  </div>
                  <h4 className="font-bold text-xl" style={{ color: theme.colors.textColor }}>
                    {properties.find(p => p.id === selectedProperty)?.name}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg shadow-sm border" style={cardStyle}>
                    <div className="font-medium mb-1 text-sm opacity-70">Municipality</div>
                    <div className="font-semibold text-base">
                      {properties.find(p => p.id === selectedProperty)?.municipality}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg shadow-sm border" style={cardStyle}>
                    <div className="font-medium mb-1 text-sm opacity-70">District</div>
                    <div className="font-semibold text-base">
                      {properties.find(p => p.id === selectedProperty)?.district}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg shadow-sm border" style={cardStyle}>
                    <div className="font-medium mb-1 text-sm opacity-70">No. of Tenants</div>
                    <div className="font-semibold flex items-center gap-2 text-base">
                      <FaUsers style={{ color: theme.colors.primaryBg }} size={16} />
                      {properties.find(p => p.id === selectedProperty)?.tenants}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg shadow-sm border" style={cardStyle}>
                    <div className="font-medium mb-1 text-sm opacity-70">Property Type</div>
                    <div className="font-semibold flex items-center gap-2 text-base">
                      <FaBuilding style={{ color: theme.colors.primaryBg }} size={16} />
                      {properties.find(p => p.id === selectedProperty)?.propertyType}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentProperty;