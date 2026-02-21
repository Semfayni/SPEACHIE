import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Gender = "female" | "male";
type Language = "ukrainian" | "english";
type Scenario =
    | "interview"
    | "answering_during_lessons"
    | "conflict"
    | "salary_increase";
type Pressure = "low" | "medium" | "high";

type CreateSessionRequest = {
    gender: Gender;
    language: Language;
    scenario: Scenario;
    pressure: Pressure;
};

type CreateSessionResponse = {
    sessionId: string;
    embedUrl?: string;
};

const API_CREATE_SESSION = "/api/interview/session";

const TrainingInterviewPage = () => {
    const navigate = useNavigate();

    const [gender, setGender] = useState<Gender>("female");
    const [language, setLanguage] = useState<Language>("ukrainian");
    const [scenario, setScenario] = useState<Scenario>("interview");
    const [pressure, setPressure] = useState<Pressure>("low");

    const [isStarting, setIsStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [embedUrl, setEmbedUrl] = useState<string | null>(null);

    const payload: CreateSessionRequest = useMemo(
        () => ({ gender, language, scenario, pressure }),
        [gender, language, scenario, pressure]
    );

    const loadAgent = () => {
        if (document.querySelector('script[data-name="did-agent"]')) return;

        const script = document.createElement("script");
        script.type = "module";
        script.src = "https://agent.d-id.com/v2/index.js";

        script.setAttribute("data-mode", "full");
        script.setAttribute(
            "data-client-key",
            "Z29vZ2xlLW9hdXRoMnwxMDE4ODc0MDMwMDg4NzM5ODU2MzU6UGo3YWNPdWxhUWtpRW5oaERmcFBs"
        );
        script.setAttribute("data-agent-id", "v2_agt_QjmaoxuZ");
        script.setAttribute("data-name", "did-agent");
        script.setAttribute("data-monitor", "true");
        script.setAttribute("data-target-id", "did-agent-container");

        document.body.appendChild(script);
    };

    const handleStart = async () => {
        setError(null);
        setIsStarting(true);

        try {
            const res = await fetch(API_CREATE_SESSION, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const data = await res.json();

                if (data.embedUrl) {
                    setEmbedUrl(data.embedUrl);
                } else {
                    loadAgent();
                }
            } else {
                // якщо сервер не відповів — все одно запускаємо агента
                loadAgent();
            }
        } catch {
            // якщо бекенд недоступний — запускаємо агента
            loadAgent();
        } finally {
            setIsStarting(false);
        }
    };

    return (
        <main className="container mx-auto px-4 pt-24 pb-16">
            <Link
                to="/training"
                className="mb-8 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Training
            </Link>

            <div className="flex flex-col items-center">
                <motion.h1
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 font-display text-4xl font-extrabold text-foreground"
                >
                    AI Interview
                </motion.h1>

                {/* Avatar window */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-muted fun-shadow"
                >
                    <div className="relative aspect-[16/7] w-full">
                        {embedUrl ? (
                            <iframe
                                title="Interactive Avatar"
                                src={embedUrl}
                                className="absolute inset-0 h-full w-full"
                                allow="camera; microphone; autoplay; clipboard-write; encrypted-media"
                            />
                        ) : (
                            <div
                                id="did-agent-container"
                                className="absolute inset-0 h-full w-full"
                            />
                        )}
                    </div>
                </motion.div>

                <p className="mt-4 text-xs font-semibold text-muted-foreground">
                    Customize your interview and press Start to begin
                </p>

                {/* Controls */}
                <div className="mt-6 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as Gender)}
                        className="h-9 w-full rounded-full bg-[#E6864E] px-4 text-sm font-semibold text-white outline-none"
                    >
                        <option value="female">Gender: female</option>
                        <option value="male">Gender: male</option>
                    </select>

                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as Language)}
                        className="h-9 w-full rounded-full bg-[#E6864E] px-4 text-sm font-semibold text-white outline-none"
                    >
                        <option value="ukrainian">Language: ukrainian</option>
                        <option value="english">Language: english</option>
                    </select>

                    <select
                        value={scenario}
                        onChange={(e) => setScenario(e.target.value as Scenario)}
                        className="h-9 w-full rounded-full bg-[#E6864E] px-4 text-sm font-semibold text-white outline-none"
                    >
                        <option value="interview">Scenario: interview</option>
                        <option value="answering_during_lessons">
                            Scenario: answering during lessons
                        </option>
                        <option value="conflict">Scenario: conflict</option>
                        <option value="salary_increase">
                            Scenario: salary increase
                        </option>
                    </select>

                    <select
                        value={pressure}
                        onChange={(e) => setPressure(e.target.value as Pressure)}
                        className="h-9 w-full rounded-full bg-[#E6864E] px-4 text-sm font-semibold text-white outline-none"
                    >
                        <option value="low">Level of pressure: low</option>
                        <option value="medium">Level of pressure: medium</option>
                        <option value="high">Level of pressure: high</option>
                    </select>
                </div>

                <Button
                    size="sm"
                    onClick={handleStart}
                    disabled={isStarting}
                    className="mt-5 w-full max-w-xs rounded-full font-bold bg-[#E6864E] hover:bg-[#d9773f] text-white"
                >
                    {isStarting ? "Starting..." : "Start"}
                </Button>

                {error && (
                    <p className="mt-3 text-sm font-semibold text-red-500">
                        {error}
                    </p>
                )}
            </div>
        </main>
    );
};

export default TrainingInterviewPage;