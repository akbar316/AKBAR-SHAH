
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LegalPageContainer } from '../components/LegalPages';

export function LegalPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  return <LegalPageContainer pageId={slug || ''} onBack={() => navigate('/')} />;
}
