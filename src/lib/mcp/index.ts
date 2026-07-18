import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listHackathons from "./tools/list-hackathons";
import getHackathon from "./tools/get-hackathon";
import listMySubmissions from "./tools/list-my-submissions";
import createSubmission from "./tools/create-submission";
import getMyProfile from "./tools/get-my-profile";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "hackverse-mcp",
  title: "Hackverse",
  version: "0.1.0",
  instructions:
    "Tools for Hackverse, a global hackathon discovery platform. Browse approved hackathons, view details, and (as the signed-in user) list your own submissions, submit new events, or read your profile.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listHackathons, getHackathon, listMySubmissions, createSubmission, getMyProfile],
});
