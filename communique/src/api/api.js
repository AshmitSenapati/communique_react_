// The base URL of your Flask API
const API_URL = "http://127.0.0.1:5000";

/**
 * Transcribes audio by sending it to the backend.
 * @param {Blob} audioBlob The audio data to transcribe.
 * @returns {Promise<string>} The transcribed text.
 */
export const transcribeAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.wav");

  const response = await fetch(`${API_URL}/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to transcribe audio.");
  }

  const data = await response.json();
  return data.text;
};

/**
 * Translates text and gets the text-to-speech audio URL.
 * @param {string} text The text to translate.
 * @param {string} targetLanguage The language code (e.g., 'es').
 * @returns {Promise<{translatedText: string, audioUrl: string}>}
 */
export const translateAndGetSpeech = async (text, targetLanguage) => {
  const formData = new FormData();
  formData.append("text", text);
  formData.append("lang", targetLanguage);

  const response = await fetch(`${API_URL}/translate_tts`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to translate or generate audio.");
  }
  
  const data = await response.json();
  // We construct the full URL for the audio file
  return { ...data, audioUrl: `${API_URL}${data.audioUrl}` };
};