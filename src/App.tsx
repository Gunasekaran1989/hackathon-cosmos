import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Trust from "./pages/Trust.tsx";
import WhatIsAHackathon from "./pages/WhatIsAHackathon.tsx";
import Contact from "./pages/Contact.tsx";
import Submit from "./pages/Submit.tsx";
import SubmitSuccess from "./pages/SubmitSuccess.tsx";
import Auth from "./pages/Auth.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Profile from "./pages/Profile.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import MySubmissions from "./pages/MySubmissions.tsx";
import Hackathons from "./pages/Hackathons.tsx";
import PastHackathons from "./pages/PastHackathons.tsx";
import HackathonDetail from "./pages/HackathonDetail.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminHackathons from "./pages/admin/AdminHackathons.tsx";
import AdminHackathonEdit from "./pages/admin/AdminHackathonEdit.tsx";
import AdminSubmissions from "./pages/admin/AdminSubmissions.tsx";
import AdminSubmissionReview from "./pages/admin/AdminSubmissionReview.tsx";
import AdminBadges from "./pages/admin/AdminBadges.tsx";
import OAuthConsent from "./pages/OAuthConsent.tsx";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/hackathons" element={<Hackathons />} />
          <Route path="/hackathons/past" element={<PastHackathons />} />
          <Route path="/hackathon/:id" element={<HackathonDetail />} />
          <Route path="/trust" element={<Trust />} />
          <Route path="/guides/what-is-a-hackathon" element={<WhatIsAHackathon />} />
          <Route path="/guides/contact" element={<Contact />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/submit/success" element={<SubmitSuccess />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-submissions" element={<MySubmissions />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/hackathons" element={<AdminHackathons />} />
          <Route path="/admin/hackathons/:id/edit" element={<AdminHackathonEdit />} />
          <Route path="/admin/submissions" element={<AdminSubmissions />} />
          <Route path="/admin/submissions/:id" element={<AdminSubmissionReview />} />
          <Route path="/admin/badges" element={<AdminBadges />} />

          <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
