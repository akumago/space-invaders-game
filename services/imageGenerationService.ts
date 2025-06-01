// services/imageGenerationService.ts

// Dynamic import for GoogleGenAI
type GoogleGenAIModule = typeof import('@google/genai');

let GoogleGenAI: GoogleGenAIModule['GoogleGenAI'] | null = null;

const getApiKey = (): string | undefined => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  return undefined;
};

export const generateBossImage = async (prompt: string): Promise<string | null> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("APIキーが設定されていません。画像生成はスキップされます。");
    return null;
  }

  try {
    if (!GoogleGenAI) {
      const genAIModule = await import('@google/genai') as GoogleGenAIModule;
      GoogleGenAI = genAIModule.GoogleGenAI;
    }

    if (!GoogleGenAI) {
      console.error("GoogleGenAI SDKの読み込みに失敗しました。");
      return null;
    }
    
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002', // Use the specified image generation model
        prompt: prompt,
        config: {numberOfImages: 1, outputMimeType: 'image/jpeg'},
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      console.warn("画像生成に成功しましたが、画像データがありません。", response);
      return null;
    }
  } catch (error) {
    console.error("Gemini APIによる画像生成に失敗しました:", error);
    return null;
  }
};
