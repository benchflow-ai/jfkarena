"use client";

import { useState, useEffect } from "react";
import Header from '@/components/Header';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Model {
  id: string;
  name: string;
}

export default function BattlePage() {
  const [question, setQuestion] = useState("");
  const [responses, setResponses] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModels, setSelectedModels] = useState<{model1: Model | null, model2: Model | null}>({
    model1: null,
    model2: null
  });

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/models`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
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

  const selectRandomModels = () => {
    console.log('Selecting random models from:', models);
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
    
    console.log('Selected models:', { model1, model2 });
    return { model1, model2 };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('handleSubmit called');
    e.preventDefault();
    if (!question) {
      console.log('No question provided');
      return;
    }
    
    console.log('Selecting random models...');
    const selected = selectRandomModels();
    if (!selected) {
      console.log('Failed to select models');
      alert("Not enough models available");
      return;
    }

    setSelectedModels(selected);
    console.log('Models selected:', selected);
    setLoading(true);
    setVoted(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const requestData = {
        model1: selected.model1.id,
        model2: selected.model2.id,
        question: question,
      };
      
      console.log('Sending request to:', apiUrl);
      console.log('Request data:', requestData);
      
      const response = await fetch(`${apiUrl}/battle`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
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
      console.log('Response data:', data);
      setResponses(data);
      setIsFlipped(Math.random() > 0.5);
    } catch (error) {
      console.error("Error details:", error);
      alert("Failed to get responses. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (result: "model1" | "model2" | "draw" | "invalid") => {
    if (voted || !selectedModels.model1 || !selectedModels.model2) return;
    try {
      let actualResult = result;
      if (isFlipped && (result === "model1" || result === "model2")) {
        actualResult = result === "model1" ? "model2" : "model1";
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await fetch(`${apiUrl}/vote`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          result: actualResult,
          model1: selectedModels.model1.id,
          model2: selectedModels.model2.id,
          question,
        }),
      });
      setVoted(true);
    } catch (error) {
      console.error("Error voting:", error);
      alert("Failed to submit vote. Please try again.");
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
    <div className="container py-10">
      <Header />
      <div className="mt-8 space-y-6 max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Send your question about JFK files here."
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 min-h-[100px] pr-24"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute bottom-3 right-3"
            disabled={!question || loading}
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
