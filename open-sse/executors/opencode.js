import { BaseExecutor } from "./base.js";
import { PROVIDERS } from "../config/providers.js";

// Models that use /zen/v1/messages (claude format)
const V1_MESSAGES_MODELS = new Set(["big-pickle", "minimax-m2.5-free"]);
// Go models that use /zen/go/v1/chat/completions (openai format)
const GO_CHAT_MODELS = new Set([
  "glm-5.1", "glm-5", "kimi-k2.5", "mimo-v2-pro", "mimo-v2-omni"
]);
// Go models that use /zen/go/v1/messages (anthropic format)
const GO_ANTHROPIC_MODELS = new Set(["minimax-m2.7", "minimax-m2.5"]);

export class OpenCodeExecutor extends BaseExecutor {
  constructor() {
    super("opencode", PROVIDERS.opencode);
  }

  buildUrl(model) {
    const base = "https://opencode.ai";
    if (GO_ANTHROPIC_MODELS.has(model)) {
      return `${base}/zen/go/v1/messages`;
    }
    if (GO_CHAT_MODELS.has(model)) {
      return `${base}/zen/go/v1/chat/completions`;
    }
    return V1_MESSAGES_MODELS.has(model)
      ? `${base}/zen/v1/messages`
      : `${base}/zen/v1/chat/completions`;
  }

  buildHeaders(credentials, stream = true) {
    const apiKey = credentials?.apiKey || credentials?.accessToken;
    const isAnthropicFormat = credentials?.model && GO_ANTHROPIC_MODELS.has(credentials.model);
    const headers = {
      "Content-Type": "application/json",
      "x-opencode-client": "desktop",
      ...(stream ? { "Accept": "text/event-stream" } : {})
    };

    if (apiKey) {
      if (isAnthropicFormat) {
        headers["x-api-key"] = apiKey;
        headers["anthropic-version"] = "2023-06-01";
      } else {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }
    } else {
      headers["Authorization"] = "Bearer public";
    }

    return headers;
  }

  async execute({ model, body, stream, credentials, signal, log, proxyOptions = null }) {
    const credentialsWithModel = { ...credentials, model };
    return super.execute({ model, body, stream, credentials: credentialsWithModel, signal, log, proxyOptions });
  }
}
