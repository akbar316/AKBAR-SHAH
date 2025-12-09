
import { 
  FileText, 
  Files, 
  Scissors, 
  RefreshCw, 
  PenTool, 
  Type, 
  AlignLeft, 
  Search, 
  Hash, 
  Code2, 
  Braces, 
  Terminal, 
  MessageSquare, 
  Image as ImageIcon, 
  Crop, 
  Wand2, 
  Layers,
  GraduationCap,
  Calculator,
  BookOpen,
  Settings,
  QrCode,
  Lock,
  Bot,
  Sparkles,
  Cpu,
  BarChart,
  Globe,
  Tag,
  Scaling,
  TrendingUp,
  FileSearch,
  LayoutTemplate,
  Minimize2,
  Images,
  Pencil,
  Stamp,
  Mic,
  BookCheck
} from 'lucide-react';
import { ToolCategory, SeoData } from './types';

export const TOOLS_DATA: ToolCategory[] = [
  {
    id: 'pdf',
    title: 'PDF Tools',
    mainIcon: FileText,
    description: 'Merge & Edit',
    gradientFrom: 'from-blue-900/80',
    gradientTo: 'to-blue-950/90',
    borderColor: 'border-blue-500/30',
    shadowColor: 'shadow-blue-500/20',
    subTools: [
      { id: 'pdf-convert', name: 'PDF Converter', icon: RefreshCw },
      { id: 'pdf-image', name: 'Image to PDF', icon: Images },
      { id: 'pdf-compress', name: 'Compress PDF', icon: Minimize2 },
      { id: 'pdf-merge-split', name: 'Split & Merge', icon: Layers },
    ]
  },
  {
    id: 'text',
    title: 'Text Tools',
    mainIcon: Type,
    description: 'Format & Analyze',
    gradientFrom: 'from-zinc-800/90',
    gradientTo: 'to-zinc-900/90',
    borderColor: 'border-zinc-500/30',
    shadowColor: 'shadow-zinc-500/20',
    subTools: [
      { id: 'text-extractor', name: 'Text Extractor', icon: Search },
      { id: 'text-counter', name: 'Word Counter', icon: Hash },
      { id: 'text-diff', name: 'Diff Checker', icon: AlignLeft },
      { id: 'text-speech', name: 'Text to Speech', icon: Mic },
    ]
  },
  {
    id: 'dev',
    title: 'Developer Tools',
    mainIcon: Code2,
    description: 'Code & API',
    gradientFrom: 'from-gray-900/90',
    gradientTo: 'to-black/90',
    borderColor: 'border-emerald-500/20',
    shadowColor: 'shadow-emerald-500/10',
    subTools: [
      { id: 'dev-json', name: 'JSON Formatter', icon: Braces },
      { id: 'dev-api', name: 'API Tester', icon: Terminal },
      { id: 'dev-ask', name: 'Data Generator', icon: MessageSquare },
    ]
  },
  {
    id: 'image',
    title: 'Image Tools',
    mainIcon: ImageIcon,
    description: 'Edit & Resize',
    gradientFrom: 'from-indigo-900/80',
    gradientTo: 'to-purple-950/90',
    borderColor: 'border-purple-500/30',
    shadowColor: 'shadow-purple-500/20',
    subTools: [
      { id: 'img-resize', name: 'Image Resizer', icon: Scaling },
      { id: 'img-crop', name: 'Image Cropper', icon: Crop },
      { id: 'img-watermark', name: 'Add Watermark', icon: Stamp },
      { id: 'img-convert', name: 'Image Converter', icon: Layers },
      { id: 'img-filter', name: 'Photo Filters', icon: Wand2 },
    ]
  },
  {
    id: 'student',
    title: 'Student Tools',
    mainIcon: GraduationCap,
    description: 'Study Aids',
    gradientFrom: 'from-amber-900/80',
    gradientTo: 'to-orange-950/90',
    borderColor: 'border-orange-500/30',
    shadowColor: 'shadow-orange-500/20',
    subTools: [
      { id: 'student-gpa', name: 'GPA Calculator', icon: Calculator },
      { id: 'student-citation', name: 'Citation Gen', icon: BookOpen },
      { id: 'student-plagiarism', name: 'Plagiarism Check', icon: Search },
      { id: 'student-grammar', name: 'Grammar Check', icon: BookCheck },
    ]
  },
  {
    id: 'utility',
    title: 'Utility Tools',
    mainIcon: Settings,
    description: 'Daily Helpers',
    gradientFrom: 'from-emerald-900/80',
    gradientTo: 'to-teal-950/90',
    borderColor: 'border-teal-500/30',
    shadowColor: 'shadow-teal-500/20',
    subTools: [
      { id: 'util-unit', name: 'Unit Converter', icon: RefreshCw },
      { id: 'util-password', name: 'Password Gen', icon: Lock },
      { id: 'util-qrcode', name: 'QR Generator', icon: QrCode },
    ]
  },
  {
    id: 'ai',
    title: 'AI Tools',
    mainIcon: Bot,
    description: 'Smart Logic',
    gradientFrom: 'from-rose-900/80',
    gradientTo: 'to-pink-950/90',
    borderColor: 'border-pink-500/30',
    shadowColor: 'shadow-pink-500/20',
    subTools: [
      { id: 'ai-chat', name: 'AI Chat Bot', icon: MessageSquare },
      { id: 'ai-summarizer', name: 'Text Summarizer', icon: Sparkles },
      { id: 'ai-prompt', name: 'Prompt Gen', icon: Cpu },
    ]
  },
  {
    id: 'seo',
    title: 'SEO Tools',
    mainIcon: BarChart,
    description: 'Web Rank',
    gradientFrom: 'from-cyan-900/80',
    gradientTo: 'to-sky-950/90',
    borderColor: 'border-cyan-500/30',
    shadowColor: 'shadow-cyan-500/20',
    subTools: [
      { id: 'seo-keyword', name: 'Keyword Tool', icon: Tag },
      { id: 'seo-meta', name: 'Meta Tags Gen', icon: Code2 },
      { id: 'seo-content', name: 'Content Optimizer', icon: FileSearch },
      { id: 'seo-title', name: 'Headline Check', icon: Type },
      { id: 'seo-report', name: 'SEO Audit', icon: TrendingUp },
    ]
  }
];

export const SEO_DATA: Record<string, SeoData> = {
  'pdf-merge-split': {
    title: 'Split & Merge PDF Files Free Online - Dicetools',
    description: 'Combine multiple PDFs into one or extract specific pages from a document. Fast, secure, and free online PDF splitter and merger.',
    h1: 'Split & Merge PDF Files',
    content: {
      what: 'This dual-function tool allows you to organize your PDF documents. "Merge" lets you combine multiple PDF files into a single document, while "Split" enables you to extract specific pages to create a new file.',
      why: 'Managing large PDF reports or compiling scattered documents can be tedious. This tool simplifies document organization without the need for expensive software like Adobe Acrobat.',
      how: [
        'Select "Split PDF" or "Merge PDFs" from the toggle.',
        'Upload your PDF file(s).',
        'For Split: Click the pages you want to keep.',
        'For Merge: Drag and drop files to reorder them.',
        'Click the action button to download your new PDF.'
      ],
      features: [
        'Lossless Processing: Keeps your text and quality intact.',
        'Secure: Files are processed in your browser.',
        'Drag & Drop Interface.',
        'Multi-file selection.'
      ],
      faq: [
        { q: 'Is this tool free?', a: 'Yes, it is completely free to use with no hidden charges.' },
        { q: 'Are my files saved?', a: 'No, all processing happens in your browser. Your files are never uploaded to a server.' }
      ]
    },
    relatedTools: ['pdf-compress', 'pdf-convert', 'pdf-image']
  },
  'pdf-compress': {
    title: 'Compress PDF Online - Reduce File Size Free | Dicetools',
    description: 'Reduce PDF file size online for free without losing quality. optimize PDF documents for email attachments and web upload.',
    h1: 'Free Online PDF Compressor',
    content: {
      what: 'The PDF Compressor tool reduces the file size of your documents by optimizing images and internal structures, making them easier to share via email or upload to websites.',
      why: 'Large PDF files are slow to upload and often blocked by email attachment limits. Compressing them saves storage space and bandwidth.',
      how: [
        'Upload the PDF you want to compress.',
        'Choose a compression level: Extreme, Recommended, or Less.',
        'Click "Compress PDF".',
        'Download the optimized file.'
      ],
      features: [
        'Three compression levels.',
        'Real-time size reduction estimates.',
        'Maintains document readability.',
        'Works on mobile and desktop.'
      ],
      faq: [
        { q: 'Will the quality decrease?', a: 'The "Recommended" setting balances quality and size perfectly. "Extreme" may reduce image quality slightly.' },
        { q: 'What is the max file size?', a: 'We recommend files under 50MB for best browser performance.' }
      ]
    },
    relatedTools: ['pdf-merge-split', 'pdf-convert', 'img-resize']
  },
  'img-resize': {
    title: 'Free Online Image Resizer - Resize JPG, PNG, WEBP',
    description: 'Resize images online in pixels or percentage. Perfect for Social Media, Web, and Email. Fast, free, and secure image resizing tool.',
    h1: 'Online Image Resizer',
    content: {
      what: 'A powerful tool to change the dimensions (width and height) of your images. It supports common formats like JPG, PNG, and WEBP.',
      why: 'Social media platforms and websites require specific image dimensions. Resizing ensures your images look professional and load quickly.',
      how: [
        'Upload your image.',
        'Choose "Pixels" or "Percentage".',
        'Enter new width or height (Aspect ratio is locked by default).',
        'Click "Download Image".'
      ],
      features: [
        'Social Media Presets (Instagram, Twitter, YouTube).',
        'Maintain Aspect Ratio lock.',
        'High-quality resampling.',
        'No watermarks.'
      ],
      faq: [
        { q: 'Does it support transparent PNGs?', a: 'Yes, transparency is preserved during resizing.' },
        { q: 'Can I resize multiple images?', a: 'Currently, this tool processes one image at a time for maximum precision.' }
      ]
    },
    relatedTools: ['img-crop', 'img-convert', 'img-watermark']
  },
  'dev-json': {
    title: 'JSON Formatter & Validator - Prettify JSON Online',
    description: 'Format, validate, and beautify JSON data instantly. Best free online JSON formatter for developers.',
    h1: 'JSON Formatter & Beautifier',
    content: {
      what: 'This tool takes raw, minified, or ugly JSON strings and formats them into a readable, indented structure. It also validates the JSON syntax.',
      why: 'APIs often return minified JSON that is hard for humans to read. This tool makes debugging and data inspection effortless.',
      how: [
        'Paste your raw JSON into the input box.',
        'Click "Run".',
        'View the beautifully formatted JSON in the output box.',
        'Click "Copy" to use it.'
      ],
      features: [
        'Syntax highlighting.',
        'Error detection.',
        'One-click copy.',
        'Fast client-side processing.'
      ],
      faq: [
        { q: 'Is my JSON data secure?', a: 'Yes, the data is processed entirely in your browser using JavaScript. No data is sent to our servers.' }
      ]
    },
    relatedTools: ['dev-api', 'text-diff', 'util-qrcode']
  },
  'text-speech': {
    title: 'Text to Speech & Speech to Text Converter Online',
    description: 'Convert text to natural sounding speech or transcribe voice to text online. Free AI-powered speech synthesis and recognition.',
    h1: 'Speech Converter (TTS & STT)',
    content: {
      what: 'A versatile audio tool that works two ways: "Text to Speech" reads your text aloud using AI voices, and "Speech to Text" transcribes your voice or audio files into written text.',
      why: 'Great for accessibility, proofreading by listening, creating audio content, or quickly dictating notes without typing.',
      how: [
        'Select "Text to Speech" or "Speech to Text".',
        'For TTS: Paste text, select a voice, and click Play.',
        'For STT: Click the microphone and start speaking.',
        'Download the audio or transcript when done.'
      ],
      features: [
        'Multiple languages and accents.',
        'Pitch and Speed controls.',
        'Download audio (WAV/MP3).',
        'File upload for transcription.'
      ],
      faq: [
        { q: 'Which browsers are supported?', a: 'Chrome, Edge, and Safari offer the best support for Web Speech API features.' },
        { q: 'Is there a character limit?', a: 'No strict limit, but very long texts may be processed in chunks.' }
      ]
    },
    relatedTools: ['text-counter', 'text-extractor', 'ai-summarizer']
  },
  'student-gpa': {
    title: 'College GPA Calculator - Calculate Grade Point Average',
    description: 'Free college GPA calculator. Enter your courses, credits, and grades to calculate your semester and cumulative GPA instantly.',
    h1: 'Advanced GPA Calculator',
    content: {
      what: 'A calculator designed to help high school and college students track their academic performance by computing their Grade Point Average (GPA).',
      why: 'Knowing your GPA is crucial for scholarships, university applications, and academic probation tracking.',
      how: [
        'Click "Add Course" for each class you are taking.',
        'Enter the course name (optional).',
        'Select the grade (A, B, C...) and credit hours.',
        'Your GPA updates instantly in the header.'
      ],
      features: [
        'Supports weighted grades (A+, A-).',
        'Dynamic course list.',
        'Instant calculation.',
        'Clean, dark-mode interface.'
      ],
      faq: [
        { q: 'What is a 4.0 scale?', a: 'It is the standard grading scale where an A equals 4 points, B equals 3, etc.' }
      ]
    },
    relatedTools: ['student-citation', 'student-plagiarism', 'student-grammar']
  }
};
