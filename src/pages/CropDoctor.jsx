import { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Trash2, Zap, Bug, Shield, Leaf, AlertTriangle } from '../components/icons';
import { analyzePlantDisease, classifyPlantImage, getAIErrorMessage } from '../services/ai';
import { cropLabel } from '../data/cropLabels';
import { useLanguage } from '../i18n/LanguageContext';
import './CropDoctor.css';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function getSeverityBadge(severity) {
  const s = (severity || '').toLowerCase();
  if (s === 'critical') return 'badge badge-red';
  if (s === 'high') return 'badge badge-amber';
  if (s === 'medium') return 'badge badge-blue';
  return 'badge badge-green';
}

const fileErrors = {
  'file-type': ['Please choose an image of your plant.', 'कृपया अपने पौधे की फ़ोटो चुनें।'],
  'file-read': ['Could not open this image. Please choose it again.', 'फ़ोटो खुल नहीं पाई। कृपया फिर से चुनें।'],
};

export default function CropDoctor() {
  const { language, t } = useLanguage();
  const [imageBase64, setImageBase64] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState({});
  const result = results[language];
  const [dragging, setDragging] = useState(false);
  const [dataset, setDataset] = useState(null);
  const fileRef = useRef();
  const requestId = useRef(0);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/dataset`).then((response) => response.ok ? response.json() : null)
      .then((data) => setDataset(data)).catch(() => setDataset(null));
  }, []);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('file-type');
      return;
    }
    const id = ++requestId.current;
    setResults({});
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      if (id !== requestId.current) return;
      setImageBase64(e.target.result);
    };
    reader.onerror = () => { if (id === requestId.current) setError('file-read'); };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleAnalyze = async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError('');
    try {
      const labels = dataset?.categories.map((item) => `${item.plant}: ${item.disease}`) || [];
      const classification = await classifyPlantImage(imageBase64, language);
      if (id !== requestId.current) return;
      const res = await analyzePlantDisease(imageBase64, description, labels, classification.prediction, language);
      if (id === requestId.current) {
        setResults((previous) => ({ ...previous, [language]: { ...res, classifier: classification } }));
      }
    } catch (err) {
      if (id === requestId.current) setError(err);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  };

  const handleClear = () => {
    requestId.current++;
    setLoading(false);
    setImageBase64('');
    setDescription('');
    setResults({});
    setError('');
  };

  return (
    <div className="crop-doctor">
      <div className="container">
        <div className="page-header">
          <h1 className="section-title">
            🩺 {t('AI', 'एआई')} <span className="gradient-text">{t('Crop Doctor', 'फसल डॉक्टर')}</span>
          </h1>
          <p className="section-subtitle">
            {t("Upload a leaf photo for an AI assessment grounded in PlantVillage's labeled crop disease categories.", 'पत्ती की साफ़ फ़ोटो भेजें। फसल डॉक्टर प्लांटविलेज की तस्वीरों से सीखी जानकारी के आधार पर रोग पहचानने में मदद करेगा।')}
          </p>
        </div>

        <div className="cd-dataset-note glass-card-static">
          <div className="cd-dataset-mark" aria-hidden="true">PV</div>
          <div className="cd-dataset-copy">
            <strong>{dataset
              ? t(`${dataset.totalImages.toLocaleString('en-US')} PlantVillage images`, `प्लांटविलेज की ${dataset.totalImages.toLocaleString('hi-IN')} तस्वीरें`)
              : t('PlantVillage dataset', 'प्लांटविलेज का फ़ोटो संग्रह')}</strong>
            <span>{dataset
              ? t(`${dataset.categories.length} labeled crop and disease categories · color leaf images`, `फसल और रोग की ${dataset.categories.length} श्रेणियाँ · पत्तियों की रंगीन तस्वीरें`)
              : t('Connecting to the local labeled leaf dataset…', 'पत्तियों का फ़ोटो संग्रह खोला जा रहा है…')}</span>
          </div>
          <span className={`cd-dataset-status${dataset ? '' : ' is-loading'}`}><span /> {dataset ? t('Dataset linked', 'संग्रह जुड़ गया है') : t('Connecting', 'जुड़ रहा है')}</span>
        </div>

        {!imageBase64 ? (
          <div className="cd-upload-area">
            <button
              type="button"
              className={`cd-dropzone${dragging ? ' dragging' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <span className="cd-dropzone-icon">
                <Upload size={32} />
              </span>
              <span className="cd-dropzone-title">{t('Drop your plant image here', 'पत्ती की फ़ोटो चुनें')}</span>
              <span className="cd-dropzone-sub">{t('or click to browse • JPG, PNG up to 10MB', 'फ़ोन या कंप्यूटर से फ़ोटो चुनें • JPG, PNG, 10 MB तक')}</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <>
            <div className="cd-preview">
              <img src={imageBase64} alt={t('Uploaded plant', 'आपके पौधे की फ़ोटो')} />
              <div className="cd-preview-overlay">
                <span style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.8)' }}>
                  <Camera size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {t('Plant image uploaded', 'पौधे की फ़ोटो जुड़ गई है')}
                </span>
                <button className="btn btn-secondary" onClick={handleClear} style={{ padding: '0.4rem 1rem', fontSize: 'var(--text-xs)' }}>
                  <Trash2 size={14} /> {t('Remove', 'हटाएँ')}
                </button>
              </div>
            </div>

            <div className="cd-desc-input">
              <textarea
                className="input-field"
                aria-label={t('Describe what you see (optional)', 'लक्षण लिखें (वैकल्पिक)')}
                placeholder={t("(Optional) Describe what you see — e.g., 'Yellow spots on tomato leaves, curling edges'...", 'चाहें तो लक्षण लिखें, जैसे “टमाटर की पत्तियों पर पीले धब्बे हैं और किनारे मुड़ रहे हैं।”')}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setResults({});
                }}
                disabled={loading}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            {!result && !loading && (
              <div className="cd-analyze-btn">
                <button className="btn btn-primary btn-lg" onClick={handleAnalyze}>
                  <Zap size={20} />
                  {Object.keys(results).length
                    ? t('Get assessment in English', 'हिन्दी में जाँच का नतीजा पाएँ')
                    : t('Analyze with AI', 'फ़ोटो की जाँच करें')}
                </button>
              </div>
            )}
          </>
        )}

        {loading && (
          <div className="cd-loading" role="status">
            <div className="spinner" style={{ width: 40, height: 40 }} />
            <div className="cd-loading-text">
              {t('AI is analyzing your plant image...', 'आपकी पत्ती की फ़ोटो की जाँच हो रही है…')}<br />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{t('This may take a few seconds', 'इसमें कुछ समय लग सकता है।')}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="cd-error" role="alert">
            <AlertTriangle size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
            {typeof error === 'string' ? t(...fileErrors[error]) : getAIErrorMessage(error, language)}
          </div>
        )}

        {result && (
          <div className="cd-results animate-fade-in-up">
            <div className="cd-result-header glass-card-static">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                  {t('Diagnosis Result', 'जाँच का नतीजा')}
                </div>
                <div className="cd-disease-name gradient-text">{cropLabel(result.disease_name, language)}</div>
              </div>
              <div className="cd-badges">
                <span className={getSeverityBadge(result.severity)}>
                  {t(`${result.severity} Severity`, `गंभीरता: ${cropLabel(result.severity, language)}`)}
                </span>
                <span className="badge badge-blue">
                  {t(`${result.confidence} Confidence`, `पहचान पर भरोसा: ${cropLabel(result.confidence, language)}`)}
                </span>
                <span className="badge badge-blue">{t('PlantVillage label reference', 'प्लांटविलेज की रोग सूची')}</span>
              </div>
            </div>
            <p className="cd-dataset-disclaimer">
              {t('PlantVillage model:', 'प्लांटविलेज की पहचान:')} {cropLabel(result.classifier?.prediction?.plant, language)} · {cropLabel(result.classifier?.prediction?.disease, language)} · {Math.round((result.classifier?.prediction?.confidence || 0) * 100)}% {t('model score', 'मॉडल का स्कोर')}
              {result.classifier?.validationAccuracy != null && ` · ${(result.classifier.validationAccuracy * 100).toFixed(1)}% ${t('validation accuracy', 'जाँच की अलग तस्वीरों पर सही पहचान')}`}
              {t('. Confidence is not calibrated; image quality and field conditions can affect results.', '। यह स्कोर एक अनुमान है। फ़ोटो की सफ़ाई और खेत की स्थिति से नतीजा बदल सकता है।')}
            </p>

            <div className="cd-detail-grid">
              {result.symptoms?.length > 0 && (
                <div className="cd-detail-card glass-card-static">
                  <div className="cd-detail-title"><Bug size={18} style={{ color: 'var(--color-accent-amber)' }} /> {t('Symptoms', 'लक्षण')}</div>
                  <ul className="cd-detail-list">
                    {result.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {result.causes?.length > 0 && (
                <div className="cd-detail-card glass-card-static">
                  <div className="cd-detail-title"><AlertTriangle size={18} style={{ color: 'var(--color-accent-red)' }} /> {t('Causes', 'कारण')}</div>
                  <ul className="cd-detail-list">
                    {result.causes.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}

              {result.treatment?.immediate?.length > 0 && (
                <div className="cd-detail-card glass-card-static">
                  <div className="cd-detail-title"><Zap size={18} style={{ color: 'var(--color-accent-green)' }} /> {t('Immediate Actions', 'अभी क्या करें')}</div>
                  <ul className="cd-detail-list">
                    {result.treatment.immediate.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              )}

              {result.treatment?.organic?.length > 0 && (
                <div className="cd-detail-card glass-card-static">
                  <div className="cd-detail-title"><Leaf size={18} style={{ color: 'var(--color-accent-emerald)' }} /> {t('Organic Treatments', 'जैविक उपचार')}</div>
                  <ul className="cd-detail-list">
                    {result.treatment.organic.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              )}

              {result.treatment?.chemical?.length > 0 && (
                <div className="cd-detail-card glass-card-static">
                  <div className="cd-detail-title"><Shield size={18} style={{ color: 'var(--color-accent-blue)' }} /> {t('Chemical Treatments', 'दवा से उपचार')}</div>
                  <ul className="cd-detail-list">
                    {result.treatment.chemical.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              )}

              {result.prevention?.length > 0 && (
                <div className="cd-detail-card glass-card-static">
                  <div className="cd-detail-title"><Shield size={18} style={{ color: 'var(--color-accent-teal)' }} /> {t('Prevention Tips', 'बचाव के उपाय')}</div>
                  <ul className="cd-detail-list">
                    {result.prevention.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {result.additional_notes && (
              <div className="glass-card-static" style={{ padding: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
                <div className="cd-detail-title" style={{ marginBottom: 'var(--space-3)' }}>📝 {t('Additional Notes', 'अन्य जानकारी')}</div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
                  {result.additional_notes}
                </p>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
              <button className="btn btn-secondary" onClick={handleClear}>
                {t('Analyze Another Plant', 'दूसरे पौधे की जाँच करें')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
