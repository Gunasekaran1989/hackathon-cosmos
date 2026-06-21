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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/trust" element={<Trust />} />
          <Route path="/guides/what-is-a-hackathon" element={<WhatIsAHackathon />} />
          <Route path="/guides/contact" element={<Contact />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/submit/success" element={<SubmitSuccess />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
