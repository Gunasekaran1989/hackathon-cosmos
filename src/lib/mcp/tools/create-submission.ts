import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "create_submission",
  title: "Submit a hackathon",
  description:
    "Create a new hackathon submission on behalf of the signed-in user. Enters the moderation queue with status 'pending'.",
  inputSchema: {
    event_name: z.string().trim().min(2).describe("Event title."),
    organizer: z.string().trim().min(1).describe("Organizing team or company."),
    email: z.string().email().describe("Contact email."),
    description: z.string().trim().optional(),
    website: z.string().url().optional(),
    location: z.string().trim().optional(),
    format: z.enum(["online", "in-person", "hybrid"]).optional(),
    prize_pool: z.string().trim().optional(),
    start_date: z.string().optional().describe("ISO date (YYYY-MM-DD)."),
    end_date: z.string().optional().describe("ISO date (YYYY-MM-DD)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
    const reference_id = `HV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const { data, error } = await supabase
      .from("hackathon_submissions")
      .insert({
        user_id: ctx.getUserId(),
        reference_id,
        status: "pending",
        ...input,
      })
      .select("id, reference_id, status")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Submission received. Reference ${data.reference_id}, status ${data.status}.` }],
      structuredContent: { submission: data },
    };
  },
});
