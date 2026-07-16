import { Provider } from './provider.interface';

export enum AiProviderType {
  OPENAI = 'openai',
  GEMINI = 'gemini',
  CLAUDE = 'claude',
  OPENROUTER = 'openrouter',
  DEEPSEEK = 'deepseek',
  OLLAMA = 'ollama',
}

export interface AiCompletionRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiCompletionResult {
  text: string;
  model: string;
  tokensUsed?: number;
}

/**
 * Interface only. AI stays fully optional — see AiConfig (ai.enabled,
 * defaults false). No OpenAI/Gemini/Claude/OpenRouter/DeepSeek/Ollama
 * implementation exists yet.
 */
export interface AiProvider extends Provider {
  generateCompletion(request: AiCompletionRequest): Promise<AiCompletionResult>;
}
