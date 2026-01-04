
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Transaction, ShopTask, Expense, Purchase } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const checkOnline = () => {
  if (!navigator.onLine) {
    const error = new Error("Offline: Neural connection to Gemini requires internet access.");
    error.name = "OfflineError";
    throw error;
  }
};

export const getStoreInsights = async (products: Product[], transactions: Transaction[], query: string) => {
  try {
    checkOnline();
    const model = 'gemini-3-flash-preview';
    
    const context = `
      You are a world-class strategic retail consultant for "GeminiPOS Pro". 
      Current Inventory: ${JSON.stringify(products.map(p => ({ 
        name: p.name, 
        stock: p.stock, 
        price: p.price, 
        costPrice: p.costPrice,
        category: p.category 
      })))}
      Recent Transactions (Total: ${transactions.length}): ${JSON.stringify(transactions.slice(-10).map(t => ({ 
        total: t.total, 
        itemsCount: t.items.length,
        timestamp: new Date(t.timestamp).toLocaleDateString() 
      })))}
      
      Instruction: Provide concise, data-driven, and highly actionable business advice. 
      Focus on Ghanaian market context if relevant (GHS currency).
      If asked for restocks, give specific quantities.
      If asked for discounts, give specific percentages.
      If asked for high-margin items, calculate (Price - Cost) to find them.

      User Query: ${query}
    `;

    const response = await ai.models.generateContent({
      model,
      contents: context,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });
    return response.text;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.name === "OfflineError" || !navigator.onLine) {
      return "OFFLINE_MODE: I'm currently unable to access my strategic engine while you're offline. Please connect to the internet for AI insights.";
    }
    return "I'm sorry, I couldn't process your request at the moment. Please check your network or API settings.";
  }
};

export const analyzeStockVisual = async (base64Image: string, products: Product[]) => {
  try {
    checkOnline();
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
          { text: `Identify this product from our inventory. Match it exactly if possible. Inventory: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, sku: p.sku })))}. Return ONLY the product ID or "NULL" if not found.` }
        ]
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Visual Analysis Error:", error);
    return "NULL";
  }
};

export const getProfitAnalysis = async (revenue: number, expenses: number, purchases: number, categories: any[]) => {
  try {
    checkOnline();
    const model = 'gemini-3-flash-preview';
    
    const prompt = `
      Perform a professional financial analysis for a retail shop in Ghana.
      Revenue: GH₵${revenue}
      Operational Expenses: GH₵${expenses}
      Inventory Purchases (COGS): GH₵${purchases}
      Category Performance: ${JSON.stringify(categories)}

      Provide a strategic briefing including:
      1. Overall financial health (Short summary)
      2. Expense-to-Revenue ratio analysis
      3. Three specific recommendations to improve net profit margin.
      
      Format the response as clear, professional markdown.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { temperature: 0.4 }
    });
    return response.text;
  } catch (error: any) {
    console.error("Profit Analysis Error:", error);
    if (error.name === "OfflineError" || !navigator.onLine) {
      return "OFFLINE_MODE: Neural analysis suspended. Connect to the internet to generate financial briefings.";
    }
    return "Analysis failed due to a processing error. Please try again later.";
  }
};

export const generateInventoryReport = async (products: Product[]) => {
  try {
    checkOnline();
    const model = 'gemini-3-flash-preview';
    
    const prompt = `Analyze this inventory and suggest restock levels, potential discounts for overstocked items, and high-value items to feature.
    Inventory: ${JSON.stringify(products)}`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            restockAlerts: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            marketingTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            summary: { type: Type.STRING }
          },
          required: ["restockAlerts", "marketingTips", "summary"]
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (error: any) {
    console.error("Gemini JSON Error:", error);
    if (error.name === "OfflineError" || !navigator.onLine) {
      throw error; // Rethrow to be caught by UI
    }
    return null;
  }
};

export const suggestDailyTasks = async (products: Product[], transactions: Transaction[]) => {
  try {
    checkOnline();
    const model = 'gemini-3-flash-preview';
    
    const prompt = `Based on the following inventory and sales data, generate 3 important operational tasks for a shop manager to complete today.
    Inventory: ${JSON.stringify(products.map(p => ({ name: p.name, stock: p.stock })))}
    Sales Count Today: ${transactions.length}
    
    Return the tasks as a JSON array of objects with title, description, and priority (high, medium, or low).`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING }
            },
            required: ["title", "description", "priority"]
          }
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (error: any) {
    console.error("Gemini Task Error:", error);
    if (error.name === "OfflineError" || !navigator.onLine) {
      throw error;
    }
    return [];
  }
};

export const generateProductImage = async (prompt: string, aspectRatio: "1:1" | "4:3" | "16:9" = "1:1") => {
  try {
    checkOnline();
    const model = 'gemini-2.5-flash-image';
    
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error: any) {
    console.error("Image Generation Error:", error);
    if (error.name === "OfflineError" || !navigator.onLine) {
      throw error;
    }
    throw error;
  }
};
