# Signal — Lead intelligence

A standalone lead qualification workspace built with Next.js, the AI SDK, and Zod. The lead scoring tool evaluates a lead's role seniority, company size, and buying intent, then returns a scorecard with evidence signals.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without an API key the app runs in a deterministic demo mode, so the complete tool lifecycle and scorecard work immediately. To use model-selected tool calls, copy `.env.example` to `.env.local`, set `OPENAI_API_KEY`, and restart the dev server.

## Tool contract

**Name:** `scoreLead`

**Input schema:** Zod object with:

- `name`: string, 2–80 characters
- `company`: string, 2–100 characters
- `jobTitle`: string, 2–100 characters
- `companySize`: `"1-50" | "51-200" | "201-1000" | "1000+"`
- `buyingIntent`: `"exploring" | "evaluating" | "ready"`

**Return shape:**

```ts
{
  score: number; // 0–100
  tier: "hot" | "warm" | "cool";
  summary: string;
  signals: Array<{
    label: string;
    detail: string;
    impact: "positive" | "neutral" | "negative";
  }>;
}
```

The shared schema and `execute` implementation live in [`lib/tools/score-lead.ts`](./lib/tools/score-lead.ts). The AI chat route is [`app/api/chat/route.ts`](./app/api/chat/route.ts). Tool inputs, streaming, successful outputs, and failures each have their own presentation in the chat.

## Failure checks

In development, use the **Failure check** menu below the chat to simulate an interrupted stream, an HTTP 429, or a malformed API response. These checks work with or without an `OPENAI_API_KEY`. Retry resends the exact failed user message, including its original lead details.

To check an offline send or a slow connection, use the browser's Network panel to switch offline or throttle requests before scoring a lead. The response skeleton appears while the request is waiting for its stream to begin.
