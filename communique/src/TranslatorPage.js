import React, { useState } from 'react';
//import { Link } from 'react-router-dom'; // Import Link for navigation
import './App.css';
import Recorder from './components/Recorder';
import AudioFileOpener from './components/AudioFileOpener';
import { transcribeAudio, translateAndGetSpeech } from './api/api'

// A list of languages for the dropdown
const languages = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'it', name: 'Italian' },
];

function TranslatorPage() { // Renamed from App to TranslatorPage
  // All of your existing state and functions (handleTranscription, handleTranslate, etc.) go here
  // ... (pasting all your logic from the second code block)
  const [transcript, setTranscript] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');

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

  return (
    <div className="App">
      <header className="App-header">
        
        
        {/* The rest of your existing JSX for the translator */}
        <h1>CommUnique 🎧</h1>
        <p>Record your voice and get it translated into different languages.</p>
        <Recorder onStop={handleTranscription} disabled={isLoading} />
        <AudioFileOpener onFileSelect={handleTranscription} disabled={isLoading} />

        {isLoading && <p className="loading">Processing...</p>}
        {error && <p className="error">{error}</p>}

        <div className="results">
          {transcript && (
            <div className="result-item">
              <h3>Transcript:</h3>
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