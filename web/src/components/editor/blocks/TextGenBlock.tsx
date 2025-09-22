import { FC, useEffect, useState } from "react";
import { WandSparkles } from "lucide-react";

export interface TextGenModel {
    provider: string
    name: string
    id: string
}

export interface TextGenRequest {
    provider: string
    model: string
    prompt: string
}

export interface TextGenResponse {
    output: string
}

interface TextGenBlockProps {
    onListModels: () => TextGenModel[]
    onGenerate: (req: TextGenRequest) => TextGenResponse
}

const TextGenBlock: FC<TextGenBlockProps> = ({ onListModels, onGenerate }) => {
    const [models, setModels] = useState<TextGenModel[]>([]);
    const [model, setModel] = useState<TextGenModel>();
    const [prompt, setPrompt] = useState("");
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const models = await onListModels()
                setModels(models)
            }
            catch (e) {
                console.log(e)
            }
        }
        fetchData()
    }, [])

    const handleGenerate = async () => {
        if (!model || !prompt) return;
        setLoading(true);
        try {
            if (!model) return
            const res = await onGenerate({ provider: model.provider, model: model.name, prompt: prompt });

            setText(res.output)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="p-2 border rounded-xl flex flex-col sm:flex-row gap-2 flex-wrap max-w-full">
                <input
                    autoFocus
                    className="p-2 flex-1 dark:bg-neutral-900"
                    placeholder="Enter prompt..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value!)}
                />
                <div className="flex justify-between gap-2">
                    <select
                        aria-label="select model"
                        className="rounded-xl px-2 dark:border dark:bg-neutral-900 max-w-40"
                        value={model?.id}
                        onChange={(e) => { setModel(models.find(x => x.id == e.target.value)) }}
                    >
                        {models.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                    <button
                        aria-label="generate"
                        onClick={handleGenerate}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-center items-center w-10 h-10 p-2 border rounded-full"
                        disabled={loading}
                    >
                        <WandSparkles size={14} />
                    </button>
                </div>
            </div>
            <div>
                {text}
            </div>
        </div>
    );
}

export default TextGenBlock