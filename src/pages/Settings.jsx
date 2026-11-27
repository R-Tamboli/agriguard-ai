import { useState } from 'react';
import { Key, Server, RefreshCw } from '../components/icons';
import { useLanguage } from '../i18n/LanguageContext';
import './Settings.css';

export default function Settings() {
  const { t } = useLanguage();
  const [checking, setChecking] = useState(false);
  const [health, setHealth] = useState(null);

  const checkLocalAI = async () => {
    setChecking(true);
    setHealth(null);
    try {
      const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      const response = await fetch(`${base}/api/health`);
      if (response.status === 429) {
        setHealth({ status: 'busy' });
        return;
      }
      const data = await response.json();
      setHealth(data);
    } catch {
      setHealth({ status: 'unreachable' });
    } finally {
      setChecking(false);
    }
  };

  function healthMessage() {
    if (health.status === 'busy') return t('Please wait a minute and check again.', 'एक मिनट रुककर फिर जाँचें।');
    if (health.status === 'unreachable') return t('AgriGuard server is not running. Start node server.mjs in a separate terminal.',
      'एग्रीगार्ड सर्वर से संपर्क नहीं हुआ। कंप्यूटर पर अलग टर्मिनल खोलें और node server.mjs चलाएँ।');
    if (health.ok) return t('Local AI is ready.', 'आपके कंप्यूटर पर एआई तैयार है।');
    if (health.message === `Model ${health.model} is not downloaded yet.`) {
      return t(health.message, `अभी ${health.model} मॉडल डाउनलोड नहीं हुआ है।`);
    }
    if (health.message === 'Ollama is not responding. Open Ollama and try again.') {
      return t(health.message, 'Ollama से संपर्क नहीं हुआ। Ollama खोलें और फिर जाँचें।');
    }
    return t(health.message || 'Local AI status is unavailable.', 'अभी एआई की स्थिति पता नहीं चल पाई।');
  }

  return (
    <div className="settings">
      <div className="container">
        <div className="page-header">
          <h1 className="section-title">⚙️ <span className="gradient-text">{t('Settings', 'सेटिंग्स')}</span></h1>
          <p className="section-subtitle">{t('Private, local AI. No API key or paid AI account needed.',
            'एआई आपके कंप्यूटर पर चलता है। इसके लिए एपीआई कुंजी या पैसे वाला खाता नहीं चाहिए।')}</p>
        </div>

        <div className="settings-card glass-card-static">
          <div className="settings-section">
            <div className="settings-section-title">
              <Key size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--color-accent-green)' }} />
              {t('No browser API key needed', 'बिना एपीआई कुंजी के इस्तेमाल करें')}
            </div>
            <div className="settings-section-desc">
              {t('AgriGuard sends AI requests to Ollama running on this computer. Your uploaded leaf photos stay on your device.',
                'एग्रीगार्ड आपके सवाल इसी कंप्यूटर पर चल रहे Ollama को भेजता है। पत्तों की फ़ोटो इसी कंप्यूटर पर रहती हैं।')}
            </div>
          </div>
          <div className="settings-divider" />
          <div className="settings-section">
            <div className="settings-section-title">
              <Server size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--color-accent-blue)' }} />
              {t('Server setup', 'कंप्यूटर पर एआई कैसे शुरू करें')}
            </div>
            <div className="settings-section-desc">
              {t('Install Ollama, download the ', 'Ollama इंस्टॉल करें। फिर ')}<code>qwen2.5vl:3b</code>{t(' model, then start Ollama and AgriGuard on this computer. The first model download is about 2 GB.',
                ' मॉडल डाउनलोड करें और इस कंप्यूटर पर Ollama और एग्रीगार्ड चालू करें। पहली बार करीब 2 जीबी डाउनलोड होगा।')}
            </div>
            <button className="btn btn-secondary" onClick={checkLocalAI} disabled={checking}>
              <RefreshCw size={16} /> {checking ? t('Checking…', 'जाँच हो रही है…') : t('Check local AI', 'एआई की जाँच करें')}
            </button>
            {health && <div className="settings-section-desc" role="status" style={{ marginTop: 'var(--space-3)' }}>{healthMessage()}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
