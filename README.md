# Zenith Bank AI-Powered Banking Platform

## Project Overview

A modern, AI-powered digital banking platform built for Zenith Bank that revolutionizes customer onboarding, account management, and financial services through conversational AI and intelligent automation.

### Key Features

#### 🏦 Multi-Bank Account Management
- **Zenith Bank Accounts**: Open Savings, Business, or Current accounts through AI-guided flows
- **External Bank Integration**: Connect OPay merchant accounts to view all finances in one place
- **Real-time Balance Sync**: Automatic balance updates with 5-minute caching
- **Multi-Account Support**: Manage multiple bank accounts from different providers

#### 🤖 AI-Powered Account Opening
Two intelligent onboarding paths:
1. **Quick Account Opening**: Chat-based interface with text/voice input for rapid account creation
2. **Swift Full Account Opening**: Real-time voice conversation using OpenAI Realtime API

Features include:
- AI intent recognition for account type determination
- Document scanning with OCR (NIN/ID verification)
- Automatic data extraction (Name, Gender, Address, NIN)
- Voice and text input support with TTS/STT capabilities

#### 💳 Virtual Card Services
- **AI Card Bot**: Conversational card request interface
- **Card Types**: Mastercard, Visa, Verve
- **Currency Options**: Naira (₦) or Dollar ($)
- **Account Categories**: Savings or Current
- **Instant Generation**: 16-digit card number, CVV, 3-year expiry
- **Privacy Controls**: Toggle card number visibility

#### 💰 Smart Loan Services
- **AI Loan Agent**: Natural language loan requests
- **Intelligent Eligibility**: Real-time analysis based on:
  - Account age and transaction history
  - Current balance and spending patterns
  - Income stability and financial behavior
- **Dynamic Approval**: Up to ₦5,000,000 with personalized interest rates
- **Flexible Terms**: 6-36 month repayment periods

#### 🔒 Security & Compliance
- Row-level security (RLS) policies on all tables
- Encrypted storage for external bank credentials
- Supabase authentication with auto-confirm email
- HMAC-SHA512 authentication for OPay API integration
- Secure edge functions for all sensitive operations

#### 🎨 Design System
- Zenith Bank branded (Red #DC143C theme)
- Multi-bank color coding (Red for Zenith, Green for OPay)
- Fully responsive design
- Dark/light mode support via semantic tokens
- Tailwind CSS with custom design tokens

### Technology Stack

**Frontend:**
- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn UI components
- React Router for navigation
- TanStack Query for data fetching

**Backend (Lovable Cloud/Supabase):**
- Supabase Database (PostgreSQL)
- Supabase Authentication
- Edge Functions (Deno runtime)
- Real-time subscriptions

**AI Integration:**
- OpenAI GPT-5 for chat agents
- OpenAI GPT-4.0 mini for intent recognition
- OpenAI Realtime API for voice conversations
- OpenAI Vision API for document OCR
- Text-to-Speech (TTS) and Speech-to-Text (STT)

### Database Schema

**Core Tables:**
- `profiles`: User profile information
- `bank_accounts`: Bank account records (Zenith + external)
- `external_bank_credentials`: Encrypted external bank credentials
- `bank_cards`: Virtual card records
- `loan_applications`: Loan request history
- `transactions`: Transaction history for all accounts

### Edge Functions

- `chat-agent`: Intent recognition for account opening
- `card-bot`: Card request intent extraction
- `loan-agent`: Loan eligibility analysis
- `opay-balance`: OPay balance sync via API
- `generate-account`: Account number generation
- `ocr-scanner`: Document data extraction
- `realtime-voice-agent`: Real-time voice conversation handling
- `stt-agent`: Speech-to-text conversion
- `tts-agent`: Text-to-speech conversion

## Project Info

**URL**: https://preview--oneclick-financial-ai.lovable.app/

