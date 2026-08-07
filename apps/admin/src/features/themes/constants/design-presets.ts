import type { DesignTokens } from '../types/design-tokens';

export interface DesignPreset {
  id: string;
  label: string;
  description: string;
  tokens: DesignTokens;
}

/**
 * Beginner-friendly starting points (Milestone 8 Phase 6) — each is a
 * complete, valid `DesignTokens` bundle, never a special rendering path:
 * selecting one just calls `form.reset()` with these exact values, after
 * which the user can change absolutely anything. `preset: id` is stamped
 * into the tokens purely as "what this theme started from" metadata
 * (`DesignTokensDto.preset`) — nothing reads it to alter rendering.
 */
function preset(id: string, tokens: Omit<DesignTokens, 'version' | 'preset'>): DesignTokens {
  return { version: 1, preset: id, ...tokens };
}

export const DESIGN_PRESETS: DesignPreset[] = [
  {
    id: 'modern',
    label: 'Modern',
    description: 'Clean, confident, and neutral — a safe default for most sites.',
    tokens: preset('modern', {
      colors: {
        brand: { primary: '#111827', secondary: '#4f46e5', accent: '#4f46e5' },
        background: { page: '#ffffff', surface: '#f9fafb', section: '#f3f4f6' },
        text: { primary: '#111827', secondary: '#374151', muted: '#6b7280', link: '#4f46e5' },
        border: { default: '#e5e7eb', focus: '#4f46e5' },
        status: { success: '#16a34a', warning: '#d97706', error: '#dc2626', info: '#2563eb' },
      },
      typography: {
        fontFamilies: { heading: 'Inter, sans-serif', body: 'Inter, sans-serif' },
      },
      buttons: { radius: '0.5rem', height: '2.75rem' },
      cards: { radius: '0.75rem', shadow: '0 1px 2px rgba(0,0,0,0.06)' },
      container: { maxWidth: '1200px', paddingX: '1.5rem' },
    }),
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Black, white, and lots of space — content does the talking.',
    tokens: preset('minimal', {
      colors: {
        brand: { primary: '#000000', secondary: '#000000', accent: '#000000' },
        background: { page: '#ffffff', surface: '#ffffff', section: '#fafafa' },
        text: { primary: '#000000', secondary: '#404040', muted: '#737373', link: '#000000' },
        border: { default: '#e5e5e5', focus: '#000000' },
      },
      typography: {
        fontFamilies: { heading: 'Helvetica Neue, sans-serif', body: 'Helvetica Neue, sans-serif' },
      },
      buttons: { radius: '0px', height: '2.5rem' },
      cards: { radius: '0px', shadow: 'none', border: '#e5e5e5' },
      container: { maxWidth: '1100px', paddingX: '2rem' },
    }),
  },
  {
    id: 'corporate',
    label: 'Corporate',
    description: 'Trustworthy blues, structured layout — for business and B2B sites.',
    tokens: preset('corporate', {
      colors: {
        brand: { primary: '#1d4ed8', secondary: '#0f172a', accent: '#1d4ed8' },
        background: { page: '#ffffff', surface: '#f8fafc', section: '#eef2f7' },
        text: { primary: '#0f172a', secondary: '#334155', muted: '#64748b', link: '#1d4ed8' },
        border: { default: '#e2e8f0', focus: '#1d4ed8' },
      },
      typography: { fontFamilies: { heading: 'Georgia, serif', body: 'Arial, sans-serif' } },
      buttons: { radius: '0.25rem', height: '2.75rem' },
      cards: { radius: '0.25rem', shadow: '0 1px 3px rgba(0,0,0,0.1)' },
      container: { maxWidth: '1280px', paddingX: '2rem' },
    }),
  },
  {
    id: 'editorial',
    label: 'Editorial',
    description: 'Serif headings, generous line-height — for blogs and publications.',
    tokens: preset('editorial', {
      colors: {
        brand: { primary: '#7c2d12', secondary: '#292524', accent: '#7c2d12' },
        background: { page: '#fffbf5', surface: '#fff7ed', section: '#fef3e7' },
        text: { primary: '#292524', secondary: '#57534e', muted: '#78716c', link: '#7c2d12' },
        border: { default: '#e7e0d5', focus: '#7c2d12' },
      },
      typography: {
        fontFamilies: { heading: 'Georgia, serif', body: 'Georgia, serif' },
        styles: { body: { lineHeight: '1.75' } },
      },
      buttons: { radius: '999px', height: '2.75rem' },
      cards: { radius: '0.25rem', shadow: 'none' },
      container: { maxWidth: '760px', paddingX: '1.5rem' },
    }),
  },
  {
    id: 'creative',
    label: 'Creative',
    description: 'Bold color, playful rounded shapes — for portfolios and studios.',
    tokens: preset('creative', {
      colors: {
        brand: { primary: '#7c3aed', secondary: '#ec4899', accent: '#ec4899' },
        background: { page: '#ffffff', surface: '#faf5ff', section: '#f3e8ff' },
        text: { primary: '#1e1b2e', secondary: '#4c3d63', muted: '#8b7aa8', link: '#7c3aed' },
        border: { default: '#e9d5ff', focus: '#7c3aed' },
      },
      typography: { fontFamilies: { heading: 'Poppins, sans-serif', body: 'Poppins, sans-serif' } },
      buttons: { radius: '999px', height: '3rem' },
      cards: { radius: '1.5rem', shadow: '0 4px 12px rgba(124,58,237,0.12)' },
      container: { maxWidth: '1200px', paddingX: '1.5rem' },
    }),
  },
  {
    id: 'travel',
    label: 'Travel',
    description: 'Warm, sunny, and open — for travel, hospitality, and lifestyle sites.',
    tokens: preset('travel', {
      colors: {
        brand: { primary: '#0d9488', secondary: '#f59e0b', accent: '#f59e0b' },
        background: { page: '#ffffff', surface: '#f0fdfa', section: '#fefce8' },
        text: { primary: '#134e4a', secondary: '#115e59', muted: '#5eead4', link: '#0d9488' },
        border: { default: '#ccfbf1', focus: '#0d9488' },
      },
      typography: { fontFamilies: { heading: 'Nunito, sans-serif', body: 'Nunito, sans-serif' } },
      buttons: { radius: '0.75rem', height: '2.75rem' },
      cards: { radius: '1rem', shadow: '0 2px 8px rgba(13,148,136,0.1)' },
      container: { maxWidth: '1280px', paddingX: '1.5rem' },
    }),
  },
];

export function getDesignPreset(id: string): DesignPreset | undefined {
  return DESIGN_PRESETS.find((p) => p.id === id);
}
