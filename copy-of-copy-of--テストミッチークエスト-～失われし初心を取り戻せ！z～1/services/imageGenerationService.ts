// services/imageGenerationService.ts

// Gemini APIは削除されたため、この関数は常にnullを返します。
// ボス画像は事前に用意されたものを使用する想定です。
export const generateBossImage = async (prompt: string): Promise<string | null> => {
  console.warn("画像生成機能 (Gemini API) は削除されました。プロンプト:", prompt);
  return null;
};