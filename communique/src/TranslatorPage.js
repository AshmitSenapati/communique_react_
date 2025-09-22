import React, { useState, useRef, useEffect } from 'react';
//import { Link } from 'react-router-dom'; // Import Link for navigation
import './App.css';
//import Recorder from './components/Recorder';
import AudioFileOpener from './components/AudioFileOpener';
import { transcribeAudio, translateAndGetSpeech } from './api/api'

// A list of languages for the dropdown
const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'tr', name: 'Turkish' },
  { code: 'it', name: 'Italian' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'ko', name: 'Korean' },
  { code: 'ja', name: 'Japanese' },
  { code: 'it', name: 'Italian' },
];

function TranslatorPage() { // Renamed from App to TranslatorPage
  // All of your existing state and functions (handleTranscription, handleTranslate, etc.) go here
  // ... (pasting all your logic from the second code block)
  const [FinalDuration, setFinalDuration] = useState(null);
  

  const [transcript, setTranscript] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef(null);

  const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  
  
};
  const handleToggleRecording = () => {
  if (isRecording) {
    // Stop the recording
    mediaRecorder.current.stop();
    setIsRecording(false);
    setFinalDuration(elapsedTime);
    setElapsedTime(0); // Reset elapsed time
  } else {
    // Start a new recording
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder.current = new MediaRecorder(stream);
        audioChunks.current = []; // Clear previous chunks

        mediaRecorder.current.ondataavailable = event => {
          audioChunks.current.push(event.data);
        };

        // When recording stops, process the audio
        mediaRecorder.current.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
          handleTranscription(audioBlob); // Use your existing transcription handler
          
          // Stop the microphone track
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.current.start();
        setIsRecording(true);
      })
      .catch(err => console.error("Error accessing microphone:", err));
    }
  };

  const handleTranscription = async (audioBlob) => {
    // ... your transcription logic ...
    setIsLoading(true);
    setError('');
    setTranscript('');
    setTranslatedText('');
    setAudioUrl('');

    try {
      const transcribedText = await transcribeAudio(audioBlob);
      setTranscript(transcribedText);
    } catch (err) {
      setError('Error during transcription. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!transcript) return;

    setIsLoading(true);
    setError('');
    setTranslatedText('');
    setAudioUrl('');

    try {
        const result = await translateAndGetSpeech(transcript, targetLanguage);
        setTranslatedText(result.translatedText);
        setAudioUrl(result.audioUrl);
    } catch (err) {
        setError('Error during translation. Please try again.');
        console.error(err);
    } finally {
        setIsLoading(false);
    }
};


  useEffect(() => {
  if (isRecording) {
    // Start the timer
    intervalRef.current = setInterval(() => {
      setElapsedTime(prevTime => prevTime + 1);
    }, 1000);
  } else {
    // Stop and clear the timer
    clearInterval(intervalRef.current);
  }

  // Cleanup function to clear the interval when the component unmounts
  return () => {
    clearInterval(intervalRef.current);
  };
}, [isRecording]);

  return (
    <div className="App">
      <header className="App-header">
        
        
        {/* The rest of your existing JSX for the translator */}
        <h1>CommUnique 🎧</h1>
        <p>Record your voice and get it translated into different languages.</p>
        {isRecording && <div className="timer">{formatTime(elapsedTime)}</div>}
        <button 
        onClick={handleToggleRecording} 
        disabled={isLoading}
        className={`record-button ${isRecording ? 'recording' : ''}`}
    >
      {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
        <AudioFileOpener onFileSelect={handleTranscription} disabled={isLoading} />

        {isLoading && <p className="loading">Processing...</p>}
        {error && <p className="error">{error}</p>}

        <div className="results">
          {transcript && (
          <div className="result-item">
          <h3>Transcript:</h3>
          {/* --- ADD THIS JSX ELEMENT --- */}
          {FinalDuration !== null && (
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
              Recording Duration: {formatTime(FinalDuration)}
            </p>
          )}
          <p>"{transcript}"</p>

              {/* 4. Show the language selector and button ONLY after transcription */}
              <div className="translation-controls">
                <select 
                  value={targetLanguage} 
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  disabled={isLoading}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                
                <button onClick={handleTranslate} disabled={isLoading}>
                  Translate
                </button>
              </div>
            </div>
          )}

          {translatedText && (
            <div className="result-item">
              <h3>Translated Text:</h3>
              <p>"{translatedText}"</p>
            </div>
          )}

          {audioUrl && (
            <div className="result-item">
              <h3>Listen:</h3>
              <audio controls autoPlay src={audioUrl}>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>

        {/* ... and so on for the rest of your JSX ... */}
      </header>
    </div>
  );
}

export default TranslatorPage;