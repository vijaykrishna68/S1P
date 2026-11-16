import type * as React from 'react';
type IconName = 'arrow-right' | 'arrow-left' | 'chevron-down' | 'chevron-right' | 'check' | 'close' | 'menu' | 'plus' | 'minus' | 'info' | 'alert-circle' | 'alert-triangle' | 'check-circle' | 'give' | 'slice' | 'image' | 'upload' | 'calendar' | 'external' | 'lock' | 'search' | 'edit' | 'trash' | 'eye' | 'receipt' | 'heart';
type SceneName = 'hero-shared-table' | 'contribution-pass-it-on' | 'impact-many-hands' | 'people-cast' | 'set-aside-slice' | 'welcome-to-the-table' | 'success-celebrate' | 'empty-plate' | 'error-try-again' | 'looking-closely' | 'wandering-slice';
type Tone = 'success' | 'warning' | 'error' | 'info';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive'; size?: 'sm' | 'md' | 'lg';
  icon?: IconName; iconEnd?: IconName; loading?: boolean; loadingText?: React.ReactNode; success?: boolean; successText?: React.ReactNode;
  fullWidth?: boolean; href?: string; label?: string; children?: React.ReactNode;
}
export declare function Button(props: ButtonProps): React.ReactElement;
export interface IconProps { name: IconName; size?: 16 | 20 | 24 | number; label?: string; className?: string }
export declare function Icon(props: IconProps): React.ReactElement;
export interface BadgeProps { tone?: 'neutral' | 'brand' | Tone | 'placeholder'; icon?: IconName; children?: React.ReactNode }
export declare function Badge(props: BadgeProps): React.ReactElement;
export interface NavBarProps { items: { label: string; href?: string; current?: boolean }[]; ctaLabel?: string; ctaHref?: string; homeHref?: string; compact?: boolean }
export declare function NavBar(props: NavBarProps): React.ReactElement;
export interface HeroSectionProps { title: React.ReactNode; eyebrow?: string; lead?: React.ReactNode; primaryLabel?: string; primaryHref?: string; secondaryLabel?: string; secondaryHref?: string; note?: React.ReactNode; illustration?: SceneName; animate?: 'auto' | 'off' }
export declare function HeroSection(props: HeroSectionProps): React.ReactElement;
export interface IllustrationProps { name: SceneName; label?: string; decorative?: boolean; animate?: 'auto' | 'off'; plate?: boolean; priority?: boolean; src?: string; mobileSrc?: string; replayKey?: number; className?: string }
export declare function Illustration(props: IllustrationProps): React.ReactElement | null;
export interface AmountSelectorProps { amounts: number[]; currency?: string; locale?: string; value?: number | 'custom' | null; defaultValue?: number | 'custom' | null; onChange?: (v: number | 'custom') => void; label?: string; hint?: string; error?: string; allowCustom?: boolean; otherLabel?: string; customLabel?: string; customHint?: string; onCustomChange?: (v: string) => void }
export declare function AmountSelector(props: AmountSelectorProps): React.ReactElement;
interface FieldBase { label: string; hint?: string; error?: string; required?: boolean; optional?: boolean }
export interface TextFieldProps extends FieldBase, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> { success?: string; multiline?: boolean; prefix?: string }
export declare function TextField(props: TextFieldProps): React.ReactElement;
export interface SelectProps extends FieldBase, React.SelectHTMLAttributes<HTMLSelectElement> { options: { value: string; label: string }[]; placeholder?: string }
export declare function Select(props: SelectProps): React.ReactElement;
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> { label: React.ReactNode; hint?: string; error?: string }
export declare function Checkbox(props: CheckboxProps): React.ReactElement;
export interface ContributionSummaryProps { rows: { label: string; value: React.ReactNode }[]; total?: React.ReactNode; totalLabel?: string; note?: React.ReactNode; title?: string }
export declare function ContributionSummary(props: ContributionSummaryProps): React.ReactElement;
export interface AlertProps { tone?: Tone; title?: React.ReactNode; children?: React.ReactNode; action?: React.ReactNode; onDismiss?: () => void }
export declare function Alert(props: AlertProps): React.ReactElement;
export interface ImpactStatProps { value: string; countTo?: number; label: string; period?: string; source?: string; exact?: boolean; rounded?: boolean; status?: 'verified' | 'placeholder'; tone?: 'tomato' | 'basil' | 'gold'; size?: 'xl' | 'md'; animate?: boolean; locale?: string }
export declare function ImpactStat(props: ImpactStatProps): React.ReactElement;
export interface TimelineProps { items: { date: string; title: string; body?: string; current?: boolean; placeholder?: boolean }[] }
export declare function Timeline(props: TimelineProps): React.ReactElement;
export interface GalleryGridProps { items: { src?: string; alt: string; caption?: string; date?: string }[]; inlineLightbox?: boolean }
export declare function GalleryGrid(props: GalleryGridProps): React.ReactElement;
export interface AccordionProps { items: { q: string; a: React.ReactNode; open?: boolean }[] }
export declare function Accordion(props: AccordionProps): React.ReactElement;
export interface StoryQuoteProps { quote: string; attribution: string; role?: string; verified?: boolean }
export declare function StoryQuote(props: StoryQuoteProps): React.ReactElement;
export interface EmptyStateProps { title: string; body?: string; action?: React.ReactNode; illustration?: SceneName; compact?: boolean; animate?: 'auto' | 'off' }
export declare function EmptyState(props: EmptyStateProps): React.ReactElement;
export interface SkeletonProps { lines?: number; media?: boolean; label?: string }
export declare function Skeleton(props: SkeletonProps): React.ReactElement;
export interface DialogProps { open: boolean; title: string; children?: React.ReactNode; actions?: React.ReactNode; onClose?: () => void; tone?: 'default' | 'destructive'; wide?: boolean; inline?: boolean }
export declare function Dialog(props: DialogProps): React.ReactElement | null;
export interface PublishStatusProps { state: 'draft' | 'saving' | 'saved' | 'pending' | 'published' | 'failed'; label?: string }
export declare function PublishStatus(props: PublishStatusProps): React.ReactElement;
export interface AdminTableProps { columns: { key: string; label: string; align?: 'start' | 'end' }[]; rows: Record<string, React.ReactNode>[]; caption?: string }
export declare function AdminTable(props: AdminTableProps): React.ReactElement;
declare global { interface Window { S1P: { Button: typeof Button; Icon: typeof Icon; Badge: typeof Badge; NavBar: typeof NavBar; HeroSection: typeof HeroSection; Illustration: typeof Illustration; AmountSelector: typeof AmountSelector; TextField: typeof TextField; Select: typeof Select; Checkbox: typeof Checkbox; ContributionSummary: typeof ContributionSummary; Alert: typeof Alert; ImpactStat: typeof ImpactStat; Timeline: typeof Timeline; GalleryGrid: typeof GalleryGrid; Accordion: typeof Accordion; StoryQuote: typeof StoryQuote; EmptyState: typeof EmptyState; Skeleton: typeof Skeleton; Dialog: typeof Dialog; PublishStatus: typeof PublishStatus; AdminTable: typeof AdminTable; scenes: SceneName[]; illustrationSources: Partial<Record<SceneName, { src?: string; mobile?: string }>>; icons: IconName[] } } }
