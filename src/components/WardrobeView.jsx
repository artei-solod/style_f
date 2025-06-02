import React from 'react';

export default function WardrobeView() {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Your Wardrobe
      </h2>
      <p className="text-gray-600 mb-6">
        Here is a digital copy of your wardrobe, organized by category.
      </p>

      {/* TODO: Replace with real wardrobe grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Example placeholder cards: */}
        <div className="h-40 bg-white rounded-lg shadow flex items-center justify-center text-gray-400">
          Upper Body (e.g., Shirts)
        </div>
        <div className="h-40 bg-white rounded-lg shadow flex items-center justify-center text-gray-400">
          Lower Body (e.g., Pants)
        </div>
        <div className="h-40 bg-white rounded-lg shadow flex items-center justify-center text-gray-400">
          Shoes
        </div>
        <div className="h-40 bg-white rounded-lg shadow flex items-center justify-center text-gray-400">
          Accessories
        </div>
        {/* Later: map over user’s items and render each as a thumbnail card */}
      </div>
    </div>
);
}
