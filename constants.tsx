
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
  Aperture
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
      { id: 'dev-web-builder', name: 'AI Web Builder', icon: LayoutTemplate },
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
      { id: 'ai-logo', name: 'Logo Generator', icon: Aperture },
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
    relatedTools: ['pdf-compress', 'pdf-convert', 'pdf-image']
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
    relatedTools: ['pdf-merge-split', 'pdf-convert', 'img-resize']
  },
  'pdf-image': {
    title: 'Image to PDF Converter - JPG to PDF Online',
    description: 'Convert JPG, PNG, and other images to PDF online for free. Create a single PDF document from multiple photos instantly.',
    h1: 'Image to PDF Converter',
    content: {
      what: 'A simple tool to convert image files (JPG, PNG, WEBP) into a professional PDF document. You can also extract images from a PDF.',
      why: 'Perfect for creating portfolios, sharing scanned receipts, or compiling photos into a single shareable file.',
      how: [
        'Select "Images to PDF".',
        'Upload one or more images.',
        'Click "Generate PDF".',
        'Your images will be compiled into a single document.'
      ],
      features: [
        'Supports multiple images.',
        'Maintains original image quality.',
        'Fast and private.',
        'Reverse conversion (PDF to Image) supported.'
      ],
      faq: [
        { q: 'Can I reorder images?', a: 'Yes, upload them in order or delete and re-add to organize.' }
      ]
    },
    relatedTools: ['pdf-convert', 'img-resize', 'pdf-compress']
  },
  'pdf-convert': {
    title: 'PDF to Word Converter & PDF to Text - Free Online',
    description: 'Convert PDF to Word (Text) or Images. Extract text from PDF files easily online. Fast and accurate PDF conversion tool.',
    h1: 'PDF to Text & Image Converter',
    content: {
      what: 'Convert your PDF documents into editable text files (.txt) or image formats (.jpg/.png). Great for extracting content from read-only files.',
      why: 'Editing PDFs can be hard. Converting them to text allows you to use the content in Word or other editors easily.',
      how: [
        'Upload the PDF file.',
        'Select "To Text", "To JPG", or "To PNG".',
        'Click "Download Processed File".'
      ],
      features: [
        'Extracts raw text accurately.',
        'High-resolution image rendering.',
        'Browser-based security.',
        'Simple interface.'
      ],
      faq: [
        { q: 'Does it keep formatting?', a: 'The "To Text" mode extracts raw text. For layout preservation, use "To Image".' }
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
    relatedTools: ['student-plagiarism', 'student-citation', 'text-counter']
  },
  'student-plagiarism': {
    title: 'Plagiarism Checker Free - Check Originality Online',
    description: 'Free plagiarism checker for students and writers. Check text for duplicate content and uniqueness score online.',
    h1: 'Free Plagiarism Checker',
    content: {
      what: 'A tool to scan your text against common patterns to estimate its originality and uniqueness.',
      why: 'Avoid academic penalties and ensure your content is unique for SEO ranking.',
      how: [
        'Paste your essay or article.',
        'Click "Check".',
        'Wait for the scan to complete.',
        'Review the uniqueness score.'
      ],
      features: [
        'Percentage based scoring.',
        'Readability analysis.',
        'Fast scanning.',
        'No sign-up required.'
      ],
      faq: [
        { q: 'Is it 100% accurate?', a: 'It provides an estimate based on pattern matching. For critical academic work, use university-provided tools.' }
      ]
    },
    relatedTools: ['student-grammar', 'student-citation', 'student-gpa']
  },
  'student-citation': {
    title: 'Citation Generator - APA, MLA, Chicago Format',
    description: 'Free citation machine. Generate APA, MLA, Chicago, and Harvard citations for websites and books instantly.',
    h1: 'Free Citation Generator',
    content: {
      what: 'Create properly formatted bibliographic references for your papers in APA, MLA, Chicago, or Harvard styles.',
      why: 'Citing sources correctly is mandatory for academic integrity but hard to memorize. This tool automates it.',
      how: [
        'Select Citation Style (e.g., APA).',
        'Choose Source Type (Website/Book).',
        'Enter details (Author, Title, Year).',
        'Click Generate to copy.'
      ],
      features: [
        'Supports 4 major styles.',
        'Instant formatting.',
        'One-click copy.',
        'Clean interface.'
      ],
      faq: [
        { q: 'Is this current?', a: 'Yes, we update formats to match the latest style guides.' }
      ]
    },
    relatedTools: ['student-gpa', 'student-grammar', 'student-plagiarism']
  },

  // --- AI TOOLS ---
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
  'ai-logo': {
    title: 'Free AI Logo Generator - Create Logos Online',
    description: 'Generate professional logos instantly with AI. Create unique brand identities from text prompts for free.',
    h1: 'AI Logo Generator',
    content: {
      what: 'A powerful AI tool that generates unique logo concepts based on your text description. It creates multiple variations instantly.',
      why: 'Starting a new business or project? get professional logo ideas in seconds without hiring a designer.',
      how: [
        'Describe your logo idea (e.g., "Minimalist coffee shop logo").',
        'Click "Generate Logos".',
        'View 4 unique variations.',
        'Download your favorite design.'
      ],
      features: [
        '4 instant variations.',
        'High-quality generation.',
        'No watermark.',
        'Unlimited attempts.'
      ],
      faq: [
        { q: 'Is it free?', a: 'Yes, you can generate and download logos for free.' }
      ]
    },
    relatedTools: ['ai-prompt', 'img-resize', 'img-convert']
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
    relatedTools: ['student-citation', 'student-grammar', 'student-plagiarism']
  }
};
