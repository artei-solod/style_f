import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BudgetSelectionPage() {
  const navigate = useNavigate();
  const [selectedBudget, setSelectedBudget] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const budgets = [
    { id: 'low', label: 'Low' },
    { id: 'medium', label: 'Medium' },
    { id: 'high', label: 'High' },
  ];

  const handleSelect = (id) => {
    setError('');
    setSelectedBudget(id);
  };

  const handleContinue = async () => {
    if (!selectedBudget) {
      setError('Please select a budget category.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      // Simulate network latency / API call
      await new Promise((res) => setTimeout(res, 500));

      // TODO: Replace with real API request, e.g.:
      // const resp = await fetch('/api/set-budget', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ budget: selectedBudget }),
      // });
      // if (!resp.ok) {
      //   const data = await resp.json();
      //   throw new Error(data.message || 'Failed to set budget');
      // }

      // On success, navigate to the main app (Wardrobe as default)
      navigate('/app/wardrobe');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <h2 className="text-center text-2xl font-bold text-gray-800">
          Select Your Budget Category
        </h2>
        <p className="text-center text-gray-600">
          Choosing a budget helps us tailor clothing recommendations for you.
        </p>

        {/* Budget Options */}
        <div className="grid grid-cols-1 gap-4">
          {budgets.map((b) => (
            <button
              key={b.id}
              onClick={() => handleSelect(b.id)}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition
                ${
                  selectedBudget === b.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }
              `}
            >
              <span
                className={`text-lg font-medium ${
                  selectedBudget === b.id
                    ? 'text-indigo-600'
                    : 'text-gray-700'
                }`}
              >
                {b.label}
              </span>
            </button>
          ))}
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedBudget || isSubmitting}
            className={`w-full max-w-xs flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
              !selectedBudget || isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
            } focus:outline-none focus:ring-2`}
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
);
}
