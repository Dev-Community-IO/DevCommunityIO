/**
 * Regenerates src/icons/lucide-react.tsx — Lucide-named exports backed by Lineicons.
 * Run: node scripts/generate-lucide-shim.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const dts = fs.readFileSync(
  path.join(root, 'node_modules/@lineiconshq/free-icons/dist/index.d.ts'),
  'utf8',
);
const esm = fs.readFileSync(
  path.join(root, 'node_modules/@lineiconshq/free-icons/dist/index.esm.js'),
  'utf8');
const outlined = new Set(
  [...dts.matchAll(/export \{ (\w+) \}/g)].map((m) => m[1]).filter((n) => n.endsWith('Outlined')),
);
const esmExports = new Set([...esm.matchAll(/as (\w+)/g)].map((m) => m[1]));

const iconsUsed = fs
  .readFileSync('/tmp/icons-used.txt', 'utf8')
  .trim()
  .split('\n')
  .filter((n) => n && n !== 'LucideIcon');

const special = {
  Twitter: 'XOutlined',
  Github: 'GithubOutlined',
  Linkedin: 'LinkedinOutlined',
  Send: 'TelegramOutlined',
  Facebook: 'FacebookOutlined',
  Instagram: 'InstagramOutlined',
  Youtube: 'YoutubeOutlined',
  // X = Lucide close icon (never XOutlined — that is the Twitter brand in Lineicons)
  LogIn: 'EnterOutlined',
  LogOut: 'ExitOutlined',
  MessageCircle: 'CommentsOutlined',
  MessageSquare: 'CommentsOutlined',
  Share2: 'Share1Outlined',
  MoreHorizontal: 'MenuMeatballs1Outlined',
  MoreVertical: 'MenuKebab1Outlined',
  Edit: 'Pencil1Outlined',
  Edit2: 'Pencil1Outlined',
  Edit3: 'Pencil1Outlined',
  Pencil: 'Pencil1Outlined',
  Trash2: 'Trash3Outlined',
  Settings: 'Gear1Outlined',
  Users: 'UserMultiple4Outlined',
  UserPlus: 'UserPlus1Outlined',
  UserCheck: 'UserCheck1Outlined',
  UserX: 'UserMinus1Outlined',
  Home: 'Home2Outlined',
  Search: 'Search1Outlined',
  User: 'User4Outlined',
  Mail: 'Envelope1Outlined',
  Heart: 'HeartOutlined',
  Bookmark: 'Bookmark1Outlined',
  Calendar: 'CalendarDaysOutlined',
  Clock: 'ClockOutlined',
  MapPin: 'MapMarker1Outlined',
  Globe: 'Globe1Outlined',
  Link: 'Link2Outlined',
  Link2: 'Link2Outlined',
  ExternalLink: 'Link2Angular1Outlined',
  FileText: 'FileMultipleOutlined',
  File: 'FileMultipleOutlined',
  Upload: 'Upload1Outlined',
  Download: 'Download1Outlined',
  Plus: 'PlusOutlined',
  Minus: 'MinusOutlined',
  Check: 'CheckOutlined',
  ChevronDown: 'ChevronDownOutlined',
  ChevronUp: 'ChevronUpOutlined',
  ChevronLeft: 'ChevronLeftOutlined',
  ChevronRight: 'ChevronRightOutlined',
  ArrowLeft: 'ArrowLeftOutlined',
  ArrowRight: 'ArrowRightOutlined',
  ArrowUp: 'ArrowUpwardOutlined',
  Bell: 'Bell1Outlined',
  Moon: 'MoonHalfRight5Outlined',
  Sun: 'SunOutlined',
  Menu: 'MenuHamburger1Outlined',
  Loader: 'Spinner3Outlined',
  Loader2: 'Spinner3Outlined',
  AlertCircle: 'InformationOutlined',
  AlertTriangle: 'WarningOutlined',
  Info: 'InformationOutlined',
  CheckCircle: 'CheckCircle1Outlined',
  CheckCircle2: 'CheckCircle1Outlined',
  XCircle: 'XmarkCircleOutlined',
  Eye: 'EyeOutlined',
  EyeOff: 'EyeSlashOutlined',
  Lock: 'Lock1Outlined',
  Unlock: 'Unlock1Outlined',
  Shield: 'Shield2Outlined',
  Award: 'Trophy1Outlined',
  Trophy: 'Trophy1Outlined',
  Star: 'StarFatOutlined',
  Sparkles: 'StarsOutlined',
  TrendingUp: 'TrendUp1Outlined',
  TrendingDown: 'TrendDown1Outlined',
  Hash: 'HashtagOutlined',
  AtSign: 'AtOutlined',
  Smile: 'EmojiSmileOutlined',
  Flag: 'Flag1Outlined',
  Flame: 'FireOutlined',
  Zap: 'Bolt2Outlined',
  Briefcase: 'Briefcase1Outlined',
  Building: 'Buildings1Outlined',
  Building2: 'Buildings1Outlined',
  Camera: 'Camera1Outlined',
  Image: 'PhotosOutlined',
  Video: 'CameraVideoOutlined',
  Mic: 'Microphone1Outlined',
  Copy: 'CopyOutlined',
  Save: 'SaveOutlined',
  Filter: 'Funnel1Outlined',
  SlidersHorizontal: 'SlidersHorizontalSquare2Outlined',
  Grid3x3: 'Grid1Outlined',
  LayoutGrid: 'Grid1Outlined',
  HelpCircle: 'QuestionCircleOutlined',
  Command: 'CommandOutlined',
  Chrome: 'ChromeOutlined',
  Wallet: 'WalletOutlined',
  Smartphone: 'SmartphoneOutlined',
  Radio: 'RadioOutlined',
  Megaphone: 'MegaphoneOutlined',
  Compass: 'CompassOutlined',
  Crown: 'CrownOutlined',
  Target: 'TargetOutlined',
  Ban: 'BanOutlined',
  Archive: 'ArchiveOutlined',
  Database: 'Database2Outlined',
  Server: 'ServerOutlined',
  Cloud: 'CloudOutlined',
  Code: 'CodeOutlined',
  Code2: 'CodeOutlined',
  Bold: 'TextBoldOutlined',
  Italic: 'TextItalicOutlined',
  List: 'ListOutlined',
  ListOrdered: 'ListOlOutlined',
  Quote: 'QuotationOutlined',
  Table: 'TableOutlined',
  Heading1: 'TextFormatOutlined',
  Heading2: 'TextFormatOutlined',
  GripVertical: 'DragVerticalOutlined',
  Layout: 'LayoutOutlined',
  Activity: 'PulseOutlined',
  ThumbsUp: 'ThumbsUp3Outlined',
  Ticket: 'Ticket1Outlined',
  DollarSign: 'DollarOutlined',
  Gamepad2: 'DiscordOutlined',
  Discord: 'DiscordOutlined',
  BadgeCheck: 'CheckCircle1Outlined',
  ShieldCheck: 'Shield2CheckOutlined',
  ShieldOff: 'Shield2Outlined',
  BellOff: 'BellOffOutlined',
  BookmarkCheck: 'Bookmark1Outlined',
  ArrowRightLeft: 'ArrowBothDirectionOutlined',
  FileX: 'FileXmarkOutlined',
  ToggleLeft: 'ToggleOffOutlined',
  ToggleRight: 'ToggleOnOutlined',
  BarChart3: 'BarChartOutlined',
  Sliders: 'SlidersHorizontalSquare2Outlined',
};

function findMatch(name) {
  if (special[name]) return special[name];
  for (const c of [`${name}Outlined`, `${name}1Outlined`, `${name}2Outlined`]) {
    if (outlined.has(c)) return c;
  }
  const lower = name.toLowerCase();
  for (const n of outlined) {
    if (n.toLowerCase().startsWith(lower)) return n;
  }
  return null;
}

const lineMap = {};
const lucideFallback = [];
for (const name of iconsUsed) {
  // Close/dismiss icon — real Lucide X, not Lineicons XOutlined (Twitter logo)
  if (name === 'X') {
    lucideFallback.push(name);
    continue;
  }
  const m = findMatch(name);
  if (m && esmExports.has(m)) lineMap[name] = m;
  else lucideFallback.push(name);
}

let out = `/* Auto-generated — run: node scripts/generate-lucide-shim.mjs */
import React, { forwardRef, type ComponentType, type SVGProps } from 'react';
import { Lineicons } from '@lineiconshq/react-lineicons';
import * as LI from '@lineiconshq/free-icons';
import * as Lucide from '__lucide_fallback__';

export type LucideIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;
export type LucideProps = SVGProps<SVGSVGElement> & { size?: number | string };

function fromLine(icon: (typeof LI)[keyof typeof LI], displayName: string) {
  const C = forwardRef<SVGSVGElement, LucideProps>(({ size = 24, className, color, strokeWidth, ...rest }, ref) => (
    <Lineicons ref={ref} icon={icon} size={size} className={className} color={color} strokeWidth={strokeWidth} {...rest} />
  ));
  C.displayName = displayName;
  return C;
}

`;

for (const name of Object.keys(lineMap).sort()) {
  out += `export const ${name} = fromLine(LI.${lineMap[name]}, '${name}');\n`;
}
for (const name of lucideFallback.sort()) {
  out += `export const ${name} = Lucide.${name};\n`;
}

out += `\nconst __default = Lucide;\nexport default __default;\n`;

const outPath = path.join(root, 'src/icons/lucide-react.tsx');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, out);
console.log(`Wrote ${outPath}: ${Object.keys(lineMap).length} Lineicons, ${lucideFallback.length} Lucide fallback`);
if (lucideFallback.length) console.log('Lucide fallback:', lucideFallback.join(', '));
