"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Send } from "lucide-react";

// Extend Window type for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Message = { role: "user" | "assistant"; text: string };
type AppState = "idle" | "listening" | "processing" | "speaking";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [appState, setAppState] = useState<AppState>("idle");
  const [inputText, setInputText] = useState("");
  const [statusText, setStatusText] = useState("बोलने के लिए माइक दबाएं या सवाल लिखें");
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach(track => track.stop());
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setAppState("listening");
      setStatusText("सुन रहा हूँ... बोलने के बाद फिर से दबाएं ⏹️");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("माइक की अनुमति दें। Browser settings में Microphone को Allow करें।");
      setAppState("idle");
      setStatusText("बोलने के लिए माइक दबाएं या सवाल लिखें");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    // We don't set idle here, because processAudio will set it to processing
  };

  const processAudio = async (audioBlob: Blob) => {
    setAppState("processing");
    setStatusText("समझ रहा हूँ...");

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      const sttResponse = await fetch("https://backend-jet-five-39.vercel.app/api/speech-to-text", {
        method: "POST",
        body: formData,
      });

      if (!sttResponse.ok) {
        throw new Error("STT API failed");
      }

      const sttData = await sttResponse.json();
      const transcribedText = sttData.text;

      if (transcribedText && transcribedText.trim() !== "") {
        await sendMessage(transcribedText);
      } else {
        await triggerDemoMode();
      }
    } catch (error) {
      console.error("STT Error:", error);
      startNativeRecognitionFallback();
    }
  };
  
  const triggerDemoMode = async () => {
    setAppState("processing");
    setStatusText("जवाब तैयार कर रहा हूँ...");
    
    const demoQuery = "कल बारिश होगी?";
    setMessages(prev => [...prev, { role: "user", text: demoQuery }]);
    
    setTimeout(() => {
      const demoResponse = "आपके इलाके के लिए मौसम की जानकारी अभी डेमो मोड में उपलब्ध है।";
      setMessages(prev => [...prev, { 
        role: "assistant", 
        text: demoResponse
      }]);
      speakText(demoResponse);
    }, 1500);
  };

  const startNativeRecognitionFallback = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("इंटरनेट कनेक्शन कमजोर है। कृपया लिखकर पूछें।");
      setAppState("idle");
      setStatusText("बोलने के लिए माइक दबाएं या सवाल लिखें");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        sendMessage(transcript);
      } else {
        setAppState("idle");
        setStatusText("बोलने के लिए माइक दबाएं या सवाल लिखें");
      }
    };

    recognition.onerror = () => {
      setAppState("idle");
      setStatusText("बोलने के लिए माइक दबाएं या सवाल लिखें");
    };
    
    recognition.onend = () => {
      if (appState === "processing") {
        setAppState("idle");
        setStatusText("बोलने के लिए माइक दबाएं या सवाल लिखें");
      }
    };

    recognition.start();
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || appState === "processing") return;

    setAppState("processing");
    setStatusText("समझ रहा हूँ...");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInputText("");

    try {
      const chatResponse = await fetch("https://backend-jet-five-39.vercel.app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!chatResponse.ok) throw new Error("Server error");

      const chatData = await chatResponse.json();
      const botText = chatData.reply;

      setMessages((prev) => [...prev, { role: "assistant", text: botText }]);

      // Use browser TTS to speak the response in Hindi
      speakText(botText);

    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "अभी जानकारी लाने में थोड़ी परेशानी हो रही है। कृपया थोड़ी देर बाद फिर पूछें।" },
      ]);
      setAppState("idle");
      setStatusText("बोलने के लिए माइक दबाएं या सवाल लिखें");
    }
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) {
      setAppState("idle");
      setStatusText("बोलने के लिए माइक दबाएं या सवाल लिखें");
      return;
    }

    setAppState("speaking");
    setStatusText("जवाब सुन रहे हैं... 🔊");

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onend = () => {
      setAppState("idle");
      setStatusText("बोलने के लिए माइक दबाएं या सवाल लिखें");
    };

    utterance.onerror = () => {
      setAppState("idle");
      setStatusText("बोलने के लिए माइक दबाएं या सवाल लिखें");
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setAppState("idle");
    setStatusText("बोलने के लिए माइक दबाएं या सवाल लिखें");
  };

  const handleMicButton = () => {
    if (appState === "listening") stopRecording();
    else if (appState === "speaking") stopSpeaking();
    else startRecording();
  };

  const isProcessing = appState === "processing";

  return (
    <main className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-center p-4 border-b border-[#E5E0D5] bg-white sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-[#1E4D2B] flex items-center gap-2">
          🌾 <span>Gaon Assistant</span>
        </h1>
        <div className="absolute right-4 text-xs text-gray-400">
          {appState !== "idle" && (
            <span className={`px-2 py-1 rounded-full text-white text-xs font-medium ${
              appState === "listening" ? "bg-red-500 animate-pulse" :
              appState === "processing" ? "bg-yellow-500 animate-pulse" :
              "bg-green-500 animate-pulse"
            }`}>
              {appState === "listening" ? "🎙️ सुन रहा हूँ" : appState === "processing" ? "⏳ सोच रहा हूँ" : "🔊 बोल रहा हूँ"}
            </span>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 pb-2 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-16 text-center space-y-4">
            <div className="text-7xl">🌾</div>
            <p className="text-2xl font-bold text-[#1E4D2B]">नमस्ते किसान भाई!</p>
            <p className="text-gray-500 text-base max-w-xs">माइक दबाकर बोलें या नीचे लिखकर अपना सवाल पूछें</p>
            <div className="grid grid-cols-2 gap-2 mt-4 w-full max-w-sm">
              {["आज का मौसम कैसा है?", "मंडी में टमाटर का भाव?", "फसल में कीड़े लग गए", "सरकारी योजना बताएं"].map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-sm bg-white border border-[#E5E0D5] text-[#2E5E3D] px-3 py-3 rounded-2xl shadow-sm hover:bg-[#F5F2EA] transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-[#2E5E3D] flex items-center justify-center text-white text-sm mr-2 flex-shrink-0 mt-1">
                🌾
              </div>
            )}
            <div className={`max-w-[80%] p-4 rounded-3xl ${
              msg.role === "user"
                ? "bg-[#2E5E3D] text-white rounded-br-lg shadow-md"
                : "bg-white text-[#3D4035] border border-[#E5E0D5] rounded-bl-lg shadow-sm"
            }`}>
              <p className="text-base leading-relaxed">{msg.text}</p>
              {msg.role === "assistant" && (
                <button
                  onClick={() => speakText(msg.text)}
                  className="mt-2 text-[#2E5E3D] flex items-center gap-1 font-medium text-xs opacity-70 hover:opacity-100"
                >
                  🔊 फिर से सुनें
                </button>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#2E5E3D] flex items-center justify-center text-white text-sm flex-shrink-0">
              🌾
            </div>
            <div className="bg-white p-4 rounded-3xl rounded-bl-lg border border-[#E5E0D5] shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-[#2E5E3D] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-[#2E5E3D] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-[#2E5E3D] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#E5E0D5] bg-white">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          {/* Text input row */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(inputText)}
              placeholder="यहाँ अपना सवाल लिखें..."
              disabled={isProcessing}
              className="flex-1 bg-[#F5F2EA] rounded-full px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#2E5E3D] disabled:opacity-50 transition-all"
            />
            <button
              onClick={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isProcessing}
              className="bg-[#2E5E3D] text-white rounded-full p-3 hover:bg-[#1E4D2B] disabled:opacity-40 transition-colors shadow-md flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Mic + status row */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleMicButton}
              disabled={isProcessing}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 disabled:opacity-50 ${
                appState === "listening"
                  ? "bg-red-500 animate-pulse scale-110"
                  : appState === "speaking"
                  ? "bg-green-500 animate-pulse scale-105"
                  : "bg-[#2E5E3D] hover:scale-110 hover:shadow-xl"
              }`}
            >
              {appState === "listening" || appState === "speaking" ? (
                <Square className="w-6 h-6 text-white fill-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>
            <p className="text-sm text-gray-500 font-medium">{statusText}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
