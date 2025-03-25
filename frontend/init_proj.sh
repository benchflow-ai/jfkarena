# 1. 克隆项目（如果还没有的话）
git clone <your-repo-url>
cd jfkarena

# 2. 设置前端
cd frontend
npm install
cp .env.example .env
# 编辑 .env 文件，添加你的 NeonDB 连接字符串

# 3. 设置后端
cd ../backend
python -m venv venv
source venv/bin/activate  # 在 Windows 上使用: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env 文件，添加你的 AI 模型 API 密钥

# 4. 创建 JFK 文件目录
mkdir jfk_files
# 将你的 JFK 相关文本文件放入这个目录