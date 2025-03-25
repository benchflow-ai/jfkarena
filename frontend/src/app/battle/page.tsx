"use client";

import { useState, useEffect } from "react";
import Header from '@/components/Header';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

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

  useEffect(() => {
    setIsFlipped(Math.random() > 0.5);
  }, [responses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModel1 || !selectedModel2 || !question) return;

    setLoading(true);
    setVoted(false);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/battle`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          model1: selectedModel1,
          model2: selectedModel2,
          question: question,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch responses");
      }

      const data = await response.json();
      setResponses(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to get responses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (result: "model1" | "model2" | "draw" | "invalid") => {
    if (voted) return;
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
          model1: selectedModel1,
          model2: selectedModel2,
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
      <div className="mt-8 space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Select Models</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Model 1</label>
                <Select
                  value={selectedModel1}
                  onValueChange={(value) => {
                    setSelectedModel1(value);
                    if (value === selectedModel2) {
                      setSelectedModel2("");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Model 2</label>
                <Select
                  value={selectedModel2}
                  onValueChange={setSelectedModel2}
                  disabled={!selectedModel1}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models
                      .filter((model) => model.id !== selectedModel1)
                      .map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Enter Your Question</h2>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question about JFK files here..."
              className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </Card>

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!selectedModel1 || !selectedModel2 || !question || loading}
        >
          {loading ? "Getting Responses..." : "Start Battle"}
        </Button>

        {responses && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-medium">Model A</h2>
                  <Separator />
                  <div className="whitespace-pre-wrap text-sm">
                    {getResponseContent("left")}
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-medium">Model B</h2>
                  <Separator />
                  <div className="whitespace-pre-wrap text-sm">
                    {getResponseContent("right")}
                  </div>
                </div>
              </Card>
            </div>

            {!voted && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleVote("model1")}
                  disabled={voted}
                >
                  Model A Wins
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleVote("model2")}
                  disabled={voted}
                >
                  Model B Wins
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleVote("draw")}
                  disabled={voted}
                >
                  Draw
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleVote("invalid")}
                  disabled={voted}
                >
                  Invalid
                </Button>
              </div>
            )}

            {voted && (
              <Card className="p-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-medium">Results Revealed</h2>
                  <Separator />
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
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 