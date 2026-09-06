import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoiceStore } from '../store/voiceStore';

const VoiceAssistant: React.FC = () => {
  const navigate = useNavigate();
  const {
    aiResponse,
    setListening,
    setSpeaking,
    processCommand,
    clearResponse
  } = useVoiceStore();

  const { i18n } = useTranslation();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-stop after 2.5 seconds of silence
  useEffect(() => {
    if (listening && transcript) {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      silenceTimeoutRef.current = setTimeout(() => {
        SpeechRecognition.stopListening();
      }, 2500);
    }

    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [transcript, listening]);

  // Sync internal speech recognition listening state to global store
  useEffect(() => {
    setListening(listening);
    if (!listening && transcript) {
      // User stopped speaking, process the command
      processCommand(transcript);
      resetTranscript();
    }
  }, [listening, transcript, setListening, processCommand, resetTranscript]);

  // Handle AI Responses
  useEffect(() => {
    if (aiResponse) {
      if (aiResponse.action === 'NAVIGATE' && aiResponse.route) {
        navigate(aiResponse.route);
      }
      
      if (aiResponse.message) {
        speak(aiResponse.message);
      }
      clearResponse(); // Clear after acting
    }
  }, [aiResponse, navigate, clearResponse]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Select appropriate Indian voice/language based on current app language
      const isHindi = i18n.language === 'hi' || /[\u0900-\u097F]/.test(text);
      utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
      
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      const lang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
      SpeechRecognition.startListening({ continuous: true, language: lang });
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        <button
          disabled
          aria-label="Voice Assistant Not Supported"
          className="w-16 h-16 rounded-full flex items-center justify-center transition-colors bg-zinc-800 text-zinc-600 shadow-lg border border-zinc-700/50 cursor-not-allowed opacity-50"
          title="Speech recognition is not supported in this browser."
        >
          <MicOff className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Tooltip / Status popup */}
      <AnimatePresence>
        {(listening || transcript) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 p-4 rounded-2xl shadow-xl max-w-[280px]"
          >
            <p className="text-sm text-zinc-300">
              {listening && !transcript && "Listening..."}
              {transcript && `"${transcript}"`}
              {!listening && transcript && (
                <span className="flex items-center gap-2 mt-2 text-lime-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </span>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={toggleListening}
        aria-label={listening ? "Stop Voice Assistant" : "Start Voice Assistant"}
        role="button"
        tabIndex={0}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={listening ? {
          boxShadow: [
            "0px 0px 0px 0px rgba(132, 204, 22, 0.4)",
            "0px 0px 20px 10px rgba(132, 204, 22, 0.4)",
            "0px 0px 0px 0px rgba(132, 204, 22, 0.4)"
          ],
        } : {}}
        transition={listening ? {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        } : {}}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-4 focus:ring-lime-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
          listening ? 'bg-lime-500 text-zinc-900' : 'bg-zinc-800 text-lime-500 hover:bg-zinc-700 shadow-lg border border-zinc-700'
        }`}
      >
        {listening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
      </motion.button>
    </div>
  );
};

export default VoiceAssistant;
