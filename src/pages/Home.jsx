import { Link } from 'react-router-dom';
import { Stethoscope, MessageSquare, BarChart3, ArrowRight, Sparkles } from '../components/icons';
import AnimatedCounter from '../components/AnimatedCounter';
import { getSdgGoals, getImpactStats } from '../data/sdgData';
import { useLanguage } from '../i18n/LanguageContext';
import './Home.css';

const getFeatures = (t) => [
  {
    icon: '🩺',
    title: t('AI Crop Doctor', 'फसल की जाँच'),
    desc: t('Upload a photo of your plant and our AI identifies diseases instantly, providing treatment plans and prevention tips.', 'अपने पौधे की फोटो भेजें। बीमारी की पहचान करें और उसके इलाज व बचाव के तरीके जानें।'),
    to: '/crop-doctor',
  },
  {
    icon: '🌱',
    title: t('Smart Crop Advisor', 'फसल की सलाह'),
    desc: t('Get AI-powered crop recommendations based on your region, soil type, season, and budget for maximum yield.', 'अपने इलाके, मिट्टी, मौसम और बजट के हिसाब से जानें कि कौन सी फसल बोएँ।'),
    to: '/crop-advisor',
  },
  {
    icon: '💬',
    title: t('AI Farm Assistant', 'खेती सहायक'),
    desc: t('Chat with our intelligent farming assistant for expert advice on pest control, irrigation, and sustainable practices.', 'कीटों से बचाव, सिंचाई और खेती के बेहतर तरीकों के बारे में अपने सवाल पूछें।'),
    to: '/farm-chat',
  },
];

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: 3 + Math.random() * 4,
  delay: Math.random() * 3,
  size: 2 + Math.random() * 4,
}));

export default function Home() {
  const { t } = useLanguage();
  const features = getFeatures(t);
  const impactStats = getImpactStats(t);
  const sdgGoals = getSdgGoals(t);

  return (
    <div>
      {/* Hero */}
      <section className="home-hero">
        <div className="hero-bg" />
        <div className="hero-particles">
          {particles.map((p) => (
            <div
              key={p.id}
              className="particle"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: p.size,
                height: p.size,
                '--duration': `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
        <div className="hero-content">
          <h1 className="hero-title">
            {t('AI-Powered Agriculture for a', 'बेहतर कल के लिए')}{' '}
            <span className="gradient-text">{t('Sustainable Future', 'एआई से खेती')}</span>
          </h1>
          <p className="hero-subtitle">
            {t('Empowering millions of smallholder farmers worldwide with AI-driven crop disease detection, smart recommendations, and expert farming guidance — one harvest at a time.', 'फसल की बीमारी पहचानें, अपने खेत के लिए सही फसल चुनें और खेती से जुड़े सवालों के जवाब पाएँ।')}
          </p>
          <div className="hero-actions">
            <Link to="/crop-doctor" className="btn btn-primary btn-lg">
              <Stethoscope size={20} />
              {t('Diagnose Your Crop', 'फसल की बीमारी पहचानें')}
            </Link>
            <Link to="/farm-chat" className="btn btn-secondary btn-lg">
              <MessageSquare size={20} />
              {t('Chat with AI', 'खेती का सवाल पूछें')}
            </Link>
          </div>
          <div className="hero-stats">
            {impactStats.map((stat) => (
              <AnimatedCounter
                key={stat.label}
                value={stat.value}
                label={stat.label}
                icon={stat.icon}
                suffix={stat.suffix}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="hero-badge" style={{ marginBottom: 'var(--space-4)' }}>
            <Sparkles size={14} />
            {t('Powered by Advanced AI', 'एआई की मदद से')}
          </div>
          <h2 className="section-title">
            {t('Intelligent Tools for', 'हर किसान के लिए')}{' '}
            <span className="gradient-text">{t('Every Farmer', 'खेती के साधन')}</span>
          </h2>
          <p className="section-subtitle">
            {t('From disease detection to market insights, AgriGuard AI gives you the power of precision agriculture right at your fingertips.', 'फसल की बीमारी से लेकर बाज़ार की जानकारी तक, अपने खेत से जुड़े फैसलों में मदद पाएँ।')}
          </p>
          <div className="features-grid">
            {features.map((f, i) => (
              <Link to={f.to} key={f.to} className={`feature-card glass-card delay-${i + 1} animate-fade-in-up`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: 'var(--color-accent-green)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                  {t('Try now', 'अभी आज़माएँ')} <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SDG Section */}
      <section className="sdg-section">
        <div className="container">
          <h2 className="section-title">
            {t('Addressing the', 'संयुक्त राष्ट्र के')}{' '}
            <span className="gradient-text">{t('UN Sustainable Development Goals', 'सतत विकास लक्ष्य')}</span>
          </h2>
          <p className="section-subtitle">
            {t('AgriGuard AI directly contributes to 4 critical SDGs, creating measurable impact for people and the planet.', 'एग्रीगार्ड एआई इन चार लक्ष्यों में योगदान देता है, ताकि लोगों और पर्यावरण दोनों को लाभ मिले।')}
          </p>
          <div className="sdg-grid">
            {sdgGoals.map((sdg) => (
              <div key={sdg.id} className="sdg-card glass-card">
                <div className="sdg-card-header">
                  <div className="sdg-card-icon" style={{ background: sdg.color + '22' }}>
                    {sdg.icon}
                  </div>
                  <div>
                    <div className="sdg-card-number" style={{ color: sdg.color }}>
                      {t('SDG', 'लक्ष्य')} {sdg.id} — {t('Target', 'उपलक्ष्य')} {sdg.target}
                    </div>
                    <div className="sdg-card-title">{sdg.name}</div>
                  </div>
                </div>
                <p className="sdg-card-desc">{sdg.impact}</p>
                <div className="sdg-card-stat">
                  <span className="sdg-card-stat-value" style={{ color: sdg.color }}>
                    {sdg.stats.value}
                  </span>
                  <span className="sdg-card-stat-label">{sdg.stats.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-box">
          <h2 className="cta-title">
            {t('Ready to', 'अपनी खेती को')}{' '}
            <span className="gradient-text">{t('Transform Your Farm?', 'बेहतर बनाएँ')}</span>
          </h2>
          <p className="cta-desc">
            {t('Start using AI-powered tools to increase yields, detect diseases early, and build a more sustainable farming future.', 'फसल की बीमारी जल्दी पहचानने, उपज बढ़ाने और मिट्टी की सेहत बनाए रखने में मदद पाएँ।')}
          </p>
          <div className="cta-actions">
            <Link to="/crop-doctor" className="btn btn-primary btn-lg">
              {t('Get Started Free', 'मुफ़्त शुरू करें')}
              <ArrowRight size={18} />
            </Link>
            <Link to="/dashboard" className="btn btn-secondary btn-lg">
              <BarChart3 size={18} />
              {t('View Impact', 'आँकड़े देखें')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
