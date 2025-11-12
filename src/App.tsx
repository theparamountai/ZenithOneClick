import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import FloatingChatbox from "@/components/FloatingChatbox";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import DashboardPage from "./pages/DashboardPage";
import OnboardingChoice from "./pages/OnboardingChoice";
import QuickAccount from "./pages/QuickAccount";
import VoiceAccount from "./pages/VoiceAccount";
import DocumentScanner from "./pages/DocumentScanner";
import AccountConfirmation from "./pages/AccountConfirmation";
import BankAccountPage from "./pages/BankAccountPage";
import ApplyCreditCard from "./pages/ApplyCreditCard";
import ApplyCheckingAccount from "./pages/ApplyCheckingAccount";
import ApplyPersonalLoan from "./pages/ApplyPersonalLoan";
import CardRequest from "./pages/CardRequest";
import CardConfirmation from "./pages/CardConfirmation";
import MyCards from "./pages/MyCards";
import LoanHistory from "./pages/LoanHistory";
import LoanRequest from "./pages/LoanRequest";
import LoanConfirmation from "./pages/LoanConfirmation";
import TransactionHistory from "./pages/TransactionHistory";
import AddBankAccount from "./pages/AddBankAccount";
import ConnectOPay from "./pages/ConnectOPay";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <FloatingChatbox />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/onboarding-choice" element={<ProtectedRoute><OnboardingChoice /></ProtectedRoute>} />
          <Route path="/quick-account" element={<ProtectedRoute><QuickAccount /></ProtectedRoute>} />
          <Route path="/voice-account" element={<ProtectedRoute><VoiceAccount /></ProtectedRoute>} />
          <Route path="/document-scanner" element={<ProtectedRoute><DocumentScanner /></ProtectedRoute>} />
          <Route path="/account-confirmation" element={<ProtectedRoute><AccountConfirmation /></ProtectedRoute>} />
          <Route path="/bank-account/:accountNumber" element={<ProtectedRoute><BankAccountPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/apply/credit-card" element={<ProtectedRoute><ApplyCreditCard /></ProtectedRoute>} />
          <Route path="/apply/checking-account" element={<ProtectedRoute><ApplyCheckingAccount /></ProtectedRoute>} />
          <Route path="/apply/personal-loan" element={<ProtectedRoute><ApplyPersonalLoan /></ProtectedRoute>} />
          <Route path="/card-request" element={<ProtectedRoute><CardRequest /></ProtectedRoute>} />
          <Route path="/card-confirmation" element={<ProtectedRoute><CardConfirmation /></ProtectedRoute>} />
          <Route path="/my-cards" element={<ProtectedRoute><MyCards /></ProtectedRoute>} />
          <Route path="/loan-history/:accountNumber" element={<ProtectedRoute><LoanHistory /></ProtectedRoute>} />
          <Route path="/loan-request/:accountNumber" element={<ProtectedRoute><LoanRequest /></ProtectedRoute>} />
          <Route path="/loan-confirmation/:accountNumber" element={<ProtectedRoute><LoanConfirmation /></ProtectedRoute>} />
          <Route path="/transaction-history/:accountNumber" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
          <Route path="/add-bank-account" element={<ProtectedRoute><AddBankAccount /></ProtectedRoute>} />
          <Route path="/connect-opay" element={<ProtectedRoute><ConnectOPay /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
