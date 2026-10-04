# Phase 4D — Copy Audit

## Status

- Audit only
- No source changes
- No copy changes
- No commit
- No push
- Baseline: `main` @ `70888c6` (Phase 4A `3fe338f`, 4B `9fcd8ff`, 4C `70888c6`)
- The only file created or changed in this pass is this document.

**How findings are labelled.** Every finding has an ID (`C-01` and so on) and one priority.

- **P0** is correctness or misleading information.
- **P1** is an important clarity, hierarchy or trust issue.
- **P2** is consistency or polish.
- **P3** is an optional refinement.

Where the project documents do not contain the information needed to fix something, the finding says **"Source information required."** No replacement copy has been invented for those.

---

## Source documents

Read in full or in the relevant parts, and cross-checked against the running implementation:

| Document                                        | Used for                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Docs/PRD.md`                                   | Original voice, keywords, CTA vocabulary, FAQ seeds. Outdated on amounts and tech stack (CLAUDE.md §1).                                                                                                                                                                                                                                                     |
| `Docs/02UI_UX.md`                               | Current UI/UX spec and the exact approved microcopy (§5, §6, §9, §13, §14), plus its "Open Content Decisions".                                                                                                                                                                                                                                              |
| `Docs/PROJECT_CONTEXT.md`                       | What the site is and is not (no payment processing, human review), donor flow, known limitations and placeholder list.                                                                                                                                                                                                                                      |
| `CLAUDE.md`                                     | Decision log, §12 known limitations (placeholder content), §3 voice and design principles.                                                                                                                                                                                                                                                                  |
| `Docs/PHASE1_IA_PROPOSAL.md`                    | Approved home/About/Gallery content decisions, including the explicitly deferred FAQ item.                                                                                                                                                                                                                                                                  |
| `Docs/PHASE2_ABOUT_SPEC.md`                     | Provenance of every About fact, the "must NOT appear" list, and the About copy rationale.                                                                                                                                                                                                                                                                   |
| `Docs/PHASE3_GALLERY.md`                        | Gallery data model and states.                                                                                                                                                                                                                                                                                                                              |
| `Docs/PHASE4A_…`, `PHASE4B_…`, `PHASE4C_…` docs | Boundaries: 4A/4B/4C made no copy changes. 4D is the first copy phase.                                                                                                                                                                                                                                                                                      |
| Implementation                                  | Every public component with visible or accessible text: Hero, Mission, Impact, Donation (4 steps, uploader, copy button), Testimonials, FAQ, Footer, Header, About (page, origin, journey, trust, closing), Gallery (page, grid, tile, dialog), `index.html`, `about.html`, `gallery.html`, the OG image source, and the API error strings a donor can see. |

**Not available:** the client PDF ("s1p glance.pdf") that About's facts came from is not in the repository. About facts are therefore treated as client-supplied and are not re-verified here.

**Admin copy was not audited** (out of scope). Where the shared API produces text a donor can see, it is included.

---

## Copy principles

These are extracted from the sources, not invented.

| #   | Principle                                                                                                                                                        | Source                                                 |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| P-1 | Tone is friendly, youthful, hopeful, minimal, honest. Emotional but optimistic. **Not guilt-driven**, no aggressive fundraising tone, no emotional manipulation. | PRD §5, §6; 02UI_UX §1.1, §17.11                       |
| P-2 | Conversational, honest, simple language. No corporate jargon.                                                                                                    | PRD §5.2                                               |
| P-3 | Keywords: small sacrifice, real impact, monthly change, simple giving, one pizza.                                                                                | PRD §6                                                 |
| P-4 | CTAs: sentence case preferred, max 3 to 4 words, avoid emoji repetition. **Use one primary CTA wording consistently** across the site ("Donate One Pizza").      | 02UI_UX §1.3, §7                                       |
| P-5 | Never imply the website verifies the UPI payment. The screenshot is the donor's claim, reviewed by a human.                                                      | 02UI_UX §5.4; PROJECT_CONTEXT §1; CLAUDE.md §12        |
| P-6 | Nothing invented: no impact numbers, testimonials, milestones or claims that the source material does not support.                                               | PHASE2_ABOUT_SPEC §O; CLAUDE.md §12; this task's brief |
| P-7 | Avoid generic NGO clichés: "making a difference", "creating a better tomorrow", "empowering communities".                                                        | PHASE2_ABOUT_SPEC §D, §O                               |
| P-8 | Dignity, trust, hope. No poverty imagery, no beneficiary names, no individual student details.                                                                   | 02UI_UX §1.1, §17.11; PHASE2_ABOUT_SPEC §O             |
| P-9 | Testimonials must be real, short, specific, with verified attribution.                                                                                           | 02UI_UX §6 and "Open Content Decisions"                |

**Conflicts between sources, resolved as the project already resolved them** (CLAUDE.md decision log): preset amounts and the ₹300–₹1000 range in the PRD are superseded by user-entered ₹300–₹3000. The 02UI_UX spec's "Warm Orange" is retired.

---

## Content data versus UI copy

The brief asks for these to be kept apart. Anything in column A cannot be changed without source authority.

| A. Product / content data (needs source authority)                                                                        | B. UI copy (can be evaluated as interface language)                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Home impact figures; About impact figures and chart series; active-member counts                                          | Button labels: "Copy UPI ID", "Copied ✓", "Confirm Donation", "Back to Home", "Share the Mission", "Close", "Replace/Remove screenshot" |
| Testimonial quotes and attributions                                                                                       | Field labels, helper text, validation messages, upload hints                                                                            |
| Origin-story facts; trust identity (legal name, registration number, location, email)                                     | Loading, empty, error, success, copied, submitting states                                                                               |
| FAQ answers (they make claims about money, status, process)                                                               | Navigation and footer link labels                                                                                                       |
| Statements about what donations fund ("education, food, essential needs"), "verified individuals", "transparency reports" | Accessible names (`aria-label`s, status text)                                                                                           |
| UPI ID, phone number, social handles                                                                                      | Section headings that do not carry factual claims                                                                                       |
| Gallery captions and descriptions of what photos show                                                                     |                                                                                                                                         |

---

## Page-by-page audit

### Home

The narrative job of each section, in order, is: **Hero** (hook plus first action) → **Mission** (why, in the visitor's terms) → **Impact** (proof) → **Donation** (act) → **Testimonials** (social proof) → **FAQ** (answer objections) → **Footer** (wayfinding, trust fine print).

#### Hero

- **Current purpose:** emotional hook and immediate action.
- **Current copy:**
  - H1: "Skip One Pizza. Feed a Future."
  - Subhead: "One small sacrifice every month can help fund someone's education, food, or essential needs."
  - CTAs: "Donate One Pizza" and "See How It Helps".
- **Assessment:** matches `02UI_UX §2.2` word for word. Clear, specific enough for a hook, in the project's voice, not guilt-based. It states the idea ("skip a pizza") and the outcome (fund someone's needs). It does not say who S1P is, which is acceptable for a hero because the name sits in the header and the Mission and About pages carry identity.
- **Issues:**
  - **C-05** the subhead's "education, food, or essential needs" is broader than About's "funds education" (see About).
  - **C-15** the secondary CTA "See How It Helps" lands on "Why One Pizza Matters".
  - **C-24** "Skip" (hero) and "Sacrifice" (brand) are never connected on Home.
- **Recommendation:** **Do not rewrite the hero.** Its wording is approved and works. Only C-05 (a scope question for the client) can touch the subhead, and only if the client narrows the scope.
- **Priority:** see C-05 (P1), C-15 (P1), C-24 (P2).

#### Mission ("Why One Pizza Matters")

- **Current purpose:** the "why", told as a human story, not a statistic.
- **Current copy:** "Every year, students drop out not because they lack talent, but because they lack small financial support. Sometimes ₹500 can cover books. Sometimes ₹700 can fund a month of meals." Then: "What feels small to us can be life-changing to someone else."
- **Assessment:** this is the spec copy (`02UI_UX §3`) with a comma in place of the spec's em dash. Conversational and honest, with no cliché. It is the only section that explains why a small amount matters.
- **Issues:**
  - **C-18** the approved IA (`PHASE1_IA_PROPOSAL §C`) adds a text link "Read our full story →" to `/about` here. It was never added, so the Home page has no path to the About story except the header.
  - The ₹500 and ₹700 equivalences ("cover books", "a month of meals") and the dropout claim are carried from the spec without a source in the repository. They are presented as general truths, not as S1P statistics, so they are a lower risk than the Impact figures. Marked **Source information required** only if the client wants to stand behind them.
- **Recommendation:** add the approved link (C-18). Leave the copy unchanged.
- **Priority:** C-18 (P2).

#### Impact ("Small Sacrifices. Big Change.")

- **Current purpose:** quantified proof.
- **Current copy:** heading; "This is what happens when people choose purpose over one meal out."; four stats: ₹50,000+ Raised, 120+ Meals Funded, 30+ Students Supported, 200+ Donors Joined.
- **Assessment:** the structure is right and the heading is on-voice. The figures are the problem.
- **Issues:**
  - **C-02 (P0).** All four figures are the PRD's "Example Stats (initially placeholder)". CLAUDE.md §12 lists them as placeholders. They are rendered on the live page as fact, and the supporting line says "This is what happens when…", which asserts they are real results. They also **contradict the About page's real figures** (₹29L+ cumulative disbursement, 55+ students). The approved IA decision was to swap real figures in on Home ("₹29L+ disbursed · 55+ students supported… the other two stay placeholder until confirmed"); this was never done.
  - **C-20** units differ across the site: "₹50,000+" here, "₹29L+" and "₹0.45L" on About. "L" (lakh) is never explained.
  - **C-12** header and footer "Impact" links from About and Gallery go to this Home section, not About's own impact figures.
- **Recommendation:** see **Proposed copy changes** (High confidence for the two figures with a source, Source information required for the other two).
- **Priority:** C-02 (P0), C-20 (P2), C-12 (P1).

#### Donation (section heading and steps)

Covered in full under **Donation flow** below.

#### Testimonials ("Voices From Our Community")

- **Current purpose:** human social proof, one or two quotes at a time.
- **Current copy:**
  1. "It's just one pizza for me, but it could be someone's opportunity." / "Monthly Donor"
  2. "I never noticed ₹500 a month. Someone else clearly will." / "Ananya, Monthly Donor"
  3. "Skipping one order took thirty seconds. It felt bigger than that." / "Karan, First-Time Donor"
- **Assessment:** the quotes are short, specific and warm, and they fit the voice. But they are not real.
- **Issues:**
  - **C-03 (P0).** Quotes 2 and 3 are **authored placeholders with invented first names** (`testimonialsData.ts` says so). They are shown under the heading "Voices From Our Community" with no indication they are illustrative. Quote 1 comes from the PRD/UI spec as an _example_ testimonial, and the spec's "Open Content Decisions" says "Final verified testimonial content and donor attribution" is still open, so even it is unverified.
  - Quote 2 contains an unverifiable factual claim ("I never noticed ₹500 a month").
  - Quote 3 claims a duration ("thirty seconds") that the donation flow, which has four steps, does not support.
- **Recommendation:** **Source information required.** Do not edit the quotes for style (brief, §G). Whether to hide or reduce the section until real quotes exist is **decision D2**.
- **Priority:** C-03 (P0).

#### FAQ ("Questions You Might Have")

- **Current purpose:** answer the doubts that stop a donation.
- **Current copy:** four items from `02UI_UX §9`:
  1. "Where does the money go?" → "It goes toward verified individuals needing education, food, and essential support."
  2. "Is this a registered charity?" → "We are working toward formal registration. Transparency reports will be shared regularly."
  3. "Can I donate monthly?" → "Yes. Set a monthly reminder and scan the QR again each month."
  4. "Is ₹300 enough?" → "Yes. Small, consistent contributions create lasting impact."
- **Assessment:** exact spec copy, short and on-voice. But it was written before the About facts existed, and the IA proposal explicitly deferred the registration answer to "Phase 4".
- **Issues:**
  - **C-01 (P0).** Q2's answer ("working toward formal registration") **directly contradicts** the About page and hero: "Registered Trust · No. 316/2016", "a registered non-profit", "since it was registered in 2016". A visitor who reads both will distrust one of them.
  - **C-05** Q1 lists "education, food, and essential support"; About says S1P "funds education".
  - **C-06** "verified individuals" is a claim about a verification process that no document describes.
  - **C-07** "Transparency reports will be shared regularly" is a promise. The PRD lists "monthly transparency report" as a _future_ roadmap item, and no source says reports exist or on what cadence. The footer says "periodically", so the two disagree.
  - **C-16** Q4 "Is ₹300 enough?" has no object; the PRD wording is "Is ₹300 enough to make a difference?".
  - **C-17** the FAQ does not address the questions this particular flow raises (privacy of the screenshot and address, what happens after submitting, safety of paying by QR, receipts). Answers are **Source information required**.
- **Recommendation:** C-01 needs a factual correction with a source (the About page provides it); the rest depend on decisions D3, D4 and D5.
- **Priority:** C-01 (P0); C-05, C-06, C-07 (P1); C-16, C-17 (P2).

#### Section-to-section narrative (Home)

| Section      | Unique job                            | Duplicates another section?                                                                                              |
| ------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Hero         | Hook, name the idea, offer the action | Subhead repeats "small sacrifice" framing that Mission and Impact echo, which is acceptable repetition for a hook.       |
| Mission      | Explain why a small amount matters    | None.                                                                                                                    |
| Impact       | Prove scale                           | **Currently contradicts About's Impact** (C-02). Its subhead "choose purpose over one meal out" re-states the hero idea. |
| Donation     | Act, step by step                     | The section heading repeats the CTA label (see C-08).                                                                    |
| Testimonials | Social proof                          | Quote 1 restates the hero idea ("just one pizza… someone's opportunity"), which is what makes it effective, so keep.     |
| FAQ          | Remove doubts                         | Q1 and Q4 partly repeat Mission ("small amount, lasting impact").                                                        |
| Footer       | Wayfinding and fine print             | "Make it your monthly ritual." is a slogan, not a footer job (C-25).                                                     |

**Home messaging hierarchy (brief §A).** The five questions are answered in this order.

1. **What S1P is:** partly. The site name and the "Skip one pizza" idea are clear. That it is a registered Chennai trust appears only on About. FAQ Q2 currently says the opposite.
2. **Why it exists:** Mission, clearly.
3. **What the visitor can do:** hero CTA, clearly.
4. **Why care:** Mission, then the placeholder Impact figures (undermined by C-02).
5. **Next action:** the hero CTA and the donation section, clearly.

The hero does not need rewriting. The hierarchy gaps are factual (C-01, C-02, C-03) and a missing path to the real story (C-18), not tone.

---

### About

The About copy has strong provenance: `PHASE2_ABOUT_SPEC §D` records it as approved website-ready copy, and the implementation matches it closely.

| Section                   | Current purpose                   | Current copy (abridged)                                                                                                                                                                                                                                     | Assessment                                                                                                                    | Issues / recommendation                                                                                                                                                                                                                                                           | Priority         |
| ------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Hero                      | Orient; narrative hook            | "It started with a pizza order that never happened." / "Sacrifice 1 Pizza (S1P) is a Chennai-based trust that turns everyday choices — like skipping a pizza — into real educational support for students who need it." / "Registered Trust · No. 316/2016" | Good. Distinct from Home's hero (story, not ask). Introduces "S1P" and the legal name's numeral.                              | The word "educational" narrows the scope relative to Home (C-05). Leave.                                                                                                                                                                                                          | C-05 P1          |
| What S1P Is               | Plain orientation                 | "…registered non-profit that funds education for underprivileged students — from UKG through MBBS. Some students receive one-time help…; others are supported for years…" / "Non-profit · Education-focused · Community-funded"                             | Clear and specific. The one-time versus ongoing support line is an inference (the spec's open decision 5 asked for approval). | "Registered" is repeated three times on the page (hero, here, Trust). Intentional layering (spec §B). Open item: confirm the support-model line (spec open decision 5).                                                                                                           | P3 (C-30)        |
| The Story That Started It | Explain the name and the founding | Four-paragraph origin story with the eight things                                                                                                                                                                                                           | The strongest copy on the site. Specific, human, and free of clichés. It is a retelling of the client's story.                | **Do not change.** The facts are client-sourced (a real person's purchases); keep as is. Note the IA proposal mentioned a "₹500 festival bonus", while the approved copy omits the amount, which is safer.                                                                        | Unchanged        |
| Why Education             | Bridge/thesis                     | "Every one of those eight small things solved a problem for a single day. Education solves one for a lifetime…"                                                                                                                                             | Works as a pull-quote. Its `h2` is visually hidden ("Why Education"), which is correct for a pull-quote section.              | None.                                                                                                                                                                                                                                                                             | Unchanged        |
| Our Journey               | Show sustained operation          | "S1P has been funding student education since it was registered in 2016. Below is what that's added up to… real disbursements, not projections." + chart caption + members line                                                                             | Honest, and states the trend in words. The chart's first data point is **2015**, a year before registration.                  | **C-11** "since it was registered in 2016" versus a series that starts in 2015 and a total (₹29.87L) that includes 2015's ₹0.45L. **C-27** "has grown too — 58 active members in 2025, up from 50 in 2020" is true at both ends but the series dips to 42 in 2021 and 52 in 2023. | C-11 P1; C-27 P3 |
| What It's Added Up To     | Headline proof                    | "None of this is hypothetical — here's the total, so far:" ₹29L+ "Disbursed cumulatively, since 2016"; 55+ "Students supported, UKG to MBBS"                                                                                                                | Real figures, correctly rounded per spec. This is the content Home's Impact should have.                                      | **C-11** "since 2016" includes 2015 money. **C-20** the "L" is unexplained. "Cumulatively" and "since 2016" overlap in one label. **C-30** the "real, not projections" assurance appears here and in Our Journey.                                                                 | P1 / P2 / P3     |
| About the Trust           | Legitimacy                        | Label/value list: legal name, status, Registration No. 316/2016, Chennai, Tamil Nadu, s1pwtrust@gmail.com                                                                                                                                                   | Plain, factual, correct per spec (no 80G, no street address).                                                                 | None, except that the claim here is what FAQ Q2 must agree with (C-01). The email is shown as text, not a `mailto:` link; that is a behaviour question, not copy.                                                                                                                 | Unchanged        |
| Closing band              | Convert                           | "Be part of the next chapter." / "The same choice is still there — one pizza, or one student's next school fee." / "Donate One Pizza"                                                                                                                       | Good. Echoes the About story ("one pizza"), single ask.                                                                       | None. Do not change.                                                                                                                                                                                                                                                              | Unchanged        |

**About narrative.** Hero (hook) → What S1P Is (orient) → Story (emotion) → Why Education (thesis) → Journey (it has lasted) → Impact (it has worked) → Trust (it is legitimate) → CTA. Each section has one job and the order matches the seven questions in the spec (§A). The only overlap is the three "registered" cues and the doubled "real, not projections" assurance, both minor.

**About facts that require client confirmation** are listed under **Source-dependent content**.

---

### Gallery

| Element       | Current copy                                                                                                                        | Assessment                                                        | Issue / recommendation                                                                                                                                                                                                                                                              | Priority  |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Hero          | "Our Gallery" / "Moments from S1P's journey — school visits, scholarship handovers, and the community behind them."                 | Clear purpose statement.                                          | **C-13** it describes photo content that does not exist yet, and "school visits" and "scholarship handovers" appear nowhere in the source documents (audit G-3: the photos' content is unknown). The same sentence is the page's meta description. **Source information required.** | P1        |
| Loading       | Visually hidden "Loading gallery" (`role="status"`) with skeleton tiles                                                             | Good: tells assistive tech what is happening.                     | None.                                                                                                                                                                                                                                                                               | Unchanged |
| Empty         | "Photos from our journey are on their way. Check back soon."                                                                        | Matches the IA ("warm, honest copy") and makes no invented claim. | None. **Do not change.**                                                                                                                                                                                                                                                            | Unchanged |
| Error         | "We couldn't load the gallery right now. Please try again in a moment." (`role="alert"`)                                            | Says what happened and what to do.                                | **C-23** it says "try again" but offers no way to retry (the IA specified an inline retry). A visitor must reload the page.                                                                                                                                                         | P2        |
| Image alt     | Caption if present, else "Photo from Sacrifice One Pizza's gallery"                                                                 | Safe default.                                                     | **C-29** every uncaptioned photo has an identical name, so a screen-reader user cannot tell them apart. Captions are content data (not invented here).                                                                                                                              | P3        |
| Viewer dialog | `Close` button; dialog named by the caption or the default alt                                                                      | Fine.                                                             | None.                                                                                                                                                                                                                                                                               | Unchanged |
| Closing band  | "Be part of the next photo." / "Every moment here started with someone choosing one pizza's worth of support." / "Donate One Pizza" | The heading is a good, specific variant of the About closer.      | **C-26** "Every moment here started with…" is a factual claim about photos that do not exist and may not all be donor-driven. Soften only with client input on what the photos show.                                                                                                | P2        |

**Relationship to the mission.** The page's job is credibility through real moments. Until photos exist the page is mostly an empty state, which is honest. Do not write imaginary descriptions of photos.

---

### Donation flow

The flow is the site's most important copy. Overall it is clear, honest and well aligned to P-5: nothing claims automatic verification. Findings are about expectation-setting and failure states.

| Step / element                 | Current copy                                                                                                                                                                                                                                                                                                                                    | Assessment                                                                                                             | Issue / recommendation                                                                                                                                                                                                                                                                                                                                                                                                    | Priority  |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Amount: heading + intro        | "Donate One Pizza" / "Give what you would normally spend on a pizza. Every contribution becomes part of something bigger."                                                                                                                                                                                                                      | Exact spec copy. On voice and non-guilt.                                                                               | **Why donate / what it supports** is not stated at the moment of giving. There is no cue to the registered trust, the FAQ, or where money goes (C-09).                                                                                                                                                                                                                                                                    | P1        |
| Amount: label, hint, errors    | "Amount"; hint "Enter any amount from ₹300 to ₹3000."; "Please enter an amount between ₹300 and ₹3000."; above limit: "For donations above ₹3000, please give us a call at [phone]."                                                                                                                                                            | Matches the spec exactly; clear and non-scolding; the call message has a tap-to-call link.                             | The phone is a placeholder (**C-04**). The placeholder "500" in the input quietly suggests an amount, although the design has no presets (**C-32**, P3).                                                                                                                                                                                                                                                                  | C-04 P0   |
| Amount: submit button          | "Donate One Pizza"                                                                                                                                                                                                                                                                                                                              | The label is the site's primary CTA wording (P-4).                                                                     | **C-08** this button does not donate. It advances to the payment step. It also repeats the section heading directly above it. The label promises a completed action.                                                                                                                                                                                                                                                      | P1        |
| Payment: heading + instruction | "Scan to pay ₹500" (the chosen amount); "Scan the QR code or use the UPI ID below with any UPI app."                                                                                                                                                                                                                                            | Clear, specific, personalised.                                                                                         | None.                                                                                                                                                                                                                                                                                                                                                                                                                     | Unchanged |
| Payment: QR and UPI ID         | QR alt "UPI QR code for donating to Sacrifice One Pizza charity"; UPI ID text; "Minimum ₹300 · Maximum via UPI ₹3000"                                                                                                                                                                                                                           | Spec alt text; the ID is plain, selectable text, so the QR is never the only way to pay.                               | The UPI ID is a placeholder unless the environment variable is set (**C-04**). "Minimum/Maximum" is repeated from the previous step (acceptable, since it re-confirms limits at the payment moment).                                                                                                                                                                                                                      | C-04 P0   |
| Payment: copy button           | "Copy UPI ID" → "Copied ✓" (with a hidden status)                                                                                                                                                                                                                                                                                               | Spec copy. The label does not resize.                                                                                  | **C-19** if the clipboard write fails nothing happens, and the visitor gets no feedback or fallback.                                                                                                                                                                                                                                                                                                                      | P2        |
| Payment: confirm prompt        | "Once you've completed the payment, confirm it below." / "I've Paid"                                                                                                                                                                                                                                                                            | Honest: does not claim the site detects payment. "I've Paid" is the spec label.                                        | Keep. The button says what the visitor did, not what the site will do, which is the honest framing.                                                                                                                                                                                                                                                                                                                       | Unchanged |
| Confirmation: heading          | "Payment done? Tell us who to thank."                                                                                                                                                                                                                                                                                                           | Spec copy, warm, no verification claim.                                                                                | Keep.                                                                                                                                                                                                                                                                                                                                                                                                                     | Unchanged |
| Confirmation: fields           | "Full Name" ("Your name"); "Address" ("Your address"); "Amount Paid"; "Payment Screenshot" with "Upload payment screenshot / Add a screenshot of your completed UPI payment. PNG, JPG, or WEBP, up to 8MB."                                                                                                                                     | Spec copy. Format and size are stated up front. Uploaded state: file name, "Ready to submit", labelled replace/remove. | **C-09** nothing explains _why_ a name, **address** and screenshot are collected or what happens to them. Address collection is the most sensitive ask and the spec lists it as an open decision. **C-21** all four fields are required but none is marked as such visibly.                                                                                                                                               | P1 / P2   |
| Confirmation: validation       | "Please enter your name." / "Please enter your address." / "Please enter an amount between ₹300 and ₹3000." / "Please upload your payment screenshot." / "Please upload a valid payment screenshot." / "Please wait for the screenshot to finish uploading." / "Please upload a PNG, JPG, or WEBP image." / "Please upload an image under 8MB." | Consistent, polite, specific, each tied to its field. Exactly the spec messages, plus the two upload-state ones.       | None. **Do not change.**                                                                                                                                                                                                                                                                                                                                                                                                  | Unchanged |
| Submit + submitting            | "Confirm Donation" → "Submitting…" (spinner, `aria-busy`)                                                                                                                                                                                                                                                                                       | Spec copy.                                                                                                             | "Confirm Donation" could be read as confirming a payment the site cannot verify, but it is the spec label and the preceding heading frames it correctly. Leave; see D12.                                                                                                                                                                                                                                                  | Unchanged |
| Submit error                   | "We couldn't submit your confirmation. Please try again." (`role="alert"`), form data preserved                                                                                                                                                                                                                                                 | Better than the spec's generic "Something went wrong"; says what and what next.                                        | **C-10** any other error message is shown as-is: server text such as "Amount must be at least ₹300." (different wording from the client's), "Screenshot must be a Vercel Blob URL.", or a Blob SDK error. A donor can be shown technical text.                                                                                                                                                                            | P1        |
| Success                        | Heart icon; "Thank you for choosing impact over indulgence ❤️"; "Your contribution has been recorded. Every small sacrifice helps create a larger opportunity."; "Back to Home"; "Share the Mission" → "Link copied ✓"                                                                                                                          | Exact spec copy; quiet, no confetti; both actions clearly named.                                                       | **C-09** nothing says what happens next, and "recorded" could be read as "received and confirmed". Because the confirmation is reviewed by a person, an honest expectation line is missing (**Source information required**: the actual review process). **C-31** "impact over indulgence" is a mild contrast of virtue and indulgence, close to the edge of the "not guilt-driven" principle; spec-locked, so flag only. | P1 / P3   |

---

### Shared navigation and footer

| Element             | Current copy                                                                              | Assessment                                                                      | Issue / recommendation                                                                                                                                 | Priority  |
| ------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| Header nav          | About · Gallery · Impact · FAQ · "Donate One Pizza"                                       | Matches the approved IA. Short, plain.                                          | **C-12** "Impact" and "FAQ" are Home anchors; from About or Gallery they navigate away to Home. "Impact" does not lead to About's real impact section. | P1        |
| Menu toggle         | "Open menu" / "Close menu"                                                                | Clear.                                                                          | None.                                                                                                                                                  | Unchanged |
| Mobile nav landmark | `aria-label="Mobile"`                                                                     | Names the device, not the purpose. The desktop one is "Primary".                | **C-22**                                                                                                                                               | P2        |
| Footer brand        | "Sacrifice One Pizza" / "Skip One Pizza. Feed a Future." / "Make it your monthly ritual." | Spec copy.                                                                      | **C-25** the last line is a slogan, not a CTA; nothing links from it and the donation flow never mentions monthly giving.                              | P2        |
| Footer links        | About · Gallery · Impact · Donate · FAQ                                                   | Consistent with the header; "Donate" is here because the header has the button. | None beyond C-12.                                                                                                                                      | Unchanged |
| Footer social       | Instagram, X (Twitter), LinkedIn (icons, `aria-label`s, `href="#"`)                       | Accessible names are fine.                                                      | **C-14** every link goes nowhere. **Source information required** (the handles). Either supply them or remove the icons.                               | P1        |
| Footer disclaimer   | "All donations are voluntary. Transparency reports will be shared periodically."          | Spec copy.                                                                      | **C-07** the promise has no source and differs from the FAQ ("regularly").                                                                             | P1        |

### Other public states and metadata

**Metadata and SEO copy (kept separate from visible copy):**

| Page    | `description` (also `og:description`, `twitter:description`)                                                                  | Assessment                                                                            |
| ------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Home    | "Skip one pizza a month and help fund someone's education, food, or essential needs. Donate ₹300–₹3000 via UPI."              | Accurate to the donation flow and good for search. Shares the scope question in C-05. |
| About   | "The story behind Sacrifice 1 Pizza Welfare Trust — why it started, how it's grown since 2016, and the students it supports." | Accurate and specific. Shares "since 2016" (C-11).                                    |
| Gallery | "Photos from Sacrifice One Pizza's journey — school visits, scholarship handovers, and the community behind them."            | Shares C-13: it describes content that does not exist.                                |
| Titles  | "Sacrifice One Pizza — Skip One Pizza. Feed a Future." / "About — Sacrifice One Pizza" / "Gallery — Sacrifice One Pizza"      | Consistent. The OG image carries the same two lines.                                  |

Metadata copy is a Phase 4D concern only to the extent it repeats an issue above.

---

## CTA audit

Types: **primary action**, **secondary action**, **navigation**, **informational**.

| Location                        | Current CTA                                                   | Type             | Destination / behaviour                                         | Issue                                                                                                       | Recommendation                                              |
| ------------------------------- | ------------------------------------------------------------- | ---------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Header                          | Donate One Pizza                                              | Primary action   | `/#donate`                                                      | On About/Gallery it leaves the page for Home. Acceptable; the donation flow only lives on Home.             | Keep.                                                       |
| Hero                            | Donate One Pizza                                              | Primary action   | `#donate`                                                       | None.                                                                                                       | Keep.                                                       |
| Hero                            | See How It Helps                                              | Secondary action | `#mission` ("Why One Pizza Matters")                            | **C-15** promises "how it helps" and lands on "why it matters"; the section does not show where money goes. | Decision D11: keep as the spec wording, or retarget/rename. |
| Mission                         | (none)                                                        | —                | —                                                               | **C-18** the approved "Read our full story →" link is missing.                                              | Add the approved link.                                      |
| Donation, step 1                | Donate One Pizza                                              | Primary action   | Advances to the payment step; nothing is donated yet            | **C-08** label describes a completed action.                                                                | Decision D9 (see Proposed changes).                         |
| Donation, step 2                | I've Paid                                                     | Primary action   | Advances to the confirmation form, no backend call              | None. Honest: states the donor's own action.                                                                | Keep.                                                       |
| Donation, step 2                | Copy UPI ID                                                   | Secondary action | Copies the ID, label flips to "Copied ✓"                        | **C-19** silent on failure.                                                                                 | Add failure feedback.                                       |
| Donation, step 3                | Upload payment screenshot (drop area)                         | Secondary action | Opens the file picker                                           | None.                                                                                                       | Keep.                                                       |
| Donation, step 3                | Replace screenshot / Remove screenshot                        | Secondary action | Icon buttons with accessible names                              | None.                                                                                                       | Keep.                                                       |
| Donation, step 3                | Confirm Donation                                              | Primary action   | Uploads then submits for review                                 | Mildly stronger than what happens (it submits a confirmation for review). Spec label.                       | Keep; see D12.                                              |
| Donation, step 4                | Back to Home                                                  | Primary action   | Resets the flow and scrolls to top                              | None.                                                                                                       | Keep.                                                       |
| Donation, step 4                | Share the Mission                                             | Secondary action | Native share sheet, else copies the site link ("Link copied ✓") | Failure is silent (same pattern as C-19).                                                                   | Same fix as C-19.                                           |
| About closing / Gallery closing | Donate One Pizza                                              | Primary action   | `/#donate`                                                      | None. Heading and body vary per page, the button stays constant (P-4).                                      | Keep.                                                       |
| Nav (header/footer)             | About, Gallery, Impact, FAQ, Donate                           | Navigation       | Page or Home anchors                                            | **C-12** "Impact" from About/Gallery.                                                                       | Decision D1 resolves most of it.                            |
| Footer                          | Make it your monthly ritual.                                  | Informational    | Not a link                                                      | **C-25** reads as a call to action but does nothing.                                                        | Keep as a slogan or link it; see D13.                       |
| Footer                          | Instagram / X (Twitter) / LinkedIn                            | Navigation       | `#`                                                             | **C-14** dead links.                                                                                        | Source information required.                                |
| Testimonials                    | Show testimonial _n_ of _N_, Pause/Start testimonial autoplay | Navigation       | Local controls                                                  | None.                                                                                                       | Keep.                                                       |
| FAQ                             | The four questions                                            | Informational    | Accordion                                                       | None (content issues are listed under FAQ).                                                                 | —                                                           |
| Gallery                         | Photo tiles, Close                                            | Navigation       | Opens/closes the viewer                                         | None.                                                                                                       | Keep.                                                       |

**CTA consistency:** one primary wording ("Donate One Pizza") is used everywhere except for the in-flow items above, which is exactly what the spec asks for. The secondary action wording is not repeated. No CTA overpromises except C-08 and, mildly, C-15.

---

## Repetition audit

| Repeated idea                             | Locations                                                                                                          | Why it repeats                                                              | Recommendation                                                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| "One small sacrifice / one pizza" framing | Hero subhead, Mission quote, Impact subhead, Donation intro, Testimonial 1, About closer, Gallery closer           | It is the brand idea and each instance fits its section.                    | Keep. It is intentional, with each line doing a different job (hook, moral, proof, instruction, voice, call). No change. |
| "Education, food, essential needs"        | Hero subhead, FAQ Q1, meta description, Mission ("books", "meals")                                                 | Spec copy; the scope was never reconciled with About's education focus.     | Needs a scope decision (C-05, D4). Not a wording problem.                                                                |
| Impact figures                            | Home Impact (placeholders) and About Impact (real); About's ₹29L+ also appears in the Journey caption (as ₹29.87L) | By design, About is the fuller version (spec §C.6).                         | The _repetition_ is fine; the _contradiction_ is the issue (C-02).                                                       |
| "Real, not hypothetical/projections"      | About "Our Journey" intro and About Impact intro                                                                   | Two adjacent sections each reassure.                                        | P3 (C-30). One of the two could go. Not urgent; both are approved copy.                                                  |
| "Registered Trust · No. 316/2016"         | About hero, About "What S1P Is" ("registered non-profit"), About the Trust                                         | Layered legitimacy cue (spec §B).                                           | Keep. The _contradicting_ FAQ is the real problem (C-01).                                                                |
| "Donate One Pizza" label                  | Header, Hero, Donation heading, Donation step-1 button, About closer, Gallery closer                               | One primary CTA wording is a spec rule.                                     | Keep, except the step-1 button (C-08).                                                                                   |
| Amount limits "₹300 to ₹3000"             | Meta description, amount hint, error message, payment step, confirmation validation                                | Each is a different moment (promise, input, payment, re-validation).        | Keep.                                                                                                                    |
| Monthly giving                            | Hero ("every month"), FAQ Q3, Footer ("monthly ritual"), testimonial attributions ("Monthly Donor")                | Brand message; monthly giving is messaging only (open decision in 02UI_UX). | Decision D13.                                                                                                            |
| "Transparency reports"                    | FAQ Q2 ("regularly"), Footer ("periodically")                                                                      | Both from the spec, never reconciled.                                       | C-07: one wording and a source.                                                                                          |
| "Thank / thanks" and warmth               | Confirmation heading, success heading                                                                              | Deliberate bookends of the flow.                                            | Keep.                                                                                                                    |

---

## Content-state audit

| State                                | Current copy                                                                                                                                         | User need                                | Issue                                                                    | Recommendation                                                               |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Gallery loading                      | Hidden "Loading gallery" plus skeleton                                                                                                               | Know it is loading                       | None                                                                     | Keep                                                                         |
| Gallery empty                        | "Photos from our journey are on their way. Check back soon."                                                                                         | Understand there is nothing yet          | None                                                                     | Keep                                                                         |
| Gallery error                        | "We couldn't load the gallery right now. Please try again in a moment."                                                                              | What happened, what to do                | **C-23** no retry control                                                | Add a retry action                                                           |
| Amount: empty/valid                  | Hint "Enter any amount from ₹300 to ₹3000."                                                                                                          | Know the allowed range                   | None                                                                     | Keep                                                                         |
| Amount: too low / too high           | "Please enter an amount between ₹300 and ₹3000." / "For donations above ₹3000, please give us a call at…"                                            | What is wrong, what to do                | Phone is a placeholder (C-04)                                            | Keep wording; supply the number                                              |
| Payment: copied                      | "Copied ✓" (and hidden status "Copied ✓")                                                                                                            | Know the copy worked                     | The ✓ is read aloud (C-28)                                               | Use a plain word in the hidden status                                        |
| Payment: copy failed                 | None                                                                                                                                                 | Know it failed and what to do            | **C-19** silent                                                          | Add a short failure message; the ID is already visible text                  |
| Upload: idle                         | "Upload payment screenshot" / "Add a screenshot of your completed UPI payment. PNG, JPG, or WEBP, up to 8MB."                                        | What to upload and limits                | None                                                                     | Keep                                                                         |
| Upload: processing                   | "Uploading…" with spinner                                                                                                                            | Know it is working                       | None                                                                     | Keep                                                                         |
| Upload: ready                        | File name, "Ready to submit"                                                                                                                         | Confirmation it is attached              | None                                                                     | Keep                                                                         |
| Upload: invalid                      | "Please upload a PNG, JPG, or WEBP image." / "Please upload an image under 8MB."                                                                     | What is wrong and what to do             | None                                                                     | Keep                                                                         |
| Form: field errors                   | "Please enter your name." etc.                                                                                                                       | What is wrong, focus moves to the field  | None                                                                     | Keep                                                                         |
| Submitting (disabled)                | Button "Submitting…" with spinner, disabled                                                                                                          | Know it is in progress; no double submit | None                                                                     | Keep                                                                         |
| Submit error                         | "We couldn't submit your confirmation. Please try again." (data preserved)                                                                           | What happened, what to do                | **C-10** other errors show raw server or SDK text                        | Use the friendly line for anything that is not a known, friendly API message |
| Rate limited                         | "Too many submissions from this network. Please try again later."                                                                                    | Why it was blocked                       | Fine, rare                                                               | Keep                                                                         |
| Server rejects the image             | "The uploaded file is not a valid image. Please upload your payment screenshot again."                                                               | What to do                               | Fine                                                                     | Keep                                                                         |
| Success / confirmation               | "Thank you for choosing impact over indulgence ❤️" / "Your contribution has been recorded. Every small sacrifice helps create a larger opportunity." | Know it worked and what happens next     | **C-09** no "what happens next"; "recorded" may overstate; **C-31** tone | Needs source on the review process; see D5, D12                              |
| Share: link copied                   | "Link copied ✓"                                                                                                                                      | Know the share fallback worked           | Silent on failure (C-19 pattern)                                         | Same fix as C-19                                                             |
| Testimonials autoplay paused/playing | "Pause testimonial autoplay" / "Start testimonial autoplay"                                                                                          | Control motion                           | None                                                                     | Keep                                                                         |

---

## Accessibility copy audit

| Element                     | Current accessible name                                                             | Issue                                                                                                                       | Recommendation                                       |
| --------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Primary nav (desktop)       | `Primary`                                                                           | Good.                                                                                                                       | Keep                                                 |
| Mobile nav                  | `Mobile`                                                                            | Names the device, not the purpose (**C-22**).                                                                               | Rename to a purpose-based name (e.g. "Primary menu") |
| Menu button                 | "Open menu" / "Close menu", with `aria-expanded`                                    | Good.                                                                                                                       | Keep                                                 |
| Footer nav                  | `Footer`                                                                            | Good.                                                                                                                       | Keep                                                 |
| Social links                | "Instagram", "X (Twitter)", "LinkedIn"                                              | Names are fine; destinations are `#` (**C-14**).                                                                            | Fix destinations or remove                           |
| QR code                     | "UPI QR code for donating to Sacrifice One Pizza charity"                           | Spec text. Good. The ID is also visible text.                                                                               | Keep                                                 |
| Copy button + status        | Visible "Copy UPI ID" / "Copied ✓"; hidden `role="status"` "Copied ✓"               | The ✓ glyph can be announced as "check mark" (**C-28**).                                                                    | Plain text "Copied" in the hidden status             |
| Share button + status       | "Share the Mission" / "Link copied ✓"; hidden status "Link copied ✓"                | Same glyph issue.                                                                                                           | Plain text in the hidden status                      |
| Amount field                | Label "Amount"; hint associated by `aria-describedby`; `₹` is `aria-hidden`         | Good: the unit is lost to screen readers, but the hint says "₹300 to ₹3000".                                                | Keep                                                 |
| Confirmation fields         | Visible labels, `aria-required`, errors by `aria-describedby`, focus on first error | Good. Visible labels do not show "required" (**C-21**).                                                                     | Keep; add a visible note                             |
| Screenshot input            | Label "Payment Screenshot" plus the drop-area label "Upload payment screenshot"     | Two similar names for one control; acceptable, since the drop area is the control's own label.                              | Keep                                                 |
| Replace / Remove screenshot | "Replace screenshot" / "Remove screenshot"                                          | Good.                                                                                                                       | Keep                                                 |
| Screenshot preview image    | "Preview of the uploaded payment screenshot"                                        | Good.                                                                                                                       | Keep                                                 |
| Success heading             | "Thank you for choosing impact over indulgence ❤️"                                  | The emoji is announced as "red heart" (spec-locked).                                                                        | **C-28**: only if the spec is revisited (D12)        |
| Testimonial dots            | "Show testimonial _n_ of _N_" with `aria-current`; group "Testimonials"             | Good.                                                                                                                       | Keep                                                 |
| Autoplay control            | "Pause testimonial autoplay" / "Start testimonial autoplay"                         | Good.                                                                                                                       | Keep                                                 |
| Impact figures              | Visually hidden final text, animated digits `aria-hidden`                           | Good: announces the finished number once.                                                                                   | Keep                                                 |
| Journey chart               | `aria-hidden` chart; visible caption states the trend                               | Good.                                                                                                                       | Keep                                                 |
| Gallery tile / viewer       | Caption or "Photo from Sacrifice One Pizza's gallery"; dialog named by it; "Close"  | Generic repeated name for uncaptioned photos (**C-29**).                                                                    | Content-dependent; real captions are the fix         |
| Gallery loading             | Hidden "Loading gallery" (`role="status"`)                                          | Good.                                                                                                                       | Keep                                                 |
| Illustrations               | `aria-hidden`, empty alt                                                            | Correct for decorative art (Phase 4C).                                                                                      | Keep                                                 |
| Skip link                   | None                                                                                | There is no "Skip to content" link before the header navigation (**C-33**). This is a missing control more than a copy fix. | Flag for the implementation plan                     |

---

## Source-dependent content

Each item below cannot be written safely from the repository alone. **Source information required** in every case.

| #   | Item                                                        | Where                                   | Exactly what is missing                                                                                                                                              |
| --- | ----------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | Real value for "Meals Funded"                               | Home Impact (C-02)                      | An actual, current figure and what counts as a "meal funded". Only "30+ students" and "₹ raised" have About analogues; meals do not appear in About's sources.       |
| S2  | Real value for "Donors Joined"                              | Home Impact (C-02)                      | A real, current donor count (and whether it means unique donors).                                                                                                    |
| S3  | Whether "₹ raised" and "₹ disbursed" mean the same thing    | Home Impact vs About                    | The Home stat says "Raised"; the real figure is "disbursed". The client must say whether Home should say either.                                                     |
| S4  | Real donor testimonials and how donors should be attributed | Home Testimonials (C-03)                | Verified quotes, and consent and attribution format (first name, role, "monthly donor").                                                                             |
| S5  | Legal status wording for FAQ Q2                             | FAQ (C-01)                              | Confirmation that the registered-trust facts on About are the wording to use, and whether "charity" is acceptable. **80G must not be mentioned** unless provided.    |
| S6  | Transparency reports                                        | FAQ Q2, Footer (C-07)                   | Whether reports exist or are planned, their cadence, and where donors can read them. The PRD lists them only as a future item.                                       |
| S7  | What the money funds                                        | Hero, FAQ Q1, meta (C-05)               | Whether donations fund only education (About's wording) or also food and essential needs (Home's wording).                                                           |
| S8  | What "verified individuals" means                           | FAQ Q1 (C-06)                           | The actual verification process, or approval to drop the word.                                                                                                       |
| S9  | The ₹500 and ₹700 equivalences                              | Mission                                 | Whether "₹500 covers books" and "₹700 funds a month of meals" are accurate for S1P, or just illustrative.                                                            |
| S10 | What happens after a donor submits                          | Success state, FAQ (C-09, C-17)         | Who reviews submissions, whether the donor is contacted, whether any receipt or acknowledgement is sent, and how long it takes.                                      |
| S11 | Why a postal address is collected                           | Confirmation form (C-09)                | The purpose (acknowledgement, records, a legal requirement?) and how it is stored. Needed for any honest explanatory line.                                           |
| S12 | The final UPI ID and phone number                           | Payment step, amount error (C-04)       | The real values, and confirmation that the production environment variables are set (the code falls back to placeholders).                                           |
| S13 | Social media handles                                        | Footer (C-14)                           | The real URLs, or confirmation that the icons should be removed.                                                                                                     |
| S14 | What 2015 represents                                        | About Journey and Impact (C-11)         | The chart's first point is 2015 and the total includes ₹0.45L from 2015, but copy says "since 2016" (registration year). The client must say which framing is right. |
| S15 | What the gallery photos will show                           | Gallery hero, meta, closer (C-13, C-26) | Whether "school visits" and "scholarship handovers" are accurate descriptions; what photos and captions will exist.                                                  |
| S16 | Confirm the About support-model sentence                    | About "What S1P Is"                     | The spec's open decision 5: whether "one-time help… others are supported for years at a time" is acceptable (inferred from an internal form term).                   |
| S17 | Phone number tap-to-call behaviour                          | Amount step                             | Already implemented as `tel:`; only the number is missing (S12).                                                                                                     |

---

## Proposed copy changes

Nothing here is implemented. Proposed wording appears only where the source material supports it.

### High confidence

These rely only on facts already stated elsewhere on the site or in the project documents.

**H-1 · FAQ Q2 (C-01, P0)**

- **CURRENT:** Q "Is this a registered charity?" / A "We are working toward formal registration. Transparency reports will be shared regularly."
- **ISSUE:** contradicts About, which states a registered trust with Registration No. 316/2016.
- **PROPOSED:** keep the question; answer: "Yes. Sacrifice 1 Pizza Welfare Trust is a registered non-profit in Chennai (Registration No. 316/2016)." The second sentence about transparency reports is **removed pending S6**.
- **REASON:** every fact is taken from the About page's approved copy. No new claim is added, and 80G is deliberately not mentioned.
- **CONFIDENCE:** High for the facts; the choice to drop the second sentence is covered by D3.

**H-2 · Home Impact: use the two real figures (C-02, P0; also C-12)**

- **CURRENT:** ₹50,000+ Raised / 120+ Meals Funded / 30+ Students Supported / 200+ Donors Joined.
- **ISSUE:** placeholders shown as fact, contradicting About.
- **PROPOSED (the two figures that have a source):** "₹29L+" with label "Disbursed" (or the About label), and "55+" with label "Students Supported, UKG to MBBS". These exact figures and the "UKG to MBBS" wording come from About's approved copy.
- **REASON:** this is the approved IA decision (`PHASE1_IA_PROPOSAL §C`) that was never applied.
- **CONFIDENCE:** High for the two figures. The other two stats are **Source information required** (S1, S2); what to do with their slots is D1.

**H-3 · Mission link (C-18, P2)**

- **CURRENT:** no link after the Mission copy.
- **PROPOSED:** add the approved text link "Read our full story →" pointing to `/about.html`.
- **REASON:** approved wording and destination in the IA proposal.
- **CONFIDENCE:** High.

**H-4 · FAQ Q4 wording (C-16, P2)**

- **CURRENT:** "Is ₹300 enough?"
- **PROPOSED:** "Is ₹300 enough to make a difference?" (PRD §8, sample question 4).
- **REASON:** supplies the missing object using the project's own earlier wording. The answer is unchanged.
- **CONFIDENCE:** High.

**H-5 · Server and SDK error text must not reach donors (C-10, P1)**

- **CURRENT:** the confirmation step shows whatever message the thrown error carries.
- **PROPOSED:** show the existing line "We couldn't submit your confirmation. Please try again." for anything that is not one of the API's known donor-friendly messages (rate limit, invalid image). No new copy is needed.
- **REASON:** the line already exists and is the spec's. This is a copy-state fix with a minimal code touch.
- **CONFIDENCE:** High.

**H-6 · Mobile nav accessible name (C-22, P2)**

- **CURRENT:** `aria-label="Mobile"`.
- **PROPOSED:** a purpose-based name, for example "Primary menu".
- **CONFIDENCE:** High.

**H-7 · Copy-failure feedback (C-19, P2)**

- **CURRENT:** silent failure on "Copy UPI ID" and on the share fallback.
- **PROPOSED:** a short inline message in the same slot, for example "Couldn't copy. Select the ID above." for the UPI button. The UPI ID is already shown as selectable text, so the message points at it.
- **CONFIDENCE:** High that feedback is needed; Medium on exact wording (interface language).

**H-8 · Hidden status text without glyphs (C-28, P3)**

- **PROPOSED:** the visually hidden status for copy and share says "Copied" and "Link copied", with no ✓. The visible labels stay as they are.
- **CONFIDENCE:** High.

**H-9 · Gallery error retry (C-23, P2)**

- **PROPOSED:** add a "Try again" control (the IA specified an inline retry) next to the existing message. Wording of the message is unchanged.
- **CONFIDENCE:** High.

### Needs confirmation

These need the client or you to decide, or need information that does not exist in the repository.

| #    | Item                                   | Why it needs confirmation                                                                                                                                                                    | Decision |
| ---- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| N-1  | Home Impact stats 3 and 4 (C-02)       | No source for meals or donors. Options: remove the two, replace with other real About figures (for example the active-member count), or keep with an on-page indication. Not mine to invent. | D1       |
| N-2  | Testimonials (C-03)                    | Replace with real quotes, show only quote 1, or hide the section. Quote 1 itself is still the spec's example.                                                                                | D2       |
| N-3  | Transparency-report promise (C-07)     | Delete, reword, or keep once reports exist; align FAQ and footer wording.                                                                                                                    | D3       |
| N-4  | Scope of funding (C-05, C-06)          | Hero, FAQ Q1 and meta say "education, food, or essential needs"; About says education. Either About or Home needs to change, but I cannot tell which is true.                                | D4       |
| N-5  | Expectation-setting in the flow (C-09) | Needs the real review process (S10) and the reason for collecting an address (S11) before any line is written. Possible places: under the confirmation heading and in the success message.   | D5       |
| N-6  | 2015 versus 2016 framing (C-11)        | Needs S14. Candidates once known: change the labels to "since 2015", or add a sentence about 2015.                                                                                           | D7       |
| N-7  | Gallery hero and meta (C-13)           | Needs S15. A neutral replacement that makes no claim about content can only be written once you decide how factual it should be.                                                             | D8       |
| N-8  | Amount-step button (C-08)              | See D9. Candidate labels: "Continue" or "Show payment details". The site's rule is one primary CTA wording (P-4), so a different label here is a deliberate exception.                       | D9       |
| N-9  | "See How It Helps" (C-15)              | The label is the spec's preferred secondary CTA. Either keep it, retarget it to Impact, or reword it to match "Why One Pizza Matters".                                                       | D11      |
| N-10 | Social links (C-14)                    | Needs the handles (S13) or a decision to remove.                                                                                                                                             | D10      |
| N-11 | Lakh notation (C-20)                   | Define "L" once (for example "₹29 lakh+") or keep it. Needs a style decision, not a source.                                                                                                  | D14      |
| N-12 | Required-field marker (C-21)           | A visible "All fields are required" note is possible. Interface language, but it changes the form's visual layout slightly.                                                                  | D15      |
| N-13 | FAQ coverage (C-17)                    | New questions need answers from S10, S11 and the status of reports. **No questions will be added without answers.**                                                                          | D5       |
| N-14 | Brand naming on Home (C-24)            | Whether Home should introduce "S1P" and the legal name once, or leave that to About.                                                                                                         | D16      |
| N-15 | Monthly giving (C-25)                  | Whether "Make it your monthly ritual." remains a slogan or becomes a link, and whether the donation flow mentions monthly giving.                                                            | D13      |
| N-16 | Success-state honesty (C-09, C-31)     | The spec's "recorded" and "impact over indulgence" wording is locked. Revisiting it is a decision, not a drive-by edit.                                                                      | D12      |

### Do not change

These are on-voice, spec-approved, accurate to the implementation, and nothing in this audit improves them.

- **Hero** H1, subhead, and the primary CTA. Do not rewrite the hero automatically.
- **Mission** copy.
- **Donation:** section heading and intro; the amount hint and the validation messages; "Scan to pay ₹…" and its instruction; "Copy UPI ID" and "Copied"; "I've Paid"; "Payment done? Tell us who to thank."; field labels and placeholders; the upload hint; all validation messages; "Confirm Donation" and "Submitting…"; the submit-error message; "Back to Home" and "Share the Mission".
- **FAQ** Q3 ("Can I donate monthly?") and the structure of the accordion.
- **About:** the origin story, "Why Education", the Trust list and the closing band.
- **Gallery:** the empty-state message, the loading announcement and the closing heading.
- **Metadata:** the Home description and the page titles.
- **Accessible names** other than the ones listed in the audit above.

---

## Priority

Counts and IDs. Priorities describe the issue, not the effort.

| Priority  | Count  | IDs                                                                                                                                                                                                                                                                         |
| --------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0        | **4**  | C-01 FAQ registration answer; C-02 Home placeholder stats; C-03 invented testimonials; C-04 placeholder UPI ID/phone                                                                                                                                                        |
| P1        | **11** | C-05 funding scope; C-06 "verified individuals"; C-07 transparency promise; C-08 amount-step button; C-09 flow expectations; C-10 raw error text; C-11 "since 2016"; C-12 cross-page "Impact"; C-13 gallery content claims; C-14 dead social links; C-15 "See How It Helps" |
| P2        | **11** | C-16 FAQ Q4; C-17 FAQ gaps; C-18 Mission link; C-19 silent copy failure; C-20 lakh/units; C-21 required marker; C-22 mobile nav name; C-23 gallery retry; C-24 brand naming; C-25 footer slogan; C-26 gallery closer claim                                                  |
| P3        | **7**  | C-27 "grown" members line; C-28 glyphs in hidden status; C-29 identical gallery alt; C-30 doubled assurance; C-31 "impact over indulgence"; C-32 "500" placeholder; C-33 no skip link                                                                                       |
| **Total** | **33** |                                                                                                                                                                                                                                                                             |

---

## Phase 4D implementation plan

Copy-only unless stated. The order puts factual correctness first, because nothing else matters if the page contradicts itself.

1. **Resolve the decisions that unblock facts.** D1 to D8 and D10. Nothing in steps 2 and 3 can be finalised without them.
2. **Correct the contradictions (P0).** FAQ Q2 (C-01), Home Impact (C-02), testimonials (C-03). Confirm the production environment variables for the UPI ID and phone number (C-04). Item C-04 is a configuration and verification step, not a code change.
3. **Align claims across the site (P1).** Funding scope (C-05, C-06), transparency wording (C-07), 2015/2016 framing (C-11), gallery claims and metadata (C-13). Apply the _same_ answer to Home, About, FAQ, the footer and the metadata so the site says one thing.
4. **Donation flow copy (P1).** Amount-step button (C-08), the expectation-setting lines (C-09) only once the facts exist, and the donor-safe error handling (C-10). The last item touches one catch block in `ConfirmationStep`; it is the only code change this phase needs.
5. **Navigation and CTAs (P1/P2).** Hero secondary CTA (C-15), Mission link (C-18), cross-page Impact link (C-12), social links (C-14).
6. **States and accessibility copy (P2/P3).** Copy and share failure feedback (C-19), gallery retry (C-23), mobile nav name (C-22), hidden status text (C-28), required marker (C-21), skip link (C-33).
7. **Polish (P2/P3).** FAQ Q4 wording (C-16), lakh notation (C-20), brand naming on Home (C-24), footer slogan (C-25), gallery closer (C-26), and the remaining P3 items.
8. **Verification.** Re-run typecheck, lint, format check, unit tests (update only tests that assert the changed copy, in `FAQ.test.tsx`, `Testimonials.test.tsx`, `ImpactStat.test.tsx` and `GalleryGrid.test.tsx` where applicable), the production build, and a rendered-text comparison against the Phase 4C baseline. Every expected text difference must trace to a decision in this document.

**Layout flags.** None of the proposed changes should require a layout change. Three need a small look once implemented: the required-field note (C-21), the retry control in the gallery error state (C-23), and the Mission link (C-18), which adds one line under the Mission statement. Reducing Impact to two stats would leave a 2-up row on desktop (D1).

---

## Open decisions

Only decisions that need your approval.

| #   | Decision                                                                                                                                                                                                                                                      | My recommendation                                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **Home Impact.** Use the two sourced figures (₹29L+, 55+ students). For the two with no source (meals, donors), do you want to remove them (a 2-stat row), replace them with another real About figure such as "58 active members", or keep them as they are? | Use the two real figures and remove the two unsourced ones. Do not keep placeholders as fact.                                      |
| D2  | **Testimonials.** Hide quotes 2 and 3 (invented, named), keep only quote 1, hide the whole section until real quotes exist, or supply real quotes?                                                                                                            | Remove quotes 2 and 3 at minimum. Whether to keep quote 1 depends on whether it is a real donor quote; you or the client must say. |
| D3  | **FAQ Q2 and transparency reports.** Approve H-1 (registered non-profit, Registration No. 316/2016) and decide whether to drop the "transparency reports" promise from the FAQ and footer until it exists, or provide a real cadence.                         | Approve H-1. Drop the promise unless reports exist.                                                                                |
| D4  | **What donations fund.** Education only (About's wording), or education, food and essential needs (Home's wording)?                                                                                                                                           | I cannot tell. Whichever is true, the other pages must change to match.                                                            |
| D5  | **Expectation-setting.** Please provide the review process after submission (who, what the donor will hear, any receipt) and why an address is collected. I will then write the lines; I will not write them without facts.                                   | Provide the facts. Without them, no new lines are added.                                                                           |
| D6  | **UPI ID and phone number.** Please confirm the real values and that `VITE_UPI_ID` and `VITE_PHONE_NUMBER` are set in the production environment (the code otherwise shows `sacrificeonepizza@upi` and `+91 00000 00000`).                                    | Verify on the live site before any other copy ships. This is the one item that can send a donor's money to the wrong place.        |
| D7  | **2015 versus 2016.** The chart and total include 2015, the copy says "since 2016". Which is correct, and may the copy say so?                                                                                                                                | Provide the client's intended framing.                                                                                             |
| D8  | **Gallery copy.** Should the hero line and meta description keep "school visits, scholarship handovers" or be reduced to something that makes no claim about the photos until they exist?                                                                     | Reduce to a neutral line until the photos exist.                                                                                   |
| D9  | **Amount-step button.** Keep "Donate One Pizza" (consistent CTA wording) or use a label that says what it does ("Continue" or "Show payment details")?                                                                                                        | Use a descriptive label inside the flow; keep "Donate One Pizza" everywhere else.                                                  |
| D10 | **Social links.** Provide the handles, or remove the three dead icons.                                                                                                                                                                                        | Remove until real URLs exist.                                                                                                      |
| D11 | **"See How It Helps".** Keep as the spec's wording and destination, or retarget it to Impact or rename it to match "Why One Pizza Matters".                                                                                                                   | Keep the wording; retarget to Impact only if D1 produces real figures.                                                             |
| D12 | **Spec-locked phrases.** Leave "Thank you for choosing impact over indulgence ❤️", "Your contribution has been recorded" and "Confirm Donation" exactly as in the UI spec, or revisit them (honesty about review, tone, emoji)?                               | Leave unchanged unless D5 shows that "recorded" misleads donors.                                                                   |
| D13 | **Monthly giving.** Is "monthly" messaging only (FAQ plus footer slogan), or should the flow mention it? Should the footer slogan link anywhere?                                                                                                              | Keep it as messaging only, as the spec's open decision currently allows.                                                           |
| D14 | **Lakh notation.** Define "L" ("lakh") once on About and Home, or keep "₹29L+" and rely on Indian readers' familiarity?                                                                                                                                       | Define it once.                                                                                                                    |
| D15 | **Required fields.** Add a visible "all fields are required" note to the confirmation form?                                                                                                                                                                   | Yes, small and unobtrusive.                                                                                                        |
| D16 | **Brand naming on Home.** Introduce "S1P" and the legal name once on Home, or leave identity to About?                                                                                                                                                        | Leave to About; add only the Mission link (H-3).                                                                                   |

---

## Final summary

### 1. Total number of copy issues found

**33** (C-01 to C-33).

### 2. Counts by priority

| P0  | P1  | P2  | P3  |
| --- | --- | --- | --- |
| 4   | 11  | 11  | 7   |

### 3. The most important proposed changes

1. **Fix the FAQ registration answer** so it no longer contradicts About (C-01, H-1).
2. **Replace Home's placeholder impact figures** with the two sourced ones, and decide what to do with the other two (C-02, H-2, D1).
3. **Remove or replace the invented testimonials** (C-03, D2).
4. **Verify the real UPI ID and phone number are live** before anything else ships (C-04, D6).
5. **Reconcile what donations fund** across Home, About, FAQ and metadata (C-05, D4).
6. **Stop raw server or SDK error text reaching donors** (C-10, H-5).
7. **Give the amount-step button an honest label** (C-08, D9).
8. **Reconcile "since 2016" with the 2015 data** (C-11, D7).
9. **Add the approved Mission link "Read our full story →"** (C-18, H-3).
10. **Add expectation-setting copy to the donation flow**, once the facts are supplied (C-09, D5).

### 4. Content that requires your or the client's confirmation

See **Source-dependent content** (S1 to S17). The critical ones: real figures for meals and donors (S1, S2), real testimonials (S4), legal-status wording and transparency reports (S5, S6), what the money funds (S7, S8), the post-submission process and why an address is collected (S10, S11), the real UPI ID and phone number (S12), social handles (S13), the 2015 framing (S14), and what the gallery photos show (S15).

### 5. Copy that should explicitly remain unchanged

See **Do not change**: the hero, Mission, the donation flow's spec microcopy and validation messages, FAQ Q3, the About origin story, Trust list and closing band, the Gallery empty state and loading announcement, and the Home metadata.

### 6. Decisions needed before implementation

**D1 to D16** (see **Open decisions**). The ones that block factual corrections are **D1, D2, D3, D4, D6, D7, D8**. The ones that block new flow copy are **D5 and D9**. The rest can be decided as the implementation proceeds.

---

## Decisions received and status

Answers received after this audit. Nothing is committed.

| Decision | Answer                                                                                                           | Status                                                                                                                                                                                                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1       | Use the two real figures.                                                                                        | **Done.** Home Impact shows ₹29L+ and 55+ students from one shared source (`impactFigures.ts`, also used by About). The two unsourced stats were removed.                                                                                                                        |
| D2       | Four real testimonials; one donor stays anonymous.                                                               | **Done.** Verbatim text. The anonymous donor is attributed only as "A long-time donor". Dr Saravanan is attributed by name only; the Founder Trustee wording stays inside his own quote and is **flagged as unconfirmed** as an attribution. Long quotes drop to a reading size. |
| D3       | The trust is a registered charity; include the details.                                                          | **Done.** FAQ Q2 states registration and Registration No. 316/2016. The footer's transparency promise was **removed** and not replaced.                                                                                                                                          |
| D4       | Mostly education for people who need it, other needs when necessary.                                             | **Done for FAQ Q1.** Hero, About and metadata unchanged.                                                                                                                                                                                                                         |
| D5       | Keep the flow order. Success confirms receipt without claiming verification. Address-purpose copy stays blocked. | **Done.** Success keeps its existing heading ("Thank you for choosing impact over indulgence ❤️", D12 decided: keep) and the body reads "We've received your payment details and screenshot. Our team will review your submission." No address explanation was added.            |
| D6       | UPI ID given; official QR supplied.                                                                              | **UPI ID and QR payload implemented; payment-verification pending** (a real test payment by the owner). The phone number is **unresolved and can no longer render a placeholder**: while unset, the above-limit message offers the contact email.                                |
| D7       | 2015.                                                                                                            | **Done.**                                                                                                                                                                                                                                                                        |
| D8       | Drop "school visits", keep "scholarship".                                                                        | **Done.**                                                                                                                                                                                                                                                                        |
| D9       | "Continue to Payment".                                                                                           | **Done.**                                                                                                                                                                                                                                                                        |
| D10–D16  | Not answered.                                                                                                    | **Not implemented.**                                                                                                                                                                                                                                                             |
