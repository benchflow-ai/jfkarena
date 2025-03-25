# JFK Arena

A platform for comparing different AI models' responses to questions about JFK using RAG (Retrieval Augmented Generation).

## Features

- Battle interface where users can compare two different AI models' responses to JFK-related questions
- Leaderboard showing model performance based on user votes
- Support for multiple AI models (GPT-4, Claude 3, Gemini Pro, DeepSeek)
- RAG-based context retrieval from JFK documents

## Prerequisites

- Node.js 18+
- Python 3.8+
- NeonDB account
- API keys for the AI models you want to use

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/jfkarena.git
cd jfkarena
```

2. Set up the frontend:
```bash
cd frontend
npm install
```

3. Set up the backend:
```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. Configure environment variables:
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Fill in your API keys and database URL

5. Set up the database:
   - Create a new project in NeonDB
   - Get your database connection string
   - Update the `DATABASE_URL` in your frontend `.env` file

6. Add JFK documents:
   - Create a `jfk_files` directory in the backend folder
   - Add your JFK-related text files to this directory

## Running the Application

1. Start the backend server:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
jfkarena/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # Next.js app router
│   │   ├── components/      # React components
│   │   └── lib/             # Utility functions and configurations
│   └── package.json
├── backend/                  # FastAPI backend
│   ├── main.py              # Main FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── jfk_files/          # JFK documents for RAG
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 