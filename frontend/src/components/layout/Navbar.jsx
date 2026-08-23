import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../common/Icons';
import { FiUser, FiPackage, FiLogOut, FiChevronDown, FiShield, FiHeart, FiZap } from 'react-icons/fi';
import axios from 'axios';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationName, setLocationName] = useState('Detecting location...');
    const [isLocating, setIsLocating] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const cartItems = useSelector(state => state.cart?.items || []);
    const cartCount = cartItems.length;

    const detectUserLocation = () => {
        if (!navigator.geolocation) {
            setLocationName('Current Location');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                try {
                    const res = await axios.get(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
                    );
                    if (res.data && res.data.address) {
                        const addr = res.data.address;
                        const city = addr.city || addr.town || addr.suburb || addr.county || addr.state || 'Current Location';
                        const stateStr = addr.state ? `, ${addr.state.substring(0, 2).toUpperCase()}` : '';
                        setLocationName(`${city}${stateStr}`);
                    } else {
                        setLocationName(`GPS: ${lat.toFixed(2)}, ${lng.toFixed(2)}`);
                    }
                } catch {
                    setLocationName('Current GPS Location');
                } finally {
                    setIsLocating(false);
                }
            },
            (err) => {
                console.warn('Browser geolocation prompt fallback:', err.message);
                setLocationName('Current GPS Location');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);
        detectUserLocation();
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/restaurants?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    // User first letter avatar
    const firstLetter = (user?.fullName?.[0] || user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase();

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <Link to="/" className="nav-logo">Aura<span>Bite</span></Link>

            <div className="nav-center">
                <button
                    type="button"
                    onClick={detectUserLocation}
                    className="location-picker hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1.5"
                    title="Click to re-detect current GPS location"
                >
                    <Icons.MapPin />
                    <span className="text-xs font-semibold text-orange-400">
                        {isLocating ? 'Locating...' : locationName}
                    </span>
                </button>
                <form className="search-bar" onSubmit={handleSearch}>
                    <div className="search-icon"><Icons.Search /></div>
                    <input
                        type="text"
                        placeholder="Search food, restaurants..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>
            </div>

            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/restaurants">Restaurants</Link></li>

                {/* AI Voice Assistant Trigger Button */}
                <li>
                    <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-voice-assist'))}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white border border-orange-500/40 hover:border-orange-500 transition-all text-xs font-bold shadow-sm cursor-pointer group"
                        title="Aura AI Voice Assist"
                    >
                        <FiZap className="w-3.5 h-3.5 text-orange-400 group-hover:text-white group-hover:scale-110 transition-transform" />
                        <span>AI Voice</span>
                    </button>
                </li>

                {/* Cart Icon */}
                <li>
                    <Link to="/cart" className="cart-btn">
                        <Icons.ShoppingBag />
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </Link>
                </li>

                {/* User First Letter Icon & Dropdown Menu */}
                {user ? (
                    <li className="relative" ref={userMenuRef}>
                        <button
                            type="button"
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 flex items-center justify-center text-sm font-black text-white shadow-lg border-2 border-white/20">
                                {firstLetter}
                            </div>
                            <FiChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Card */}
                        {userMenuOpen && (
                            <div className="absolute right-0 mt-3 w-56 bg-[#18181b] rounded-2xl p-2 shadow-2xl border border-white/15 backdrop-blur-xl z-[9999]">
                                <div className="p-3 border-b border-white/10 mb-1">
                                    <p className="text-sm font-bold text-white truncate">{user.fullName || user.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                </div>

                                <Link
                                    to="/orders"
                                    onClick={() => setUserMenuOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-200 hover:bg-orange-500/20 hover:text-orange-400 transition-colors"
                                >
                                    <FiPackage className="w-4 h-4 text-orange-400" />
                                    <span>My Orders</span>
                                </Link>

                                <Link
                                    to="/profile"
                                    onClick={() => setUserMenuOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-200 hover:bg-orange-500/20 hover:text-orange-400 transition-colors"
                                >
                                    <FiUser className="w-4 h-4 text-orange-400" />
                                    <span>My Profile & Health</span>
                                </Link>

                                <div className="border-t border-white/10 mt-1 pt-1">
                                    <button
                                        onClick={() => {
                                            setUserMenuOpen(false);
                                            logout();
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                    >
                                        <FiLogOut className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </li>
                ) : (
                    <li>
                        <Link to="/login" className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg transition-colors">
                            Sign In
                        </Link>
                    </li>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;
