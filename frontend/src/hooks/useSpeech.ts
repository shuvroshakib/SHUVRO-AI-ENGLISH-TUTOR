import { useState, useCallback, useRef, useEffect } from 'react';

interface SpeechState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

export function useSpeech() {
  const [state, setState] = useState<SpeechState>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    interimTranscript: '',
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setState(s => ({ ...s, error: 'Speech recognition not supported in this browser' }));
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setState(s => ({ ...s, isListening: true, error: null }));
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setState(s => ({
        ...s,
        transcript: final ? s.transcript + ' ' + final : s.transcript,
        interimTranscript: interim,
      }));
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech') {
        setState(s => ({ ...s, error: event.error }));
      }
    };

    recognition.onend = () => {
      setState(s => ({ ...s, isListening: false }));
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setState(s => ({ ...s, isListening: false, interimTranscript: '' }));
  }, []);

  const speak = useCallback((text: string, voiceName?: string, rate: number = 1) => {
    if (!synthRef.current) {
      setState(s => ({ ...s, error: 'Text-to-speech not supported' }));
      return;
    }

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.1;
    utterance.lang = 'en-US';

    if (voiceName) {
      const voices = synthRef.current.getVoices();
      const voice = voices.find(v => v.name.includes(voiceName) || v.name.includes('Female'));
      if (voice) utterance.voice = voice;
    }

    utterance.onstart = () => {
      setState(s => ({ ...s, isSpeaking: true }));
    };

    utterance.onend = () => {
      setState(s => ({ ...s, isSpeaking: false }));
    };

    utterance.onerror = () => {
      setState(s => ({ ...s, isSpeaking: false }));
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setState(s => ({ ...s, isSpeaking: false }));
  }, []);

  const clearTranscript = useCallback(() => {
    setState(s => ({ ...s, transcript: '', interimTranscript: '' }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearTranscript,
  };
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
