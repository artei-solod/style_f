import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UploadPhotoPage() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Handler for when the user chooses a file
  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    // Optional: check file type/size here (e.g., only images, limit size)
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    // Create a preview URL for display
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    setSelectedFile(file);
  };

  const handleNext = async () => {
    if (!selectedFile) return;

    setError('');
    setIsUploading(true);

    try {
      // Create FormData to send the image
      const formData = new FormData();
      formData.append('photo', selectedFile);

      // TODO: Replace URL with your actual endpoint, e.g. '/api/upload-photo'
      // For now, we simulate a network request.
      await new Promise((res) => setTimeout(res, 800));

      // If you were hitting a real endpoint, it might look like:
      // const resp = await fetch('/api/upload-photo', {
      //   method: 'POST',
      //   body: formData,
      // });
      // if (!resp.ok) {
      //   const data = await resp.json();
      //   throw new Error(data.message || 'Upload failed');
      // }

      // On success:
      navigate('/select-budget');
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full space-y-6">
        <h2 className="text-center text-2xl font-bold text-gray-800">
          Upload Your Photo
        </h2>
        <p className="text-center text-gray-600">
          We’ll analyze your body shape to give personalized styling advice.
        </p>

        {/* File Input Card */}
        <div className="flex flex-col items-center">
          <label
            htmlFor="photo-upload"
            className="cursor-pointer bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center hover:border-gray-400 transition"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-48 h-48 object-cover rounded-md"
              />
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v4a1 1 0 001 1h3m10-6v4a1 1 0 01-1 1h-3m-6 6h6m-6 0v4m6-4v4m-6 0h6"
                  />
                </svg>
                <span className="text-gray-600">
                  {selectedFile
                    ? 'Change Photo'
                    : 'Click to select a photo'}
                </span>
              </>
            )}
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {error && (
            <p className="mt-2 text-red-500 text-sm">{error}</p>
          )}
        </div>

        {/* Next Button */}
        <div className="flex justify-center">
          <button
            onClick={handleNext}
            disabled={!selectedFile || isUploading}
            className={`w-full max-w-xs flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
              !selectedFile || isUploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
            } focus:outline-none focus:ring-2`}
          >
            {isUploading ? 'Uploading...' : 'Next'}
          </button>
        </div>
      </div>
    </div>
);
}
