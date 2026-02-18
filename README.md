<div align="center">

# CliniSense

### AI-Powered Clinical Decision Support System

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

*Real-time clinical consultation assistant with live transcription, AI insights, and SOAP note generation*

[Live Demo](https://clinisenseai.com) · [Report Bug](https://github.com/issues) · [Request Feature](https://github.com/issues)

</div>

---

## Overview

CliniSense is a comprehensive clinical decision support system designed to assist healthcare providers during patient consultations. It combines real-time audio transcription, AI-powered clinical insights, and structured documentation to streamline the clinical workflow.

**Important Disclaimer**: CliniSense is a support tool only. It does not provide diagnoses or replace clinical judgment. All AI-generated content must be reviewed and validated by a licensed healthcare provider.

## Key Features

### Real-Time Consultation
- **Live Audio Transcription** - Powered by Deepgram for accurate, real-time speech-to-text
- **AI Follow-up Suggestions** - Contextual questions based on the ongoing conversation
- **Safety Alerts** - Red flag detection for critical symptoms
- **Entity Extraction** - Automatic identification of symptoms, conditions, and medications

### Clinical Documentation
- **SOAP Note Generation** - AI-assisted Subjective, Objective, Assessment, Plan notes
- **EHR Export** - FHIR-compliant export with PDF download
- **Transcript Management** - Full consultation transcript with timestamps

### Lab Analysis
- **CSV Import/Export** - Bulk lab data import with automatic reference range matching
- **AI Lab Insights** - Pattern recognition and clinical correlations
- **Safety Checklist** - Automated prompts for abnormal values

### Discharge & Handoff
- **Patient Instructions** - Plain-language discharge summaries (5th-grade reading level)
- **Clinician Handoff** - Structured SBAR-style handoff notes
- **PDF Generation** - Hospital-formatted documents ready for printing

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library with concurrent features |
| **TypeScript 5** | Type-safe development |
| **Tailwind CSS 4** | Utility-first styling |
| **shadcn/ui** | Accessible component library |
| **Recharts** | Data visualization |
| **Lucide React** | Icon library |

### Backend & APIs
| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | Serverless API endpoints |
| **Vercel AI SDK 6** | AI model integration |
| **OpenAI GPT-4o** | Clinical insights generation |
| **Deepgram** | Real-time audio transcription |
| **NextAuth.js 4** | Authentication |

### Database
| Technology | Purpose |
|------------|---------|
| **Neon** | Serverless PostgreSQL |
| **@neondatabase/serverless** | Database client |

### Infrastructure
| Service | Purpose |
|---------|---------|
| **Vercel** | Hosting & deployment |
| **Vercel AI Gateway** | AI model routing |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│  Landing Page  │  Dashboard  │  Consultation  │  Labs  │ Discharge│
└────────┬────────────────┬───────────────┬──────────┬─────────────┘
         │                │               │          │
         ▼                ▼               ▼          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Routes (/api)                           │
├──────────┬──────────┬───────────┬──────────┬───────────────────┤
│ /auth/*  │ /ai/*    │ /deepgram │ /labs/*  │ /discharge/*      │
└────┬─────┴────┬─────┴─────┬─────┴────┬─────┴─────────┬─────────┘
     │          │           │          │               │
     ▼          ▼           ▼          ▼               ▼
┌─────────┐ ┌────────┐ ┌─────────┐ ┌───────────────────────────────┐
│NextAuth │ │OpenAI  │ │Deepgram │ │          Neon PostgreSQL       │
│         │ │GPT-4o  │ │  STT    │ │  ┌──────────────────────────┐  │
└─────────┘ └────────┘ └─────────┘ │  │ consultations            │  │
                                   │  │ transcript_entries       │  │
                                   │  │ ai_events                │  │
                                   │  │ soap_notes               │  │
                                   │  │ lab_results              │  │
                                   │  │ lab_ai_insights          │  │
                                   │  │ discharge_instructions   │  │
                                   │  │ clinician_handoffs       │  │
                                   │  └──────────────────────────┘  │
                                   └───────────────────────────────┘
```

## Database Schema

### Core Tables
- **users** - Authentication and user profiles
- **consultations** - Consultation sessions with status tracking
- **transcript_entries** - Real-time transcription data
- **ai_events** - AI-generated insights (follow-ups, red flags, entities)
- **soap_notes** - SOAP documentation

### Lab Module
- **lab_results** - Individual lab test results with flags
- **lab_ai_insights** - AI analysis of lab patterns
- **lab_safety_checklist** - Safety verification items

### Discharge Module
- **discharge_instructions** - Patient-facing discharge notes
- **clinician_handoffs** - SBAR handoff documentation
- **discharge_checklist** - Discharge verification items

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Neon database account
- Deepgram API key
- OpenAI API key (or Vercel AI Gateway)

### Environment Variables

Create a `.env.local` file:

```env
# Database (Neon)
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# AI Services
OPENAI_API_KEY=sk-...  # Or use Vercel AI Gateway

# Deepgram (Speech-to-Text)
DEEPGRAM_API_KEY=your-deepgram-key
```

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/clinisense.git
cd clinisense

# Install dependencies
pnpm install

# Run database migrations
# Execute SQL scripts in order:
# scripts/001-create-schema.sql
# scripts/002-create-auth-users.sql
# scripts/003-create-labs-schema.sql
# scripts/004-create-discharge-schema.sql

# Start development server
pnpm dev
```

### Database Setup

Run the SQL migration scripts in order:

```bash
# 1. Core schema (consultations, transcripts, AI events)
psql $DATABASE_URL -f scripts/001-create-schema.sql

# 2. Authentication tables
psql $DATABASE_URL -f scripts/002-create-auth-users.sql

# 3. Lab analysis module
psql $DATABASE_URL -f scripts/003-create-labs-schema.sql

# 4. Discharge & handoff module
psql $DATABASE_URL -f scripts/004-create-discharge-schema.sql
```

## Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── ai/                 # AI analysis endpoints
│   │   ├── auth/               # NextAuth configuration
│   │   ├── deepgram/           # Speech-to-text token
│   │   ├── discharge/          # Discharge documentation
│   │   └── labs/               # Lab analysis
│   ├── consultation/[id]/      # Consultation pages
│   │   ├── labs/               # Lab analysis view
│   │   ├── summary/            # SOAP notes & export
│   │   └── discharge/          # Discharge & handoff
│   ├── dashboard/              # Main dashboard
│   └── login/                  # Authentication
├── components/
│   ├── consultation/           # Live consultation UI
│   ├── dashboard/              # Dashboard components
│   ├── discharge/              # Discharge module
│   ├── labs/                   # Lab analysis UI
│   ├── summary/                # Summary & SOAP notes
│   └── ui/                     # shadcn/ui components
├── hooks/                      # Custom React hooks
│   ├── use-ai-insights.ts      # AI insight management
│   ├── use-audio-recording.ts  # Microphone control
│   └── use-deepgram-streaming.ts # Real-time transcription
├── lib/
│   ├── auth.ts                 # NextAuth configuration
│   ├── db.ts                   # Database client & types
│   └── utils.ts                # Utility functions
└── scripts/                    # SQL migrations
```

## API Endpoints

### AI Analysis
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/analyze` | POST | Generate follow-up questions and safety alerts |
| `/api/ai/generate-soap` | POST | Generate SOAP note from transcript |

### Labs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/labs/results` | GET/POST | Fetch/save lab results |
| `/api/labs/analyze` | POST | AI analysis of lab values |
| `/api/labs/checklist` | POST | Update safety checklist |

### Discharge
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/discharge/generate-patient-instructions` | POST | Generate patient-facing instructions |
| `/api/discharge/generate-clinician-handoff` | POST | Generate SBAR handoff note |
| `/api/discharge/checklist` | POST | Update discharge checklist |

## Clinical Workflow

```
1. Start Consultation
   └── Real-time audio transcription
   └── AI generates follow-up questions
   └── Safety alerts for red flags
   
2. End Consultation
   └── AI processing animation
   └── View summary with key findings
   
3. SOAP Note Generation
   └── AI-generated structured note
   └── Clinician review & edit
   └── Export to EHR (FHIR/PDF)
   
4. Lab Analysis (Optional)
   └── Import CSV or manual entry
   └── AI pattern recognition
   └── Safety checklist verification
   
5. Discharge & Handoff
   └── Patient instructions (plain language)
   └── Clinician handoff (SBAR format)
   └── PDF download for records
```

## Safety & Compliance

- **Clinician-in-the-Loop**: All AI outputs require clinician review
- **Non-Diagnostic Disclaimers**: Clear messaging that AI does not diagnose
- **Red Flag Alerts**: Automatic detection of critical symptoms
- **Audit Trail**: Full transcript and AI event logging
- **HIPAA Considerations**: No PHI stored in logs; database encrypted at rest

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Deepgram](https://deepgram.com) for real-time speech recognition
- [Vercel](https://vercel.com) for hosting and AI Gateway
- [Neon](https://neon.tech) for serverless PostgreSQL
- [shadcn/ui](https://ui.shadcn.com) for the component library

---

<div align="center">

**Built with care for healthcare providers**

[Report Issues](https://github.com/issues) · [Request Features](https://github.com/issues)

</div>
