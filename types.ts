import { LucideIcon } from 'lucide-react';

export interface SubTool {
  id: string;
  name: string;
  icon: LucideIcon;
}

export interface ToolCategory {
  id: string;
  title: string;
  mainIcon: LucideIcon;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  shadowColor: string;
  subTools: SubTool[];
}

export interface SeoData {
  title: string; // Meta Title
  description: string; // Meta Description
  h1: string; // Main Page Title
  content: {
    what: string;
    why: string;
    how: string[]; // Steps
    features: string[];
    faq: { q: string; a: string }[];
  };
  relatedTools: string[]; // IDs of related tools to link to
}