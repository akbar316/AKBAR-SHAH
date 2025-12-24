import React, { useState, useEffect } from 'react';
import { TOOLS_DATA } from '../constants';
import { Search as SearchIcon } from 'lucide-react';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.length > 1) {
      const lowerCaseQuery = query.toLowerCase();
      const allTools = [];
      TOOLS_DATA.forEach(category => {
        category.subTools.forEach(tool => {
          if (tool.name.toLowerCase().includes(lowerCaseQuery) || category.title.toLowerCase().includes(lowerCaseQuery)) {
            allTools.push({ ...tool, category: category.title, categoryId: category.id });
          }
        });
      });
      setResults(allTools);
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Search for tools..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>
      {results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
          <ul>
            {results.map((tool) => (
              <li key={tool.id}>
                <a href={`/${tool.categoryId}/${tool.id}`} className="block px-4 py-2 text-white hover:bg-gray-700">
                  {tool.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Search;
