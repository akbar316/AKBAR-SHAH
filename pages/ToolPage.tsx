
import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { TOOLS_DATA, SEO_DATA } from '../constants';
import { ActiveTool } from '../components/ActiveTool';
import { Seo } from '../components/Seo';
import { NotFoundPage } from './NotFoundPage';

export function ToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect old query URLs to the new clean URLs
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const toolParam = params.get('tool');
    if (toolParam) {
      navigate(`/tools/${toolParam}`, { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  if (!slug) {
    return <NotFoundPage />;
  }

  const activeData = (() => {
    for (const cat of TOOLS_DATA) {
      const sub = cat.subTools.find(t => t.id === slug);
      if (sub) return { category: cat, subTool: sub };
    }
    return null;
  })();

  const seoData = SEO_DATA[slug];

  if (!activeData || !seoData) {
    return <NotFoundPage />;
  }

  return (
    <>
      <Seo data={seoData} slug={slug} />
      <ActiveTool
        toolId={slug}
        toolData={activeData.subTool}
        category={activeData.category}
        onBack={() => navigate('/')}
        onSelectTool={(id) => navigate(`/tools/${id}`)}
      />
    </>
  );
}
