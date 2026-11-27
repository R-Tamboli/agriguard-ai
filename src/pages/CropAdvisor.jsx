import { useState } from 'react';
import { Sparkles, AlertTriangle } from '../components/icons';
import { getAIErrorMessage, getCropRecommendations } from '../services/ai';
import { regions, soilTypes, seasons, waterAvailability } from '../data/sdgData';
import { cropLabel } from '../data/cropLabels';
import { useLanguage } from '../i18n/LanguageContext';
import './CropAdvisor.css';

const fields = [
  { key: 'region', label: ['Region', 'इलाका'], prompt: ['Select region...', 'अपना इलाका चुनें…'], options: regions },
  { key: 'soilType', label: ['Soil Type', 'मिट्टी का प्रकार'], prompt: ['Select soil...', 'मिट्टी चुनें…'], options: soilTypes },
  { key: 'season', label: ['Season', 'मौसम'], prompt: ['Select season...', 'मौसम चुनें…'], options: seasons },
  { key: 'water', label: ['Water Availability', 'खेत में पानी की सुविधा'], prompt: ['Select water...', 'पानी की सुविधा चुनें…'], options: waterAvailability },
];

export default function CropAdvisor() {
  const { language, t } = useLanguage();
  const [form, setForm] = useState({
    region: '',
    soilType: '',
    season: '',
    water: '',
    budget: 'Medium',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState({});
  const result = results[language];

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setResults({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.region || !form.soilType || !form.season || !form.water) {
      setError('required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await getCropRecommendations(form, language);
      setResults((previous) => ({ ...previous, [language]: res }));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crop-advisor">
      <div className="container">
        <div className="page-header">
          <h1 className="section-title">
            🌱 {t('Smart ', '')}<span className="gradient-text">{t('Crop Advisor', 'फसल सलाहकार')}</span>
          </h1>
          <p className="section-subtitle">
            {t('Tell us about your farming conditions, and our AI will recommend the best crops for maximum yield and profitability.', 'अपने खेत की मिट्टी, मौसम और पानी के बारे में बताएं। अच्छी पैदावार और कमाई के लिए कौन सी फसलें बो सकते हैं, इसकी सलाह पाएँ।')}
          </p>
        </div>

        {!result && !loading && (
          <form className="ca-form-card glass-card-static" onSubmit={handleSubmit}>
            <div className="ca-form-grid">
              {fields.map(({ key, label, prompt, options }) => (
                <div className="form-group" key={key}>
                  <label className="form-label" htmlFor={key}>{t(...label)}</label>
                  <select id={key} className="select-field" value={form[key]} onChange={(event) => handleChange(key, event.target.value)}>
                    <option value="">{t(...prompt)}</option>
                    {options.map((option) => <option key={option} value={option}>{cropLabel(option, language)}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-8)' }}>
              <span className="form-label" id="budget-label">{t('Budget Level', 'खेती का बजट')}</span>
              <div role="group" aria-labelledby="budget-label" style={{ display: 'flex', gap: 'var(--space-3)' }}>
                {['Low', 'Medium', 'High'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    className={`btn ${form.budget === b ? 'btn-primary' : 'btn-secondary'}`}
                    aria-pressed={form.budget === b}
                    onClick={() => handleChange('budget', b)}
                    style={{ flex: 1 }}
                  >
                    {cropLabel(b, language)}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="ca-error" role="alert" style={{ marginBottom: 'var(--space-6)' }}>
                <AlertTriangle size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
                {error === 'required' ? t('Please fill in all fields.', 'कृपया सभी विकल्प चुनें।') : getAIErrorMessage(error, language)}
              </div>
            )}

            <div className="ca-form-actions">
              <button type="submit" className="btn btn-primary btn-lg">
                <Sparkles size={20} />
                {Object.keys(results).length
                  ? t('Get recommendations in English', 'हिन्दी में सलाह पाएँ')
                  : t('Get AI Recommendations', 'फसल की सलाह पाएँ')}
              </button>
            </div>
          </form>
        )}

        {loading && (
          <div className="ca-loading" role="status">
            <div className="spinner" style={{ width: 40, height: 40 }} />
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              {t('AI is analyzing your conditions and finding the best crops...', 'आपके खेत के हिसाब से फसलें चुनी जा रही हैं…')}
            </div>
          </div>
        )}

        {result && (
          <div className="ca-results animate-fade-in-up">
            <div className="ca-results-header">
              <div className="badge badge-green" style={{ marginBottom: 'var(--space-4)' }}>
                <Sparkles size={12} /> {t('AI Recommendations Ready', 'आपकी सलाह तैयार है')}
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)' }}>
                {t('Top Crop Picks for Your Farm', 'आपके खेत के लिए सुझाई गई फसलें')}
              </h2>
            </div>

            <div className="ca-results-grid">
              {result.recommendations?.map((crop, i) => (
                <div key={i} className="ca-crop-card glass-card">
                  <div className="ca-crop-rank">{i + 1}</div>
                  <div className="ca-crop-emoji">{crop.emoji || '🌿'}</div>
                  <div className="ca-crop-name">{crop.crop_name}</div>
                  <div className="ca-score-bar">
                    <div className="ca-score-fill" style={{ width: `${crop.suitability_score || 80}%` }} />
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent-green)', marginBottom: 'var(--space-3)', fontWeight: 600 }}>
                    {crop.suitability_score || 80}% {t('Match', 'अनुकूलता')}
                  </div>

                  <div className="ca-crop-details">
                    <div className="ca-crop-detail">
                      <span className="ca-crop-detail-label">{t('Expected Yield', 'अनुमानित पैदावार')}</span>
                      <span className="ca-crop-detail-value">{crop.expected_yield}</span>
                    </div>
                    <div className="ca-crop-detail">
                      <span className="ca-crop-detail-label">{t('Investment', 'खर्च')}</span>
                      <span className="ca-crop-detail-value">{cropLabel(crop.investment_level, language)}</span>
                    </div>
                    <div className="ca-crop-detail">
                      <span className="ca-crop-detail-label">{t('Water Needs', 'पानी की ज़रूरत')}</span>
                      <span className="ca-crop-detail-value">{cropLabel(crop.water_needs, language)}</span>
                    </div>
                    <div className="ca-crop-detail">
                      <span className="ca-crop-detail-label">{t('Duration', 'फसल तैयार होने का समय')}</span>
                      <span className="ca-crop-detail-value">{crop.growth_duration}</span>
                    </div>
                    <div className="ca-crop-detail">
                      <span className="ca-crop-detail-label">{t('Climate Resilience', 'बदलते मौसम को सहने की क्षमता')}</span>
                      <span className="ca-crop-detail-value">{cropLabel(crop.climate_resilience, language)}</span>
                    </div>
                  </div>

                  {crop.tips?.length > 0 && (
                    <div className="ca-crop-tips">
                      <div className="ca-crop-tips-title">{t('Pro Tips', 'खेती के सुझाव')}</div>
                      <ul className="ca-crop-tips-list">
                        {crop.tips.map((t, j) => <li key={j}>{t}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {result.general_advice && (
              <div className="ca-advice glass-card-static">
                <div className="ca-advice-title">💡 {t('General Advice', 'खेती की सलाह')}</div>
                <p className="ca-advice-text">{result.general_advice}</p>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
              <button className="btn btn-secondary" onClick={() => setResults({})}>
                {t('Get New Recommendations', 'फिर से सलाह लें')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
