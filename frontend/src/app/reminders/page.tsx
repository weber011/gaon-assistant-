"use client";

import { useEffect, useState } from "react";
import { Bell, Plus, CheckCircle2, Calendar, Droplets, Camera } from "lucide-react";
import Link from "next/link";

export default function RemindersPage() {
  const [reminders, setReminders] = useState<any[]>([]);

  useEffect(() => {
    fetch("https://backend-jet-five-39.vercel.app/api/reminders")
      .then(res => res.json())
      .then(data => setReminders(data.reminders || []))
      .catch(console.error);
  }, []);

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-sans p-4 sm:p-6 pb-24">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#1E4D2B]">🔔 मेरे रिमाइंडर</h1>
      </header>

      {reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Bell className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">अभी कोई रिमाइंडर नहीं है।</h2>
          <p className="text-gray-500 mb-8 max-w-[250px]">
            अपने खेत के कामों को समय पर पूरा करने के लिए रिमाइंडर सेट करें।
          </p>
          <Link href="/chat?mic=1" className="bg-[#1E4D2B] text-white px-8 py-3 rounded-full font-bold shadow-md flex items-center gap-2 hover:bg-[#15361e] transition-colors">
            🎙️ बोलकर रिमाइंडर बनाएं
          </Link>
        </div>
      ) : (
        <div className="space-y-6 animate-slide-up">
          
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4 px-1">आज</h2>
            <div className="space-y-3">
              {reminders.map((r, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-[#E5E0D5] flex items-center justify-between group cursor-pointer hover:border-[#1E4D2B] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0 text-orange-500 group-hover:scale-110 transition-transform">
                      {r.task.includes("सिंचाई") || r.task.includes("पानी") ? <Droplets className="w-6 h-6" /> : 
                       r.task.includes("फोटो") || r.task.includes("जांच") ? <Camera className="w-6 h-6" /> :
                       <Calendar className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg leading-tight">{r.task}</h3>
                      <p className="text-gray-500 font-medium text-sm mt-0.5">{r.time}</p>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-green-50 hover:border-green-500 hover:text-green-500 transition-colors text-transparent">
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-center pt-4">
            <Link href="/chat?mic=1" className="bg-white border-2 border-[#1E4D2B] text-[#1E4D2B] px-8 py-3 rounded-full font-bold shadow-sm flex items-center gap-2 hover:bg-[#F5F2EA] transition-colors">
              🎙️ बोलकर नया बनाएं
            </Link>
          </div>

        </div>
      )}
    </main>
  );
}
