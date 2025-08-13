import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AuthListener from "./components/AuthListener";
import ProtectedRoute from "./components/ProtectedRoute";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Add from "./pages/Add";
import Symptoms from "./pages/Symptoms";
import Medications from "./pages/Medications";
import Calendar from "./pages/Calendar";
import Insights from "./pages/Insights";
import Vitals from "./pages/Vitals";
import Water from "./pages/Water";
import Activity from "./pages/Activity";
import Nutrition from "./pages/Nutrition";
import Devices from "./pages/Devices";
import SymptomDetail from "./pages/SymptomDetail";
import SymptomRecommendations from "./pages/SymptomRecommendations";
import NewUserOnboarding from "./pages/NewUserOnboarding";
import BookAppointment from "./pages/BookAppointment";
import BookAppointmentLanding from "./pages/BookAppointmentLanding";
import ReportLanding from "./pages/ReportLanding";
import ExportReport from "./pages/ExportReport";
import AddRecord from "./pages/AddRecord";
import ManualDataEntry from "./pages/ManualDataEntry";
import StepsInput from "./pages/StepsInput";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AuthListener />
          <TooltipProvider>
            <div className="min-h-screen w-full bg-gray-50 overflow-x-hidden">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/new-user-onboarding" element={<NewUserOnboarding />} />

                {/* Protected routes with Navigation */}
                <Route
                  path="*"
                  element={
                    <>
                      <ProtectedRoute>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/add" element={<Add />} />
                          <Route path="/symptoms" element={<Symptoms />} />
                          <Route path="/medications" element={<Medications />} />
                          <Route path="/calendar" element={<Calendar />} />
                          <Route path="/insights" element={<Insights />} />
                          <Route path="/vitals" element={<Vitals />} />
                          <Route path="/water" element={<Water />} />
                          <Route path="/activity" element={<Activity />} />
                          <Route path="/nutrition" element={<Nutrition />} />
                          <Route path="/devices" element={<Devices />} />
                          <Route path="/symptom/:id" element={<SymptomDetail />} />
                          <Route path="/symptom-recommendations" element={<SymptomRecommendations />} />
                          <Route path="/book-appointment" element={<BookAppointment />} />
                          <Route path="/book-appointment-landing" element={<BookAppointmentLanding />} />
                          <Route path="/report-landing" element={<ReportLanding />} />
                          <Route path="/export-report" element={<ExportReport />} />
                          <Route path="/add-record" element={<AddRecord />} />
                          <Route path="/manual-data-entry" element={<ManualDataEntry />} />
                          <Route path="/steps-input" element={<StepsInput />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                        <Navigation />
                      </ProtectedRoute>
                    </>
                  }
                />
              </Routes>
              <Toaster />
            </div>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
