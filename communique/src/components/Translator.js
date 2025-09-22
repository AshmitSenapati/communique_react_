import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, Trash2, Copy, Volume2, History, Mic } from 'lucide-react';

// --- Helper Functions & Constants ---
const LOCAL_STORAGE_KEY = 'translationHistory';

/**
 * A dedicated component to display the translation history.
 * It's a "dumb" component that just receives props and renders UI.
 */
const TranslationHistory = ({ history, onHistoryClick, onClearHistory }) => {
    return (
        <div className="w-full md:w-1/4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-inner flex flex-col h-full max-h-[85vh]">
            <div className="flex justify-between items-center mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                    <History className="w-6 h-6 mr-2 text-indigo-500" />
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">History</h2>
                </div>
                <button 
                    onClick={onClearHistory} 
                    className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 group"
                    aria-label="Clear history"
                >
                    <Trash2 className="w-5 h-5 text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors" />
                </button>
            </div>

            {history.length === 0 ? (
                <div className="flex-grow flex items-center justify-center text-center">
                    <p className="text-gray-500 dark:text-gray-400">Your past translations will appear here.</p>
                </div>
            ) : (
                <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                    {history.map((item) => (
                        <button 
                            key={item.id} 
                            onClick={() => onHistoryClick(item)}
                            className="w-full text-left p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
                        >
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{item.sourceText}</p>
                            <p className="text-sm text-indigo-600 dark:text-indigo-400 truncate mt-1">{item.translatedText}</p>
                            <div className="flex justify-between items-center mt-2 text-xs text-gray-400 dark:text-gray-500">
                                <span>{item.sourceLang} → {item.targetLang}</span>
                                <span>{new Date(item.id).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


/**
 * The main Translator component, now with history management.
 */
export default function Translator() {
    // --- State Management ---
    const [sourceText, setSourceText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [sourceLang, setSourceLang] = useState('English');
    const [targetLang, setTargetLang] = useState('Spanish');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [history, setHistory] = useState([]);

    // --- Refs for Media Recorder ---
    // Use useRef to hold the MediaRecorder instance and audio chunks
    // This prevents re-renders when they change.
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);


    // --- Effects for LocalStorage Sync ---
    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error("Failed to parse translation history:", error);
            setHistory([]);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
        } catch (error) {
            console.error("Failed to save translation history:", error);
        }
    }, [history]);

    // --- Core Functions ---

    // UPDATED: Real speech-to-text transcription logic
    const handleTranscribe = useCallback(async () => {
        if (isRecording) {
            // If already recording, stop it.
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            return;
        }

        // --- Start Recording ---
        try {
            // 1. Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // 2. Create a new MediaRecorder instance
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = []; // Clear previous audio chunks

            // 3. When audio data is available, push it to our chunks array
            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            // 4. When recording stops, process the audio
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const formData = new FormData();
                formData.append('audio', audioBlob, 'recording.webm');
                
                setIsLoading(true);
                setSourceText('Transcribing...');

                try {
                    // 5. Send the audio to our Flask backend
                    const response = await fetch('http://localhost:5001/stt', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    setSourceText(data.text); // Set input text with the transcription

                } catch (error) {
                    console.error("Transcription failed:", error);
                    setSourceText("Transcription failed. Please try again.");
                } finally {
                    setIsLoading(false);
                    // Stop all tracks on the stream to turn off the microphone light
                    stream.getTracks().forEach(track => track.stop());
                }
            };

            // 6. Start recording and update UI state
            mediaRecorder.start();
            setIsRecording(true);
            setSourceText('');

        } catch (error) {
            console.error("Microphone access denied or error:", error);
            alert("Microphone access is required for transcription. Please allow access and try again.");
        }
    }, [isRecording]);


    const handleTranslate = useCallback(async () => {
        if (!sourceText.trim()) return;

        setIsLoading(true);
        // --- MOCK API CALL ---
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        const mockTranslation = `${sourceText} (translated to ${targetLang})`;
        setTranslatedText(mockTranslation);
        // --- END MOCK ---
        setIsLoading(false);
        
        const newHistoryItem = {
            id: Date.now(),
            sourceText,
            translatedText: mockTranslation,
            sourceLang,
            targetLang,
        };

        setHistory(prevHistory => [newHistoryItem, ...prevHistory].slice(0, 50));

    }, [sourceText, sourceLang, targetLang]);

    const handleHistoryClick = useCallback((item) => {
        setSourceText(item.sourceText);
        setTranslatedText(item.translatedText);
        setSourceLang(item.sourceLang);
        setTargetLang(item.targetLang);
    }, []);

    const handleClearHistory = useCallback(() => {
        setHistory([]);
    }, []);


    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                    AI Language Suite
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Your all-in-one tool for global communication. Assembled in Vellore, IN.</p>
            </header>
            
            <main className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
                <div className="w-full md:w-3/4 flex flex-col gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                        <textarea
                            value={sourceText}
                            onChange={(e) => setSourceText(e.target.value)}
                            placeholder="Type text or use the microphone to transcribe..."
                            className="w-full h-40 p-2 bg-transparent rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex justify-between items-center mt-2 border-t pt-2 border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleTranscribe}
                                    disabled={isLoading && !isRecording}
                                    className={`p-2 rounded-full transition-colors ${
                                        isRecording 
                                            ? 'bg-red-500 text-white animate-pulse' 
                                            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                    aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                                >
                                    <Mic className="w-5 h-5"/>
                                </button>
                                <span className="text-sm font-medium text-gray-500">{sourceLang}</span>
                            </div>
                            <button 
                                onClick={handleTranslate}
                                disabled={isLoading || !sourceText.trim()}
                                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all"
                            >
                                {isLoading ? (isRecording ? 'Recording...' : 'Translating...') : 'Translate'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                         <div className="w-full h-40 p-2 bg-transparent rounded-md resize-none">
                            {translatedText}
                         </div>
                        <div className="flex justify-between items-center mt-2 border-t pt-2 border-gray-200 dark:border-gray-700">
                             <span className="text-sm font-medium text-gray-500">{targetLang}</span>
                            <div className="flex items-center gap-2">
                                <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><Volume2 className="w-5 h-5"/></button>
                                <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><Copy className="w-5 h-5"/></button>
                            </div>
                        </div>
                    </div>
                </div>

                <TranslationHistory 
                    history={history}
                    onHistoryClick={handleHistoryClick}
                    onClearHistory={handleClearHistory}
                />
            </main>
        </div>
    );
}

