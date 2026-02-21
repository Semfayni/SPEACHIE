import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import Index from "./pages/Index";
import EducationPage from "./pages/EducationPage";
import TrainingPage from "./pages/TrainingPage";
import TrainingModulePage from "./pages/TrainingModulePage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import EducationGesticulationPage from "./pages/EducationGesticulationPage";
import EducationSpeechPage from "./pages/EducationSpeechPage";
import EducationDictionPage from "./pages/EducationDictionPage";
import TrainingDictionPage from "./pages/TrainingDictionPage";
import TrainingSpeechPage from "./pages/TrainingSpeechPage";
import TrainingInterviewPage from "./pages/TrainingInterviewPage";

const queryClient = new QueryClient();

const Layout = () => (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
);

const App = () => (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/education" element={<EducationPage />} />
                  <Route path="/training" element={<TrainingPage />} />
                  <Route path="/training/:moduleKey" element={<TrainingModulePage />} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                    <Route path="/education/gesticulation" element={<EducationGesticulationPage />} />
                    <Route path="/education/speech" element={<EducationSpeechPage />} />
                    <Route path="/education/diction" element={<EducationDictionPage />} />

                    <Route path="/training/diction" element={<TrainingDictionPage />} />
                    <Route path="/training/speech" element={<TrainingSpeechPage />} />
                    <Route path="/training/interview" element={<TrainingInterviewPage />} />
                </Route>

                <Route path="/auth" element={<AuthPage />} />
                <Route path="*" element={<NotFound />} />



              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
);

export default App;