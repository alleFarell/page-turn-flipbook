# Product Roadmap — Page-Turn Flipbook

> **Last updated:** 2026-05-11
> **Goal:** Close the gap with Heyzine, prioritizing the "Configurable Flipbook Design Set" and enterprise-ready features.

## Metric Legend
- **Priority:** P0 (Critical/Now), P1 (High/Next), P2 (Medium/Later), P3 (Low/Future)
- **Impact:** High (Major UX/Value), Medium (Solid Feature), Low (Minor Polish)
- **Effort:** High (Weeks), Medium (Days), Low (Hours)

---

## Phase 1: Configurable Flipbook Design Sets 🚀
> Provide users with a variety of layout choices beyond the standard double-sided book flip.

| Task | Description | Priority | Impact | Effort | Status |
|------|-------------|----------|--------|--------|--------|
| **1.1 Magazine Mode** | Soft pages, center spine shadow, double spread, glossy overlay. | P0 | High | Medium | ✅ |
| **1.2 Book Mode** | Hard cover, realistic 3D thickness, stiff spine, endpapers. | P0 | High | High | ✅ |
| **1.3 Album Mode** | Flat lay, thick stiff pages, landscape-optimized layout. | P0 | High | Medium | ✅ |
| **1.4 Notebook Mode** | Spiral/binder rings on side or top, ruled/grid backgrounds. | P0 | High | High | ✅ |
| **1.5 Slider Mode** | Horizontal sliding presentation (no 3D flip animation). | P0 | High | Low | ✅ |
| **1.6 Cards Mode** | Stacked cards with swipe-away/tinder deck transition. | P0 | High | Medium | ✅ |
| **1.7 Coverflow Mode** | 3D horizontal scrolling coverflow style selection. | P1 | Medium | High | ✅ |
| **1.8 One Page Mode** | Single page vertical/horizontal snap scrolling. | P0 | High | Low | ✅ |
| **1.9 Theme Customizer UI** | Settings panel to switch between modes, pick bg colors, upload logos. | P0 | High | Medium | ✅ |

---

## Phase 2: Viewer Enhancements & UX Polish ✨
> Make the core reading experience robust and premium.

| Task | Description | Priority | Impact | Effort | Status |
|------|-------------|----------|--------|--------|--------|
| **2.1 Table of Contents Panel** | Slide-out drawer with page titles/sections. | P0 | High | Medium | ⬜ |
| **2.2 Thumbnail Navigation** | Grid overlay showing all page thumbnails. | P0 | High | Medium | ⬜ |
| **2.3 Pinch-to-Zoom** | Touch-friendly zooming for mobile devices. | P0 | High | Medium | ⬜ |
| **2.4 Toolbar Actions** | Add Download PDF, Print, and Share (Social/QR) buttons. | P1 | Medium | Low | ⬜ |
| **2.5 Dark Mode Toggle** | System preference detection + manual override. | P1 | Medium | Low | ⬜ |
| **2.6 Page-turn Audio** | Background music / page flip sound effects. | P1 | Low | Low | ⬜ |

---

## Phase 3: Interactivity & Hotspots 🎯
> Add rich media directly onto flipbook pages.

| Task | Description | Priority | Impact | Effort | Status |
|------|-------------|----------|--------|--------|--------|
| **3.1 Hotspot Editor** | Drag-and-drop WYSIWYG editor to place links/media on pages. | P1 | High | High | ⬜ |
| **3.2 Media Embeds** | Support for YouTube/Vimeo video embeds over pages. | P1 | High | Medium | ⬜ |
| **3.3 Image/Audio Hotspots** | Clickable popups for images or audio clips. | P1 | Medium | Medium | ⬜ |
| **3.4 In-book Text Search** | Full-text search across extracted PDF text. | P1 | High | High | ⬜ |

---

## Phase 4: Infrastructure & Optimization ⚙️
> Move processing server-side and improve delivery.

| Task | Description | Priority | Impact | Effort | Status |
|------|-------------|----------|--------|--------|--------|
| **4.1 Server-side PDF Processing**| Use Supabase Edge Functions for PDF to Image conversion. | P0 | High | High | ⬜ |
| **4.2 Progressive Loading** | Generate thumbnail sprites + full-res images on demand. | P1 | High | Medium | ⬜ |
| **4.3 Pagination & Perf** | Virtualized scrolling in dashboard for large libraries. | P1 | Medium | Low | ⬜ |
| **4.4 Upload Validation** | File type checking and malware scanning server-side. | P1 | High | Low | ⬜ |

---

## Phase 5: Enterprise, Security & Analytics 📈
> Build business-ready features.

| Task | Description | Priority | Impact | Effort | Status |
|------|-------------|----------|--------|--------|--------|
| **5.1 Password Protection** | Viewer-side password gate for private books. | P1 | High | Medium | ⬜ |
| **5.2 Domain Restriction** | Whitelist domains where the flipbook can be embedded. | P1 | Medium | Low | ⬜ |
| **5.3 Reader Analytics** | Track views, completion rate, and time-per-page. | P1 | High | High | ⬜ |
| **5.4 Custom Domains** | Support CNAME for fully branded URLs. | P2 | High | High | ⬜ |
| **5.5 Team Workspaces** | Multi-user collaboration and permissions. | P3 | High | High | ⬜ |
