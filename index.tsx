
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
<<<<<<< HEAD
import { HelmetProvider } from 'react-helmet-async';
import { MainLayout } from './components/layout/MainLayout';
import { HomePage } from './pages/HomePage';
import { ToolPage } from './pages/ToolPage';
import { LegalPage } from './pages/LegalPage';
import { NotFoundPage } from './pages/NotFoundPage';
=======
import App from './App';
import Home from './Home';
import ToolPage from './ToolPage';
import About from './About';
import Contact from './Contact';
import Privacy from './Privacy';
import Terms from './Terms';
>>>>>>> 8a1029c55dc41207e98752cf481ab70467c117cf

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
<<<<<<< HEAD
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="tools/:slug" element={<ToolPage />} />
            <Route path="/:slug" element={<LegalPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
=======
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path=":categoryId/:toolId" element={<ToolPage />} />
          <Route path=":categoryId" element={<ToolPage />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
        </Route>
      </Routes>
    </BrowserRouter>
>>>>>>> 8a1029c55dc41207e98752cf481ab70467c117cf
  </React.StrictMode>
);
