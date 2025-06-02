import React from 'react';
import { useNavigate } from 'react-router-dom';
import outfit1 from '../assets/outfit1.jpg';
import outfit2 from '../assets/outfit2.jpg';
import outfit3 from '../assets/outfit3.jpg';

export default function GreetingPage() {
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Images: a simple 3-image grid / mosaic */}
      <div className="absolute inset-0 grid grid-cols-3 gap-0">
        <img
          src={outfit1}
          alt="Outfit 1"
          className="object-cover w-full h-full"
        />
        <img
          src={outfit2}
          alt="Outfit 2"
          className="object-cover w-full h-full"
        />
        <img
          src={outfit3}
          alt="Outfit 3"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Dark overlay to increase contrast for button/text */}
      <div className="absolute inset-0 bg-black opacity-50" />

      {/* Centered Sign Up Button */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <h1 className="text-white text-4xl font-bold mb-6">
          Welcome to AI Stylist
        </h1>
        <button
          onClick={handleSignUpClick}
          className="bg-white text-black font-medium py-3 px-8 rounded-md shadow-lg hover:bg-gray-100 transition"
        >
          Sign Up
        </button>
      </div>
    </div>
);
}
