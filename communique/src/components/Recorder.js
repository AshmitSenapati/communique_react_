import React from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';

// 1. Accept `onStop` and `disabled` as props
const AudioRecorder = ({ onStop, disabled }) => {
  
  // 2. Pass a custom onStop function to the hook
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ 
      audio: true,
      // The hook's onStop provides the blobUrl and the raw blob
      onStop: (blobUrl, blob) => {
        // Pass the raw blob to the parent component's handler
        onStop(blob);
      }
    });

  return (
    <div>
      {/* 3. Use the disabled prop to control the buttons */}
      <p>Status: <strong>{status}</strong></p>
      <button onClick={startRecording} disabled={disabled}>Start Recording</button>
      <button onClick={stopRecording} disabled={disabled}>Stop Recording</button>

      {/* This local preview is optional but good for testing */}
      {mediaBlobUrl && (
        <div style={{ marginTop: '20px' }}>
          <h4>Preview:</h4>
          <audio src={mediaBlobUrl} controls />
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
