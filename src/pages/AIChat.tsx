import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Sparkles, Leaf, Loader2, Trash2, MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface AIPlan {
    totalWeeks: number;
    harvestDate: string;
    weeklyPlans: {
        week: number;
        title: string;
        tasks: string[];
    }[];
}

interface Territory {
    id: string;
    points: [number, number][];
    name: string;
    crop?: string;
    plantingDate?: string;
    aiPlan?: AIPlan;
    area?: number;
}

export default function AIChat() {
    const { toast } = useToast();
    const CHAT_STORAGE_KEY = 'farmplanet_chat_history';
    const TERRITORIES_STORAGE_KEY = 'farmplanet_territories';

    // Load territories from localStorage
    const loadTerritories = (): Territory[] => {
        try {
            const stored = localStorage.getItem(TERRITORIES_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading territories:', error);
            return [];
        }
    };

    // Load messages from localStorage or use default
    const loadMessages = (): Message[] => {
        try {
            const stored = localStorage.getItem(CHAT_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Convert timestamp strings back to Date objects
                return parsed.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }

        // Default welcome message
        return [
            {
                id: '1',
                role: 'assistant',
                content: 'Hello! I\'m your FarmPlanet AI Assistant. I can help you with farming questions, analyze your field data, provide crop recommendations, and assist with irrigation planning. How can I help you today?',
                timestamp: new Date()
            }
        ];
    };

    const [messages, setMessages] = useState<Message[]>(loadMessages);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [territories, setTerritories] = useState<Territory[]>(loadTerritories);
    const [selectedTerritoryId, setSelectedTerritoryId] = useState<string>('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Load territories on mount
    useEffect(() => {
        const loadedTerritories = loadTerritories();
        setTerritories(loadedTerritories);
    }, []);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }, [messages]);

    useEffect(() => {
        // Auto-scroll to bottom when new messages arrive
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    // Get selected territory context
    const getSelectedTerritory = (): Territory | null => {
        if (!selectedTerritoryId) return null;
        return territories.find(t => t.id === selectedTerritoryId) || null;
    };

    // Build context string for AI
    const buildTerritoryContext = (): string => {
        if (!selectedTerritoryId || selectedTerritoryId === 'none') return '';

        const territory = getSelectedTerritory();
        if (!territory) return '';

        let context = `\n\n📍 SELECTED TERRITORY CONTEXT:\n`;
        context += `- Name: ${territory.name}\n`;

        if (territory.area) {
            context += `- Area: ${territory.area.toFixed(2)} hectares\n`;
        }

        if (territory.crop) {
            const cropName = territory.crop.replace(/[^\w\s]/gi, '').trim();
            context += `- Current Crop: ${cropName}\n`;
        }

        if (territory.plantingDate) {
            const plantDate = new Date(territory.plantingDate);
            const daysSincePlanting = Math.floor((Date.now() - plantDate.getTime()) / (1000 * 60 * 60 * 24));
            context += `- Planting Date: ${plantDate.toLocaleDateString()}\n`;
            context += `- Days Since Planting: ${daysSincePlanting} days\n`;
        }

        if (territory.aiPlan) {
            const weeksPassed = territory.plantingDate
                ? Math.floor((Date.now() - new Date(territory.plantingDate).getTime()) / (1000 * 60 * 60 * 24 * 7))
                : 0;
            const currentWeek = Math.min(weeksPassed + 1, territory.aiPlan.totalWeeks);

            context += `- Growing Season: Week ${currentWeek} of ${territory.aiPlan.totalWeeks}\n`;
            context += `- Expected Harvest: ${territory.aiPlan.harvestDate}\n`;

            if (currentWeek > 0 && currentWeek <= territory.aiPlan.totalWeeks) {
                const weekPlan = territory.aiPlan.weeklyPlans[currentWeek - 1];
                if (weekPlan) {
                    context += `- Current Week Tasks: ${weekPlan.tasks.join(', ')}\n`;
                }
            }
        }

        context += '\nUse this context to provide personalized advice for this specific field.';
        return context;
    };

    // Call OpenAI API for real AI responses
    const generateAIResponse = async (userMessage: string): Promise<string> => {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

        if (!apiKey) {
            return "⚠️ OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.";
        }

        try {
            const territoryContext = buildTerritoryContext();
            const systemMessage = `You are an expert agricultural AI assistant for FarmPlanet, a smart farming platform. You help farmers with:
- Crop health analysis using NDVI satellite data
- Irrigation and water management recommendations
- Planting schedules and crop rotation advice
- Pest and disease detection
- Weather impact analysis and K-Index monitoring
- Harvest predictions and yield optimization
- Fertilizer and nutrient management

Always provide practical, actionable advice. Use emojis and formatting to make responses engaging and easy to read. Base your answers on real agricultural science and NASA satellite data principles.${territoryContext}`;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: systemMessage
                        },
                        {
                            role: 'user',
                            content: userMessage
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('OpenAI API Error:', error);
            return "❌ Sorry, I encountered an error processing your request. Please try again later.";
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Call OpenAI API
        try {
            const aiContent = await generateAIResponse(userMessage.content);

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiContent,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error('Error generating AI response:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "❌ Sorry, I encountered an error. Please try again.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClearHistory = () => {
        const welcomeMessage: Message = {
            id: '1',
            role: 'assistant',
            content: 'Hello! I\'m your FarmPlanet AI Assistant. I can help you with farming questions, analyze your field data, provide crop recommendations, and assist with irrigation planning. How can I help you today?',
            timestamp: new Date()
        };

        setMessages([welcomeMessage]);
        localStorage.removeItem(CHAT_STORAGE_KEY);

        toast({
            title: "Chat History Cleared",
            description: "All previous messages have been deleted"
        });
    };

    const handleTerritoryChange = (value: string) => {
        setSelectedTerritoryId(value);

        if (value && value !== 'none') {
            const territory = territories.find(t => t.id === value);
            if (territory) {
                toast({
                    title: "🌾 Territory Context Activated",
                    description: `AI will now provide personalized advice for ${territory.name}`,
                });
            }
        } else {
            toast({
                title: "🌍 General Mode",
                description: "AI will provide general farming advice",
            });
        }
    };

    const suggestedQuestions = [
        "How is my crop health?",
        "When should I water my fields?",
        "Give me this week's farming plan",
        "What's the harvest prediction?"
    ];

    return (
        <div className="p-4 sm:p-6 h-[calc(100vh-40px)] flex flex-col min-h-0">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 space-y-4"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                AI Farm Assistant
                            </h1>
                            <p className="text-muted-foreground">
                                Your intelligent farming companion powered by NASA data
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleClearHistory}
                        variant="outline"
                        size="sm"
                        className="glass-button"
                        disabled={messages.length <= 1 || isLoading}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear History
                    </Button>
                </div>

                {/* Territory Selector */}
                {territories.length > 0 && (
                    <Card className="glass-card">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <label className="text-sm font-medium">
                                            Select Territory for Context
                                        </label>
                                    </div>
                                    <Select
                                        value={selectedTerritoryId}
                                        onValueChange={handleTerritoryChange}
                                    >
                                        <SelectTrigger className="glass-input">
                                            <SelectValue placeholder="No territory selected - general advice" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                None - General Advice
                                            </SelectItem>
                                            {territories.map((territory) => (
                                                <SelectItem key={territory.id} value={territory.id}>
                                                    {territory.crop ? territory.crop + ' - ' : ''}{territory.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        💡 Select a territory to get personalized AI advice based on your field data
                                    </p>
                                </div>

                                {/* Selected Territory Info */}
                                {selectedTerritoryId && selectedTerritoryId !== 'none' && getSelectedTerritory() && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex-1 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
                                    >
                                        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-primary" />
                                            Active Context
                                        </h3>
                                        <div className="space-y-2 text-xs">
                                            {getSelectedTerritory()?.name && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3 h-3 text-muted-foreground" />
                                                    <span className="font-medium">{getSelectedTerritory()?.name}</span>
                                                </div>
                                            )}
                                            {getSelectedTerritory()?.crop && (
                                                <div className="flex items-center gap-2">
                                                    <Leaf className="w-3 h-3 text-muted-foreground" />
                                                    <span>{getSelectedTerritory()?.crop}</span>
                                                </div>
                                            )}
                                            {getSelectedTerritory()?.area && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-muted-foreground">📏</span>
                                                    <span>{getSelectedTerritory()?.area?.toFixed(2)} ha</span>
                                                </div>
                                            )}
                                            {getSelectedTerritory()?.plantingDate && (
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3 h-3 text-muted-foreground" />
                                                    <span>
                                                        Planted: {new Date(getSelectedTerritory()!.plantingDate!).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                            {getSelectedTerritory()?.aiPlan && (
                                                <Badge variant="secondary" className="mt-2">
                                                    AI Plan Active ({getSelectedTerritory()?.aiPlan?.totalWeeks} weeks)
                                                </Badge>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </motion.div>

            <Card className="glass-card flex-1 flex flex-col overflow-hidden min-h-[70vh]">
                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollAreaRef}>
                        <div className="space-y-4">
                            <AnimatePresence>
                                {messages.map((message, index) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {message.role === 'assistant' && (
                                            <Avatar className="w-8 h-8 border-2 border-primary/20">
                                                <AvatarFallback className="bg-gradient-to-br from-primary to-accent">
                                                    <Bot className="w-4 h-4 text-white" />
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                                ? 'bg-gradient-to-br from-primary to-accent text-white'
                                                : 'glass-card'
                                                }`}
                                        >
                                            {message.role === 'assistant' ? (
                                                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-li:text-foreground">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-foreground">{children}</h1>,
                                                            h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-foreground">{children}</h2>,
                                                            h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-foreground">{children}</h3>,
                                                            p: ({ children }) => <p className="mb-2 text-sm leading-relaxed text-foreground">{children}</p>,
                                                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-sm">{children}</ul>,
                                                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-sm">{children}</ol>,
                                                            li: ({ children }) => <li className="text-sm text-foreground">{children}</li>,
                                                            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                                                            em: ({ children }) => <em className="italic text-foreground">{children}</em>,
                                                            code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-foreground">{children}</code>,
                                                            blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/30 pl-3 my-2 italic text-foreground">{children}</blockquote>
                                                        }}
                                                    >
                                                        {message.content}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                                    {message.content}
                                                </p>
                                            )}
                                            <p className="text-xs opacity-70 mt-2">
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {message.role === 'user' && (
                                            <Avatar className="w-8 h-8 border-2 border-primary/20">
                                                <AvatarFallback className="bg-primary/10">
                                                    <User className="w-4 h-4" />
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3"
                                >
                                    <Avatar className="w-8 h-8 border-2 border-primary/20">
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent">
                                            <Bot className="w-4 h-4 text-white" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="glass-card rounded-2xl px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                            <span className="text-sm text-muted-foreground">AI is thinking...</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Suggested Questions */}
                    {messages.length === 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="px-4 sm:px-6 pb-4 flex-shrink-0"
                        >
                            <p className="text-sm text-muted-foreground mb-3">Suggested questions:</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestedQuestions.map((question, index) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors"
                                        onClick={() => setInput(question)}
                                    >
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        {question}
                                    </Badge>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Input Area */}
                    <div className="border-t border-border/50 p-3 sm:p-4 flex-shrink-0 bg-background/95 backdrop-blur-sm sticky bottom-0 z-10">
                        <div className="flex gap-2 mb-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything about your farm..."
                                className="glass-input flex-1 h-10 sm:h-11"
                                disabled={isLoading}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="glow-button flex-shrink-0 h-10 sm:h-11 w-10 sm:w-11 p-0"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            💡 Tip: Ask about crop health, irrigation, weather, or get farming recommendations
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

