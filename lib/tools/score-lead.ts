import { tool } from "ai";
import { z } from "zod";

export const scoreLeadInputSchema = z.object({
  name: z.string().min(2).max(80).describe("The lead's full name."),
  company: z.string().min(2).max(100).describe("The lead's company."),
  jobTitle: z.string().min(2).max(100).describe("The lead's current job title."),
  companySize: z
    .enum(["1-50", "51-200", "201-1000", "1000+"])
    .describe("Approximate number of employees at the lead's company."),
  buyingIntent: z
    .enum(["exploring", "evaluating", "ready"])
    .describe("The lead's stated buying intent."),
});

export type ScoreLeadInput = z.infer<typeof scoreLeadInputSchema>;

export type LeadScore = {
  score: number;
  tier: "hot" | "warm" | "cool";
  summary: string;
  signals: Array<{
    label: string;
    detail: string;
    impact: "positive" | "neutral" | "negative";
  }>;
};

export function scoreLead(input: ScoreLeadInput): LeadScore {
  const signals: LeadScore["signals"] = [];
  let score = 35;
  const seniority = /\b(chief|ceo|cto|cfo|coo|cmo|vp|vice president|director|head)\b/i.test(
    input.jobTitle,
  );

  if (seniority) {
    score += 22;
    signals.push({
      label: "Decision-maker",
      detail: `${input.jobTitle} has influence over purchasing decisions.`,
      impact: "positive",
    });
  } else {
    score += 8;
    signals.push({
      label: "Team-level contact",
      detail: `${input.jobTitle} may help build internal consensus.`,
      impact: "neutral",
    });
  }

  if (input.companySize === "201-1000" || input.companySize === "1000+") {
    score += 14;
    signals.push({
      label: "Strong company fit",
      detail: `${input.companySize} employees matches the target account profile.`,
      impact: "positive",
    });
  } else if (input.companySize === "51-200") {
    score += 9;
    signals.push({
      label: "Good company fit",
      detail: "A growing team with room to scale.",
      impact: "positive",
    });
  } else {
    score += 3;
    signals.push({
      label: "Smaller account",
      detail: "A smaller team may have a lower near-term contract value.",
      impact: "neutral",
    });
  }

  const intentPoints = {
    exploring: 4,
    evaluating: 15,
    ready: 25,
  }[input.buyingIntent];
  score += intentPoints;
  signals.push({
    label: `Buying intent: ${input.buyingIntent}`,
    detail:
      input.buyingIntent === "ready"
        ? "The lead is ready to discuss a purchase."
        : input.buyingIntent === "evaluating"
          ? "The lead is actively comparing options."
          : "The lead is researching, with no immediate decision planned.",
    impact: input.buyingIntent === "exploring" ? "neutral" : "positive",
  });

  score = Math.min(score, 100);
  const tier = score >= 75 ? "hot" : score >= 55 ? "warm" : "cool";

  return {
    score,
    tier,
    summary:
      tier === "hot"
        ? `${input.name} at ${input.company} is showing strong sales readiness. Prioritize a personal follow-up.`
        : tier === "warm"
          ? `${input.name} at ${input.company} is a promising fit. A focused discovery conversation could move them forward.`
          : `${input.name} at ${input.company} is early in the journey. Keep them engaged with relevant resources.`,
    signals,
  };
}

export const scoreLeadTool = tool({
  description:
    "Score a sales lead using role seniority, company size, and buying intent. Use this when the user asks to prioritize or qualify a lead.",
  inputSchema: scoreLeadInputSchema,
  execute: async (input) => scoreLead(input),
});
