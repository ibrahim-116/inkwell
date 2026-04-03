import { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';

declare module 'lucide-react' {
  export interface LucideProps extends Partial<SVGProps<SVGSVGElement>> {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
    className?: string;
  }

  export type LucideIcon = ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >;

  export const Clock: LucideIcon;
  export const Heart: LucideIcon;
  export const Bookmark: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const Share2: LucideIcon;
  export const Search: LucideIcon;
  export const Bell: LucideIcon;
  export const User: LucideIcon;
  export const Settings: LucideIcon;
  export const LogOut: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const MoreHorizontal: LucideIcon;
  export const MoreVertical: LucideIcon;
  export const Plus: LucideIcon;
  export const X: LucideIcon;
  export const Check: LucideIcon;
  export const Edit: LucideIcon;
  export const Trash: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const Calendar: LucideIcon;
  // Add more as needed, or use a wildcard if the module allows it.
  // For most cases, explicitly declaring common icons is safer.
}
