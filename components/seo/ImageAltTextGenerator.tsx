import React, { useState } from 'react';
import { ImagePlus, Sparkles } from 'lucide-react';

export const ImageAltTextGenerator: React.FC = () => {
    const [imageUrl, setImageUrl] = useState('');
    const [altText, setAltText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const generateAltText = async () => {
        if (!imageUrl) return;
        setIsLoading(true);
        // In a real application, you would make an API call to an AI service
        // to generate the alt text. For this example, we'll use a placeholder.
        setTimeout(() => {
            setAltText(`A descriptive alt text for the image at ${imageUrl}`);
            setIsLoading(false);
        }, 2000);
    };

    return (
        <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ImagePlus className="text-cyan-400"/> AI Alt Text Generator
            </h3>
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Enter image URL"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="w-full bg-black/30 p-3 rounded-lg border border-gray-700 text-white"
                />
                <button
                    onClick={generateAltText}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-lg text-white font-bold flex items-center justify-center gap-2"
                    disabled={isLoading}
                >
                    {isLoading ? 'Generating...' : <><Sparkles size={18}/> Generate Alt Text</>}
                </button>
                {altText && (
                    <div className="relative bg-black/50 p-4 rounded-lg">
                        <h4 className="text-lg font-bold mb-2">Generated Alt Text</h4>
                        <p className="text-gray-300">{altText}</p>
                    </div>
                )}
            </div>
        </div>
    );
};