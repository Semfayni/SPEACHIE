import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const YT_URL =
    "https://www.youtube.com/watch?v=Ks-_Mh1QhMc";

const videos = [
    { title: "Body Language Basics", desc: "Learn the fundamentals of non-verbal communication." },
    { title: "Gestures & Meaning", desc: "How gestures change the message you send." },
    { title: "Posture & Confidence", desc: "Simple posture habits that boost confidence." },
    { title: "Eye Contact Training", desc: "Practical drills for better presence." },
];

const EducationGesticulationPage = () => {
    const { t } = useLanguage();

    return (
        <main className="container mx-auto px-4 pt-24 pb-16">
            <Link
                to="/education"
                className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                {t("edu.back")}
            </Link>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 font-display text-4xl font-extrabold text-foreground sm:text-5xl"
            >
                {t("edu.gesticulation")}
            </motion.h1>

            <div className="grid gap-6">
                {videos.map((v, i) => (
                    <motion.div
                        key={v.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="overflow-hidden rounded-3xl border border-border bg-card fun-shadow"
                    >
                        <div className="grid gap-6 p-6 md:grid-cols-[240px_1fr] md:items-center">
                            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted flex items-center justify-center">
                                <Play className="h-10 w-10 text-muted-foreground" />
                            </div>

                            <div>
                                <h3 className="font-display text-xl font-bold text-foreground">{v.title}</h3>
                                <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>

                                <a href={YT_URL} target="_blank" rel="noreferrer">
                                    <Button
                                        size="sm"
                                        className="mt-4 rounded-full font-bold bg-[#E6864E] hover:bg-[#d9773f] text-white"
                                    >
                                        Open Course
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </main>
    );
};

export default EducationGesticulationPage;