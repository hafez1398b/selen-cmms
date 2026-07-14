import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size?: number): SVGProps<SVGSVGElement> => ({
  width: size ?? 18, height: size ?? 18, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor', strokeWidth: 1.8,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
});

export const I = {
  Dashboard: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
  ),
  Tree: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M3 6h6M3 12h12M3 18h9"/><circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/></svg>
  ),
  Wrench: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M14.7 6.3a4 4 0 1 0 5 5l-9.4 9.4-5-5z"/><path d="M9 11l4 4"/></svg>
  ),
  Calendar: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
  ),
  Users: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><circle cx="9" cy="8" r="3"/><path d="M3 21v-1a6 6 0 0 1 12 0v1"/><circle cx="17" cy="9" r="2.5"/><path d="M22 21v-1a4 4 0 0 0-4-4"/></svg>
  ),
  Box: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>
  ),
  Bell: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M6 8a6 6 0 0 1 12 0v5l1.5 3h-15L6 13z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>
  ),
  Spark: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></svg>
  ),
  Doc: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg>
  ),
  Cog: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
  ),
  Shield: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z"/></svg>
  ),
  Search: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
  ),
  Plus: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M12 5v14M5 12h14"/></svg>
  ),
  Edit: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/></svg>
  ),
  Trash: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
  ),
  Check: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M20 6 9 17l-5-5"/></svg>
  ),
  X: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>
  ),
  Download: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/></svg>
  ),
  Print: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
  ),
  Upload: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/></svg>
  ),
  Sun: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
  ),
  Moon: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
  ),
  Logout: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>
  ),
  Chevron: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M9 18l6-6-6-6"/></svg>
  ),
  ChevronDown: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M6 9l6 6 6-6"/></svg>
  ),
  Folder: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
  ),
  Factory: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M2 22V8l5 3V8l5 3V8l5 3V4l5-2v20z"/><path d="M6 18h2M10 18h2M14 18h2"/></svg>
  ),
  Cpu: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>
  ),
  Mic: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 18v3"/></svg>
  ),
  Camera: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
  ),
  Eye: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  Mail: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>
  ),
  Phone: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1 .37 1.96.72 2.88a2 2 0 0 1-.45 2.11L8.1 10.1a16 16 0 0 0 6 6l1.39-1.39a2 2 0 0 1 2.11-.45c.92.35 1.88.59 2.88.72A2 2 0 0 1 22 16.92z"/></svg>
  ),
  Whatsapp: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M21 11.5a8.4 8.4 0 0 1-1.3 4.5L21 21l-5.2-1.4a8.5 8.5 0 1 1 5.2-8.1z"/></svg>
  ),
  AI: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/></svg>
  ),
  Alert: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>
  ),
  Activity: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
  ),
};
