# Feature Audit — Page-Turn Flipbook

> **Last updated:** 2026-05-06  
> **Reference platform:** [Heyzine](https://heyzine.com)  
> **Scope:** Standalone infra + TinyPages Platform iframe integration

---

## 1. Project Identity

| Attribute | Detail |
|-----------|--------|
| **Name** | `page-turn-flipbook` |
| **Stack** | Vite + React 19 + TypeScript, Tailwind CSS 3, shadcn/ui (Radix), Supabase (Auth + DB + Storage) |
| **Core Lib** | `page-flip` v2 (StPageFlip) — HTML-based page rendering |
| **PDF Engine** | `pdfjs-dist` v5 — client-side render to JPEG at 1.5× scale |
| **Hosting** | Supabase Storage (public buckets for pages, private bucket for PDFs) |
| **Usage Modes** | ① Standalone SaaS  ② Embeddable via iframe for TinyPages Platform |

---

## 2. Current Feature Inventory

### ✅ Implemented Features

| # | Feature | File(s) | Status | Notes |
|---|---------|---------|--------|-------|
| 1 | **PDF Upload & Conversion** | `UploadModal.tsx`, `useFlipbooks.ts` | ✅ Working | Client-side pdf.js render → JPEG → Supabase Storage. Max 20 MB. |
| 2 | **Page-Flip Viewer** | `FlipbookViewer.tsx` | ✅ Working | page-flip lib, book-style flip with shadow, mouse + swipe support. |
| 3 | **Keyboard Navigation** | `FlipbookViewer.tsx` | ✅ Working | Arrow keys (L/R, U/D), Escape for fullscreen exit. |
| 4 | **Page Number Input** | `FlipbookViewer.tsx` | ✅ Working | Direct jump to page via number input in toolbar. |
| 5 | **Zoom Slider** | `FlipbookViewer.tsx` | ✅ Working | Range 0.5×–2× via CSS transform scale. Hidden on mobile. |
| 6 | **Fullscreen Toggle** | `FlipbookViewer.tsx` | ✅ Working | Native Fullscreen API with icon toggle. |
| 7 | **Responsive / Mobile** | `FlipbookViewer.tsx` | ✅ Partial | Portrait mode on mobile, dynamic page sizing. Touch swipe supported. |
| 8 | **Auth (Email/Password)** | `Auth.tsx`, `useAuth.ts` | ✅ Working | Supabase Auth, sign-in / sign-up tabs, protected routes. |
| 9 | **Dashboard / Library** | `Dashboard.tsx`, `FlipbookCard.tsx` | ✅ Working | Grid view, thumbnail from first page, status badges. |
| 10 | **Embed Route** | `Embed.tsx` | ✅ Working | `/embed/:id` — chromeless viewer for iframe usage. |
| 11 | **Share Link** | `FlipbookCard.tsx` | ✅ Working | Copy-to-clipboard public/private link. |
| 12 | **Embed Code Copy** | `FlipbookCard.tsx` | ✅ Working | `<iframe>` snippet with optional token for private books. |
| 13 | **Visibility Toggle** | `FlipbookCard.tsx` | ✅ Working | Public ↔ Private with token-based access. |
| 14 | **Share Token Rotation** | `FlipbookCard.tsx`, `useFlipbooks.ts` | ✅ Working | Regenerate private share token. |
| 15 | **Rename Flipbook** | `FlipbookCard.tsx` | ✅ Working | Inline rename with Enter/Escape. |
| 16 | **Delete Flipbook** | `FlipbookCard.tsx`, `useFlipbooks.ts` | ✅ Working | Confirmation dialog, cleans up storage + DB. |
| 17 | **RPC Viewer Access** | `useFlipbooks.ts` | ✅ Working | `get_flipbook_for_viewer` RPC enforces visibility/token logic server-side. |
| 18 | **Landing Page** | `Landing.tsx` | ✅ Working | Hero + feature cards + CTA. |
| 19 | **Dark/Light Theme Tokens** | `index.css` | ✅ Defined | CSS vars for both themes; dark class present but no runtime toggle. |
| 20 | **Upload Progress** | `UploadModal.tsx` | ✅ Working | Phase-based progress bar (Rendering → Uploading). |

### ⚠️ Partially Implemented

| # | Feature | Current State | Gap |
|---|---------|---------------|-----|
| 1 | **Mobile Responsiveness** | Page sizing adapts, but zoom is hidden on mobile, toolbar may overflow on small screens. | Need touch-friendly zoom gesture (pinch-to-zoom). |
| 2 | **Dark Mode** | CSS tokens defined, no runtime toggle. Viewer always uses zinc-950 dark. | Missing user toggle or system-preference detection. |
| 3 | **Error Handling** | Basic `alert()` and inline error messages. | No global toast notification system leveraged (sonner is installed but not widely used). |
| 4 | **SEO / Meta Tags** | Landing page has no dynamic `<title>` or `<meta>` per route. | Add per-route titles, OG tags for shared flipbooks. |

---

## 3. Gap Analysis vs Heyzine

### 🔴 Critical Gaps (Must-Have for Parity)

| # | Heyzine Feature | Our Status | Priority | Effort |
|---|-----------------|------------|----------|--------|
| 1 | **Table of Contents / Outline** | ❌ Missing | 🔴 P0 | Medium |
| 2 | **In-Flipbook Text Search** | ❌ Missing | 🔴 P0 | High |
| 3 | **Thumbnail / Page Grid Navigation** | ❌ Missing | 🔴 P0 | Medium |
| 4 | **Custom Branding (Logo, Background Color/Image)** | ❌ Missing | 🔴 P0 | Medium |
| 5 | **Multiple Viewing Modes** (magazine flip, slide, single page, cover-flow) | ❌ Only book-flip | 🔴 P0 | High |
| 6 | **Share Widget** (social sharing, QR code generation) | ❌ Only copy link | 🔴 P0 | Low-Med |
| 7 | **PDF Download / Print Toggle** | ❌ Missing | 🔴 P0 | Low |
| 8 | **Background Music / Audio** | ❌ Missing | 🔴 P0 | Medium |

### 🟡 Important Gaps (Competitive Advantage)

| # | Heyzine Feature | Our Status | Priority | Effort |
|---|-----------------|------------|----------|--------|
| 9 | **Interactive Hotspots on Pages** (link, video, image, audio, iframe) | ❌ Missing | 🟡 P1 | High |
| 10 | **Hotspot Editor** (WYSIWYG overlay editor for placing elements) | ❌ Missing | 🟡 P1 | Very High |
| 11 | **Password-Protected Flipbooks** (viewer-side password gate) | ❌ Missing | 🟡 P1 | Medium |
| 12 | **Domain Embed Restrictions** | ❌ Missing | 🟡 P1 | Low |
| 13 | **Reader Analytics / Statistics** | ❌ Missing | 🟡 P1 | High |
| 14 | **Google Analytics Integration** | ❌ Missing | 🟡 P1 | Low |
| 15 | **Lead Generation Forms** (email capture before viewing) | ❌ Missing | 🟡 P1 | Medium |
| 16 | **RTL (Right-to-Left) Support** | ❌ Missing | 🟡 P1 | Medium |
| 17 | **Custom Subdomain / Custom Domain** | ❌ Missing | 🟡 P1 | High |
| 18 | **API Access** (programmatic flipbook CRUD) | ❌ Missing | 🟡 P1 | Medium |

### 🟢 Nice-to-Have Gaps (Polish / Scale)

| # | Heyzine Feature | Our Status | Priority | Effort |
|---|-----------------|------------|----------|--------|
| 19 | **White-Labeling** (remove all branding) | ❌ Missing | 🟢 P2 | Low |
| 20 | **Batch / Bulk Upload** | ❌ Missing | 🟢 P2 | Medium |
| 21 | **Flipbook Templates** | ❌ Missing | 🟢 P2 | Medium |
| 22 | **Version History / Revision Control** | ❌ Missing | 🟢 P2 | High |
| 23 | **Collaboration / Team Workspaces** | ❌ Missing | 🟢 P2 | Very High |
| 24 | **SEO Optimization** (indexable content, sitemap for flipbooks) | ❌ Missing | 🟢 P2 | Medium |
| 25 | **Offline Viewer / PWA** | ❌ Missing | 🟢 P2 | High |
| 26 | **One-Time Access Links** | ❌ Missing | 🟢 P2 | Medium |
| 27 | **Image-Based Flipbooks** (upload images directly, not just PDF) | ❌ Missing | 🟢 P2 | Low |

---

## 4. TinyPages Integration Gaps

Since this flipbook infra also serves as the embedded viewer for the TinyPages children's book platform, there are specific integration needs:

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | **Chromeless Embed Mode** | ✅ Working | `chromeless` prop hides toolbar until hover. |
| 2 | **Token-Based Access** | ✅ Working | Private flipbooks accessible via `?token=` param in iframe. |
| 3 | **PostMessage API** (parent ↔ iframe communication) | ❌ Missing | TinyPages needs to receive events: page-flip, book-complete, loading-state. |
| 4 | **Configurable Toolbar** (show/hide specific controls via URL params) | ❌ Missing | Allow parent to control which toolbar buttons appear. |
| 5 | **Custom Theme via URL Params** | ❌ Missing | Pass background color, accent color, font via query string. |
| 6 | **Preload / Lazy Load Strategy** | ⚠️ Partial | First 4 pages eager, rest lazy. No progressive JPEG or thumbnail sprites. |
| 7 | **Auto-Play / Auto-Flip** | ❌ Missing | Timed page turning for presentation/kiosk mode. |
| 8 | **Callback URL on Complete** | ❌ Missing | Redirect or postMessage when reader finishes the book. |

---

## 5. Technical Debt & Infrastructure Gaps

| # | Issue | Impact | Priority |
|---|-------|--------|----------|
| 1 | **Client-Side PDF Rendering** — heavy CPU for large PDFs, blocks UI thread | Performance | 🔴 P0 |
| 2 | **No Web Worker for PDF Processing** | UI jank during upload | 🔴 P0 |
| 3 | **No Server-Side PDF Processing** (Edge Function or backend) | Scalability, no text extraction for search | 🟡 P1 |
| 4 | **No CDN / Image Optimization** (raw JPEG from Supabase Storage) | Load time | 🟡 P1 |
| 5 | **Fixed JPEG Quality (0.85) & Scale (1.5×)** — no DPI-aware rendering | Quality vs file size trade-off | 🟢 P2 |
| 6 | **No Pagination/Infinite Scroll on Dashboard** | Won't scale beyond ~50 flipbooks | 🟡 P1 |
| 7 | **`sonner` Installed but Unused** for toast notifications | UX inconsistency | 🟢 P2 |
| 8 | **No Rate Limiting** on upload/creation | Abuse risk | 🟡 P1 |
| 9 | **No File Type Validation Server-Side** | Security | 🟡 P1 |
| 10 | **README.md is default Vite boilerplate** | Developer experience | 🟢 P2 |

---

## 6. Development Roadmap

### Phase 1 — Viewer Enhancement (Foundation)
> **Goal:** Make the viewer competitive with Heyzine's core reading experience.  
> **Timeline:** 2–3 weeks

- [ ] **Table of Contents Panel** — Slide-out drawer with page titles/sections
- [ ] **Thumbnail Grid Navigation** — Grid overlay showing all page thumbnails for quick jump
- [ ] **PDF Download Button** — Optional, toggleable by owner
- [ ] **Print Button** — Optional, toggleable by owner
- [ ] **Share Widget** — Social share buttons + QR code generation
- [ ] **Zoom: Pinch-to-Zoom** for mobile devices
- [ ] **Dark Mode Toggle** — System preference detection + manual override
- [ ] **Toast Notifications** — Wire up `sonner` globally for all user actions

---

### Phase 2 — Customization & Branding
> **Goal:** Allow flipbook owners to customize the look & feel.  
> **Timeline:** 2–3 weeks

- [ ] **Custom Background** — Color picker + image upload per flipbook
- [ ] **Custom Logo** — Upload brand logo, display in viewer toolbar (with optional link)
- [ ] **Viewer Toolbar Customization** — Show/hide controls per flipbook (download, print, zoom, share)
- [ ] **Custom Cover Style** — Hard cover vs soft cover options
- [ ] **Background Music** — Audio upload + play/pause control in viewer
- [ ] **Flipbook Settings Panel** — New settings page/modal per flipbook in dashboard

---

### Phase 3 — Infrastructure & Performance
> **Goal:** Move PDF processing server-side, optimize delivery.  
> **Timeline:** 2–3 weeks

- [ ] **Server-Side PDF Processing** — Supabase Edge Function with pdf-lib/pdf.js to render pages
- [ ] **Text Extraction** — Extract searchable text per page during processing for in-viewer search
- [ ] **Progressive Image Loading** — Generate thumbnail sprites + full-res on demand
- [ ] **Image CDN Optimization** — Supabase Image Transformation or external CDN
- [ ] **Upload Validation** — File type verification server-side, malware scanning
- [ ] **Rate Limiting** — Per-user upload quotas via Edge Function middleware
- [ ] **Dashboard Pagination** — Cursor-based pagination for large libraries

---

### Phase 4 — Interactivity & Engagement
> **Goal:** Add interactive elements that set us apart.  
> **Timeline:** 3–4 weeks

- [ ] **In-Flipbook Text Search** — Full-text search across extracted page text
- [ ] **Interactive Hotspots** — Clickable regions on pages for:
  - External links
  - Video embeds (YouTube/Vimeo)
  - Image pop-ups
  - Audio clips
- [ ] **Hotspot Editor** — Drag-and-drop WYSIWYG editor for placing hotspots on pages
- [ ] **Multiple Viewing Modes** — Magazine flip, single-page slide, horizontal scroll
- [ ] **Auto-Flip / Presentation Mode** — Timed page turning for kiosk/demo use

---

### Phase 5 — Security, Analytics & Access Control
> **Goal:** Enterprise-ready security and insights.  
> **Timeline:** 2–3 weeks

- [ ] **Password-Protected Flipbooks** — Viewer-side password gate
- [ ] **Domain Embed Restrictions** — Whitelist allowed embed domains
- [ ] **Reader Analytics** — Track page views, time-per-page, read completion rate
- [ ] **Google Analytics Integration** — GA4 event tracking from viewer
- [ ] **Lead Generation Gate** — Email capture form before viewing
- [ ] **One-Time Access Links** — Self-destructing share URLs

---

### Phase 6 — TinyPages Integration Layer
> **Goal:** First-class iframe integration for TinyPages Platform.  
> **Timeline:** 2 weeks

- [ ] **PostMessage API** — Emit events: `flipbook:ready`, `flipbook:page-flip`, `flipbook:complete`, `flipbook:error`
- [ ] **Receive Commands** — Listen for: `goToPage`, `nextPage`, `prevPage`, `toggleFullscreen`
- [ ] **URL Param Configuration** — `?controls=zoom,fullscreen&bg=hex&accent=hex`
- [ ] **Auto-Play Mode** — `?autoplay=true&interval=5000`
- [ ] **Completion Callback** — `?onComplete=postMessage` or redirect URL
- [ ] **Configurable Toolbar** — Enable/disable individual buttons via params

---

### Phase 7 — Scale & Platform Features
> **Goal:** SaaS-ready features for growth.  
> **Timeline:** 4–6 weeks

- [ ] **REST API** — Public API for programmatic flipbook CRUD
- [ ] **Custom Domains** — CNAME support for branded flipbook URLs
- [ ] **White-Labeling** — Remove all platform branding
- [ ] **RTL Support** — Right-to-left reading direction
- [ ] **Image-Based Flipbooks** — Direct image upload (not just PDF)
- [ ] **Batch Upload** — Multiple PDFs in one session
- [ ] **Team Workspaces** — Multi-user collaboration
- [ ] **Version History** — Track revisions per flipbook
- [ ] **SEO / Sitemap** — Generate indexable pages for public flipbooks
- [ ] **Offline Viewer / PWA** — Service worker caching for offline reading

---

## 7. Feature Priority Matrix

```
                     HIGH IMPACT
                        │
    ┌───────────────────┼───────────────────┐
    │ P0 — DO NOW       │ P1 — PLAN NEXT    │
    │                   │                   │
    │ • ToC Panel       │ • Hotspot Editor   │
    │ • Thumbnail Nav   │ • Text Search      │
    │ • Share Widget    │ • Analytics        │
    │ • Custom Branding │ • Password Gate    │
    │ • Download/Print  │ • Server-Side PDF  │
    │ • Mobile Zoom     │ • API Access       │
    │ • View Modes      │ • PostMessage API  │
LOW ├───────────────────┼───────────────────┤ HIGH
EFF │ P2 — BACKLOG      │ P3 — FUTURE       │ EFFORT
    │                   │                   │
    │ • Toast system    │ • Team Workspaces  │
    │ • Dark mode       │ • Custom Domains   │
    │ • White-label     │ • Version History  │
    │ • Image flipbooks │ • Offline/PWA      │
    │ • RTL support     │ • Batch Upload     │
    │                   │ • Templates        │
    └───────────────────┼───────────────────┘
                        │
                     LOW IMPACT
```

---

## 8. Success Metrics per Phase

| Phase | KPI | Target |
|-------|-----|--------|
| Phase 1 | Viewer feature parity score vs Heyzine | ≥ 70% |
| Phase 2 | Customization options available | ≥ 5 settings |
| Phase 3 | PDF processing time (20-page doc) | < 10 seconds |
| Phase 4 | Interactive element types supported | ≥ 4 types |
| Phase 5 | Security features active | ≥ 3 controls |
| Phase 6 | TinyPages integration test pass | 100% events |
| Phase 7 | API endpoints available | ≥ 5 CRUD ops |

---

> **Next step:** Begin Phase 1 by implementing the Table of Contents panel and Thumbnail Grid Navigation in `FlipbookViewer.tsx`.
