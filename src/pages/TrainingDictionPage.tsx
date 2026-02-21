import { Link } from "react-router-dom";
import { ArrowLeft, Mic } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const TRANSCRIBE_URL = "/api/transcribe"; // бекенд-ендпоінт

const TrainingDictionPage = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [status, setStatus] = useState<"idle" | "recording" | "uploading" | "done" | "error">("idle");
    const [text, setText] = useState("Tap the microphone and read the text aloud.");

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);

    useEffect(() => {
        return () => {
            // cleanup на виході зі сторінки
            try {
                mediaRecorderRef.current?.stop();
            } catch {}
            streamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, []);

    const startRecording = async () => {
        try {
            setText("Recording...");
            setStatus("recording");

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mimeType =
                MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                    ? "audio/webm;codecs=opus"
                    : "audio/webm";

            const recorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                try {
                    setStatus("uploading");
                    setText("Uploading audio...");

                    const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
                    const file = new File([blob], "recording.webm", { type: blob.type });

                    const formData = new FormData();
                    formData.append("audio", file);

                    const res = await fetch(TRANSCRIBE_URL, {
                        method: "POST",
                        body: formData,
                    });

                    if (!res.ok) throw new Error(`HTTP ${res.status}`);

                    const data = (await res.json()) as { text?: string };
                    setText(data.text?.trim() || "No text returned.");
                    setStatus("done");
                } catch {
                    setStatus("error");
                    setText("Error while uploading/transcribing. Try again.");
                } finally {
                    streamRef.current?.getTracks().forEach((t) => t.stop());
                    streamRef.current = null;
                    setIsRecording(false);
                }
            };

            recorder.start();
            setIsRecording(true);
        } catch {
            setStatus("error");
            setText("Microphone access denied or unavailable.");
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        try {
            setText("Stopping...");
            setStatus("uploading");
            mediaRecorderRef.current?.stop();
        } catch {
            setStatus("error");
            setText("Could not stop recording.");
            setIsRecording(false);
        }
    };

    const toggleMic = () => {
        if (isRecording) stopRecording();
        else startRecording();
    };

    return (
        <main className="container mx-auto px-4 pt-24 pb-16">
            <Link
                to="/training"
                className="mb-10 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Training
            </Link>

            <div className="flex flex-col items-center">
                <motion.h1
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 font-display text-4xl font-extrabold text-foreground"
                >
                    Diction Trainer
                </motion.h1>

                {/* Блок з текстом */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="w-full max-w-2xl rounded-2xl border border-border bg-card px-8 py-6 fun-shadow"
                >
                    <p className="text-base font-medium text-foreground">{text}</p>
                </motion.div>

                {/* Кнопка мікрофона */}
                <motion.button
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.12 }}
                    onClick={toggleMic}
                    aria-label="Toggle microphone"
                    className={[
                        "mt-14 flex h-28 w-28 items-center justify-center rounded-full",
                        "bg-[#E6864E] text-white shadow-sm transition-transform",
                        "hover:scale-[1.03] active:scale-[0.98]",
                        isRecording ? "ring-4 ring-[#E6864E]/25" : "",
                    ].join(" ")}
                >
                    <Mic className="h-12 w-12" />
                </motion.button>

                {/* Підпис */}
                <p className="mt-6 text-sm font-semibold text-muted-foreground">
                    {isRecording ? "Recording... tap to stop" : "Tap the microphone to start"}
                </p>

                {/* маленький статус (необов’язково) */}
                <p className="mt-2 text-xs text-muted-foreground">
                    {status === "uploading" ? "Uploading/transcribing..." : status === "error" ? "Error" : ""}
                </p>
            </div>
        </main>
    );
};

export default TrainingDictionPage;