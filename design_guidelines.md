# Design Guidelines: Legal Contract Templates & Consultation Marketplace

## Design Approach

**Selected Approach:** Reference-Based with Professional Services Focus  
Drawing inspiration from Shopify's e-commerce clarity, combined with professional legal service aesthetics (think LegalZoom, Rocket Lawyer) to build trust while maintaining modern usability.

**Core Principles:**
- Professional credibility above all - users must feel confident in legal purchases
- Clear information hierarchy for both products (templates) and services (consultations)
- Seamless purchase and booking flows with minimal friction
- Trust-building visual language throughout

## Color Palette

**Primary Colors:**
- Deep Navy Blue: 220 45% 20% (authority, trust, professionalism)
- Rich Navy: 220 40% 30% (secondary actions, hover states)

**Accent Colors:**
- Professional Teal: 180 35% 45% (CTAs, active states, success indicators)
- Warm Sage: 150 25% 55% (highlights, secondary CTAs)

**Neutrals:**
- Light Background: 220 15% 98% (main background, light mode)
- Medium Gray: 220 10% 65% (text secondary, borders)
- Dark Text: 220 20% 15% (primary text)

**Dark Mode:**
- Background: 220 25% 10%
- Surface: 220 20% 15%
- Text Primary: 220 15% 95%

## Typography

**Font Families:**
- Headings: Inter (weights: 600, 700) - modern professional authority
- Body: Inter (weights: 400, 500) - excellent readability
- Accent/Numbers: JetBrains Mono (weight: 500) - for pricing, template codes

**Scale:**
- Hero Heading: text-5xl lg:text-7xl font-bold
- Section Headings: text-3xl lg:text-4xl font-semibold
- Card Titles: text-xl font-semibold
- Body Text: text-base leading-relaxed
- Small Text: text-sm

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 to p-8
- Section spacing: py-16 to py-24
- Card gaps: gap-6 to gap-8
- Element margins: m-4 to m-8

**Container Strategy:**
- Max width: max-w-7xl for main content
- Template grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Full-width sections with inner constraints for visual variety

## Component Library

### Navigation
- Sticky header with logo, category navigation, cart icon, and "Agendar Consulta" CTA
- Mega menu for template categories (Laboral, Empresarial, Inmobiliario, etc.)
- Shopping cart preview on hover with item count badge

### Hero Section
- Professional split layout: Left side with compelling headline and value proposition, right side with hero image
- Primary CTA: "Explorar Templates" 
- Secondary CTA: "Agendar Asesoría Legal"
- Trust indicators below CTAs: "100+ Plantillas Profesionales" | "Descarga Inmediata" | "Asesoría Certificada"

### Template Cards
- Clean white/surface cards with subtle shadow on hover
- Template preview thumbnail at top
- Category badge (small, teal background)
- Template name (font-semibold)
- Short description (2 lines, truncated)
- Price prominent with JetBrains Mono
- "Ver Detalles" and "Añadir al Carrito" buttons
- File format icons (PDF, DOCX)

### Consultation Booking
- Calendar interface with available time slots highlighted in teal
- Consultant cards with photo, specialty, rating, and hourly rate
- Service type selector (Asesoría General, Revisión de Contratos, etc.)
- Time zone display
- Instant availability indicator

### Trust Elements
- Security badge section: SSL encryption, secure payment, money-back guarantee
- Professional certifications displayed
- Client testimonials with lawyer photo and credentials
- "Garantía de Satisfacción" banner

### Shopping Cart & Checkout
- Sliding cart panel from right side
- Line items with thumbnail, name, price
- Stripe payment integration with card preview
- Clear total calculation
- Order confirmation with download links

### Footer
- Multi-column: Categories, Legal Pages (Términos, Privacidad), Contact Info, Newsletter
- Professional credentials and associations
- Trust seals (secure payment, SSL)

## Images

**Hero Image:** Professional legal scene - modern law office with documents and laptop, or abstract representation of contracts/legal documents. Subtle, sophisticated, not stock-photo generic. Positioned on right side of hero section, taking ~40% width.

**Template Previews:** Clean mockups of contract first pages showing professional formatting

**Consultant Photos:** Professional headshots with consistent styling and backgrounds

**Trust Section:** Icons/badges for security, certifications, guarantees

**Category Headers:** Subtle background images relevant to each legal category

## Animations

**Minimal and Professional:**
- Smooth hover transitions on cards (scale: 1.02)
- Fade-in on scroll for trust indicators
- Smooth cart slide-in/out
- Calendar date selection highlight animation (subtle teal fill)

No distracting or playful animations - maintain professional demeanor throughout.