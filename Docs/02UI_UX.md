# Sacrifice One Pizza — UI/UX Specification

_(Revised design direction based on the latest product decisions)_

This document is the design + development handoff for the Sacrifice One Pizza charity website.

The experience should feel **warm, trustworthy, premium, human, and quietly alive**. The website should not look like a generic charity template. Visual personality should come primarily from **composition, typography, purposeful motion, and small interaction details**, not from gradients, excessive cards, or decorative effects.

---

# 1. Brand Identity

## 1.1 Brand Personality

- Friendly
- Youthful
- Trustworthy
- Minimal
- Hopeful
- Community-driven
- Premium without feeling luxurious
- Human rather than corporate

### Core emotion

> “A small personal sacrifice can create a real opportunity for someone else.”

The design should create empathy without using guilt, poverty imagery, visual desperation, or manipulative urgency.

---

## 1.2 Color Palette

### Primary Colors

| Purpose              | Color            | Hex         |
| -------------------- | ---------------- | ----------- |
| Primary Accent / CTA | Warm Tomato Red  | **#E63946** |
| CTA Hover / Active   | Deep Red         | **#C92C3A** |
| Background Base      | Soft Cream White | **#FFF8F2** |
| Headline Text        | Charcoal         | **#1D1D1F** |

### Secondary Colors

| Purpose                | Color            | Hex         |
| ---------------------- | ---------------- | ----------- |
| Supporting Accent      | Warm Orange      | **#FF7A00** |
| Success / Confirmation | Fresh Green      | **#2ECC71** |
| Soft Section Surface   | Very Light Beige | **#FDEDE3** |
| Secondary Text         | Medium Gray      | **#6B6B6B** |

### Usage Rules

- Keep the page predominantly light and clean.
- Red is primarily a **meaningful action signal**, especially donation-related actions.
- Orange should be used sparingly.
- Green should only communicate successful actions or verified states.
- Do not introduce decorative gradients into the hero.
- Do not use every accent color simultaneously.
- Maintain at least 4.5:1 contrast for normal text.
- Visual hierarchy should come from typography, spacing, scale, and interaction rather than color overload.

---

# 1.3 Typography

### Headlines

Use a strong, contemporary display typeface such as:

- DM Sans
- Poppins
- Inter

Recommended:

- Weight: 600–700
- Slightly tight tracking
- Large responsive scale
- Short line lengths for emotional clarity

### Body

- Inter / DM Sans
- Weight: 400–500
- Line height: 1.6–1.8
- 16–18px base size

### Metadata / Small Labels

- 12–14px
- Medium weight
- Optional uppercase or mono treatment for small system labels

### CTA Buttons

- Weight: 600
- Sentence case preferred
- Maximum 3–4 words where possible
- Avoid unnecessary emoji repetition

---

# 1.4 Layout Principles

- 8px spacing system
- Generous whitespace
- 80–120px section spacing on desktop
- 60–80px section spacing on mobile
- Max content width: approximately 1200px
- Mobile-first
- Strong vertical rhythm
- Avoid excessive cards
- Avoid visually dense sections
- Every section should have a clear purpose

The page should feel **editorial and intentional**, not like a collection of UI components.

---

# 2. Hero / Landing Experience

## 2.1 Primary Goal

The hero must communicate the mission immediately while establishing a visual identity that feels distinctive.

The **animation is the star of the landing experience**.

The hero should not rely on a gradient, stock illustration, floating blobs, particle field, or generic animated background.

---

## 2.2 Hero Copy

### H1

> Skip One Pizza. Feed a Future.

### Supporting Copy

> One small sacrifice every month can help fund someone's education, food, or essential needs.

### Primary CTA

**Donate One Pizza**

### Secondary CTA

**See How It Helps**

The primary CTA should be visible above the fold.

---

# 2.3 Hero Visual Direction

The hero needs one memorable visual system that feels custom to Sacrifice One Pizza.

### Design principle

> **One beautiful animation, rather than many decorative animations.**

The visual should communicate the idea of **small action → meaningful impact** without literally relying on a cartoon pizza-to-graduation-cap illustration.

Possible visual directions:

### Preferred direction: Transforming Impact Motif

A minimal visual system where a small pizza-inspired shape, mark, or collection of elements subtly transforms/reorganizes into something representing opportunity, growth, education, or community.

The transformation should be:

- Abstract
- Elegant
- Recognizable after a moment
- Brand-specific
- Subtle rather than theatrical

### Alternative direction

A small collection of simple illustrated elements that slowly reorganize into a meaningful composition.

For example:

- A circular donation mark
- Small dots / line elements
- Minimal book / education symbol
- Human/community symbol
- Pizza-inspired shape

The individual elements should not constantly bounce around.

---

# 2.4 Hero Animation Requirements

### Performance is a first-class constraint

The animation must feel premium **without being CPU intensive**.

Prefer:

- CSS transforms
- CSS opacity
- SVG transforms
- `requestAnimationFrame` only when genuinely necessary
- GPU-friendly `transform` and `opacity`
- Very small number of animated elements
- Long, calm motion curves

Avoid:

- Canvas particle systems
- Large particle networks
- Continuous DOM layout calculations
- Animating width / height / top / left
- Heavy blur filters
- Large backdrop-filter effects
- Constant box-shadow animation
- Excessive SVG path calculations
- High-frequency mouse tracking
- Multiple independent animation loops

### Motion character

The animation should feel:

- Slow
- Organic
- Slightly unexpected
- Calm
- Premium
- Almost tactile
- Never distracting

It should be possible to look at the hero for several seconds without feeling that the animation is demanding attention.

### Suggested motion characteristics

- Primary loop: approximately 8–15 seconds
- Secondary micro movements: 2–5 seconds
- Ease-in-out / spring-like but restrained timing
- No sharp acceleration
- No infinite bouncing
- No flashing
- No rapid particle movement

### Interaction

A very subtle cursor response may be used on desktop.

If implemented:

- Movement should be extremely small.
- Use transform only.
- No direct cursor-following of individual elements.
- Avoid creating a “3D tilt card” effect.
- Disable on touch devices.
- Disable or freeze under reduced-motion preferences.

---

# 2.5 Hero Background

### No gradient

The hero background should be a **solid, calm surface**.

Preferred:

- Soft Cream White `#FFF8F2`

Optional extremely subtle surface variation may be created through:

- Thin borders
- Very faint static shapes
- Typography
- The animation itself

Do **not** use:

- Animated gradients
- Gradient blobs
- Mesh gradients
- Aurora effects
- Glowing blobs
- Particle backgrounds

The animation itself provides the hero's visual energy.

---

# 2.6 Hero Entrance

The hero should have a staged entrance.

Recommended order:

1. Small brand / eyebrow label
2. H1
3. Supporting copy
4. CTA
5. Hero visual completes its first subtle motion

Entrance animation should be short and restrained.

Suggested:

- Opacity
- Small translateY
- Optional blur-to-focus only for the H1
- 300–600ms range
- Staggered by approximately 50–100ms

The entrance animation must not compete with the hero's continuous animation.

---

# 2.7 Hero CTA Interaction

### Hover

- Slight scale: approximately 1.02–1.03
- Subtle shadow lift
- Background shifts toward deep red
- 150–220ms transition

### Press

- Scale down very slightly
- Immediate visual feedback

### Focus

- Strong visible focus ring
- Never remove keyboard focus indicators

### Click

The CTA should smoothly move the user into the donation flow rather than abruptly jumping to a form.

---

# 3. Mission / Problem Section

## H2

> Why One Pizza Matters

### Supporting Copy

Every year, students drop out not because they lack talent — but because they lack small financial support.

Sometimes ₹500 can cover books.
Sometimes ₹700 can fund a month of meals.

What feels small to us can be life-changing to someone else.

### UX Direction

Do not present this as a large collection of cards.

Prefer:

- Strong typography
- One supporting visual
- One highlighted statement
- Generous whitespace
- Optional number or quote treatment

The section should feel like a continuation of the story rather than another dashboard.

---

# 4. Impact Section

## H2

> Small Sacrifices. Big Change.

### Metrics

- ₹50,000+ Raised
- 120+ Meals Funded
- 30+ Students Supported
- 200+ Donors Joined

### Supporting Copy

> This is what happens when people choose purpose over one meal out.

### Interaction

Metrics may count up once when they enter the viewport.

Rules:

- Animate only once.
- Short duration.
- No infinite looping.
- Respect reduced-motion preferences.
- Do not make the numbers bounce or overshoot dramatically.

---

# 5. Donation Experience

The donation experience should be the most important functional flow on the website.

The user should be able to understand exactly:

1. How to pay
2. Where to pay
3. What amount is accepted
4. How to confirm the payment
5. What happens after submitting the confirmation

Do not use fixed donation cards such as ₹300 / ₹500 / ₹700 / ₹1000.

---

# 5.1 Donation Section

## H2

> Donate One Pizza

### Supporting Copy

> Give what you would normally spend on a pizza. Every contribution becomes part of something bigger.

### Donation Amount Rule

There are **no preset donation amount buttons**.

The donor enters their own amount.

### UPI limits

- Minimum donation: **₹300**
- Maximum donation through UPI: **₹3000**
- Amounts below ₹300 should be rejected.
- Amounts above ₹3000 should be rejected for the UPI flow.

### Above-limit message

> For donations above ₹3000, please give us a call at **<PHONE NUMBER>**.

The phone number is intentionally left as a content placeholder until confirmed.

---

# 5.2 Donation Flow

The experience should use a clear multi-step flow rather than showing every input at once.

### Step 1 — Payment Instructions

Once the user clicks **Donate One Pizza**, open the donation experience.

Display:

- UPI QR code
- UPI ID
- Copy UPI ID button
- Clear payment instruction
- Donation amount guidance

### Example layout

```text
        Donate One Pizza

   Scan the QR code or use the UPI ID

          [ QR CODE ]

       example@upi

       [ Copy UPI ID ]

   Minimum: ₹300
   Maximum via UPI: ₹3000

   Once you've completed the payment,
   confirm it below.

          [ I've Paid ]
```

The QR code should be the visual focus of this step.

---

# 5.3 QR Code Interaction

### QR Code

- High contrast
- Minimum approximately 280px on mobile
- Generous surrounding whitespace
- Do not place unnecessary decorative elements behind it
- Provide accessible alternative text

### Alt text

> UPI QR code for donating to Sacrifice One Pizza charity

### Copy UPI ID

Button:

> Copy UPI ID

On success:

> Copied!

Optional:

- Tiny check icon
- Brief success state
- Return to the original label after approximately 1.5–2 seconds

The interaction should not trigger a toast that blocks the screen.

---

# 5.4 Payment Confirmation Step

After the donor indicates that the payment has been completed, transition into the confirmation form.

Use a clear transition such as:

> Payment done? Tell us who to thank.

Avoid implying that the website can automatically verify the UPI payment.

---

# 5.5 Donor Confirmation Form

### Form fields

#### Full Name

Required.

Placeholder:

> Your name

#### Address

Required.

Placeholder:

> Your address

The address field may be a textarea if appropriate.

#### Amount Paid

Required.

Input type:

- Numeric
- Indian rupee formatting may be shown visually

Validation:

- Minimum ₹300
- Maximum ₹3000
- No preset amounts

#### Payment Screenshot

Required.

Input:

> Upload payment screenshot

Accepted formats should be clearly communicated by the UI.

The upload area should support:

- Drag and drop on desktop
- Tap to upload on mobile
- File preview
- File name
- Remove / replace action
- Upload error state

---

# 5.6 Form Validation

Validation should be immediate but not aggressive.

### Amount errors

> Please enter an amount between ₹300 and ₹3000.

### Missing name

> Please enter your name.

### Missing address

> Please enter your address.

### Missing screenshot

> Please upload your payment screenshot.

### Invalid file

> Please upload a valid payment screenshot.

### General submission error

> We couldn't submit your confirmation. Please try again.

Do not clear the completed form when an error occurs.

---

# 5.7 Form Submission

Primary button:

> Confirm Donation

Loading state:

> Submitting...

During submission:

- Disable duplicate submissions.
- Keep the user's data visible.
- Show a small loading indicator.

---

# 5.8 Donation Success

After successful submission, transition into a simple confirmation state.

### Message

> Thank you for choosing impact over indulgence ❤️

Supporting copy:

> Your contribution has been recorded. Every small sacrifice helps create a larger opportunity.

Optional:

- Small celebratory animation
- Checkmark / heart / subtle brand mark
- No confetti explosion
- No loud animation

Primary action:

> Back to Home

Secondary action:

> Share the Mission

---

# 6. Testimonials

Testimonials should feel human and editorial rather than like a standard three-card carousel.

## H2

> Voices From Our Community

### Content

Testimonials should be:

- Real
- Short
- Authentic
- Specific
- Emotionally warm
- Easy to read

Example:

> “It’s just one pizza for me, but it could be someone’s opportunity.”

— Monthly Donor

---

# 6.1 Testimonial Layout

Show **one or two testimonials at a time**.

Preferred desktop layout:

- One dominant testimonial
- Optional second testimonial partially or fully visible
- Large quote typography
- Small attribution
- Minimal navigation controls

Mobile:

- One testimonial at a time

Avoid:

- 3–6 testimonial card grids
- Huge carousel arrows
- Excessive borders
- Heavy shadows
- Generic customer-review styling

---

# 6.2 Testimonial Animation

The testimonial transition should be one of the site's most polished interactions.

### Desired feeling

> Smooth editorial page-turn / crossfade rather than “carousel.”

Possible animation:

1. Current quote gently moves 8–12px and fades.
2. New quote enters from the opposite direction.
3. Attribution follows with a tiny delay.
4. Layout remains stable.

Duration:

- Approximately 500–800ms

Easing:

- Smooth ease-out / custom cubic-bezier

Autoplay:

- Optional
- If enabled, use a slow interval such as 6–8 seconds.

Pause autoplay when:

- User hovers over the testimonial area
- User focuses an interactive control
- User prefers reduced motion

Navigation:

- Small progress indicators or minimal previous/next controls
- Keyboard accessible
- Swipe support on mobile is acceptable

No aggressive infinite carousel movement.

---

# 7. Calls to Action

## Primary CTA

Preferred:

> Donate One Pizza

Alternatives:

- Scan & Support
- Make an Impact

Use one primary wording consistently across the website.

---

## Secondary CTA

Preferred:

> See How It Helps

Alternatives:

- Share This Mission
- Learn Where It Goes

---

## CTA Placement

Primary donation CTA may appear:

- Hero
- After mission / problem section
- Donation section
- Footer CTA

Do not make every section look like a sales funnel.

---

# 8. Micro-Interaction System

The website should feel **alive**, but the user should not consciously notice an animation happening every few seconds.

The principle is:

> **Motion should reward attention, not demand it.**

---

# 8.1 Global Interaction Rules

Every interactive element should provide subtle feedback through one or more of:

- Color
- Position
- Opacity
- Scale
- Border
- Icon movement
- State change

Avoid stacking multiple effects on the same interaction.

For example:

**Good:**

Hover → slight lift + color change

**Bad:**

Hover → scale + rotation + glow + shadow + background animation

---

# 8.2 Navigation

### Nav links

On hover:

- Underline grows or slides in
- Text color changes subtly

Active link:

- Clear but restrained indicator

### Header on scroll

The header may:

- Gain a subtle surface
- Add a faint border
- Slightly change opacity / background

Avoid a dramatic blur-heavy glassmorphism effect.

---

# 8.3 Buttons

Hover:

- 1.02–1.03 scale
- Slight color shift
- Small shadow lift

Press:

- 0.98–0.99 scale

Focus:

- Clear focus ring

Success:

- Check icon / success color
- Short transition

---

# 8.4 Copy Buttons

For UPI ID:

Idle:

> Copy UPI ID

Success:

> Copied ✓

Use a compact icon transition.

---

# 8.5 Form Inputs

Focus:

- Border becomes more prominent
- Optional subtle accent ring
- Label remains visually stable

Do not use large glowing input fields.

Error:

- Small inline error message
- Clear border/state change
- Do not shake the entire form

Success:

- Small check indicator where useful

---

# 8.6 File Upload

Idle:

- Dashed or subtle bordered drop area
- Upload icon
- Short instruction

Hover:

- Border becomes slightly stronger

Drag-over:

- Surface changes subtly
- Upload icon reacts

Uploaded:

- Preview / filename appears
- Replace and remove actions become visible

---

# 8.7 Scroll Reveals

Use restrained reveal animations for sections.

Recommended:

- Opacity
- 8–20px translateY
- 300–500ms
- Small stagger where helpful

Avoid:

- Large slide-ins
- Rotations
- Zooming from 0.5 → 1
- Every individual element animating separately

---

# 8.8 Links

Text links may use:

- Underline expansion
- Small arrow movement
- Color transition

Example:

`See How It Helps →`

On hover:

`See How It Helps  ↗`

Keep movement minimal.

---

# 8.9 Impact Numbers

Counters animate only once when entering the viewport.

They should not continuously count or replay.

---

# 8.10 Success States

Success states should feel satisfying but quiet.

Use:

- Checkmark
- Short scale/opacity transition
- Small icon movement
- Clear confirmation copy

Avoid:

- Confetti
- Exploding particles
- Large screen-wide animations

---

# 9. FAQ

## H2

> Questions You Might Have

### Q1: Where does the money go?

It goes toward verified individuals needing education, food, and essential support.

### Q2: Is this a registered charity?

We are working toward formal registration. Transparency reports will be shared regularly.

### Q3: Can I donate monthly?

Yes. Set a monthly reminder and scan the QR again each month.

### Q4: Is ₹300 enough?

Yes. Small, consistent contributions create lasting impact.

---

# 9.1 FAQ Interaction

Use an accordion.

Rules:

- One item open at a time
- Large clickable area
- Plus/minus or chevron indicator
- Smooth 200–300ms height transition
- Keyboard accessible
- Clear focus state

The accordion should feel lightweight rather than like a stack of large cards.

---

# 10. Motion System

The website should have a clear motion hierarchy.

## Tier 1 — Signature Motion

### Hero

The hero animation is the **only continuous ambient animation**.

It establishes the site's personality.

---

## Tier 2 — Meaningful Interaction

These animate only when the user interacts:

- Donation CTA
- UPI copy interaction
- Form fields
- File upload
- Testimonial controls
- FAQ accordion
- Navigation
- Buttons

---

## Tier 3 — Entrance Motion

Used sparingly:

- Section reveals
- Hero entrance
- Impact counters

---

## Tier 4 — Static

Everything else remains still.

---

# 10.1 Performance Rules

All continuous animation should prioritize:

- `transform`
- `opacity`

Avoid animating layout properties.

Performance targets:

- Hero should remain smooth on mid-range mobile devices.
- No unnecessary animation loops.
- No large particle systems.
- No continuous expensive blur/filter calculations.
- Do not animate dozens of DOM elements simultaneously.

If the hero animation begins to affect scrolling or input responsiveness, simplify the animation before adding optimization complexity.

---

# 10.2 Reduced Motion

Respect:

`prefers-reduced-motion: reduce`

When reduced motion is enabled:

- Hero animation becomes static.
- Testimonial autoplay is disabled.
- Section reveals become immediate or near-immediate.
- Counter animations become static values.
- Hover interactions remain functional but lose unnecessary movement.
- Donation success animation becomes a simple state change.

Reduced motion should **freeze the visual system**, not merely make it slower.

---

# 11. Responsive Behaviour

## Desktop > 1024px

- Hero uses a strong two-column composition.
- Signature animation receives enough space to breathe.
- Donation QR and information can sit side-by-side.
- Testimonials may show two items.

## Tablet 768–1024px

- Hero visual becomes smaller.
- Reduce animation complexity if necessary.
- Donation flow remains vertically clear.
- Testimonials may show one item at a time.

## Mobile < 768px

- Hero becomes vertically stacked.
- Signature animation remains visible but simplified.
- No continuous cursor-based interactions.
- Donation QR remains large and easily scannable.
- Form fields use full available width.
- Testimonials show one item at a time.
- Buttons should be at least 44px high.
- Avoid horizontal overflow.

---

# 12. Donation UX Accessibility

- QR code minimum approximately 280px on mobile.
- Provide descriptive alt text.
- UPI ID must be selectable/copyable.
- All form fields require visible labels.
- Errors must not rely on color alone.
- Buttons must have accessible names.
- File upload must work with keyboard and touch.
- Focus states must remain visible.
- Form errors should be announced appropriately to assistive technologies.
- Maintain at least 4.5:1 text contrast.
- Do not make the QR code the only way to understand how to pay.

---

# 13. Content / Microcopy

## UPI Copy

Button:

> Copy UPI ID

Success:

> Copied!

---

## Payment Confirmation

> Payment done? Tell us who to thank.

---

## Amount Guidance

> Enter any amount from ₹300 to ₹3000.

---

## Above ₹3000

> For donations above ₹3000, please give us a call at <PHONE NUMBER>.

---

## Upload

> Upload payment screenshot

Supporting text:

> Add a screenshot of your completed UPI payment.

---

## Submission

> Confirm Donation

Loading:

> Submitting...

---

## Success

> Thank you for choosing impact over indulgence ❤️

Supporting:

> Your contribution has been recorded. Every small sacrifice helps create a larger opportunity.

---

## Error

> Something went wrong. Please try again.

---

# 14. Footer

## Brand

**Sacrifice One Pizza**

> Skip One Pizza. Feed a Future.

### Links

- About
- Impact
- Donate
- FAQ

### Social

- Instagram
- Twitter / X
- LinkedIn

### Disclaimer

> All donations are voluntary. Transparency reports will be shared periodically.

### Footer CTA

> Make it your monthly ritual.

---

# 15. Visual Things to Avoid

The website should explicitly avoid looking like a generic charity landing page.

Avoid:

- Hero gradients
- Generic floating blobs
- Particle backgrounds
- Excessive glassmorphism
- Large card grids
- Fixed donation amount cards
- Giant testimonial card carousels
- Excessive shadows
- Excessive rounded containers
- Poverty / suffering stock photography
- Guilt-driven messaging
- Flashing animations
- Confetti
- Constant parallax
- Excessive cursor effects
- Multiple competing animated sections
- Too many CTA buttons
- Overly corporate dashboards

---

# 16. Overall Experience

The website should feel like:

> **A thoughtful, premium community initiative with one memorable visual idea.**

The user journey should be:

### 1. Understand

Within approximately 5 seconds, the visitor understands:

> “I can skip one pizza and use that money to help someone.”

### 2. Believe

The visitor sees:

- Where the money goes
- Impact numbers
- Real testimonials
- Transparent donation instructions

### 3. Act

The donation flow is simple:

**Donate → Scan / Pay → Confirm → Upload screenshot → Submit**

### 4. Feel Good

The confirmation experience acknowledges the donor without over-celebrating.

### 5. Return

The site encourages the idea of making the donation a recurring personal ritual.

---

# 17. Final UX Principles

1. **The hero animation is the signature.**
2. **No hero gradient.**
3. **One ambient animation, not an animated-everything website.**
4. **Donation amounts are user-entered, not preset.**
5. **UPI donations are limited to ₹300–₹3000.**
6. **The QR/UPI step comes before the donor confirmation form.**
7. **The form captures name, address, amount paid, and payment screenshot.**
8. **Testimonials are presented one or two at a time with editorial transitions.**
9. **Micro-interactions should make the site feel alive without making it busy.**
10. **Motion must remain performant and respect reduced-motion preferences.**
11. **The design should communicate dignity, trust, and hope — never guilt.**
12. **Every visual effect should have a reason to exist.**

---

# Open Content Decisions

The following items still need to be confirmed before implementation:

- Official UPI ID
- Final QR code
- Phone number for donations above ₹3000
- Whether the donor's address is required exactly as written or should be simplified
- Whether donations above ₹3000 should simply display the phone number or also provide a tap-to-call action on mobile
- Whether monthly donations should remain a messaging/FAQ concept or become a dedicated feature
- Final verified testimonial content and donor attribution
- Final verified impact numbers
