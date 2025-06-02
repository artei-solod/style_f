import React from 'react';

export default function OutfitsView() {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Generated Outfits
      </h2>
      <p className="text-gray-600 mb-6">
        AI-powered combinations from your existing wardrobe.
      </p>

      {/* TODO: Replace with real outfit grid/list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Example placeholder cards */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <div className="h-32 w-32 bg-gray-200 rounded-md mb-3 flex items-center justify-center text-gray-400">
            Outfit #1
          </div>
          <p className="text-gray-600">Shirt + Jeans + Sneakers</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <div className="h-32 w-32 bg-gray-200 rounded-md mb-3 flex items-center justify-center text-gray-400">
            Outfit #2
          </div>
          <p className="text-gray-600">Jacket + Trousers + Boots</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <div className="h-32 w-32 bg-gray-200 rounded-md mb-3 flex items-center justify-center text-gray-400">
            Outfit #3
          </div>
          <p className="text-gray-600">Dress + Heels</p>
        </div>

        {/* Later: map through an array of AI-generated outfit objects */}
      </div>
    </div>
);
}
