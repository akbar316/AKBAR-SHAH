import React, { useState } from 'react';
import { Copy, Code } from 'lucide-react';

export const SchemaMarkupGenerator: React.FC = () => {
    const [schemaType, setSchemaType] = useState('Article');
    const [formData, setFormData] = useState<any>({ headline: '', author: '', datePublished: '' });
    const [schema, setSchema] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const generateSchema = () => {
        const schemaObject = {
            '@context': 'https://schema.org',
            '@type': schemaType,
            ...formData
        };
        setSchema(JSON.stringify(schemaObject, null, 2));
    };

    const renderForm = () => {
        switch (schemaType) {
            case 'Article':
                return (
                    <>
                        <input type="text" name="headline" placeholder="Headline" onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded-lg mb-2 text-white" />
                        <input type="text" name="author" placeholder="Author" onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded-lg mb-2 text-white" />
                        <input type="date" name="datePublished" placeholder="Date Published" onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded-lg text-white" />
                    </>
                );
            case 'FAQPage':
                // Simplified for brevity
                return <p className='text-gray-400'>FAQ schema form coming soon.</p>
            default:
                return null;
        }
    }

    return (
        <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Code className="text-cyan-400"/> Schema Markup Generator</h3>
            <div className="space-y-4">
                <select value={schemaType} onChange={e => setSchemaType(e.target.value)} className="w-full bg-black/30 p-3 rounded-lg border border-gray-700 text-white">
                    <option>Article</option>
                    <option>FAQPage</option>
                    <option>HowTo</option>
                </select>
                <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                    {renderForm()}
                </div>
                <button onClick={generateSchema} className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-lg text-white font-bold">Generate Schema</button>
                {schema && (
                    <div className="relative bg-black/50 p-4 rounded-lg group">
                        <h4 className="text-lg font-bold mb-2">Generated Schema</h4>
                        <pre className="text-sm text-gray-300 overflow-auto max-h-60">{schema}</pre>
                        <button onClick={() => navigator.clipboard.writeText(schema)} className="absolute top-3 right-3 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"><Copy size={18}/></button>
                    </div>
                )}
            </div>
        </div>
    );
};