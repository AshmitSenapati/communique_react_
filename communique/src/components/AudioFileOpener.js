import React, { useState } from 'react';

const AudioFileOpener = ({ onFileSelect }) => {
  const [audioFileUrl, setAudioFileUrl] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Create a URL for the local file to be used by the audio player
      const fileUrl = URL.createObjectURL(file);
      setAudioFileUrl(fileUrl);
      
      // Pass the selected file blob up to the parent component (App.js)
      onFileSelect(file); 
    }
  };

  return (
    <div style={{ marginTop: '30px' }}>
      <h2>Or Upload an Audio File</h2>
      <input type="file" accept="audio/*" onChange={handleFileSelect} />

      {audioFileUrl && (
        <div style={{ marginTop: '20px' }}>
          <h4>Preview:</h4>
          <audio src={audioFileUrl} controls />
        </div>
      )}
    </div>
  );
};

export default AudioFileOpener;

