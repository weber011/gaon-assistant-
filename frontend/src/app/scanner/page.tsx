"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Image as ImageIcon, ArrowLeft, Leaf, ScanSearch, CheckCircle2, AlertTriangle, ChevronRight, Volume2, StopCircle, RefreshCcw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type AppState = "idle" | "selecting_crop" | "analyzing" | "result" | "speaking";

const CROP_CHOICES = [
  { id: "tomato", name: "टमाटर", icon: "🍅" },
  { id: "wheat", name: "गेहूं", icon: "🌾" },
  { id: "rice", name: "धान", icon: "🌾" },
  { id: "potato", name: "आलू", icon: "🥔" },
  { id: "corn", name: "मक्का", icon: "🌽" },
  { id: "dal", name: "दाल", icon: "🫘" },
  { id: "veg", name: "सब्ज़ी", icon: "🥬" },
  { id: "other", name: "अन्य", icon: "🌱" },
];

export default function ScannerPage() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = "";
      }
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate format & size
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert("कृपया JPG, PNG या WEBP फोटो अपलोड करें।");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("फोटो 10MB से छोटी होनी चाहिए।");
        return;
      }

      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setAppState("selecting_crop");
    }
  };

  const handleCropSelect = async (cropName: string) => {
    setSelectedCrop(cropName);
    setAppState("analyzing");
    
    try {
      const formData = new FormData();
      if (selectedImage) formData.append("image", selectedImage);
      formData.append("crop", cropName);
      formData.append("user_id", "default_farmer");

      const response = await fetch("https://backend-jet-five-39.vercel.app/api/crop/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Analysis failed");
      
      const result = await response.json();
      setAnalysisResult(result);
      setAppState("result");
      
      // Auto-play voice explanation
      await playVoiceExplanation(result);
      
    } catch (error) {
      console.error(error);
      // Fallback to Demo Mode for Crop Analysis
      const demoResult = {
        crop: cropName,
        possible_problem: "झुलसा रोग (Blight) का शुरुआती लक्षण",
        action: "पत्तियों पर फफूंदनाशक (Fungicide) का छिड़काव करें और खेत में जलभराव न होने दें।",
        is_demo_data: true
      };
      setAnalysisResult(demoResult);
      setAppState("result");
      await playVoiceExplanation(demoResult);
    }
  };

  const playVoiceExplanation = async (result: any) => {
    const text = `जी, आपकी फोटो में ${result.crop} के पत्तों पर कुछ समस्या दिखाई दे रही है। यह ${result.possible_problem} जैसे लक्षण हो सकते हैं। यह केवल एआई का प्रारंभिक अनुमान है। अधिक जानकारी के लिए, स्क्रीन पर दिए गए सुझाव पढ़ें या कृषि विशेषज्ञ से बात करें।`;
    
    try {
      const ttsResponse = await fetch("https://backend-jet-five-39.vercel.app/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!ttsResponse.ok) throw new Error("TTS failed");

      const blob = await ttsResponse.blob();
      const url = URL.createObjectURL(blob);
      
      const audio = new Audio(url);
      audioPlayerRef.current = audio;
      
      audio.onplay = () => setAppState("speaking");
      audio.onended = () => setAppState("result");
      audio.onerror = () => setAppState("result");
      
      audio.play().catch(e => {
          console.error("Autoplay blocked", e);
          setAppState("result");
      });
    } catch (e) {
      console.error("Audio playback error", e);
      // Fallback native TTS
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "hi-IN";
        
        utterance.onstart = () => setAppState("speaking");
        utterance.onend = () => setAppState("result");
        utterance.onerror = () => setAppState("result");
        
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const stopSpeaking = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    window.speechSynthesis?.cancel();
    setAppState("result");
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans">
      {/* ── Header ── */}
      <header className="flex items-center p-4 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-[#E5E0D5]">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors mr-2">
          <ArrowLeft className="w-6 h-6 text-[#1E4D2B]" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#1E4D2B] leading-tight flex items-center gap-2">
            <Camera className="w-5 h-5" />
            फसल जांच
          </h1>
          <p className="text-xs text-[#2E5E3D] font-medium opacity-80">फोटो भेजकर फसल की समस्या समझें</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24">
        
        {appState === "idle" && (
          <div className="animate-fade-in max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-[#1E4D2B] mb-2 text-center">अपनी फसल की साफ फोटो लें</h2>
            <p className="text-center text-sm text-gray-500 mb-8">बेहतर परिणाम के लिए पत्ते या फल की साफ और नज़दीकी फोटो लें।</p>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E5E0D5] flex flex-col gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-[#1E4D2B] hover:bg-[#15361e] text-white p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all shadow-md active:scale-95"
              >
                <Camera className="w-10 h-10" />
                <span className="text-lg font-bold">कैमरे से फोटो लें</span>
              </button>
              
              <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] flex-1 bg-gray-200"></div>
                <span className="text-sm text-gray-400 font-medium uppercase">या</span>
                <div className="h-[1px] flex-1 bg-gray-200"></div>
              </div>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-[#F5F2EA] hover:bg-[#E5E0D5] text-[#1E4D2B] p-4 rounded-2xl flex items-center justify-center gap-3 transition-colors border border-[#E5E0D5]"
              >
                <ImageIcon className="w-6 h-6" />
                <span className="font-bold">गैलरी से चुनें</span>
              </button>
            </div>
            
            {/* Hidden file input */}
            <input 
              type="file" 
              accept="image/jpeg,image/png,image/webp" 
              capture="environment"
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageChange}
            />
          </div>
        )}

        {appState === "selecting_crop" && imagePreview && (
          <div className="animate-fade-in max-w-lg mx-auto">
            <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-6 shadow-sm border border-gray-200 bg-black">
              <Image src={imagePreview} alt="Selected Crop" fill className="object-contain" />
              <button 
                onClick={() => setAppState("idle")}
                className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full text-xs font-bold"
              >
                बदलें
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-[#1E4D2B] mb-4 text-center">यह कौन सी फसल है?</h2>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {CROP_CHOICES.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleCropSelect(c.name)}
                  className="bg-white border border-[#E5E0D5] hover:border-[#1E4D2B] hover:shadow-md p-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95"
                >
                  <span className="text-3xl">{c.icon}</span>
                  <span className="font-bold text-[#1E4D2B]">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {appState === "analyzing" && imagePreview && (
          <div className="animate-fade-in max-w-lg mx-auto flex flex-col items-center justify-center pt-10">
            <div className="relative w-48 h-48 rounded-full overflow-hidden mb-8 border-4 border-[#2E5E3D] shadow-xl bg-black">
              <Image src={imagePreview} alt="Scanning" fill className="object-cover opacity-60" />
              {/* Scanning laser animation */}
              <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_15px_4px_rgba(74,222,128,0.6)] animate-[scan_2s_ease-in-out_infinite]"></div>
              <ScanSearch className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-white drop-shadow-md animate-pulse" />
            </div>
            
            <h2 className="text-2xl font-bold text-[#1E4D2B] mb-2 text-center animate-pulse">
              🔍 फोटो की जांच हो रही है...
            </h2>
            <div className="text-center text-[#2E5E3D] font-medium space-y-1 h-12">
              <p className="animate-fade-in">कृषि जानकारी से मिलान कर रहे हैं...</p>
            </div>
          </div>
        )}

        {(appState === "result" || appState === "speaking") && analysisResult && imagePreview && (
          <div className="animate-slide-up max-w-lg mx-auto">
            {/* Result Header Card */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#E5E0D5] mb-6">
              <div className="relative h-48 w-full bg-black">
                <Image src={imagePreview} alt="Crop" fill className="object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border border-white/30">
                      {analysisResult.crop}
                    </span>
                    {analysisResult.is_demo_data && (
                      <span className="bg-yellow-500/90 text-yellow-950 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                        Demo
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-shadow-sm flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-yellow-400" />
                    संभावित समस्या
                  </h2>
                </div>
              </div>
              
              <div className="p-5 bg-gradient-to-b from-[#FFFDF0] to-white">
                <div className="text-xl font-black text-[#8B4513] mb-2">{analysisResult.possible_problem}</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-yellow-800 bg-yellow-200/50 border border-yellow-300 px-2.5 py-1 rounded-md">
                    🟡 {analysisResult.severity === 'medium' ? 'मध्यम संभावना' : 'उच्च संभावना'}
                  </span>
                  <span className="text-gray-500 font-medium flex items-center gap-1.5 text-xs bg-gray-50 px-2 py-1 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> 
                    {analysisResult.disclaimer}
                  </span>
                </div>
              </div>
            </div>

            {/* Audio Control */}
            <button
              onClick={() => {
                if (appState === "speaking") stopSpeaking();
                else playVoiceExplanation(analysisResult);
              }}
              className={`w-full mb-6 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all shadow-sm ${
                appState === "speaking" 
                  ? "bg-[#D4AF37] text-white ring-2 ring-[#D4AF37]/30 scale-[1.02]" 
                  : "bg-[#F5F2EA] text-[#1E4D2B] border border-[#E5E0D5] hover:bg-[#E5E0D5]"
              }`}
            >
              {appState === "speaking" ? (
                <><StopCircle className="w-5 h-5" /> ⏹ रोकें</>
              ) : (
                <><Volume2 className="w-5 h-5" /> 🔊 वॉइस रिपोर्ट सुनें</>
              )}
            </button>

            {/* Details */}
            <div className="space-y-6 bg-white p-6 rounded-3xl border border-[#E5E0D5] shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-[#1E4D2B] mb-3 border-b pb-2 border-gray-100 flex items-center gap-2">
                  <span>👀</span> देखे गए लक्षण
                </h3>
                <ul className="space-y-2.5">
                  {analysisResult.symptoms.map((sym: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-gray-700 font-medium leading-snug">
                      <span className="text-red-500 font-bold mt-0.5">✓</span> {sym}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-[#1E4D2B] mb-3 border-b pb-2 border-gray-100 flex items-center gap-2">
                  <span>💡</span> क्या करें?
                </h3>
                <ul className="space-y-2.5">
                  {analysisResult.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-gray-700 font-medium leading-snug">
                      <span className="text-green-500 font-bold mt-0.5">✓</span> {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Follow up Action */}
            <div className="mt-8 mb-4">
              <h3 className="text-center font-bold text-gray-500 mb-4 flex items-center justify-center gap-2">
                <span className="h-px w-12 bg-gray-200"></span>
                और कुछ पूछना है?
                <span className="h-px w-12 bg-gray-200"></span>
              </h3>
              <Link 
                href={`/chat?context=${encodeURIComponent(analysisResult.possible_problem)}`}
                className="w-full bg-white border-2 border-[#1E4D2B] text-[#1E4D2B] hover:bg-[#F5F2EA] p-4 rounded-2xl flex items-center justify-between transition-colors shadow-sm active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#1E4D2B] text-white p-2.5 rounded-full shadow-inner">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-base">एआई सहायक से बात करें</div>
                    <div className="text-xs text-gray-500 font-medium">"इसका इलाज क्या है?"</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </Link>
            </div>
            
            <button 
                onClick={() => {
                  setAppState("idle");
                  setSelectedImage(null);
                  setImagePreview(null);
                  setAnalysisResult(null);
                }}
                className="w-full flex items-center justify-center gap-2 text-sm text-[#1E4D2B] font-bold p-4 opacity-70 hover:opacity-100 transition-opacity"
              >
                <RefreshCcw className="w-4 h-4" /> नई जांच करें
            </button>
            
          </div>
        )}
      </div>
    </main>
  );
}
