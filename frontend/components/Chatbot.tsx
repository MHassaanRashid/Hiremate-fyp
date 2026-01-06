"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2, Info, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";

interface Message {
    role: "user" | "bot";
    content: string;
    source?: "faq" | "ai_explainer" | "rule";
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { role: "bot", content: "Hi! I'm the HireMate Decision Explainer. I can explain your quiz results, proctoring flags, or interview eligibility based on the system rules." },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleAsk = async () => {
        if (!query.trim() || isLoading) return;

        const userMessage = query.trim();
        setQuery("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            let token = Cookies.get("access_token") || "";
            if (!token && typeof window !== 'undefined') {
                token = localStorage.getItem("access_token") || "";
            }
            const res = await fetch(`/api/chatbot/ask?query=${encodeURIComponent(userMessage)}`, {
                headers: {
                    "Authorization": token ? `Bearer ${token}` : "",
                    "ngrok-skip-browser-warning": "true",
                }
            });

            if (!res.ok) throw new Error("Failed to fetch response");

            const data = await res.json();

            setMessages((prev) => [...prev, {
                role: "bot",
                content: data.answer,
                source: data.source
            }]);
        } catch (error) {
            console.error("Chatbot Error:", error);
            setMessages((prev) => [...prev, {
                role: "bot",
                content: "I'm having trouble accessing the system logs right now. Please try again later."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="mb-4 w-[350px] sm:w-[400px]"
                    >
                        <Card className="shadow-2xl border-primary/20 overflow-hidden flex flex-col h-[550px] bg-background/95 backdrop-blur-sm">
                            <CardHeader className="bg-primary p-4 flex flex-row items-center justify-between text-primary-foreground">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 font-semibold">
                                        <ShieldCheck className="w-5 h-5" />
                                        <span>Decision Explainer</span>
                                    </div>
                                    <span className="text-[10px] opacity-80 uppercase tracking-widest">Transparency Mode Active</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="hover:bg-primary-foreground/20 text-primary-foreground h-8 w-8"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </CardHeader>

                            <CardContent
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/10"
                            >
                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "flex items-start gap-2 max-w-[85%]",
                                            msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border mt-1",
                                            msg.role === "user" ? "bg-secondary" : "bg-primary text-primary-foreground"
                                        )}>
                                            {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className={cn(
                                                "rounded-2xl p-3 text-sm shadow-sm relative",
                                                msg.role === "user"
                                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                                    : "bg-muted rounded-tl-none border border-border"
                                            )}>
                                                {msg.content}
                                            </div>

                                            {msg.source && (
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-1">
                                                    <Info className="w-3 h-3" />
                                                    <span>Source: {msg.source === "faq" ? "System FAQ (Rule-based)" : msg.source === "ai_explainer" ? "AI Analysis of System Logs" : "System Rule"}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex items-start gap-2 mr-auto max-w-[85%]">
                                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center border">
                                            <Bot className="w-4 h-4" />
                                        </div>
                                        <div className="bg-muted rounded-2xl rounded-tl-none p-3 border border-border">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        </div>
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter className="p-3 border-t bg-background/50 flex flex-col gap-2">
                                <form
                                    onSubmit={(e) => { e.preventDefault(); handleAsk(); }}
                                    className="flex w-full items-center gap-2"
                                >
                                    <Input
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Ask about your results..."
                                        className="flex-1 bg-background"
                                        disabled={isLoading}
                                    />
                                    <Button type="submit" size="icon" disabled={isLoading || !query.trim()}>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </form>
                                <div className="text-[10px] text-center text-muted-foreground italic">
                                    Transparency Notice: This AI only explains system-generated outcomes. It cannot change your score or status.
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 flex items-center justify-center"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <ShieldCheck className="h-7 w-7" />}
                </Button>
            </motion.div>
        </div>
    );
}
