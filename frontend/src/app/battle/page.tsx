"use client";

import { useState, useEffect } from "react";
import Header from '@/components/Header';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface Model {
  id: string;
  name: string;
}

const MAX_TOKENS = 150;
const APPROX_CHARS_PER_TOKEN = 4; // Rough approximation
const MAX_CHARS = MAX_TOKENS * APPROX_CHARS_PER_TOKEN;

export default function BattlePage() {
  const [question, setQuestion] = useState("");
  const [responses, setResponses] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [battleId, setBattleId] = useState<number | null>(null);
  const [selectedModels, setSelectedModels] = useState<{model1: Model | null, model2: Model | null}>({
    model1: null,
    model2: null
  });
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const authenticate = async () => {
      try {
        const authResponse = await fetch('/api/auth');
        if (!authResponse.ok) {
          const loginResponse = await fetch('/api/auth', { method: 'POST' });
          if (!loginResponse.ok) {
            throw new Error('Failed to authenticate');
          }
        }
      } catch (err) {
        console.error("Authentication error:", err);
        return false;
      }
      return true;
    };

    const fetchModels = async () => {
      try {
        // Authenticate before fetching models
        const isAuthenticated = await authenticate();
        if (!isAuthenticated) {
          setError("Failed to authenticate");
          return;
        }

        const response = await fetch('/api/proxy/models');
        if (!response.ok) {
          throw new Error("Failed to fetch models");
        }
        const data = await response.json();
        setModels(data);
      } catch (error) {
        console.error("Error fetching models:", error);
        setError("Failed to load models");
      }
    };
    
    fetchModels();
  }, []);

  const selectRandomModels = () => {
    if (models.length < 2) {
      console.log('Not enough models available');
      return null;
    }
    
    const availableModels = [...models];
    const model1Index = Math.floor(Math.random() * availableModels.length);
    const model1 = availableModels[model1Index];
    availableModels.splice(model1Index, 1);
    
    const model2Index = Math.floor(Math.random() * availableModels.length);
    const model2 = availableModels[model2Index];
    
    return { model1, model2 };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question) {
      return;
    }
    
    const selected = selectRandomModels();
    if (!selected) {
      setError("Not enough models available");
      return;
    }

    setSelectedModels(selected);
    setLoading(true);
    setVoted(false);

    try {
      const requestData = {
        model1: selected.model1.id,
        model2: selected.model2.id,
        question: question,
      };
      
      const response = await fetch('/api/proxy/battle', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to fetch responses: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setResponses(data);
      setBattleId(data.battle_id);
      setIsFlipped(Math.random() > 0.5);
      setQuestion('');
      setCharCount(0);
    } catch (error) {
      console.error("Error details:", error);
      setError("Failed to get responses");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (result: "model1" | "model2" | "draw" | "invalid") => {
    if (voted || !selectedModels.model1 || !selectedModels.model2 || !battleId) return;
    try {
      let actualResult = result;
      if (isFlipped && (result === "model1" || result === "model2")) {
        actualResult = result === "model1" ? "model2" : "model1";
      }

      const response = await fetch('/api/proxy/vote', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          result: actualResult,
          model1: selectedModels.model1.id,
          model2: selectedModels.model2.id,
          battle_id: battleId,
          question,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }

      setVoted(true);
    } catch (error) {
      console.error("Error voting:", error);
      setError("Failed to submit vote");
    }
  };

  const getResponseContent = (position: "left" | "right") => {
    if (!responses) return null;
    const isLeft = position === "left";
    return isFlipped ? 
      (isLeft ? responses.response2 : responses.response1) :
      (isLeft ? responses.response1 : responses.response2);
  };

  const estimateTokens = (text: string): number => {
    // Simple estimation: roughly 4 characters per token
    return Math.ceil(text.length / APPROX_CHARS_PER_TOKEN);
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const newCharCount = newText.length;
    const estimatedTokens = estimateTokens(newText);
    
    if (estimatedTokens <= MAX_TOKENS) {
      setQuestion(newText);
      setCharCount(newCharCount);
      setError(null);
    } else {
      setError("Question is too long. Please shorten it.");
    }
  };

  return (
    <div className="container py-10">
      <Header />
      <div className="mt-8 space-y-6 max-w-3xl mx-auto">
        {error && (
          <div className="text-destructive text-center p-4">
            Error: {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={question}
            onChange={handleQuestionChange}
            placeholder="Ask a question about the JFK files..."
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 min-h-[100px] pr-24 pb-10"
            maxLength={MAX_CHARS}
          />
          <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-white px-1">
            <div className="text-xs text-zinc-500">
              ~{estimateTokens(question)}/{MAX_TOKENS} tokens
            </div>
            <Progress 
              value={(estimateTokens(question) / MAX_TOKENS) * 100} 
              className="w-20 h-1"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            className="absolute bottom-3 right-3"
            disabled={!question || loading || estimateTokens(question) > MAX_TOKENS}
          >
            {loading ? (
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
                <span>Sending</span>
              </span>
            ) : (
              "Send"
            )}
          </Button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 min-h-[300px]">
            <div className="space-y-3">
              <h2 className="text-sm font-medium">
                {voted ? (isFlipped ? selectedModels.model2?.name : selectedModels.model1?.name) : "Model A"}
              </h2>
              <Separator className="bg-zinc-100" />
              <div className="whitespace-pre-wrap text-sm text-zinc-600">
                {getResponseContent("left") || "Waiting for response..."}
              </div>
            </div>
          </Card>
          <Card className="p-4 min-h-[300px]">
            <div className="space-y-3">
              <h2 className="text-sm font-medium">
                {voted ? (isFlipped ? selectedModels.model1?.name : selectedModels.model2?.name) : "Model B"}
              </h2>
              <Separator className="bg-zinc-100" />
              <div className="whitespace-pre-wrap text-sm text-zinc-600">
                {getResponseContent("right") || "Waiting for response..."}
              </div>
            </div>
          </Card>
        </div>

        {responses && !voted && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVote("model1")}
              disabled={voted}
              className="text-xs"
            >
              Model A Wins
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVote("model2")}
              disabled={voted}
              className="text-xs"
            >
              Model B Wins
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVote("draw")}
              disabled={voted}
              className="text-xs"
            >
              Draw
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVote("invalid")}
              disabled={voted}
              className="text-xs"
            >
              Invalid
            </Button>
          </div>
        )}

        {voted && (
          <Card className="p-4">
            <div className="space-y-3">
              <h2 className="text-sm font-medium">Results Revealed</h2>
              <Separator className="bg-zinc-100" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500">Model A was:</p>
                  <p className="text-sm font-medium">
                    {isFlipped ? selectedModels.model2?.name : selectedModels.model1?.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Model B was:</p>
                  <p className="text-sm font-medium">
                    {isFlipped ? selectedModels.model1?.name : selectedModels.model2?.name}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
