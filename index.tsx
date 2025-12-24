import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import Home from './Home';
import ToolPage from './ToolPage';
import About from './About';
import Contact from './Contact';
import Privacy from './Privacy';
import Terms from './Terms';
import { TOOLS_DATA } from './constants';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Generate redirects for tool categories
const categoryRedirects = TOOLS_DATA.map(category => (
  <Route 
    key={category.id}
    path={`/${category.id}`}
    element={<Navigate to={`/${category.id}/${category.subTools[0].id}`} replace />}
  />
));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          {categoryRedirects}
          <Route path=":categoryId/:toolId" element={<ToolPage />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);