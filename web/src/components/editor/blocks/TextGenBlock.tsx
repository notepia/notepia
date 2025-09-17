import React, { FC, useEffect, useState } from "react";
import axios from "axios";

type TextGenBlockData = {
    model?: string;
    prompt?: string;
    text?: string
}

interface TextGenBlockProps {
    data: TextGenBlockData
    onChange: (data: TextGenBlockData) => void
    onGenerate: (data: string) => void
}

const TextGenBlock: FC<TextGenBlockProps> = ({ data, onChange, onGenerate }) => {
    const [models, setModels] = useState<string[]>([]);
    const [model, setModel] = useState(data.model || "");
    const [prompt, setPrompt] = useState(data.prompt || "");
    const [text, setText] = useState(data.text || "");
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        //if (!model || !prompt) return;
        setLoading(true);
        try {
            //const res = await axios.post("/api/v1/GenText", { model, prompt });

            onGenerate(prompt);
            onChange({ model, prompt, text });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-2 border rounded-xl flex">
            <input
                className="border p-2 flex-1"
                placeholder="Enter prompt..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />
            <select
                aria-label="select model"
                className="border p-1 mr-2"
                value={model}
                onChange={(e) => setModel(e.target.value)}
            >
                <option value="">Select model...</option>
                {models.map((m) => (
                    <option key={m} value={m}>
                        {m}
                    </option>
                ))}
            </select>
            <button
                onClick={handleGenerate}
                className="bg-blue-500 text-white px-2 py-1 rounded"
                disabled={loading}
            >
                {loading ? "Loading..." : "Generate"}
            </button>
        </div>
    );
}

export default TextGenBlock