import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { getSdgGoals, getImpactStats, getCropDiseases } from '../data/sdgData';
import { useLanguage } from '../i18n/LanguageContext';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#94a3b8',
        font: { family: 'Inter', size: 12 },
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: '#1a2332',
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
    },
  },
};

// Doughnut: how AgriGuard AI's features map to each SDG (project relevance %)
const getSdgDoughnutData = (sdgGoals, t) => ({
  labels: sdgGoals.map((s) => `${t('SDG', 'लक्ष्य')} ${s.id}: ${s.name}`),
  datasets: [
    {
      data: [25, 35, 22, 18],
      backgroundColor: sdgGoals.map((s) => s.color + 'cc'),
      borderColor: sdgGoals.map((s) => s.color),
      borderWidth: 2,
      hoverOffset: 8,
    },
  ],
});

// Bar: estimated global annual crop loss (millions of tons) per disease type — FAO data
const getDiseaseBarData = (cropDiseases, t) => ({
  labels: cropDiseases.map((d) => d.name),
  datasets: [
    {
      label: t('Est. Global Crop Loss (M tons/yr)', 'फसल का अनुमानित सालाना नुकसान (दस लाख टन)'),
      data: [85, 60, 95, 55, 120, 35],
      backgroundColor: [
        'rgba(234, 179, 8, 0.6)',
        'rgba(59, 130, 246, 0.6)',
        'rgba(239, 68, 68, 0.6)',
        'rgba(168, 85, 247, 0.6)',
        'rgba(249, 115, 22, 0.6)',
        'rgba(34, 197, 94, 0.6)',
      ],
      borderColor: [
        'rgba(234, 179, 8, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(168, 85, 247, 1)',
        'rgba(249, 115, 22, 1)',
        'rgba(34, 197, 94, 1)',
      ],
      borderWidth: 1,
      borderRadius: 6,
    },
  ],
});

function getSeverityBadgeClass(severity) {
  const s = severity.toLowerCase();
  if (s === 'critical') return 'badge badge-red';
  if (s === 'high') return 'badge badge-amber';
  return 'badge badge-green';
}

// Real UN SDG global progress scores (approx. from UN SDG Report 2024)
const sdgProgress = [38, 29, 18, 22];

export default function Dashboard() {
  const { t, language } = useLanguage();
  const sdgGoals = getSdgGoals(t);
  const impactStats = getImpactStats(t);
  const cropDiseases = getCropDiseases(t);
  const sdgChartTitle = t('Project SDG Relevance', 'विकास लक्ष्यों में एग्रीगार्ड का योगदान');
  const diseaseChartTitle = t('Global Crop Losses by Disease (M tons/yr)', 'रोगों से फसल का सालाना नुकसान (दस लाख टन)');
  return (
    <div className="dashboard">
      <div className="container">
        <div className="page-header">
          <h1 className="section-title">
            📊 {t('Global Crisis', 'दुनिया में खेती और भोजन के')}{' '}
            <span className="gradient-text">{t('Dashboard', 'आँकड़े')}</span>
          </h1>
          <p className="section-subtitle">
            {t('Real data on the global food security crisis — the problem AgriGuard AI is designed to solve. Sources: UN FAO, World Bank.', 'दुनिया में भोजन की कमी और फसल के नुकसान से जुड़े आँकड़े। ये आँकड़े संयुक्त राष्ट्र के खाद्य एवं कृषि संगठन और विश्व बैंक से लिए गए हैं।')}
          </p>
        </div>

        {/* Stats */}
        <div className="dash-stats-grid">
          {impactStats.map((stat) => (
            <div key={stat.label} className="dash-stat-card glass-card">
              <div className="dash-stat-icon">{stat.icon}</div>
              <div className="dash-stat-value">
                {stat.value.toLocaleString(language)}{stat.suffix}
              </div>
              <div className="dash-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="dash-charts">
          <div className="dash-chart-card glass-card-static">
            <div className="dash-chart-title">🎯 {sdgChartTitle}</div>
            <div className="dash-chart-container">
              <Doughnut
                aria-label={sdgChartTitle}
                data={getSdgDoughnutData(sdgGoals, t)}
                options={{
                  ...chartOptions,
                  locale: language,
                  cutout: '60%',
                  plugins: {
                    ...chartOptions.plugins,
                    legend: { ...chartOptions.plugins.legend, position: 'bottom' },
                  },
                }}
              />
            </div>
          </div>

          <div className="dash-chart-card glass-card-static">
            <div className="dash-chart-title">🦠 {diseaseChartTitle}</div>
            <div className="dash-chart-container">
              <Bar
                aria-label={diseaseChartTitle}
                data={getDiseaseBarData(cropDiseases, t)}
                options={{
                  ...chartOptions,
                  locale: language,
                  plugins: { ...chartOptions.plugins, legend: { display: false } },
                  scales: {
                    x: {
                      ticks: { color: '#64748b', font: { size: 11 } },
                      grid: { color: 'rgba(255,255,255,0.03)' },
                    },
                    y: {
                      ticks: { color: '#64748b' },
                      grid: { color: 'rgba(255,255,255,0.03)' },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* SDG Progress */}
        <div className="dash-sdg-section">
          <h2 className="section-title" style={{ textAlign: 'center', fontSize: 'var(--text-2xl)' }}>
            {t('UN SDG', 'संयुक्त राष्ट्र के विकास लक्ष्य')}{' '}
            <span className="gradient-text">{t('Global Progress (2026)', 'दुनिया की प्रगति (2026)')}</span>
          </h2>
          <div className="dash-sdg-grid">
            {sdgGoals.map((sdg, i) => (
              <div key={sdg.id} className="dash-sdg-card glass-card">
                <div className="dash-sdg-icon" style={{ background: sdg.color + '22' }}>
                  {sdg.icon}
                </div>
                <div className="dash-sdg-content">
                  <div className="dash-sdg-name">{sdg.name}</div>
                  <div className="dash-sdg-target">{t('Target', 'उपलक्ष्य')} {sdg.target}: {sdg.targetText}</div>
                  <div className="dash-sdg-progress">
                    <div
                      className="dash-sdg-progress-fill"
                      style={{ width: `${sdgProgress[i]}%`, background: sdg.color }}
                    />
                  </div>
                  <div className="dash-sdg-progress-label">
                    {sdgProgress[i]}% {t('global progress', 'लक्ष्य की ओर प्रगति')} — {sdg.stats.value} {sdg.stats.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disease Table */}
        <div className="dash-disease-section">
          <h2 className="section-title" style={{ textAlign: 'center', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-8)' }}>
            🔬 {t('Common Crop', 'फसलों के आम रोग')}{' '}
            <span className="gradient-text">{t('Diseases We Detect', 'जिनकी पहचान होती है')}</span>
          </h2>
          <div className="dash-table-card glass-card-static">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t('Disease', 'रोग')}</th>
                  <th>{t('Crop', 'फसल')}</th>
                  <th>{t('Severity', 'गंभीरता')}</th>
                  <th>{t('AI Detection', 'एआई से पहचान')}</th>
                </tr>
              </thead>
              <tbody>
                {cropDiseases.map((d, i) => (
                  <tr key={i}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {d.icon} {d.name}
                    </td>
                    <td>{d.crop}</td>
                    <td>
                      <span className={getSeverityBadgeClass(d.severity)}>
                        {d.severityLabel}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-green">{t('Supported', 'उपलब्ध')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
