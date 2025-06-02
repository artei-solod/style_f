import React, { useState } from 'react';

export default function ShoppingView() {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Hook into your shopping-agent backend to fetch/search products
    console.log('Search for:', query);
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Shopping Suggestions
      </h2>
      <p className="text-gray-600 mb-6">
        We’ve scored and filtered items so you don’t need to browse multiple sites.
      </p>

      {/* 1. Search Bar */}
      <form
        onSubmit={handleSearch}
        className="flex items-center mb-6"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for new items..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Search
        </button>
      </form>

      {/* 2. Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Example placeholder products */}
        <div className="bg-white-rounded-lg shadow p-4">
          <div className="h-40 bg-gray-200 rounded-md mb-3 flex items-center justify-center text-gray-400">
            Product #1
          </div>
          <h3 className="text-lg font-medium text-gray-800">Stylish Jacket</h3>
          <p className="text-gray-600">Score: 9.2</p>
          <button className="mt-3 text-indigo-600 hover:text-indigo-800">
            View Details
          </button>
        </div>

        <div className="bg-white-rounded-lg shadow p-4">
          <div className="h-40 bg-gray-200 rounded-md mb-3 flex items-center justify-center text-gray-400">
            Product #2
          </div>
          <h3 className="text-lg font-medium text-gray-800">Casual Sneakers</h3>
          <p className="text-gray-600">Score: 8.7</p>
          <button className="mt-3 text-indigo-600 hover:text-indigo-800">
            View Details
          </button>
        </div>

        <div className="bg-white-rounded-lg shadow p-4">
          <div className="h-40 bg-gray-200 rounded-md mb-3 flex items-center justify-center text-gray-400">
            Product #3
          </div>
          <h3 className="text-lg font-medium text-gray-800">Slim Fit Jeans</h3>
          <p className="text-gray-600">Score: 8.9</p>
          <button className="mt-3 text-indigo-600 hover:text-indigo-800">
            View Details
          </button>
        </div>

        {/* Later: map over fetched “recommended” items from your parsed brands data */}
      </div>
    </div>
);
}
