import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../common/Icons';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const cartItems = useSelector(state => state.cart?.items || []);
    const cartCount = cartItems.length;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/restaurants?search=${encodeURIComponent(searchQuery)}`);
            setMobileOpen(false);
        }
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <Link to="/" className="nav-logo">Aura<span>Bite</span></Link>

            <div className="nav-center">
                <div className="location-picker">
                    <Icons.MapPin />
                    <span>New York, NY</span>
                </div>
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

            <ul className="nav-links" style={{ display: mobileOpen ? 'flex' : '' }}>
                <li><Link to="/" onClick={() => setMobileOpen(false)}>Home</Link></li>
                <li><Link to="/restaurants" onClick={() => setMobileOpen(false)}>Restaurants</Link></li>
                <li><Link to="/orders" onClick={() => setMobileOpen(false)}>Orders</Link></li>

                {user ? (
                    <li className="relative group flex items-center gap-2">
                        <Link to="/profile" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-xs font-bold text-white">
                                {user.name?.[0] || 'U'}
                            </div>
                        </Link>
                        <button onClick={logout} className="text-xs text-red-400 hover:text-red-300 ml-2">Logout</button>
                    </li>
                ) : (
                    <li><Link to="/login" onClick={() => setMobileOpen(false)}>Sign In</Link></li>
                )}

                <li>
                    <Link to="/cart" className="cart-btn" onClick={() => setMobileOpen(false)}>
                        <Icons.ShoppingBag />
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </Link>
                </li>
            </ul>

            <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} style={{ display: 'block' }}>
                {mobileOpen ? <Icons.X /> : <Icons.Menu />}
            </button>
        </nav>
    );
}

export default Navbar;
