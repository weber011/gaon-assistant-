"use client";

import { useEffect, useState } from "react";
import { User, MapPin, Leaf, Maximize, Languages, Store, Edit2 } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetch("https://backend-jet-five-39.vercel.app/api/profile")
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(console.error);
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1E4D2B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-sans p-4 sm:p-6 pb-24">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#1E4D2B]">👨‍🌾 मेरा प्रोफाइल</h1>
        <button className="text-[#2E5E3D] hover:bg-green-50 p-2 rounded-full">
          <Edit2 className="w-5 h-5" />
        </button>
      </header>

      {/* Profile Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E5E0D5] mb-6 flex items-center gap-6 animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl shadow-inner border-2 border-white">
          🧔🏽
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-800">{profile.name}</h2>
          <p className="text-gray-500 font-medium flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4" /> {profile.village}, {profile.state}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 animate-slide-up">
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E5E0D5] flex flex-col gap-2">
          <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-bold mb-0.5">मुख्य फसल</div>
            <div className="font-black text-gray-800 text-lg">{profile.main_crop}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E5E0D5] flex flex-col gap-2">
          <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
            <Maximize className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-bold mb-0.5">खेत का आकार</div>
            <div className="font-black text-gray-800 text-lg">{profile.land_area}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E5E0D5] flex flex-col gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-bold mb-0.5">भाषा</div>
            <div className="font-black text-gray-800 text-lg">{profile.language}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E5E0D5] flex flex-col gap-2">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-bold mb-0.5">पसंदीदा मंडी</div>
            <div className="font-black text-gray-800 text-lg">{profile.preferred_mandi}</div>
          </div>
        </div>

      </div>

    </main>
  );
}
