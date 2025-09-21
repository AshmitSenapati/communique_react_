//Main code flow
import { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

// Import your page components
import AboutPage from './AboutPage';
import TranslatorPage from './TranslatorPage';
// Import your new Navigation component
import Navigation from './components/Navigation';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/about') {
        navigate('/about');
    }
  }, []);

  return (
    <div>
      {/* The navigation bar is here, outside the Routes */}
      <Navigation />

      {/* The page content will be rendered below */}
      <Routes>
        <Route path="/" element={<Navigate to="/about" />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/translator" element={<TranslatorPage />} />
      </Routes>
    </div>
  );
}

export default App;