"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mic, CloudSun, IndianRupee, Bell, Camera, Landmark, ChevronRight } from "lucide-react";

export default function HomePage() {
  const [profile, setProfile] = useState<any>(null);
  const [reminders, setReminders] = useState<any[]>([]);

  useEffect(() => {
    // Fetch profile and reminders
    fetch("https://backend-jet-five-39.vercel.app/api/profile")
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(console.error);
      
    fetch("https://backend-jet-five-39.vercel.app/api/reminders")
      .then(res => res.json())
      .then(data => setReminders(data.reminders || []))
      .catch(console.error);
  }, []);

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-sans p-4 sm:p-6 pb-24">
      {/* Header */}
      <header className="mb-6 animate-fade-in">
        <h1 className="text-xl font-black text-[#1E4D2B] mb-1">🌾 GAON ASSISTANT</h1>
        <h2 className="text-2xl font-bold text-gray-800">
          नमस्ते {profile?.name ? `${profile.name.split(' ')[0]} जी 🙏` : "किसान भाई 🙏"}
        </h2>
        <p className="text-[#2E5E3D] font-medium opacity-80 mt-1">
          आज आपकी खेती में मैं कैसे मदद करूँ?
        </p>
      </header>

      {/* Voice Assistant CTA */}
      <div className="bg-gradient-to-br from-[#1E4D2B] to-[#2E5E3D] rounded-3xl p-6 text-white shadow-md mb-8 relative overflow-hidden animate-slide-up">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1">अपना सवाल पूछें</h3>
            <p className="text-sm text-green-100 opacity-90 max-w-[200px]">मौसम, मंडी भाव या फसल की जानकारी के लिए माइक दबाएं</p>
          </div>
          <Link href="/chat?mic=1" className="w-16 h-16 bg-white text-[#1E4D2B] rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform animate-pulse-slow">
            <Mic className="w-8 h-8" />
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <section className="mb-8 animate-slide-up delay-100">
        <h3 className="text-lg font-bold text-[#1E4D2B] mb-4 flex items-center gap-2">
          ⚡ आज आपके लिए
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Link href="/chat?context=weather" className="bg-white p-4 rounded-2xl shadow-sm border border-[#E5E0D5] flex flex-col gap-2 hover:border-[#1E4D2B] transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-gray-800">मौसम</div>
              <div className="text-xs text-gray-500">{profile?.village ? `${profile.village} का मौसम` : "चेक करें"}</div>
            </div>
          </Link>
          
          <Link href="/chat?context=mandi" className="bg-white p-4 rounded-2xl shadow-sm border border-[#E5E0D5] flex flex-col gap-2 hover:border-[#1E4D2B] transition-colors">
            <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-gray-800">मंडी भाव</div>
              <div className="text-xs text-gray-500">{profile?.preferred_mandi ? `${profile.preferred_mandi} मंडी` : "भाव जानें"}</div>
            </div>
          </Link>
        </div>
      </section>

      {/* Reminders Preview */}
      {reminders.length > 0 && (
        <section className="mb-8 animate-slide-up delay-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[#1E4D2B] flex items-center gap-2">
              <Bell className="w-5 h-5" /> रिमाइंडर
            </h3>
            <Link href="/reminders" className="text-sm font-bold text-[#2E5E3D] hover:underline">सभी देखें</Link>
          </div>
          <div className="space-y-3">
            {reminders.slice(0, 2).map((r, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-[#E5E0D5] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${r.status === 'upcoming' ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                  <div>
                    <div className="font-bold text-gray-800">{r.task}</div>
                    <div className="text-xs text-gray-500">{r.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features List */}
      <section className="space-y-4 animate-slide-up delay-300">
        <Link href="/scanner" className="block bg-white p-5 rounded-3xl shadow-sm border border-[#E5E0D5] hover:border-[#1E4D2B] transition-colors group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg">फसल की जांच</h3>
              <p className="text-sm text-gray-500 leading-snug">फोटो से अपनी फसल की संभावित समस्या देखें</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>
        
        <Link href="/chat?context=schemes" className="block bg-white p-5 rounded-3xl shadow-sm border border-[#E5E0D5] hover:border-[#1E4D2B] transition-colors group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Landmark className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg">किसान योजनाएँ</h3>
              <p className="text-sm text-gray-500 leading-snug">आपके लिए उपलब्ध सरकारी योजनाएं</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>
      </section>
      
      {/* Trust Section */}
      <section className="mb-8 mt-6 bg-green-50/50 p-5 rounded-3xl border border-green-100 animate-slide-up delay-300">
        <h3 className="text-lg font-bold text-[#1E4D2B] mb-4 text-center">Gaon Assistant आपकी मदद करता है</h3>
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-[#2E5E3D] font-medium">
          <div className="flex items-center gap-2"><span className="text-green-600">✓</span> सरल भाषा</div>
          <div className="flex items-center gap-2"><span className="text-green-600">✓</span> आवाज़ से बातचीत</div>
          <div className="flex items-center gap-2"><span className="text-green-600">✓</span> खेती की जानकारी</div>
          <div className="flex items-center gap-2"><span className="text-green-600">✓</span> मौसम और मंडी</div>
          <div className="flex items-center gap-2"><span className="text-green-600">✓</span> फसल की फोटो जांच</div>
          <div className="flex items-center gap-2"><span className="text-green-600">✓</span> किसान योजनाएँ</div>
          <div className="flex items-center gap-2 col-span-2 justify-center"><span className="text-green-600">✓</span> स्मार्ट रिमाइंडर</div>
        </div>
      </section>
      
      {/* Dynamic Demo Label */}
      <div className="mt-4 mb-6 text-center">
        <span className="inline-block bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          Demo Data Mode
        </span>
      </div>

    </main>
  );
}
