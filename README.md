# JFK Arena

A platform for comparing different AI models' responses to questions about JFK using RAG (Retrieval Augmented Generation). The platform enables users to evaluate and compare how different AI models interpret and respond to questions about historical events related to JFK.

## Features

- Interactive battle interface for comparing two AI models' responses to JFK-related questions
- Real-time voting system for response evaluation
- Dynamic leaderboard tracking model performance
- Support for multiple AI models including:
  - GPT-4
  - Claude 3
  - Gemini Pro
  - DeepSeek
- Advanced RAG system using JFK historical documents
- Modern, responsive UI built with Next.js and Tailwind CSS
- Real-time data updates using PostgreSQL

## Tech Stack

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Radix UI Components
- Framer Motion
- DrizzleORM

### Backend
- FastAPI
- LangChain
- FAISS for vector search
- PostgreSQL
- SQLAlchemy
- Python 3.8+

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL database
- API keys for supported AI models

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/jfkarena.git
cd jfkarena
```

2. Frontend setup:
```bash
cd frontend
cp .env.example .env
npm install
```

3. Backend setup:
```bash
cd backend
cp .env.example .env
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. Environment Configuration:

Frontend (.env):
```
NEXT_PUBLIC_API_URL=your_backend_url
DATABASE_URL=your_database_url
```

Backend (.env):
```
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key
DATABASE_URL=your_database_url
```

## Development

1. Start the backend server:
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
jfkarena/
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js app router pages
│   │   ├── components/   # Reusable React components
│   │   └── lib/         # Utilities and configurations
│   ├── public/          # Static assets
│   └── package.json
├── backend/
│   ├── main.py          # FastAPI application
│   ├── requirements.txt
│   └── cache/          # Vector store cache
└── README.md
```

## Deployment

The project is configured for deployment with:
- Frontend: Vercel
- Backend: Fly.io
- Database: NeonDB

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 