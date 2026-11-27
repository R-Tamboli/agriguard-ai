import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import { useLanguage } from './i18n/LanguageContext';

const CropDoctor = lazy(() => import('./pages/CropDoctor'));
const CropAdvisor = lazy(() => import('./pages/CropAdvisor'));
const FarmChat = lazy(() => import('./pages/FarmChat'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  const { t } = useLanguage();
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Suspense fallback={<div className="page container" role="status">{t('Loading page…', 'पेज खुल रहा है…')}</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/crop-doctor" element={<CropDoctor />} />
            <Route path="/crop-advisor" element={<CropAdvisor />} />
            <Route path="/farm-chat" element={<FarmChat />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
