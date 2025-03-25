# 1. Clone the project (if not already done)
git clone https://github.com/yourusername/jfkarena.git
cd jfkarena

# 2. Setup Frontend
cd frontend
npm install

# Edit .env file and add your NeonDB connection string
cp .env.example .env

# 3. Setup Backend
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt

# Edit .env file and add your AI model API keys
cp .env.example .env

# 4. Create JFK files directory
mkdir -p data/jfk_text

# Put your JFK-related text files in this directory