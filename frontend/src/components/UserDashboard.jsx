import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef
} from 'react';
import {
  FiPlus,
  FiPackage,
  FiBarChart2,
  FiMoon,
  FiSun,
  FiUser,
  FiMail,
  FiDroplet,
  FiLogOut,
  FiSettings,
  FiCamera
} from 'react-icons/fi';
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarRightCollapse } from "react-icons/tb";
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import ViewInvitation from './dashboardcomponents/ViewInvitation';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const value = {
    darkMode,
    toggleDarkMode,
    colors: {
      baseColor: darkMode ? '#1f1f2e' : '#f8f6ff',
      textColor: darkMode ? '#ffffff' : '#4b0082',
      cardBg: darkMode ? '#2a2a3d' : '#ffffff',
      sidebarBg: darkMode
        ? 'linear-gradient(to bottom, #23233a, #3a3a5e)'
        : 'linear-gradient(to bottom, #6e8efb, #a777e3)',
      primaryBg: darkMode ? '#3a3a5e' : '#6e8efb',
      secondaryBg: darkMode ? '#4a4a6a' : '#cdb8f2',
      hoverBg: darkMode ? 'rgba(138, 116, 249, 0.15)' : 'rgba(110, 142, 251, 0.15)',
      borderColor: darkMode ? '#4a4a6a' : '#e0e0e0',
      mutedText: darkMode ? '#a0a0a0' : '#666666',
      activeBg: darkMode ? 'rgba(138, 116, 249, 0.2)' : 'rgba(110, 142, 251, 0.2)',
      shadowSm: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(107, 70, 193, 0.1)',
      shadowMd: darkMode ? '0 4px 8px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(107, 70, 193, 0.15)',
      shadowLg: darkMode ? '0 8px 16px rgba(0, 0, 0, 0.5)' : '0 8px 24px rgba(107, 70, 193, 0.2)'
    }
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const ProfileAvatar = ({ src, alt, className, iconSize = 20, theme }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div className={`flex items-center justify-center w-full h-full ${className}`} style={{ color: theme.colors.textColor }}>
        <FiUser size={iconSize} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      style={{ display: 'block' }} // Ensure it's not hidden by parent styles
    />
  );
};

const UserDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [invitationModalOpen, setInvitationModalOpen] = useState(false);
  const [userData, setUserData] = useState({
    userName: '',
    userId: '',
    waterId: '',
    userProfilePhoto: ''
  });

  const dropdownRef = useRef(null);
  const { userid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const isWaterIdEmpty = !userData.waterId || userData.waterId.trim() === '';

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const newUserData = {
          userName: parsed.userName || '',
          userId: parsed.userId || '',
          waterId: parsed.waterId || '',
          userProfilePhoto: parsed.userProfilePhoto || ''
        };
        setUserData(prevData => ({ ...prevData, ...newUserData }));

        if (parsed.userId && parsed.userId !== userid) {
          const currentPath = location.pathname;
          const newPath = currentPath.replace(`/u/${userid}`, `/u/${parsed.userId}`);
          navigate(newPath, { replace: true });
        }
      } catch (e) {
        console.error('Invalid user in localStorage:', e);
      }
    }
  }, [userid, location.pathname, navigate]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userData.userId) {
        try {
          const response = await axiosInstance.get(`/user/${userData.userId}/get-user`);
          if (response.data && response.data.userProfilePhoto) {
            setUserData(prevData => ({
              ...prevData,
              userProfilePhoto: response.data.userProfilePhoto
            }));
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [userData.userId]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        const storedUser = e.newValue;
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            const newUserData = {
              userName: parsed.userName || '',
              userId: parsed.userId || '',
              waterId: parsed.waterId || '',
              userProfilePhoto: parsed.userProfilePhoto || ''
            };
            setUserData(prevData => ({ ...prevData, ...newUserData }));

            if (parsed.userId && parsed.userId !== userid) {
              const currentPath = location.pathname;
              const newPath = currentPath.replace(`/u/${userid}`, `/u/${parsed.userId}`);
              navigate(newPath, { replace: true });
            }
          } catch (e) {
            console.error('Invalid user in localStorage:', e);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [userid, location.pathname, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleProfileDropdown = () => setProfileDropdownOpen((prev) => !prev);

  const handleProfile = () => {
    setProfileDropdownOpen(false);
    const currentUserId = userData.userId || userid;
    navigate(`/u/${currentUserId}/profile`);
  };

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleInvitations = () => {
    setProfileDropdownOpen(false);
    setInvitationModalOpen(true);
  };

  const DisabledTooltip = ({ children, message }) => (
    <div className="relative group">
      {children}
      <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 top-1/2 transform -translate-y-1/2 shadow-lg">
        {message}
        <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-[6px] border-transparent border-r-gray-800"></div>
      </div>
    </div>
  );

  const isActiveRoute = (route) => location.pathname === route;

  const MenuItem = ({ icon, label, route, disabled = false, tooltipMessage = '', navigationState = null }) => {
    const currentUserId = userData.userId || userid;
    const actualRoute = route ? route.replace(userid, currentUserId) : route;

    const content = (
      <div
        className={`p-4 text-base flex items-center gap-4 rounded-xl font-medium transition-all duration-300 ${disabled
          ? 'text-gray-400 cursor-not-allowed opacity-50'
          : 'cursor-pointer transform hover:translate-x-1'
          } ${!sidebarOpen ? 'justify-center' : ''}`}
        style={{
          color: disabled
            ? theme.colors.mutedText
            : theme.colors.textColor,
          backgroundColor: isActiveRoute(actualRoute)
            ? theme.colors.activeBg
            : 'transparent',
          boxShadow: isActiveRoute(actualRoute) ? theme.colors.shadowSm : 'none',
          borderLeft: isActiveRoute(actualRoute) ? `3px solid ${theme.darkMode ? '#8a74f9' : '#6e8efb'}` : '3px solid transparent'
        }}
        onClick={() => !disabled && actualRoute && navigate(actualRoute, { state: navigationState })}
        onMouseEnter={(e) => {
          if (!disabled && !isActiveRoute(actualRoute)) {
            e.currentTarget.style.background = theme.colors.hoverBg;
            e.currentTarget.style.boxShadow = theme.colors.shadowSm;
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isActiveRoute(actualRoute)) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        <span className="text-xl">{icon}</span>
        {sidebarOpen && <span className="font-semibold">{label}</span>}
      </div>
    );

    return disabled ? (
      <DisabledTooltip message={tooltipMessage}>{content}</DisabledTooltip>
    ) : (
      content
    );
  };

  const currentUserId = userData.userId || userid;

  return (
    <div
      className="flex flex-row h-screen w-screen overflow-hidden shadow-2xl relative font-sans"
      style={{
        backgroundColor: theme.colors.baseColor,
        color: theme.colors.textColor
      }}
    >
      <div
        className="flex flex-col flex-shrink-0 transition-all duration-300 gap-2 justify-between h-full relative"
        style={{
          width: sidebarOpen ? '256px' : '80px',
          padding: sidebarOpen ? '1.5rem' : '1rem',
          background: theme.colors.sidebarBg
        }}
      >
        <div className="flex flex-col gap-2">
          <div
            className={`mb-6 relative ${sidebarOpen ? 'flex items-center gap-3' : 'flex justify-center'}`}
            style={{
              padding: sidebarOpen ? '1rem 0' : '0.5rem 0',
              marginBottom: '1rem'
            }}
          >
            {sidebarOpen ? (
              <>
                <div
                  className="flex items-center justify-center rounded-full transition-transform duration-300 hover:scale-110"
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  <FiDroplet className="text-white text-xl" />
                </div>
                <div className="flex flex-col">
                  <h1
                    className="text-2xl font-bold"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      letterSpacing: '-0.02em',
                      color: theme.darkMode ? '#ffffff' : '#ffffff'
                    }}
                  >
                    HydraOne
                  </h1>

                </div>
                <button
                  onClick={toggleSidebar}
                  className="absolute top-0 right-0 bg-transparent border-none text-xl transition-all duration-300 p-2 rounded-lg hover:rotate-180"
                  style={{
                    color: theme.colors.textColor
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.colors.hoverBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <TbLayoutSidebarLeftCollapse />
                </button>
              </>
            ) : (
              <button
                onClick={toggleSidebar}
                className="bg-transparent border-none text-2xl transition-all duration-300 p-3 rounded-lg hover:rotate-180"
                style={{
                  color: theme.colors.textColor
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.hoverBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <TbLayoutSidebarRightCollapse />
              </button>
            )}
          </div>

          <MenuItem icon={<FiBarChart2 />} label="Dashboard" route={`/u/${currentUserId}`} />
          <MenuItem icon={<FiPackage />} label="Add Property" route={`/u/${currentUserId}/add-property`} />
          <MenuItem
            icon={<FiPlus />}
            label="Register for Water"
            disabled={isWaterIdEmpty}
            tooltipMessage="Please add a property or join as a tenant to access this feature"
            route={`/u/${currentUserId}/water-registration`}
          />
          <MenuItem
            icon={<FiCamera />}
            label="Camera Monitor"
            disabled={isWaterIdEmpty}
            tooltipMessage="Please add a property or join as a tenant to access this feature"
            route={`/u/${currentUserId}/camera-monitor`}
            navigationState={{ waterId: userData.waterId }}
          />
          <MenuItem
            icon={<FiBarChart2 />}
            label="Usage Insights"
            disabled={isWaterIdEmpty}
            tooltipMessage="Please add a property or join as a tenant to access this feature"
            route={`/u/${currentUserId}/usage-insights`}
          />
        </div>

        <div className="mt-auto pt-5 relative" ref={dropdownRef}>
          <div
            className={`text-base font-bold text-center rounded-xl p-3 cursor-pointer transition-all duration-300 transform hover:scale-105 ${sidebarOpen ? 'flex items-center gap-3' : 'flex items-center justify-center'
              }`}
            style={{
              backgroundColor: theme.colors.secondaryBg,
              color: theme.colors.textColor,
              boxShadow: theme.colors.shadowMd
            }}
            onClick={toggleProfileDropdown}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.hoverBg;
              e.currentTarget.style.boxShadow = theme.colors.shadowLg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.secondaryBg;
              e.currentTarget.style.boxShadow = theme.colors.shadowMd;
            }}
          >
            {sidebarOpen ? (
              <>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-white/20"
                  style={{
                    backgroundColor: theme.colors.cardBg,
                    minWidth: '32px',
                    minHeight: '32px'
                  }}
                >
                  <ProfileAvatar
                    src={userData.userProfilePhoto}
                    alt={userData.userName || 'User'}
                    className="w-full h-full object-cover"
                    iconSize={18}
                    theme={theme}
                  />
                </div>
                <span className="text-lg">{userData.userName || 'Guest'}</span>
              </>
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-white/20"
                style={{
                  backgroundColor: theme.colors.cardBg,
                  minWidth: '36px',
                  minHeight: '36px'
                }}
              >
                <ProfileAvatar
                  src={userData.userProfilePhoto}
                  alt={userData.userName || 'User'}
                  className="w-full h-full object-cover"
                  iconSize={20}
                  theme={theme}
                />
              </div>
            )}
          </div>

          {profileDropdownOpen && (
            <div
              className="absolute bottom-full mb-2 rounded-xl shadow-2xl border overflow-hidden backdrop-blur-sm"
              style={{
                backgroundColor: theme.colors.cardBg,
                borderColor: theme.colors.borderColor,
                width: sidebarOpen ? '100%' : '180px',
                left: sidebarOpen ? '0' : '100%',
                right: sidebarOpen ? 'auto' : '0',
                zIndex: 1000,
                boxShadow: theme.colors.shadowLg
              }}
            >
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-300 transform hover:translate-x-1"
                style={{ color: theme.colors.textColor }}
                onClick={handleProfile}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.hoverBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <FiSettings className="text-lg" />
                <span className="font-semibold">Profile</span>
              </div>
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-300 transform hover:translate-x-1"
                style={{ color: theme.colors.textColor }}
                onClick={handleLogout}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.hoverBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <FiLogOut className="text-lg" />
                <span className="font-semibold">Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-grow min-w-0 flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: theme.colors.baseColor }}>
        <div
          className="flex justify-end items-center px-8 py-5 border-b backdrop-blur-sm"
          style={{
            borderColor: theme.colors.borderColor,
            backgroundColor: theme.colors.baseColor,
            boxShadow: theme.colors.shadowSm
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={handleInvitations}
              className="bg-transparent border-none text-xl p-3 rounded-xl transition-all duration-300 cursor-pointer transform hover:scale-110"
              style={{
                color: theme.colors.textColor,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.hoverBg;
                e.currentTarget.style.boxShadow = theme.colors.shadowSm;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
              title="View Invitations"
            >
              <FiMail />
            </button>

            <button
              onClick={theme.toggleDarkMode}
              className="bg-transparent border-none text-xl p-3 rounded-xl transition-all duration-300 transform hover:scale-110 hover:rotate-180"
              style={{
                color: theme.colors.textColor,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.hoverBg;
                e.currentTarget.style.boxShadow = theme.colors.shadowSm;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
              title={theme.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme.darkMode ? <FiSun /> : <FiMoon />}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>

      <ViewInvitation
        isOpen={invitationModalOpen}
        onClose={() => setInvitationModalOpen(false)}
        theme={theme}
      />
    </div>
  );
};

export default UserDashboard;