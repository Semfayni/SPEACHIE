import { Link } from "react-router-dom";
import { ArrowLeft, Mic, RotateCcw, Loader2 } from "lucide-react"; // Додав Loader2
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Типізація (без змін)
interface AnalysisResponse {
    transcription: string;
    voice_confidence: { score: number; label: string };
    technical_metrics: {
        duration_sec: number;
        wpm: number;
        fillers_count: number;
        fillers_list: string[];
        silence_percent: number;
    };
    ai_analysis: {
        topic_score: number;
        style_score: number;
        structure_score: number;
        feedback: string;
        tips: string;
    };
}

const TrainingSpeechPage = () => {
    const [topic, setTopic] = useState("");
    const [style, setStyle] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [status, setStatus] = useState<"idle" | "recording" | "uploading" | "done" | "error">("idle");
    const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => {
                    if (prev >= 59) {
                        stopRecording();
                        return 60;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setRecordingTime(0);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isRecording]);

    const startRecording = async () => {
        if (!topic.trim() || !style.trim()) {
            alert("Please fill topic and style first!");
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
            recorder.onstop = async () => {
                setStatus("uploading"); // Модель на бекенді починає роботу
                const blob = new Blob(chunksRef.current, { type: "audio/wav" });
                const formData = new FormData();
                formData.append("audio", blob, "speech.wav");
                formData.append("topic", topic);
                formData.append("style", style);

                try {
                    const res = await fetch("http://127.0.0.1:5000/analyze", {
                        method: "POST",
                        body: formData,
                    });

                    if (!res.ok) throw new Error("Server error");

                    const data = await res.json();
                    setAnalysis(data);
                    setStatus("done");
                } catch (err) {
                    console.error(err);
                    setStatus("error");
                }
            };

            recorder.start();
            setIsRecording(true);
            setStatus("recording");
        } catch (err) {
            setStatus("error");
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
    };

    return (
        <main className="container mx-auto px-4 pt-24 pb-16 min-h-screen">
            <Link to="/training" className="mb-10 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Training
            </Link>

            <div className="flex flex-col items-center">
                <h1 className="mb-2 font-display text-4xl font-extrabold text-foreground text-center">
                    {status === "done" ? "Analysis" : status === "uploading" ? "Processing..." : "Speech Trainer"}
                </h1>

                <AnimatePresence mode="wait">
                    {/* СТАН ЗАВАНТАЖЕННЯ (AI АНАЛІЗ) */}
                    {status === "uploading" ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center py-20"
                        >
                            <Loader2 className="h-16 w-16 text-[#E6864E] animate-spin mb-6" />
                            <h2 className="text-2xl font-bold mb-2">Analyzing your speech...</h2>
                            <p className="text-muted-foreground animate-pulse text-center max-w-sm">
                                Our AI is listening to your recording, checking your style and confidence. Please wait.
                            </p>
                        </motion.div>
                    ) : status === "error" ? (
                        <motion.div key="error" className="py-20 text-center">
                            <p className="text-red-500 font-bold mb-4">Something went wrong. Please check connection.</p>
                            <button onClick={() => setStatus("idle")} className="px-6 py-2 bg-primary text-white rounded-full">Try Again</button>
                        </motion.div>
                    ) : status !== "done" ? (
                        /* СТАН ЗАПИСУ ТА ВВОДУ */
                        <motion.div key="input-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-xl flex flex-col items-center">
                            <p className="mb-10 text-sm font-semibold text-muted-foreground text-center">
                                Set topic & speaking style, then record your speech.
                            </p>
                            <div className="w-full space-y-3 mb-10">
                                <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic (e.g., Slang in Social Media)" className="w-full rounded-2xl border border-border bg-card px-5 py-3 text-sm outline-none fun-shadow focus:border-[#E6864E] transition-all" />
                                <input value={style} onChange={(e) => setStyle(e.target.value)} placeholder="Speech style (e.g., Presentation)" className="w-full rounded-2xl border border-border bg-card px-5 py-3 text-sm outline-none fun-shadow focus:border-[#E6864E] transition-all" />
                            </div>

                            <button onClick={() => isRecording ? stopRecording() : startRecording()} className={`flex h-28 w-28 items-center justify-center rounded-full transition-all ${isRecording ? "bg-red-500 animate-pulse" : "bg-[#E6864E]"} text-white shadow-xl hover:scale-110`}>
                                <Mic className="h-12 w-12" />
                            </button>
                            <p className="mt-4 font-bold text-[#E6864E]">{isRecording ? `00:${recordingTime.toString().padStart(2, '0')} / 01:00` : "Tap to start"}</p>
                        </motion.div>
                    ) : (
                        /* СТАН РЕЗУЛЬТАТІВ */
                        <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                <ScoreCard label="Topic" value={analysis?.ai_analysis.topic_score} />
                                <ScoreCard label="Style" value={analysis?.ai_analysis.style_score} />
                                <ScoreCard label="Structure" value={analysis?.ai_analysis.structure_score} />
                                <ScoreCard label="Confidence" value={Math.round((analysis?.voice_confidence.score || 0) * 100)} />
                            </div>

                            <div className="bg-white rounded-3xl p-8 border border-border fun-shadow space-y-6">
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Filler words:</h3>
                                    <p className="text-muted-foreground italic">{analysis?.technical_metrics.fillers_list.join(", ") || "None found"}</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">General feedback:</h3>
                                    <p className="text-foreground leading-relaxed">{analysis?.ai_analysis.feedback}</p>
                                </div>
                                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                                    <h3 className="font-bold text-orange-800 mb-1">Tips:</h3>
                                    <p className="text-orange-700">{analysis?.ai_analysis.tips}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-10 justify-center">
                                <button onClick={() => setStatus("idle")} className="flex items-center gap-2 px-8 py-3 bg-[#E6864E] text-white rounded-full font-bold hover:bg-[#d4753d] transition-colors shadow-lg">
                                    <RotateCcw className="h-5 w-5" /> Try Again
                                </button>
                                <Link to="/training" className="px-8 py-3 bg-white border border-border rounded-full font-bold hover:bg-gray-50 transition-colors">
                                    Back to Training
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
};

const ScoreCard = ({ label, value }: { label: string, value?: number }) => (
    <div className="bg-white p-6 rounded-3xl border border-border text-center fun-shadow">
        <h3 className="font-bold text-foreground mb-3">{label}</h3>
        <div className="h-3 w-full bg-orange-100 rounded-full mb-2 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${value || 0}%` }} transition={{ duration: 1 }} className="h-full bg-[#E6864E]" />
        </div>
        <span className="text-sm font-extrabold text-[#E6864E]">{value}%</span>
    </div>
);

export default TrainingSpeechPage;