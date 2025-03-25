from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader
import openai
import anthropic

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

# Initialize vector store
embeddings = OpenAIEmbeddings()
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
)

# 修改数据目录路径
data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "jfk_text")
loader = DirectoryLoader(data_dir, glob="**/*.md")  # 注意这里改成 .md 文件
documents = loader.load()
texts = text_splitter.split_documents(documents)
vectorstore = FAISS.from_documents(texts, embeddings)

# Initialize model clients
openai.api_key = os.getenv("OPENAI_API_KEY")
anthropic_client = anthropic.Client(api_key=os.getenv("ANTHROPIC_API_KEY"))
# genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
# deepseek_client = DeepSeek(api_key=os.getenv("DEEPSEEK_API_KEY"))

class BattleRequest(BaseModel):
    model1: str
    model2: str
    question: str

def get_relevant_context(question: str) -> str:
    docs = vectorstore.similarity_search(question, k=3)
    return "\n".join([doc.page_content for doc in docs])

def get_model_response(model: str, question: str, context: str) -> str:
    prompt = f"""Based on the following context about JFK, please answer the question.
    If the answer cannot be found in the context, please say so.

    Context:
    {context}

    Question: {question}

    Answer:"""

    try:
        if model == "gpt-4":
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        elif model == "claude-3":
            response = anthropic_client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text
        elif model == "gemini-pro":
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(prompt)
            return response.text
        elif model == "deepseek":
            response = deepseek_client.chat.completions.create(
                model="deepseek-chat",
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported model: {model}")
    except Exception as e:
        print(f"Error calling {model}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error calling {model}: {str(e)}")

@app.post("/battle")
async def battle(request: BattleRequest):
    try:
        context = get_relevant_context(request.question)
        
        response1 = get_model_response(request.model1, request.question, context)
        response2 = get_model_response(request.model2, request.question, context)
        
        return {
            "model1": response1,
            "model2": response2
        }
    except Exception as e:
        print(f"Battle error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 