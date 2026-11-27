import { Link } from 'react-router-dom';
import { getSdgGoals } from '../data/sdgData';
import { useLanguage } from '../i18n/LanguageContext';
import './Footer.css';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-brand-name gradient-text">🌾 {t('AgriGuard AI', 'एग्रीगार्ड एआई')}</div>
            <p className="footer-brand-desc">
              {t('AI-Powered Precision Agriculture & Food Security Platform. Empowering farmers worldwide with intelligent tools for a Sustainable Future.',
                'एग्रीगार्ड एआई दुनिया भर के किसानों को फसल की देखभाल, पैदावार बढ़ाने और टिकाऊ खेती अपनाने में मदद करता है।')}
            </p>
            <div className="footer-sdg-badges">
              {getSdgGoals(t).map((sdg) => (
                <div
                  key={sdg.id}
                  className="footer-sdg-badge"
                  style={{ background: sdg.color + '22' }}
                  title={`${t('SDG', 'सतत विकास लक्ष्य')} ${sdg.id}: ${sdg.name}`}
                >
                  {sdg.icon}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="footer-col-title">{t('Platform', 'खेती के साधन')}</h4>
            <ul className="footer-links">
              <li><Link to="/crop-doctor">{t('Crop Doctor', 'फसल की जाँच')}</Link></li>
              <li><Link to="/crop-advisor">{t('Smart Advisor', 'फसल की सलाह')}</Link></li>
              <li><Link to="/farm-chat">{t('Farm Chat', 'खेती पर बातचीत')}</Link></li>
              <li><Link to="/dashboard">{t('Impact Dashboard', 'खेती से जुड़े आँकड़े')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-divider" />

        <p className="footer-bottom">© 2026 {t('AgriGuard AI — Empowering Farmers Through Smart Technology', 'एग्रीगार्ड एआई — तकनीक से किसानों की मदद')}</p>
      </div>
    </footer>
  );
}
