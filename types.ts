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