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
  LayoutTemplate
} from 'lucide-react';
import { ToolCategory } from './types';

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
      { id: 'pdf-split', name: 'Split', icon: Scissors },
      { id: 'pdf-convert', name: 'Convert', icon: RefreshCw },
      { id: 'pdf-sign', name: 'Sign', icon: PenTool },
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
      { id: 'text-extractor', name: 'Extractor', icon: Search },
      { id: 'text-counter', name: 'Counter', icon: Hash },
      { id: 'text-diff', name: 'Diff Check', icon: AlignLeft },
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
      { id: 'dev-json', name: 'JSON fmt', icon: Braces },
      { id: 'dev-api', name: 'API Test', icon: Terminal },
      { id: 'dev-ask', name: 'Generator', icon: MessageSquare },
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
      { id: 'img-resize', name: 'Resizer', icon: Scaling },
      { id: 'img-crop', name: 'Cropper', icon: Crop },
      { id: 'img-convert', name: 'Convert', icon: Layers },
      { id: 'img-filter', name: 'Filters', icon: Wand2 },
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
      { id: 'student-gpa', name: 'GPA Calc', icon: Calculator },
      { id: 'student-citation', name: 'Citation', icon: BookOpen },
      { id: 'student-plagiarism', name: 'Check', icon: Search },
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
      { id: 'util-unit', name: 'Converter', icon: RefreshCw },
      { id: 'util-password', name: 'Pass Gen', icon: Lock },
      { id: 'util-qrcode', name: 'QR Code', icon: QrCode },
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
      { id: 'ai-chat', name: 'AI Chat', icon: MessageSquare },
      { id: 'ai-summarizer', name: 'Summary', icon: Sparkles },
      { id: 'ai-prompt', name: 'Prompter', icon: Cpu },
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
      { id: 'seo-keyword', name: 'Keywords', icon: Tag },
      { id: 'seo-meta', name: 'Meta Gen', icon: Code2 },
      { id: 'seo-content', name: 'Optimizer', icon: FileSearch },
      { id: 'seo-title', name: 'Headline', icon: Type },
      { id: 'seo-report', name: 'SEO Report', icon: TrendingUp },
    ]
  }
];