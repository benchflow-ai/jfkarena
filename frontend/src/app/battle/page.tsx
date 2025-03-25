"use client";

import { useState, useEffect } from "react";

interface Model {
  id: string;
  name: string;
}

export default function BattlePage() {
  const [selectedModel1, setSelectedModel1] = useState("");
  const [selectedModel2, setSelectedModel2] = useState("");
  const [question, setQuestion] = useState("");
  const [responses, setResponses] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [models, setModels] = useState<Model[]>([]);

  useEffect(() => {
    // 获取可用模型列表
    const fetchModels = async () => {
      try {
        const response = await fetch("http://localhost:8000/models");
        if (!response.ok) {
          throw new Error("Failed to fetch models");
        }
        const data = await response.json();
        setModels(data);
      } catch (error) {
        console.error("Error fetching models:", error);
        alert("Failed to load models. Please try again later.");
      }
    };
    
    fetchModels();
  }, []);

  useEffect(() => {
    // 随机决定显示顺序
    setIsFlipped(Math.random() > 0.5);
  }, [responses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModel1 || !selectedModel2 || !question) return;

    setLoading(true);
    setVoted(false);
    try {
      const response = await fetch("http://localhost:8000/battle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model1: selectedModel1,
          model2: selectedModel2,
          question: question,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to fetch");
      }

      const data = await response.json();
      setResponses(data);
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (result: "model1" | "model2" | "draw" | "invalid") => {
    if (voted) return;
    try {
      // 根据显示顺序转换投票结果
      let actualResult = result;
      if (isFlipped && (result === "model1" || result === "model2")) {
        actualResult = result === "model1" ? "model2" : "model1";
      }

      await fetch("http://localhost:8000/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          result: actualResult,
          model1: selectedModel1,
          model2: selectedModel2,
          question,
        }),
      });
      setVoted(true);
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const getResponseContent = (position: "left" | "right") => {
    if (!responses) return null;
    const isLeft = position === "left";
    return isFlipped ? 
      (isLeft ? responses.response2 : responses.response1) :
      (isLeft ? responses.response1 : responses.response2);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="linear-card">
        <h1 className="text-2xl font-bold mb-6 linear-gradient">AI Battle Arena</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm text-muted-foreground">Model 1</label>
              <select
                value={selectedModel1}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSelectedModel1(newValue);
                  // 如果选择的Model 1与当前的Model 2相同，清空Model 2
                  if (newValue === selectedModel2) {
                    setSelectedModel2("");
                  }
                }}
                className="linear-input w-full"
                required
              >
                <option value="">Select Model</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-muted-foreground">Model 2</label>
              <select
                value={selectedModel2}
                onChange={(e) => setSelectedModel2(e.target.value)}
                className="linear-input w-full"
                required
                disabled={!selectedModel1}
              >
                <option value="">Select Model</option>
                {models
                  .filter(model => model.id !== selectedModel1)
                  .map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-muted-foreground">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="linear-input min-h-[100px]"
              placeholder="Enter your question..."
              required
            />
          </div>
          <button
            type="submit"
            className="linear-button-primary w-full"
            disabled={loading || !selectedModel1 || !selectedModel2}
          >
            {loading ? "Battling..." : "Start Battle"}
          </button>
        </form>
      </div>

      {responses && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="linear-card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium linear-gradient">Model A</h3>
                {voted && (
                  <span className="text-sm text-muted-foreground">
                    {models.find(m => m.id === (isFlipped ? selectedModel2 : selectedModel1))?.name}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground whitespace-pre-wrap mb-4">
                {getResponseContent("left")}
              </p>
            </div>
            <div className="linear-card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium linear-gradient">Model B</h3>
                {voted && (
                  <span className="text-sm text-muted-foreground">
                    {models.find(m => m.id === (isFlipped ? selectedModel1 : selectedModel2))?.name}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground whitespace-pre-wrap mb-4">
                {getResponseContent("right")}
              </p>
            </div>
          </div>
          
          {!voted && (
            <div className="flex gap-4">
              <button
                onClick={() => handleVote("model1")}
                className="linear-button-primary flex-1 py-3"
                disabled={voted}
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-xl">🏆</span>
                  Model A Wins
                </span>
              </button>
              <button
                onClick={() => handleVote("model2")}
                className="linear-button-primary flex-1 py-3"
                disabled={voted}
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-xl">🏆</span>
                  Model B Wins
                </span>
              </button>
              <button
                onClick={() => handleVote("draw")}
                className="linear-button-secondary flex-1 py-3"
                disabled={voted}
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-xl">🤝</span>
                  Draw
                </span>
              </button>
              <button
                onClick={() => handleVote("invalid")}
                className="linear-button-secondary flex-1 py-3"
                disabled={voted}
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-xl">❌</span>
                  Both Invalid
                </span>
              </button>
            </div>
          )}

          {voted && (
            <div className="linear-card">
              <h3 className="text-lg font-medium mb-4 linear-gradient">Results Revealed</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Model A was:</p>
                  <p className="font-medium">
                    {models.find(m => m.id === (isFlipped ? selectedModel2 : selectedModel1))?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Model B was:</p>
                  <p className="font-medium">
                    {models.find(m => m.id === (isFlipped ? selectedModel1 : selectedModel2))?.name}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 