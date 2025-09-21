/**
 * SIMULATED: Sends an audio blob for transcription.
 * @param {Blob} audioBlob - The audio data to transcribe.
 * @returns {Promise<string>} A fake transcribed text.
 */
export const transcribeAudio = async (audioBlob) => {
  console.log('Simulating audio transcription for:', audioBlob);
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 1500)); 
  // Return a hardcoded successful response
  return "This is a test transcription from the recorded audio.";
};

/**
 * SIMULATED: Sends text for translation.
 * @param {string} text - The text to translate.
 * @param {string} targetLanguage - The language to translate to.
 * @returns {Promise<string>} A fake translated text.
 */
export const translateText = async (text, targetLanguage) => {
  console.log(`Simulating translation for: "${text}" to language: ${targetLanguage}`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return "Esta es una transcripción de prueba del audio grabado.";
};

/**
 * SIMULATED: Sends text to be converted to speech.
 * @param {string} text - The text to convert.
 * @param {string} language - The language of the text.
 * @returns {Promise<string>} A URL to a placeholder audio file.
 */
export const textToSpeech = async (text, language) => {
  console.log(`Simulating text-to-speech for: "${text}" in language: ${language}`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  // In a real app, you would get a blob back. For now, we can't easily create a fake audio blob.
  // This will return an empty string, preventing an error in the audio player.
  // You can replace this with a URL to any sample mp3 online for testing.
  // Example: return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
  return ""; 
};

