import { BaseExecutor } from "./base.js";
import { PROVIDERS } from "../config/providers.js";

// Models that use /zen/v1/messages (claude format)
const V1_MESSAGES_MODELS = new Set(["big-pickle", "minimax-m2.5-free"]);
// Models that use /zen/go/v1/ endpoints
const GO_MODELS = new Set([
  "glm-5.1", "glm-5", "kimi-k2.5", "mimo-v2-pro", "mimo-v2-omni",
  "minimax-m2.7", "minimax-m2.5"
]);

export class OpenCodeExecutor extends BaseExecutor {
  constructor() {
    super("opencode", PROVIDERS.opencode);
  }

  buildUrl(model) {
    const base = "https://opencode.ai";
    if (GO_MODELS.has(model)) {
      return `${base}/zen/go/v1/chat/completions`;
    }
    return V1_MESSAGES_MODELS.has(model)
      ? `${base}/zen/v1/messages`
      : `${base}/zen/v1/chat/completions`;
  }

  buildHeaders(credentials, stream = true) {
    const apiKey = credentials?.apiKey || credentials?.accessToken;
    return {
      "Content-Type": "application/json",
      "Authorization": apiKey ? `Bearer ${apiKey}` : "Bearer public",
      "x-opencode-client": "desktop",
      ...(stream ? { "Accept": "text/event-stream" } : {})
    };
  }
}
