import { Mic } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#3D4035] font-sans flex flex-col items-center justify-center p-6">
      
      <div className="w-full max-w-md flex flex-col items-center space-y-8 mt-12">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#1E4D2B]">🌾 Gaon Assistant</h1>
          <h2 className="text-xl font-semibold mt-4">नमस्ते किसान भाई 🙏</h2>
          <p className="text-lg text-gray-600">बताइए, आज आपकी खेती में मैं कैसे मदद करूँ?</p>
        </div>

        {/* Microphone Section */}
        <Link href="/chat" className="flex flex-col items-center justify-center space-y-4 mt-8 group">
          <button className="w-32 h-32 bg-[#2E5E3D] text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
            <Mic className="w-16 h-16" />
          </button>
          <span className="text-xl font-medium text-[#2E5E3D]">बोलकर पूछें</span>
        </Link>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4 w-full mt-12">
          <ActionCard icon="📷" title="फसल की फोटो" href="/chat" />
          <ActionCard icon="🌦️" title="मौसम" href="/chat" />
          <ActionCard icon="💰" title="मंडी भाव" href="/chat" />
          <ActionCard icon="🏛️" title="सरकारी योजनाएँ" href="/chat" />
        </div>
      </div>
    </main>
  );
}

function ActionCard({ icon, title, href }: { icon: string, title: string, href: string }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-32">
      <span className="text-4xl mb-3">{icon}</span>
      <span className="font-medium text-gray-800 text-center">{title}</span>
    </Link>
  );
}
