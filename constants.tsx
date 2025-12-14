
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
  BookCheck,
  Aperture,
  StickyNote,
  FileQuestion,
  EyeOff,
  CaseSensitive,
  FileCode,
  FileSpreadsheet,
  Briefcase
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
      { id: 'pdf-summary', name: 'PDF Summarizer', icon: Sparkles },
      { id: 'pdf-editable', name: 'PDF to Word/Excel', icon: FileText },
      { id: 'pdf-image', name: 'PDF ↔ Image', icon: Images },
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
      { id: 'text-case', name: 'Case Converter', icon: CaseSensitive },
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
      { id: 'dev-web-builder', name: 'AI Web Builder', icon: LayoutTemplate },
      { id: 'dev-format', name: 'Code Beautifier', icon: FileCode },
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
      { id: 'student-notes', name: 'Lecture Notes', icon: StickyNote },
      { id: 'student-solver', name: 'Homework Solver', icon: BookOpen },
      { id: 'student-questions', name: 'Question Gen', icon: FileQuestion },
      { id: 'student-paraphrase', name: 'Paraphraser', icon: RefreshCw },
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
      { id: 'util-calc', name: 'Calculators', icon: Calculator },
      { id: 'util-unit', name: 'Unit Converter', icon: RefreshCw },
      { id: 'util-password', name: 'Password Gen', icon: Lock },
      { id: 'util-qrcode', name: 'QR Generator', icon: QrCode },
      { id: 'util-obfuscator', name: 'Text Scrambler', icon: EyeOff },
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
      { id: 'ai-code', name: 'Code Generator', icon: Code2 },
      { id: 'ai-summarizer', name: 'Text Summarizer', icon: Sparkles },
      { id: 'ai-prompt', name: 'Prompt Gen', icon: Cpu },
      { id: 'ai-resume', name: 'Resume Writer', icon: Briefcase },
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
  // --- PDF TOOLS ---
  'pdf-summary': {
    title: 'AI PDF Summarizer - Summarize PDF Online Free',
    description: 'Summarize long PDF documents instantly with AI. Convert PDFs to bullet points, notes, or key takeaways for free.',
    h1: 'AI PDF Summarizer & Notes',
    content: {
      what: 'An intelligent document analysis tool that reads your PDF files and generates concise, easy-to-read summaries.',
      why: 'Don\'t waste time reading 50-page reports. Get the key information, bullet points, and main ideas in seconds.',
      how: [
        'Upload your PDF document.',
        'Click "Generate Summary".',
        'Read the AI-generated key points.',
        'Copy the summary to your notes.'
      ],
      features: [
        'Instant AI Summarization.',
        'Extracts Key Bullet Points.',
        'Handles Long Documents.',
        'Secure & Private.'
      ],
      faq: [
        { q: 'Is it accurate?', a: 'Yes, it uses advanced AI models to understand and condense text effectively.' }
      ]
    },
    relatedTools: ['pdf-editable', 'student-notes', 'ai-summarizer']
  },
  'pdf-merge-split': {
    title: 'Merge PDF & Split PDF Online Free - Dicetools',
    description: 'Best free online tool to merge PDF files or split PDF pages. Fast, secure, and no installation required. Try the PDF Merger today.',
    h1: 'Merge & Split PDF Files Online',
    content: {
      what: 'A comprehensive PDF utility that functions as both a PDF Merger and a PDF Splitter. Combine multiple documents into one or extract specific pages to create a new file.',
      why: 'Organizing digital documents shouldn\'t require expensive software. Whether you need to combine reports or separate chapters, this tool handles it securely in your browser.',
      how: [
        'Choose "Merge" or "Split" mode.',
        'Upload your PDF file(s).',
        'For Merge: Drag and drop to reorder files.',
        'For Split: Click the pages you wish to extract.',
        'Download your newly organized PDF document.'
      ],
      features: [
        'Lossless quality preservation.',
        'Secure client-side processing.',
        'Multi-file batch merging.',
        'Visual page selector.'
      ],
      faq: [
        { q: 'Is it free?', a: 'Yes, 100% free with no limits.' },
        { q: 'Is it secure?', a: 'Yes, files are processed locally in your browser and never uploaded to a server.' }
      ]
    },
    relatedTools: ['pdf-compress', 'pdf-editable', 'pdf-image']
  },
  'pdf-compress': {
    title: 'PDF Compressor - Compress PDF Online Free',
    description: 'Reduce PDF file size online instantly. Best free PDF compressor to optimize documents for email and web without quality loss.',
    h1: 'Online PDF Compressor',
    content: {
      what: 'This tool reduces the file size of PDF documents by optimizing internal assets and images, making them smaller and easier to share.',
      why: 'Email attachments often have size limits (e.g., 25MB). Compressing your PDF allows you to send large reports, portfolios, and scanned documents easily.',
      how: [
        'Upload your large PDF file.',
        'Select compression level (Recommended is best for most users).',
        'Wait for the optimization process.',
        'Download the smaller PDF file.'
      ],
      features: [
        'Up to 80% file size reduction.',
        'Preserves text clarity.',
        'Works on mobile devices.',
        'No watermarks.'
      ],
      faq: [
        { q: 'Does it affect quality?', a: 'Our intelligent algorithm maintains high visual quality while removing redundant data.' }
      ]
    },
    relatedTools: ['pdf-merge-split', 'pdf-editable', 'img-resize']
  },
  'pdf-image': {
    title: 'Image to PDF & PDF to Image Converter',
    description: 'Convert JPG/PNG to PDF or turn PDF pages into images. Bidirectional converter for all your document needs.',
    h1: 'PDF ↔ Image Converter',
    content: {
      what: 'A versatile dual-mode tool. Convert multiple images (JPG, PNG, WEBP) into a single PDF document, OR extract pages from a PDF and save them as high-quality images.',
      why: 'Perfect for creating portfolios, digitizing receipts, or extracting visual content from reports for social media.',
      how: [
        'Select mode: "Image to PDF" or "PDF to Image".',
        'Upload your file(s).',
        'For Images: Reorder if needed and click "Convert".',
        'For PDF: Click "Convert Pages" to generate images.',
        'Download the result.'
      ],
      features: [
        'Bidirectional conversion.',
        'Bulk image uploading.',
        'Extracts high-quality JPGs.',
        'Private client-side processing.'
      ],
      faq: [
        { q: 'Can I download all images at once?', a: 'Yes, when converting PDF to Images, you can download a ZIP file containing all pages.' }
      ]
    },
    relatedTools: ['pdf-editable', 'img-resize', 'pdf-compress']
  },
  'pdf-editable': {
    title: 'PDF to Word, Excel & Text Converter - Free Online',
    description: 'Convert PDF files to editable Word (.doc), Excel (.csv), or Text formats. Preserves content for easy editing.',
    h1: 'PDF to Editable Converter',
    content: {
      what: 'Transform your static PDF documents into editable formats like Microsoft Word, Excel, or plain Text.',
      why: 'Need to edit a contract or analyze data from a report? Converting to an editable format saves you from retyping everything manually.',
      how: [
        'Upload the PDF file.',
        'Select output format: Word, Excel, or Text.',
        'Click "Convert to Editable".',
        'Download your file instantly.'
      ],
      features: [
        'Converts to Word (.doc) layout.',
        'Extracts tables to Excel (.csv).',
        'Secure client-side processing.',
        'No file size limits.'
      ],
      faq: [
        { q: 'Is it accurate?', a: 'It extracts text and layout structures efficiently, though complex styling may vary slightly.' }
      ]
    },
    relatedTools: ['pdf-merge-split', 'text-extractor', 'pdf-image']
  },

  // --- IMAGE TOOLS ---
  'img-resize': {
    title: 'Photo Resizer - Resize Image Online Free',
    description: 'Free online image resizer. Resize JPG, PNG, and WEBP images by pixels or percentage. Perfect for social media posts and web.',
    h1: 'Online Image Resizer',
    content: {
      what: 'Change the dimensions of your photos instantly. Resize by exact pixels or percentage scale while maintaining the aspect ratio.',
      why: 'Optimized images load faster on websites and look better on social media. Use this to prepare your content for Instagram, Twitter, or your blog.',
      how: [
        'Upload an image.',
        'Enter new width/height or select a preset.',
        'Click "Download Image".'
      ],
      features: [
        'Social Media Presets (IG, YouTube, Twitter).',
        'Aspect Ratio Lock.',
        'High-quality resampling.',
        'Supports transparency.'
      ],
      faq: [
        { q: 'Will my image look pixelated?', a: 'We use high-quality resampling algorithms to keep your images sharp.' }
      ]
    },
    relatedTools: ['img-crop', 'img-convert', 'img-watermark']
  },
  'img-crop': {
    title: 'Image Cropper - Crop Photo Online Free',
    description: 'Crop images online with ease. Cut photo to specific aspect ratios like 16:9, 4:3, or custom sizes. Free image cropping tool.',
    h1: 'Free Online Image Cropper',
    content: {
      what: 'Trim unwanted outer areas from your photos. Focus on the subject by cropping to specific shapes or custom rectangles.',
      why: 'Framing is key in photography. Cropping allows you to improve the composition of your shots post-capture.',
      how: [
        'Upload your photo.',
        'Drag the corners of the box to select area.',
        'Use presets like 1:1 for square crops.',
        'Click "Download Image".'
      ],
      features: [
        'Interactive drag & resize.',
        'Preset aspect ratios.',
        'Rotation and Flip support.',
        'Rule of thirds grid.'
      ],
      faq: [
        { q: 'What formats are supported?', a: 'JPG, PNG, and WEBP.' }
      ]
    },
    relatedTools: ['img-resize', 'img-filter', 'img-convert']
  },

  // --- TEXT TOOLS ---
  'text-counter': {
    title: 'Word Counter & Character Counter Online',
    description: 'Free online word counter and character count tool. Check text length for essays, tweets, and SEO descriptions instantly.',
    h1: 'Word & Character Counter',
    content: {
      what: 'A real-time analysis tool that counts words, characters, sentences, and paragraphs in your text.',
      why: 'Essential for writers meeting essay limits, social media managers writing tweets (280 chars), and SEOs writing meta descriptions.',
      how: [
        'Paste your text into the box.',
        'View the stats instantly below.',
        'No button click required.'
      ],
      features: [
        'Real-time counting.',
        'Counts spaces and no-spaces.',
        'Estimated reading time.',
        'Simple and clean UI.'
      ],
      faq: [
        { q: 'Is there a limit?', a: 'No, you can paste as much text as your browser can handle.' }
      ]
    },
    relatedTools: ['text-diff', 'text-speech', 'student-grammar']
  },
  'text-case': {
    title: 'Text Case Converter - Uppercase, Lowercase & Title Case',
    description: 'Easily convert text between Uppercase, Lowercase, Title Case, Sentence Case, and more. Free online text formatting tool.',
    h1: 'Text Case Converter',
    content: {
      what: 'A versatile text utility to instantly change the capitalization of your text. Convert whole paragraphs to uppercase, lowercase, or format headlines.',
      why: 'Left your caps lock on? Need to format a title properly? This tool fixes capitalization issues in seconds.',
      how: [
        'Paste your text.',
        'Click the button for your desired format (e.g., UPPERCASE, Title Case).',
        'Copy the formatted text.'
      ],
      features: [
        'Sentence case logic.',
        'Title Case formatting.',
        'Alternating & Inverse case modes.',
        'Instant conversion.'
      ],
      faq: [
        { q: 'Does it handle punctuation?', a: 'Yes, Sentence Case respects punctuation marks like periods and question marks.' }
      ]
    },
    relatedTools: ['text-counter', 'text-speech', 'seo-title']
  },
  'text-speech': {
    title: 'Text to Speech & Speech to Text Online',
    description: 'Convert text to voice (TTS) and voice to text (STT) online. Free AI speech converter and transcription tool.',
    h1: 'Text to Speech & Transcription',
    content: {
      what: 'A dual-mode accessibility tool. Convert written text into spoken audio (TTS) or transcribe microphone input into text (STT).',
      why: 'Listen to articles while multitasking, or dictate notes faster than you can type.',
      how: [
        'Select mode (TTS or STT).',
        'TTS: Paste text and click Play.',
        'STT: Click mic and start speaking.',
        'Download the audio or transcript.'
      ],
      features: [
        'Natural AI voices.',
        'Download WAV audio.',
        'Real-time dictation.',
        'Pitch and Rate control.'
      ],
      faq: [
        { q: 'Is it accurate?', a: 'It uses your browser\'s native speech engine, which is generally very accurate for clear speech.' }
      ]
    },
    relatedTools: ['text-counter', 'ai-summarizer', 'ai-chat']
  },

  // --- STUDENT TOOLS ---
  'student-notes': {
    title: 'Lecture Notes Summarizer & PDF to Study Guide',
    description: 'Upload lecture notes or PDFs to create bullet points, study guides, and Q&A automatically. Best AI study assistant.',
    h1: 'Lecture Notes & PDF Summarizer',
    content: {
      what: 'A powerful study companion that digests long lecture notes, chapters, or PDF slides and converts them into organized study materials.',
      why: 'Reading 50 pages of notes is hard. This tool extracts the key information instantly, creating concise bullet points or practice questions to help you study smarter.',
      how: [
        'Upload your PDF lecture notes or paste text.',
        'Select output mode (Bullet Points, Study Guide, Q&A).',
        'Click "Generate Notes".',
        'Review and copy your study material.'
      ],
      features: [
        'Supports PDF Uploads.',
        'Generates Practice Q&A.',
        'Creates Structured Study Guides.',
        'Extracts Key Concepts.'
      ],
      faq: [
        { q: 'Can it read scanned PDFs?', a: 'It works best with text-based PDFs. Scanned images may not be read accurately.' }
      ]
    },
    relatedTools: ['student-solver', 'ai-summarizer', 'student-paraphrase']
  },
  'student-solver': {
    title: 'AI Homework Solver & Question Answerer',
    description: 'Get disciplined, step-by-step answers for any subject. Solves Math, Physics, Chemistry, and more with clean formatting.',
    h1: 'AI Homework & Question Solver',
    content: {
      what: 'An intelligent tutoring assistant that solves homework questions and explains concepts in a disciplined, clean format. It covers all major academic subjects.',
      why: 'Stuck on a math problem or need a clear definition for a science term? Get direct, distraction-free answers that mimic a well-written notebook entry.',
      how: [
        'Select your subject (Math, Physics, History, etc.).',
        'Type your question.',
        'Click "Get Answer".',
        'View the clean, structured solution.'
      ],
      features: [
        'Step-by-step Math solutions.',
        'Notebook-style display.',
        'Supports all major subjects.',
        'Clean output without clutter.'
      ],
      faq: [
        { q: 'Is it accurate?', a: 'Yes, it uses advanced AI to provide academic-standard answers.' }
      ]
    },
    relatedTools: ['student-grammar', 'student-questions', 'student-notes']
  },
  'student-grammar': {
    title: 'Grammar Checker Online Free - Correct Grammar & Spelling',
    description: 'Free AI grammar checker and spell checker. Fix grammar mistakes, punctuation, and improve writing style instantly.',
    h1: 'Free Online Grammar Checker',
    content: {
      what: 'An intelligent writing assistant that scans your text for grammatical errors, spelling mistakes, and style improvements.',
      why: 'Submit error-free essays, emails, and reports. Good grammar improves credibility and readability.',
      how: [
        'Paste your text into the input box.',
        'Click "Improve Writing".',
        'View the corrected version with suggestions.',
        'Copy the improved text.'
      ],
      features: [
        'AI-powered analysis.',
        'Fixes spelling & punctuation.',
        'Improves sentence flow.',
        'Subject-verb agreement checks.'
      ],
      faq: [
        { q: 'How does it work?', a: 'It uses advanced language models to understand context and suggest corrections.' }
      ]
    },
    relatedTools: ['student-paraphrase', 'student-questions', 'text-counter']
  },
  'student-paraphrase': {
    title: 'Free Paraphrasing Tool - Rewrite Text & Remove Plagiarism',
    description: 'Best free AI paraphrasing tool. Rewrite essays, articles, and text to avoid plagiarism and improve clarity. Multiple modes available.',
    h1: 'AI Paraphrasing Tool',
    content: {
      what: 'A smart rewriting tool that rephrases your text to make it unique, clear, and engaging while keeping the original meaning.',
      why: 'Avoid accidental plagiarism in academic papers or refresh old content for SEO. It helps you find new ways to express ideas.',
      how: [
        'Paste your text into the input box.',
        'Select a mode (Standard, Formal, Academic, etc.).',
        'Click "Paraphrase".',
        'Copy the unique, rewritten text.'
      ],
      features: [
        'Removes plagiarism.',
        'Improves sentence structure.',
        'Academic & Formal modes.',
        'Maintains original meaning.'
      ],
      faq: [
        { q: 'Is it free?', a: 'Yes, our paraphraser is free to use.' }
      ]
    },
    relatedTools: ['student-grammar', 'student-solver', 'text-counter']
  },
  'student-questions': {
    title: 'AI Question Generator - Create MCQs & Short Questions',
    description: 'Generate practice questions, MCQs, and quizzes from any text or chapter. Perfect for students and teachers to create exams instantly.',
    h1: 'AI Question & Quiz Generator',
    content: {
      what: 'A powerful educational tool that converts your textbook chapters, notes, or articles into practice exams. It generates Multiple Choice Questions (MCQs), Short Answer, and Long Answer questions with answer keys.',
      why: 'Studying for an exam? Test your knowledge by generating a quiz from your notes. Teachers can also use it to quickly create test papers.',
      how: [
        'Paste your text or upload a PDF chapter.',
        'Select Question Type (MCQ, Short, Long).',
        'Choose Difficulty and Quantity.',
        'Click "Generate Questions".'
      ],
      features: [
        'Generates MCQs with Options.',
        'Includes Answer Keys.',
        'Supports Long & Short formats.',
        'Reads from PDF or Text.'
      ],
      faq: [
        { q: 'Are the answers accurate?', a: 'The AI generates answers based strictly on the provided text to ensure accuracy.' }
      ]
    },
    relatedTools: ['util-calc', 'student-grammar', 'student-paraphrase']
  },

  // --- AI TOOLS ---
  'ai-chat': {
    title: 'AI Chat Bot - Free Online AI Assistant',
    description: 'Chat with an intelligent AI assistant. Get answers to questions, write content, and solve problems instantly.',
    h1: 'AI Chat Assistant',
    content: {
      what: 'A versatile AI chatbot designed to help you with a wide range of tasks, from general knowledge to creative writing.',
      why: 'Access a smart assistant 24/7 to boost your productivity and get instant answers.',
      how: [
        'Type your message in the chat box.',
        'Receive an instant, helpful response.',
        'Continue the conversation.'
      ],
      features: [
        'Natural conversation.',
        'General knowledge.',
        'Creative writing helper.',
        'Problem solving.'
      ],
      faq: [
        { q: 'Is it free?', a: 'Yes, this tool is free to use.' }
      ]
    },
    relatedTools: ['ai-summarizer', 'ai-code', 'ai-prompt']
  },
  'ai-code': {
    title: 'AI Code Generator & Assistant - Write Code Instantly',
    description: 'Free AI code generator. Generate Python, JavaScript, PHP, HTML, and CSS code from text descriptions. Debug and explain code.',
    h1: 'AI Code Generator',
    content: {
      what: 'An intelligent coding assistant that converts natural language requests into clean, functional code snippets in various programming languages.',
      why: 'Speed up development by generating boilerplate code, solving algorithms, or understanding complex functions instantly.',
      how: [
        'Select your programming language.',
        'Describe what you want the code to do (or paste code to explain).',
        'Click "Generate".',
        'Copy the result to your IDE.'
      ],
      features: [
        'Supports JS, Python, PHP, HTML, CSS.',
        'Explains complex logic.',
        'Refactors and optimizes code.',
        'Instant syntax generation.'
      ],
      faq: [
        { q: 'Is the code bug-free?', a: 'While highly accurate, always review and test generated code before using it in production.' }
      ]
    },
    relatedTools: ['dev-format', 'dev-web-builder', 'dev-json']
  },
  'ai-summarizer': {
    title: 'Text Summarizer - Summarize Articles Online',
    description: 'Free AI text summarizer. Condense long articles, essays, and text into short summaries instantly.',
    h1: 'AI Text Summarizer',
    content: {
      what: 'An Artificial Intelligence tool that reads long blocks of text and outputs the key points in a concise summary.',
      why: 'Save time reading long reports, research papers, or news articles. Get the gist in seconds.',
      how: [
        'Paste the long text.',
        'Click the summarize button.',
        'Read or copy the generated abstract.'
      ],
      features: [
        'AI-powered understanding.',
        'Bullet point extraction.',
        'Adjustable length (via prompt).',
        'Instant results.'
      ],
      faq: [
        { q: 'Is there a word limit?', a: 'It works best with texts under 2000 words.' }
      ]
    },
    relatedTools: ['ai-chat', 'text-speech', 'text-counter']
  },
  'ai-resume': {
    title: 'Free AI Resume & Cover Letter Writer',
    description: 'Generate professional resumes and cover letters instantly. Customizable for any job role and experience level.',
    h1: 'AI Resume & Cover Letter Builder',
    content: {
      what: 'A smart career tool that writes professional, ATS-friendly resumes and cover letters tailored to your specific job targets.',
      why: 'Writing a resume from scratch is difficult. This tool helps you articulate your skills and experience professionally in seconds.',
      how: [
        'Select "Resume" or "Cover Letter".',
        'Enter your Job Title and Experience.',
        'List your key skills and background.',
        'Click "Generate" to get a formatted draft.'
      ],
      features: [
        'Professional & Academic formats.',
        'Customizable skills section.',
        'ATS-friendly structure.',
        'Instant generation.'
      ],
      faq: [
        { q: 'Is it free?', a: 'Yes, you can generate unlimited drafts.' }
      ]
    },
    relatedTools: ['ai-chat', 'student-solver', 'text-counter']
  },
  'ai-prompt': {
    title: 'AI Prompt Generator - Improve Midjourney Prompts',
    description: 'Enhance your AI art prompts. Generate detailed, descriptive prompts for Midjourney, DALL-E, and Stable Diffusion.',
    h1: 'AI Prompt Engineer',
    content: {
      what: 'A tool to expand basic ideas into detailed, professional prompts for AI image generators.',
      why: 'Better prompts yield better images. This tool adds lighting, style, and texture details automatically.',
      how: [
        'Enter a basic idea (e.g., "A cat").',
        'Click "Enhance".',
        'Copy the detailed prompt.'
      ],
      features: [
        'Adds stylistic details.',
        'Optimizes for Midjourney/DALL-E.',
        'Instant expansion.',
        'Professional vocabulary.'
      ],
      faq: [
        { q: 'Does it generate images?', a: 'No, it generates text prompts for you to use in image generators.' }
      ]
    },
    relatedTools: ['ai-resume', 'ai-chat', 'dev-web-builder']
  },

  // --- DEV TOOLS ---
  'dev-web-builder': {
    title: 'AI Website Builder - Generate Website Code Online',
    description: 'Free AI website generator. Create full HTML/Tailwind websites from text descriptions. Preview and edit code instantly.',
    h1: 'AI Website Builder & Code Generator',
    content: {
      what: 'An advanced AI assistant that generates complete, responsive website templates based on your instructions. It outputs ready-to-use HTML and Tailwind CSS code.',
      why: 'Speed up your development process by letting AI build the boilerplate, layout, and styling. Perfect for prototyping ideas or creating simple landing pages.',
      how: [
        'Describe your website (e.g., "Portfolio for a photographer").',
        'Click "Generate Website".',
        'Switch between "Code View" and "Live Preview".',
        'Copy the code to your project.'
      ],
      features: [
        'Generates HTML + Tailwind CSS.',
        'Responsive mobile-friendly designs.',
        'Includes Hero, Features, Contact sections.',
        'Live interactive preview.'
      ],
      faq: [
        { q: 'Do I need a backend?', a: 'The generated code is static HTML/CSS, which you can host anywhere (Vercel, Netlify, GitHub Pages).' }
      ]
    },
    relatedTools: ['dev-json', 'seo-meta', 'ai-chat']
  },
  'dev-format': {
    title: 'Code Beautifier & Formatter - HTML, CSS, JS, Python',
    description: 'Free online code formatter. Beautify and format HTML, CSS, JavaScript, Python, PHP, and JSON. Highlights syntax errors instantly.',
    h1: 'Code Beautifier & Formatter',
    content: {
      what: 'A powerful multi-language code formatter that cleans up messy code, fixes indentation, and highlights syntax errors using AI.',
      why: 'Readable code is essential for debugging and maintenance. Don\'t waste time manually fixing indentation.',
      how: [
        'Select your programming language.',
        'Paste the messy code.',
        'Click "Format Code".',
        'Copy the beautified result.'
      ],
      features: [
        'Supports HTML, CSS, JS, Python, PHP, JSON.',
        'AI-powered syntax checking.',
        'Fixes indentation & spacing.',
        'Instant processing.'
      ],
      faq: [
        { q: 'Does it fix logic errors?', a: 'It primarily fixes formatting and syntax errors, not complex logical bugs.' }
      ]
    },
    relatedTools: ['dev-json', 'dev-web-builder', 'text-diff']
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
  'dev-api': {
    title: 'API Tester Online - Mock API Requests',
    description: 'Free online API tester. Simulate GET, POST, PUT requests and view responses. Useful for testing endpoints quickly.',
    h1: 'Online API Tester',
    content: {
      what: 'A simple utility to test API endpoints or generate mock JSON responses for prototyping.',
      why: 'Quickly verify if an API endpoint is reachable or simulate a response structure before building the backend.',
      how: [
        'Select HTTP Method (GET, POST, etc).',
        'Enter URL.',
        'Click Run to see the response.'
      ],
      features: [
        'Supports common HTTP methods.',
        'JSON response preview.',
        'Fast lightweight interface.',
        'History of requests.'
      ],
      faq: [
        { q: 'Can I send headers?', a: 'Currently supports basic requests. Advanced headers coming soon.' }
      ]
    },
    relatedTools: ['dev-json', 'dev-web-builder']
  },
  'dev-ask': {
    title: 'Mock Data Generator - Generate Random Data',
    description: 'Generate random user data, UUIDs, and lorem ipsum text for testing. Free developer data tool.',
    h1: 'Random Data Generator',
    content: {
      what: 'Generate placeholder data for your applications. Create UUIDs, random strings, or lorem ipsum text instantly.',
      why: 'Developers often need dummy data to test databases or UI layouts. This tool provides it instantly.',
      how: [
        'Type "uuid" for a unique ID.',
        'Leave empty for Lorem Ipsum text.',
        'Click Run.'
      ],
      features: [
        'UUID v4 generation.',
        'Lorem Ipsum text.',
        'Instant results.',
        'One-click copy.'
      ],
      faq: [
        { q: 'Is it random?', a: 'Yes, it uses cryptographically strong random values where applicable.' }
      ]
    },
    relatedTools: ['dev-json', 'util-password']
  },
  'util-calc': {
    title: 'Free Online Calculators - GPA, BMI, Loan & Scientific',
    description: 'All-in-one calculator suite. Includes Scientific Calculator, College GPA Calculator, BMI Health Calculator, and Loan/Mortgage Payment Calculator.',
    h1: 'Advanced Online Calculators',
    content: {
      what: 'A complete suite of essential calculators for students, homeowners, and health-conscious individuals.',
      why: 'Why visit different websites? Get precise calculations for your grades, finance, and health in one secure place.',
      how: [
        'Select the Calculator Mode (Scientific, GPA, BMI, Loan).',
        'Enter your values (e.g., Course Grades, Loan Amount).',
        'View results instantly.'
      ],
      features: [
        'Standard & Scientific Math.',
        'Cumulative GPA tracking.',
        'Monthly Mortgage Payments.',
        'BMI Health Categories.'
      ],
      faq: [
        { q: 'Is the loan calculator accurate?', a: 'It uses the standard amortization formula used by most banks.' }
      ]
    },
    relatedTools: ['student-questions', 'util-unit', 'text-counter']
  },
  'util-obfuscator': {
    title: 'Text Obfuscator & Scrambler - Hide Text Online',
    description: 'Scramble text to make it unreadable and restore it easily. Simple reversible text obfuscation tool.',
    h1: 'Text Obfuscator & Scrambler',
    content: {
      what: 'A utility to obfuscate or scramble text so it becomes unreadable to the human eye, with the ability to reverse the process.',
      why: 'Useful for hiding spoilers, temporarily obscuring sensitive info in shared snippets, or just for fun puzzles.',
      how: [
        'Enter your text.',
        'Click "Obfuscate" to scramble it.',
        'Copy the result.',
        'To restore, paste the scrambled text and click "Unscramble".'
      ],
      features: [
        'Reversible scrambling.',
        'Base64 + Reversal algorithm.',
        'Instant client-side processing.',
        'No data storage.'
      ],
      faq: [
        { q: 'Is this secure encryption?', a: 'No, this is simple obfuscation (encoding). Do not use for highly sensitive passwords.' }
      ]
    },
    relatedTools: ['util-password', 'text-counter', 'dev-json']
  },
};
