
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SeoData } from '../types';

interface SeoProps {
  data: SeoData;
  slug: string;
}

export function Seo({ data, slug }: SeoProps) {
  const canonicalUrl = `https://dicetools.com/tools/${slug}`;

  return (
    <Helmet>
      <title>{data.title}</title>
      <meta name="description" content={data.description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={data.title} />
      <meta property="og:description" content={data.description} />
      {/* <meta property="og:image" content={`https://dicetools.com/og/${slug}.png`} /> */}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={data.title} />
      <meta property="twitter:description" content={data.description} />
      {/* <meta property="twitter:image" content={`https://dicetools.com/og/${slug}.png`} /> */}

      {/* Schema.org */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": data.h1,
          "applicationCategory": "Utilities",
          "operatingSystem": "Any",
          "description": data.description,
          "url": canonicalUrl,
          "potentialAction": {
            "@type": "ViewAction",
            "target": canonicalUrl
          }
        })}
      </script>
    </Helmet>
  );
}
