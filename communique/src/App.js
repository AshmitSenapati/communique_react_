import React, { useState } from 'react';
import './App.css';
import Recorder from './components/Recorder';
import AudioFileOpener from './components/AudioFileOpener';
import { transcribeAudio, translateText, textToSpeech } from './api/api';

// A list of languages for the dropdown
const languages = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'it', name: 'Italian' },
];

function App() {
  const [transcript, setTranscript] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 1. Add state for the selected language
  const [targetLanguage, setTargetLanguage] = useState('es'); // Default to Spanish

  // 2. This function now ONLY handles transcription
  const handleTranscription = async (audioBlob) => {
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

  // 3. This NEW function handles the translation part on button click
  const handleTranslate = async () => {
    if (!transcript) return; // Don't do anything if there's no text

    setIsLoading(true);
    setError('');
    setTranslatedText('');
    setAudioUrl('');

    try {
      // Step 2: Translate Text using the stored transcript and selected language
      const translated = await translateText(transcript, targetLanguage);
      setTranslatedText(translated);

      // Step 3: Convert Translated Text to Speech
      const finalAudioUrl = await textToSpeech(translated, targetLanguage);
      setAudioUrl(finalAudioUrl);
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
        <h1>CommUnique 🎧</h1>
        <p>Record your voice and get it translated into different languages.</p>
        
        {/* These components now trigger transcription only */}
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
      </header>
    </div>
  );
}

export default App;

