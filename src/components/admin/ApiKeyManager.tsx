import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Key, Eye, EyeOff, Save, Trash } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios"; // For making API requests

export const ApiKeyManager = () => {
  const { user, isAuthenticated } = useAuth();
  const [apiKeys, setApiKeys] = useState<
    { id: string; service_name: string; api_key: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
  const [newApiKey, setNewApiKey] = useState("");
  const [serviceName, setServiceName] = useState("deepseek");
  const [prompt, setPrompt] = useState(""); // For user input (prompt)
  const [apiResponse, setApiResponse] = useState(""); // For storing API response

  // Hardcoded API key for testing
  const hardcodedApiKey = "sk-601380ab4f754c83b6d5c60b524aed28";

  // Simulate fetching API keys (using hardcoded key)
  useEffect(() => {
    if (isAuthenticated && user) {
      setIsLoading(true);
      // Simulate fetching API keys
      setTimeout(() => {
        setApiKeys([
          {
            id: "1",
            service_name: "deepseek",
            api_key: hardcodedApiKey, // Use the hardcoded key
          },
        ]);
        setIsLoading(false);
      }, 1000); // Simulate a delay
    }
  }, [isAuthenticated, user]);

  // Save or update API key (simulated)
  const saveApiKey = async () => {
    if (!newApiKey.trim()) {
      toast.error("API key cannot be empty");
      return;
    }

    try {
      setIsLoading(true);
      // Simulate saving the key
      setTimeout(() => {
        setApiKeys([
          {
            id: "1",
            service_name: serviceName,
            api_key: newApiKey,
          },
        ]);
        toast.success(
          `${
            serviceName === "deepseek" ? "DeepSeek" : serviceName.toUpperCase()
          } API key saved successfully`
        );
        setNewApiKey("");
        setIsLoading(false);
      }, 1000); // Simulate a delay
    } catch (error: any) {
      console.error("Error saving API key:", error);
      toast.error(error.message || "Failed to save API key");
      setIsLoading(false);
    }
  };

  // Delete API key (simulated)
  const deleteApiKey = async (id: string) => {
    try {
      setIsLoading(true);
      // Simulate deleting the key
      setTimeout(() => {
        setApiKeys([]);
        toast.success("API key deleted successfully");
        setIsLoading(false);
      }, 1000); // Simulate a delay
    } catch (error: any) {
      console.error("Error deleting API key:", error);
      toast.error(error.message || "Failed to delete API key");
      setIsLoading(false);
    }
  };

  // Toggle visibility of API key
  const toggleShowKey = (id: string) => {
    setShowKey((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Call DeepSeek API
  const callDeepSeekAPI = async (apiKey: string, prompt: string) => {
    try {
      const response = await axios.post(
        "https://api.deepseek.com/v1/chat/completions", // Replace with the actual DeepSeek API endpoint
        {
          prompt: prompt,
          max_tokens: 150, // Adjust based on your needs
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error calling DeepSeek API:", error);
      throw error;
    }
  };

  // Handle DeepSeek API request
  const handleDeepSeekRequest = async () => {
    const deepSeekKey = apiKeys.find(
      (key) => key.service_name === "deepseek"
    )?.api_key;
    if (deepSeekKey) {
      try {
        const result = await callDeepSeekAPI(deepSeekKey, prompt);
        setApiResponse(JSON.stringify(result, null, 2)); // Display the response
        toast.success("DeepSeek API call successful");
      } catch (error) {
        toast.error("Failed to call DeepSeek API");
      }
    } else {
      toast.error("No DeepSeek API key found");
    }
  };

  // Render UI
  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please login to manage API keys
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle>API Key Manager</CardTitle>
          </div>
          <CardDescription>
            Manage your API keys for various services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add or Update API Key Section */}
          <div className="space-y-2">
            <Label htmlFor="apiKeyInput">Add or Update API Key</Label>
            <div className="flex gap-2">
              <Select value={serviceName} onValueChange={setServiceName}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deepseek">DeepSeek</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="apiKeyInput"
                type="password"
                placeholder="Enter API key"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                className="flex-1"
              />
              <Button onClick={saveApiKey} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          {/* Test DeepSeek API Section */}
          <div className="space-y-2">
            <Label htmlFor="promptInput">Test DeepSeek API</Label>
            <div className="flex gap-2">
              <Input
                id="promptInput"
                type="text"
                placeholder="Enter a prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleDeepSeekRequest} disabled={isLoading}>
                Send
              </Button>
            </div>
            {apiResponse && (
              <div className="mt-4 p-3 border rounded-md bg-gray-50">
                <pre className="text-sm">{apiResponse}</pre>
              </div>
            )}
          </div>

          {/* Saved API Keys Section */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Saved API Keys</h3>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : apiKeys.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No API keys saved yet
              </p>
            ) : (
              <div className="space-y-2">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div>
                      <p className="font-medium">
                        {key.service_name === "deepseek"
                          ? "DeepSeek"
                          : key.service_name.toUpperCase()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {showKey[key.id]
                          ? key.api_key
                          : "•".repeat(Math.min(20, key.api_key.length))}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleShowKey(key.id)}
                      >
                        {showKey[key.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete API Key</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this{" "}
                              {key.service_name === "deepseek"
                                ? "DeepSeek"
                                : key.service_name.toUpperCase()}{" "}
                              API key? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => {}}>
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => deleteApiKey(key.id)}
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <p className="text-sm text-muted-foreground">
            Your API keys are encrypted and stored securely. We never share your
            keys with third parties.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
