import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  safeValidateUIMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { scoreLeadInputSchema, scoreLeadTool } from "@/lib/tools/score-lead";

export const maxDuration = 30;

type ChatMessage = UIMessage;
const sabotageHeader = "x-demo-sabotage";

function getText(message: ChatMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}

function createDemoResponse(messages: ChatMessage[]) {
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");
  const text = latestUserMessage ? getText(latestUserMessage) : "";
  const prefix = "Score lead: ";

  if (!text.startsWith(prefix)) {
    return Response.json(
      { error: "In demo mode, submit a lead using the scoring form." },
      { status: 400 },
    );
  }

  let input: unknown;
  try {
    input = JSON.parse(text.slice(prefix.length));
  } catch {
    return Response.json({ error: "The lead details were not valid JSON." }, { status: 400 });
  }

  const parsed = scoreLeadInputSchema.safeParse(input);
  if (!parsed.success) {
    return Response.json({ error: "The submitted lead details were invalid." }, { status: 400 });
  }

  const toolCallId = generateId();
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({ type: "start" });
      writer.write({ type: "text-start", id: "demo-text" });
      writer.write({
        type: "text-delta",
        id: "demo-text",
        delta: "I’ve scored the lead against role seniority, company fit, and buying intent.",
      });
      writer.write({ type: "text-end", id: "demo-text" });
      writer.write({
        type: "tool-input-start",
        toolCallId,
        toolName: "scoreLead",
        title: "Scoring lead",
      });
      writer.write({
        type: "tool-input-delta",
        toolCallId,
        inputTextDelta: JSON.stringify(parsed.data),
      });
      await new Promise((resolve) => setTimeout(resolve, 220));
      writer.write({
        type: "tool-input-available",
        toolCallId,
        toolName: "scoreLead",
        input: parsed.data,
      });

      try {
        await new Promise((resolve) => setTimeout(resolve, 220));
        const output = await scoreLeadTool.execute!(parsed.data, {
          toolCallId,
          messages: [],
          abortSignal: new AbortController().signal,
        });
        writer.write({
          type: "tool-output-available",
          toolCallId,
          output,
        });
      } catch (error) {
        console.error("Lead scoring tool execution failed:", error);
        writer.write({
          type: "tool-output-error",
          toolCallId,
          errorText: "We couldn’t score this lead. Please check the details and try again.",
        });
      }

      writer.write({ type: "finish", finishReason: "stop" });
    },
  });

  return createUIMessageStreamResponse({ stream });
}

export async function POST(request: Request) {
  const sabotage = request.headers.get(sabotageHeader);
  if (process.env.NODE_ENV === "development" && sabotage === "rate-limit") {
    return Response.json(
      { error: "Signal is receiving too many requests. Please retry shortly." },
      { status: 429, headers: { "Retry-After": "5" } },
    );
  }

  if (process.env.NODE_ENV === "development" && sabotage === "malformed-json") {
    return new Response("{ malformed response", {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json({ error: "The request body must be valid JSON." }, { status: 400 });
    }
    throw error;
  }

  if (typeof body !== "object" || body === null || !("messages" in body)) {
    return Response.json({ error: "The request must include chat messages." }, { status: 400 });
  }

  const validation = await safeValidateUIMessages({ messages: body.messages });
  if (!validation.success) {
    return Response.json({ error: "The submitted chat messages were invalid." }, { status: 400 });
  }

  const messages = validation.data;
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
  if (!latestUserMessage || !getText(latestUserMessage).trim()) {
    return Response.json({ error: "Add lead details before asking Signal to score them." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    if (process.env.NODE_ENV === "development" && sabotage === "mid-stream") {
      const stream = createUIMessageStream<ChatMessage>({
        execute: async ({ writer }) => {
          writer.write({ type: "start" });
          writer.write({ type: "text-start", id: "interrupted-demo" });
          writer.write({
            type: "text-delta",
            id: "interrupted-demo",
            delta: "I’ve started reviewing this lead, but the response was interrupted.",
          });
          await new Promise((resolve) => setTimeout(resolve, 350));
          throw new Error("Development-only simulated stream interruption.");
        },
        onError: () => "The response was interrupted before scoring finished.",
      });

      return createUIMessageStreamResponse({ stream });
    }

    return createDemoResponse(messages);
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system:
      "You are Signal, a concise sales qualification assistant. When a user asks to score or prioritize a lead, call scoreLead with the provided details. Do not invent missing lead data; ask one concise follow-up question if needed. Explain the result in one short sentence.",
    messages: await convertToModelMessages(messages),
    tools: { scoreLead: scoreLeadTool },
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse({
    onError: () => "Signal couldn’t finish the response. Please retry the failed scoring request.",
  });
}
