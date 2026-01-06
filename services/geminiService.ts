import { GoogleGenAI } from "@google/genai";
import { DailyLog } from "../types";

// In a real app, never expose keys in client-side code without proxies.
// For this demo, we assume the environment variable is set or the user will input it if we built an input UI.
// Since we can't ask user for input in this specific flow, we check environment.
const apiKey = process.env.API_KEY || ''; 

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
    aiClient = new GoogleGenAI({ apiKey });
}

export const generateHealthInsight = async (log: DailyLog): Promise<string> => {
  if (!apiKey || !aiClient) {
    return "Configure sua API KEY do Google Gemini para receber insights personalizados sobre sua saúde.";
  }

  const prompt = `
    Atue como um treinador pessoal e nutricionista de classe mundial. Analise os dados do meu dia e me dê um feedback curto, motivador e útil (máximo 3 frases) em Português.
    
    Dados do dia (${log.date}):
    - Peso: ${log.weight ? log.weight + 'kg' : 'Não registrado'}
    - Água: ${log.waterMl}ml
    - Correu: ${log.didRun ? 'Sim (' + log.runCalories + ' cal)' : 'Não'}
    - Academia: ${log.didGym ? 'Sim (' + log.gymCalories + ' cal)' : 'Não'}
    - Refeições na dieta: ${Object.entries(log.meals).filter(([_, v]) => v).length} de 6 refeições planejadas.
    
    Se eu não bati a meta de água (2500ml), me lembre. Se treinei, me parabenize.
  `;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Não foi possível gerar um insight no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erro ao conectar com o treinador virtual. Verifique sua conexão.";
  }
};