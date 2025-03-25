"use client";

import { useState, useEffect } from "react";
import Header from '@/components/Header';

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
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* 主要内容部分使用较窄的容器，并添加上边距留出标题空间 */}
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-8">
        <div className="space-y-6">
          {/* Model Selection */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Select Models</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Model 1</label>
                <select
                  value={selectedModel1}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setSelectedModel1(newValue);
                    if (newValue === selectedModel2) {
                      setSelectedModel2("");
                    }
                  }}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Select a model</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Model 2</label>
                <select
                  value={selectedModel2}
                  onChange={(e) => setSelectedModel2(e.target.value)}
                  disabled={!selectedModel1}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">Select a model</option>
                  {models
                    .filter((model) => model.id !== selectedModel1)
                    .map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Question Input */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Enter Your Question About JFK Files</h2>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here..."
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-h-[120px] resize-y"
            />
          </div>

          {/* Battle Button */}
          <button
            onClick={handleSubmit}
            disabled={!selectedModel1 || !selectedModel2 || !question || loading}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {loading ? "Battling..." : "Start Battle"}
          </button>

          {/* Responses */}
          {responses && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Model A</h2>
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap min-h-[200px]">
                    {getResponseContent("left")}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Model B</h2>
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap min-h-[200px]">
                    {getResponseContent("right")}
                  </div>
                </div>
              </div>

              {/* Voting Buttons */}
              {!voted && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => handleVote("model1")}
                    disabled={voted}
                    className="bg-white border border-green-500 text-green-600 py-2 px-4 rounded-lg font-medium hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Model A Wins
                  </button>
                  <button
                    onClick={() => handleVote("model2")}
                    disabled={voted}
                    className="bg-white border border-blue-500 text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Model B Wins
                  </button>
                  <button
                    onClick={() => handleVote("draw")}
                    disabled={voted}
                    className="bg-white border border-yellow-500 text-yellow-600 py-2 px-4 rounded-lg font-medium hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Draw
                  </button>
                  <button
                    onClick={() => handleVote("invalid")}
                    disabled={voted}
                    className="bg-white border border-red-500 text-red-600 py-2 px-4 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Invalid
                  </button>
                </div>
              )}

              {/* Results Reveal */}
              {voted && (
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 text-gray-700">Results Revealed</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Model A was:</p>
                      <p className="font-medium text-gray-700">
                        {models.find(m => m.id === (isFlipped ? selectedModel2 : selectedModel1))?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Model B was:</p>
                      <p className="font-medium text-gray-700">
                        {models.find(m => m.id === (isFlipped ? selectedModel1 : selectedModel2))?.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 