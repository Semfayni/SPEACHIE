import { Link } from "react-router-dom";
import { ArrowLeft, Mic, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface WordResult {
    word: string;
    color: string;
}

const TrainingDictionPage = () => {
    // Текст для читання
    const [originalText] = useState("The quick brown fox jumps over the lazy dog. Clear articulation requires consistent practice.");
    const [isRecording, setIsRecording] = useState(false);
    const [status, setStatus] = useState<"idle" | "recording" | "uploading" | "done" | "error">("idle");
    const [results, setResults] = useState<{ accuracy: number, word_results: WordResult[] } | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
            recorder.onstop = async () => {
                setStatus("uploading");
                const blob = new Blob(chunksRef.current, { type: "audio/wav" });
                const formData = new FormData();
                formData.append("audio", blob, "speech.wav");
                formData.append("original_text", originalText);

                try {
                    const res = await fetch("https://overtalkative-josephina-multilaterally.ngrok-free.dev/analyze-diction", {
                        method: "POST",
                        body: formData,
                    });
                    const data = await res.json();
                    setResults(data);
                    setStatus("done");
                } catch {
                    setStatus("error");
                }
            };

            recorder.start();
            setIsRecording(true);
            setStatus("recording");
        } catch {
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
                <h1 className="mb-10 font-display text-4xl font-extrabold text-foreground">
                    {status === "done" ? "Analysis" : "Diction Trainer"}
                </h1>

                {/* Біле поле з текстом */}
                <motion.div
                    className="w-full max-w-2xl rounded-3xl border border-border bg-white px-8 py-10 shadow-xl mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex flex-wrap gap-x-2 gap-y-1 justify-center">
                        {status === "done" && results ? (
                            results.word_results.map((item, idx) => (
                                <span key={idx} style={{ color: item.color }} className="text-2xl font-bold transition-colors duration-500">
                                    {item.word}
                                </span>
                            ))
                        ) : (
                            originalText.split(" ").map((word, idx) => (
                                <span key={idx} className="text-2xl font-bold text-foreground">
                                    {word}
                                </span>
                            ))
                        )}
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {status !== "done" ? (
                        <div className="flex flex-col items-center">
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`h-28 w-28 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-[#E6864E]'} text-white shadow-2xl hover:scale-105`}
                            >
                                <Mic className="h-12 w-12" />
                            </button>
                            <p className="mt-6 font-semibold text-muted-foreground">
                                {status === "uploading" ? "AI is analyzing..." : isRecording ? "Stop and Analyze" : "Tap to start recording"}
                            </p>
                        </div>
                    ) : (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                            <div className="mb-8 text-center bg-white p-6 rounded-2xl border border-border shadow-lg min-w-[200px]">
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Diction Score</p>
                                <p className="text-5xl font-black text-[#E6864E]">{results?.accuracy}%</p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => { setStatus("idle"); setResults(null); }}
                                    className="flex items-center gap-2 px-8 py-3 bg-[#E6864E] text-white rounded-full font-bold hover:bg-[#d4753d] transition-all shadow-lg"
                                >
                                    <RotateCcw className="h-5 w-5" /> Try Again
                                </button>
                                <Link to="/training" className="px-8 py-3 bg-white border border-border rounded-full font-bold hover:bg-gray-50 transition-all">
                                    Done
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
};

export default TrainingDictionPage;