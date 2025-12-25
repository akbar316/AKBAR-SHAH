
import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-gray-500 mb-8">The page you are looking for does not exist.</p>
      <Link to="/" className="px-6 py-2 rounded-full border border-gray-700 text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-all">
        Go Home
      </Link>
    </div>
  );
}
