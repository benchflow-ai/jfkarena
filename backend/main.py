from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Literal, Optional
import os
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader
import httpx
import json
from sqlalchemy import create_engine, Column, Integer, String, Float, MetaData, Table, select, func, ForeignKey, inspect
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import text

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize battle statistics
battle_stats: Dict[str, dict] = {}

# ELO rating constant
K_FACTOR = 32

# Initialize RAG components
try:
    # Setup paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    cache_dir = os.path.join(base_dir, "cache")
    cache_path = os.path.join(cache_dir, "faiss_store")
    data_dir = os.path.join(os.path.dirname(base_dir), "data", "jfk_text")
    
    print(f"Cache path: {cache_path}")
    print(f"Data directory: {data_dir}")
    
    if os.path.exists(cache_path):
        print("Loading vector store from cache...")
        try:
            embeddings = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))
            vectorstore = FAISS.load_local(cache_path, embeddings)
            print("Successfully loaded vector store from cache!")
        except Exception as e:
            print(f"Failed to load from cache: {str(e)}")
            print("Will attempt to recreate vector store...")
            os.remove(cache_path)  # Remove corrupted cache
            raise  # Trigger the recreation logic
    
    if not os.path.exists(cache_path):
        # If cache doesn't exist or failed to load, create new vector store
        print("Creating new vector store...")
        if not os.path.exists(data_dir):
            raise FileNotFoundError(f"Data directory not found: {data_dir}")
            
        loader = DirectoryLoader(data_dir, glob="**/*.txt", show_progress=True)
        print(f"Loading documents from {data_dir}...")
        documents = loader.load()
        print(f"Loaded {len(documents)} documents")
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        print("Splitting documents into chunks...")
        texts = text_splitter.split_documents(documents)
        print(f"Created {len(texts)} text chunks")
        
        print("Initializing embeddings and vector store...")
        embeddings = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))
        vectorstore = FAISS.from_documents(texts, embeddings)
        
        # Save to cache
        os.makedirs(cache_dir, exist_ok=True)
        vectorstore.save_local(cache_path)
        print("Successfully created and cached vector store!")

except Exception as e:
    print(f"Warning: Failed to initialize RAG components: {str(e)}")
    print("Please ensure the data/jfk_text directory exists and contains .txt files")
    vectorstore = None

# 数据库连接
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise Exception("DATABASE_URL environment variable is not set")

print(f"Connecting to database: {DATABASE_URL}")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建数据库表
metadata = MetaData()

models = Table(
    "models",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("model_id", String, unique=True),
    Column("name", String),
    Column("wins", Integer, default=0),
    Column("losses", Integer, default=0),
    Column("draws", Integer, default=0),
    Column("invalid", Integer, default=0),
    Column("elo", Float, default=1500.0),
)

battles = Table(
    "battles",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("model1_id", Integer, ForeignKey("models.id", ondelete="CASCADE")),
    Column("model2_id", Integer, ForeignKey("models.id", ondelete="CASCADE")),
    Column("winner_id", Integer, ForeignKey("models.id", ondelete="CASCADE")),
    Column("question", String),
    Column("response1", String),
    Column("response2", String)
)

# 支持的模型列表
SUPPORTED_MODELS = [
    {"id": "openai/gpt-4-turbo-preview", "name": "GPT-4 Turbo"},
    {"id": "openai/gpt-4", "name": "GPT-4"},
    {"id": "openai/gpt-3.5-turbo", "name": "GPT-3.5 Turbo"},
    {"id": "google/gemini-2.0-flash-001", "name": "Gemini 2.0 Flash"},
    {"id": "google/learnlm-1.5-pro-experimental:free", "name": "Gemini 1.5 Pro"},
    {"id": "anthropic/claude-3-opus-20240229", "name": "Claude 3 Opus"},
    {"id": "anthropic/claude-3-sonnet-20240229", "name": "Claude 3 Sonnet"},
    {"id": "anthropic/claude-2", "name": "Claude 2"},
    {"id": "google/gemini-pro", "name": "Gemini Pro"},
    {"id": "meta-llama/llama-2-70b-chat", "name": "Llama 2 70B"},
    {"id": "meta-llama/llama-2-13b-chat", "name": "Llama 2 13B"},
    {"id": "mistral/mixtral-8x7b", "name": "Mixtral 8x7B"},
    {"id": "mistral/mistral-medium", "name": "Mistral Medium"},
    {"id": "mistral/mistral-small", "name": "Mistral Small"},
    {"id": "deepseek/deepseek-chat-v3-0324:free", "name": "DeepSeek v3 0324"},
    {"id": "deepseek/deepseek-r1:free", "name": "DeepSeek r1"},
    {"id": "deepseek/deepseek-coder", "name": "DeepSeek Coder"},
    {"id": "deepseek/deepseek-chat", "name": "DeepSeek Chat"}
]

# 测试数据库连接
def test_db_connection():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Successfully connected to the database!")
        return True
    except Exception as e:
        print(f"Error connecting to the database: {str(e)}")
        return False

# 检查表是否存在
def check_tables_exist():
    inspector = inspect(engine)
    return "models" in inspector.get_table_names() and "battles" in inspector.get_table_names()

# 初始化数据库中的模型
def init_models():
    with SessionLocal() as db:
        for model in SUPPORTED_MODELS:
            # 检查模型是否已存在
            result = db.execute(
                select(models).where(models.c.model_id == model["id"])
            ).first()
            if not result:
                # 如果模型不存在，则添加
                db.execute(
                    models.insert().values(
                        model_id=model["id"],
                        name=model["name"],
                        wins=0,
                        losses=0,
                        draws=0,
                        invalid=0,
                        elo=1500.0
                    )
                )
        db.commit()

# 初始化数据库
def initialize_database():
    try:
        if not check_tables_exist():
            print("Tables do not exist. Creating tables...")
            metadata.create_all(bind=engine)
            print("Tables created successfully!")
            init_models()
            print("Models initialized successfully!")
        else:
            print("Tables already exist. Skipping initialization.")
        return True
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        return False

# 启动时测试连接并初始化数据库（如果需要）
if test_db_connection():
    initialize_database()
else:
    raise Exception("Failed to connect to the database")

def update_elo(winner_elo: float, loser_elo: float) -> tuple[float, float]:
    expected_winner = 1 / (1 + 10 ** ((loser_elo - winner_elo) / 400))
    expected_loser = 1 - expected_winner
    
    new_winner_elo = winner_elo + K_FACTOR * (1 - expected_winner)
    new_loser_elo = loser_elo + K_FACTOR * (0 - expected_loser)
    
    return new_winner_elo, new_loser_elo

class BattleRequest(BaseModel):
    model1: str
    model2: str
    question: str

class VoteRequest(BaseModel):
    result: str  # "model1", "model2", "draw", "invalid"
    model1: str
    model2: str
    question: str

def get_relevant_context(question: str) -> str:
    if vectorstore is None:
        return ""
    try:
        docs = vectorstore.similarity_search(question, k=3)
        return "\n".join([doc.page_content for doc in docs])
    except Exception as e:
        print(f"Error getting context: {str(e)}")
        return ""

async def get_model_response(client: httpx.AsyncClient, model_id: str, question: str) -> str:
    # Get relevant context from RAG
    context = get_relevant_context(question)
    
    headers = {
        "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
        "HTTP-Referer": "https://github.com/OpenRouterStudio/openrouter-py",
        "X-Title": "AI Battle Arena",
        "Content-Type": "application/json"
    }
    
    system_prompt = """You are an AI assistant participating in a battle arena. Your task is to provide the most helpful, accurate, and well-reasoned response to the user's question.
    
If relevant context is provided, use it to inform your response, but do not simply repeat the context. Synthesize the information and provide a thoughtful answer."""

    user_prompt = f"""Context: {context}

Question: {question}"""
    
    data = {
        "model": model_id,
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ]
    }
    
    try:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Error getting response from {model_id}: {str(e)}")
        if response := getattr(e, 'response', None):
            print(f"Response content: {response.text}")
        raise HTTPException(status_code=500, detail=f"Failed to get response from {model_id}")

@app.get("/models")
async def get_models():
    return SUPPORTED_MODELS

@app.post("/battle")
async def battle(request: dict):
    model1 = request.get("model1")
    model2 = request.get("model2")
    question = request.get("question")

    if not model1 or not model2 or not question:
        raise HTTPException(status_code=400, detail="Missing required fields")

    async with httpx.AsyncClient() as client:
        try:
            response1 = await get_model_response(client, model1, question)
            response2 = await get_model_response(client, model2, question)
            
            return {
                "response1": response1,
                "response2": response2
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.post("/vote")
async def vote(request: dict):
    result = request.get("result")
    model1_id = request.get("model1")
    model2_id = request.get("model2")
    
    if not result or not model1_id or not model2_id:
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    with SessionLocal() as db:
        # 获取两个模型的当前状态
        model1 = db.execute(
            select(models).where(models.c.model_id == model1_id)
        ).first()
        model2 = db.execute(
            select(models).where(models.c.model_id == model2_id)
        ).first()
        
        if not model1 or not model2:
            raise HTTPException(status_code=404, detail="Model not found")
        
        # 更新统计数据
        if result == "model1":
            # 更新胜负场次
            db.execute(
                models.update()
                .where(models.c.model_id == model1_id)
                .values(wins=models.c.wins + 1)
            )
            db.execute(
                models.update()
                .where(models.c.model_id == model2_id)
                .values(losses=models.c.losses + 1)
            )
            
            # 计算新的 ELO 分数
            r1 = 10 ** (model1.elo / 400)
            r2 = 10 ** (model2.elo / 400)
            e1 = r1 / (r1 + r2)
            e2 = r2 / (r1 + r2)
            
            new_elo1 = model1.elo + K_FACTOR * (1 - e1)
            new_elo2 = model2.elo + K_FACTOR * (0 - e2)
            
            # 更新 ELO 分数
            db.execute(
                models.update()
                .where(models.c.model_id == model1_id)
                .values(elo=new_elo1)
            )
            db.execute(
                models.update()
                .where(models.c.model_id == model2_id)
                .values(elo=new_elo2)
            )
            
        elif result == "model2":
            # 更新胜负场次
            db.execute(
                models.update()
                .where(models.c.model_id == model2_id)
                .values(wins=models.c.wins + 1)
            )
            db.execute(
                models.update()
                .where(models.c.model_id == model1_id)
                .values(losses=models.c.losses + 1)
            )
            
            # 计算新的 ELO 分数
            r1 = 10 ** (model1.elo / 400)
            r2 = 10 ** (model2.elo / 400)
            e1 = r1 / (r1 + r2)
            e2 = r2 / (r1 + r2)
            
            new_elo1 = model1.elo + K_FACTOR * (0 - e1)
            new_elo2 = model2.elo + K_FACTOR * (1 - e2)
            
            # 更新 ELO 分数
            db.execute(
                models.update()
                .where(models.c.model_id == model1_id)
                .values(elo=new_elo1)
            )
            db.execute(
                models.update()
                .where(models.c.model_id == model2_id)
                .values(elo=new_elo2)
            )
            
        elif result == "draw":
            # 更新平局场次
            db.execute(
                models.update()
                .where(models.c.model_id == model1_id)
                .values(draws=models.c.draws + 1)
            )
            db.execute(
                models.update()
                .where(models.c.model_id == model2_id)
                .values(draws=models.c.draws + 1)
            )
            
        elif result == "invalid":
            # 更新无效场次
            db.execute(
                models.update()
                .where(models.c.model_id == model1_id)
                .values(invalid=models.c.invalid + 1)
            )
            db.execute(
                models.update()
                .where(models.c.model_id == model2_id)
                .values(invalid=models.c.invalid + 1)
            )
        
        db.commit()
        return {"status": "success"}

@app.get("/leaderboard")
async def get_leaderboard():
    with SessionLocal() as db:
        # 按 ELO 分数降序排序获取所有模型
        result = db.execute(
            select(models).order_by(models.c.elo.desc())
        ).fetchall()
        
        return [
            {
                "id": row.model_id,
                "name": row.name,
                "wins": row.wins,
                "losses": row.losses,
                "draws": row.draws,
                "invalid": row.invalid,
                "elo": row.elo
            }
            for row in result
        ]

@app.post("/reset_database")
async def reset_database():
    with SessionLocal() as db:
        try:
            # 删除所有现有数据
            db.execute(models.delete())
            db.commit()
            
            # 重新初始化模型
            init_models()
            return {"status": "success", "message": "Database reset successfully"}
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to reset database: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 