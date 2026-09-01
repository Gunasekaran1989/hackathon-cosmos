import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_hackathons",
  title: "List hackathons",
  description:
    "List approved, publicly listed hackathons on Hackverse. Defaults to active/upcoming events; optionally include past events. Supports text search and a result limit.",
  inputSchema: {
    query: z
      .string()
      .trim()
      .optional()
      .describe("Optional case-insensitive substring to match against title, organizer, or country."),
    limit: z.number().int().min(1).max(50).optional().describe("Max rows to return. Default 20."),
    include_past: z
      .boolean()
      .optional()
      .describe("If true, include hackathons whose end_date has already passed. Default false."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit, include_past }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const today = new Date().toISOString().slice(0, 10);
    let q = supabase
      .from("hackathons")
      .select("id, title, organizer, country, city, mode, start_date, end_date, prize_pool, registration_url, tags, featured, status")
      .eq("status", "approved")
      .order("start_date", { ascending: true })
      .limit(limit ?? 20);
    if (!include_past) {
      q = q.or(`end_date.gte.${today},end_date.is.null`);
    }
    if (query) {
      const like = `%${query}%`;
      q = q.or(`title.ilike.${like},organizer.ilike.${like},country.ilike.${like}`);
    }
    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { hackathons: data ?? [] },
    };
  },
});
