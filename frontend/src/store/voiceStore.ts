import { create } from 'zustand';
import api from '../lib/api';

interface VoiceState {
  isListening: boolean;
  transcript: string;
  aiResponse: {
    action: string;
    route?: string;
    message: string;
  } | null;
  isSpeaking: boolean;
  
  setListening: (val: boolean) => void;
  setTranscript: (text: string) => void;
  setSpeaking: (val: boolean) => void;
  processCommand: (transcript: string) => Promise<void>;
  clearResponse: () => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  isListening: false,
  transcript: '',
  aiResponse: null,
  isSpeaking: false,

  setListening: (val) => set({ isListening: val }),
  setTranscript: (text) => set({ transcript: text }),
  setSpeaking: (val) => set({ isSpeaking: val }),
  
  clearResponse: () => set({ aiResponse: null }),

  processCommand: async (transcript) => {
    if (!transcript.trim()) return;
    
    try {
      const response = await api.post('/assistant/command', { prompt: transcript });
      set({ aiResponse: response.data, transcript: '' });
    } catch (error) {
      console.error('Failed to process voice command', error);
      set({ 
        aiResponse: { 
          action: 'SPEAK', 
          message: 'Sorry, I had trouble processing that.' 
        } 
      });
    }
  }
}));
