import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { scoreLeadInputSchema, scoreLeadTool } from "@/lib/tools/score-lead";

export const maxDuration = 30;

type ChatMessage = UIMessage;

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
  const body: { messages?: ChatMessage[] } = await request.json();
  const messages = body.messages ?? [];

  if (!process.env.OPENAI_API_KEY) {
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

  return result.toUIMessageStreamResponse();
}
