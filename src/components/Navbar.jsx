import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Sprout, Stethoscope, Wheat, MessageSquare, BarChart3, Settings, Menu, X } from './icons';
import { useLanguage } from '../i18n/LanguageContext';
import './Navbar.css';

const navItems = [
  { to: '/', label: 'Home', hindi: 'मुख्य पेज', icon: Sprout, end: true },
  { to: '/crop-doctor', label: 'Crop Doctor', hindi: 'फसल की जाँच', icon: Stethoscope },
  { to: '/crop-advisor', label: 'Advisor', hindi: 'फसल की सलाह', icon: Wheat },
  { to: '/farm-chat', label: 'Farm Chat', hindi: 'खेती पर बातचीत', icon: MessageSquare },
  { to: '/dashboard', label: 'Dashboard', hindi: 'आँकड़े', icon: BarChart3 },
];

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} aria-label={t('Main navigation', 'मुख्य मेन्यू')}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <div className="navbar-logo-icon" aria-hidden="true">🌾</div>
          <span>{t('AgriGuard AI', 'एग्रीगार्ड एआई')}</span>
        </Link>

        <ul id="main-menu" className={`navbar-links${menuOpen ? ' open' : ''}`}>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <item.icon size={16} />
                {t(item.label, item.hindi)}
              </NavLink>
            </li>
          ))}
          <li className="navbar-mobile-settings">
            <NavLink to="/settings" className="navbar-link" onClick={() => setMenuOpen(false)}>
              <Settings size={16} /> {t('Settings', 'सेटिंग्स')}
            </NavLink>
          </li>
        </ul>

        <div className="navbar-actions">
          <div className="language-switch" role="group" aria-label={t('Language', 'भाषा')}>
            <button type="button" lang="en" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>English</button>
            <button type="button" lang="hi" aria-pressed={language === 'hi'} onClick={() => setLanguage('hi')}>हिन्दी</button>
          </div>
          <Link to="/settings" className="navbar-settings" onClick={() => setMenuOpen(false)} title={t('Settings', 'सेटिंग्स')} aria-label={t('Settings', 'सेटिंग्स')}>
            <Settings size={18} />
          </Link>
          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? t('Close menu', 'मेन्यू बंद करें') : t('Open menu', 'मेन्यू खोलें')}
            aria-expanded={menuOpen}
            aria-controls="main-menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
