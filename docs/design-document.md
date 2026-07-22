# CarePath — Design Document
**Team:** Demond Balentine · Michelle Berthiaume · Remington Neustadter
**Atlas School Capstone · July 2026**

---

## Section 1: General MVP Discovery

### What problem will your capstone solve?

Patients in rural and low-income areas miss critical medical appointments — dialysis, oncology, cardiology, post-surgical follow-ups — not because they choose to, but because they have no reliable way to get there. Transportation failures cause no-shows. No-shows cause health deterioration, emergency hospitalizations, and preventable deaths.

The current system fails at every layer:
- Medicaid transportation cancels rides at 2am with no notice
- Volunteer drivers have no visibility into patient needs or appointment times
- Coordinators manage everything manually across phone calls, texts, and paper
- When a ride falls through, there is no organized fallback — patients are simply left behind
- No one tracks whether rides actually happened or what the health outcome was

CarePath solves this by providing a transportation coordination platform that connects patients, volunteer drivers, coordinators, and institutional partners — with ride matching, fallback escalation, SMS communication, and outcome tracking — without requiring mileage as a decision factor.

This problem is validated by 15 interviews across 5 stakeholder types, producing 13 strong signals of pain and willingness to use a solution.

---

### Who is your target audience?

CarePath serves five distinct user groups, each with a role-based interface:

| User Group | Description |
|---|---|
| Patients | Adults with chronic or acute conditions who need rides to medical appointments and rely on Medicaid transport, volunteers, or family — all of which are unreliable |
| Volunteer Drivers | Community members (often from churches, nonprofits, or neighborhoods) who are willing to drive patients but have no coordination tool |
| Coordinators | Staff at clinics, nonprofits, or community organizations who currently manage ride logistics manually via phone and text |
| Institutional Partners | Hospitals, churches, and nonprofits that want to pre-fund ride credits for patients in their community |
| Caregivers / Advocates | Family members, CNAs, home health aides, and veteran advocates who arrange rides on behalf of patients |

Primary geographic focus: rural and low-income communities in Arkansas and similar markets where public transit is limited and Medicaid transportation is unreliable.

---

### What features could be in this application?

**Core coordination features:**
- Patient ride request with accessibility flags (wheelchair, oxygen, stretcher)
- Driver matching based on availability, county, and vehicle capability
- Ride status lifecycle: PENDING → MATCHED → CONFIRMED → IN_PROGRESS → COMPLETED → CANCELLED → FALLBACK_NEEDED
- Coordinator pooling hub — view all pending rides, match drivers, trigger fallback
- Fallback escalation — when a ride fails, alert the backup driver pool instantly
- Depot route builder — recurring community van runs (e.g. every Tuesday to dialysis)

**Communication features:**
- Automated SMS reminders at 48hr, 24hr, and 2hr before pickup
- Ride confirmation SMS to patient and driver
- SMS-only workflow for patients and drivers without smartphones
- Voice call fallback for patients who cannot receive SMS
- Communication log — every message tracked with delivery status

**Outcome and data features:**
- Post-ride NPS survey (0–10 score + comments)
- Driver reliability score (calculated from completed rides and ratings)
- Ride cost log with funding source (grant, Medicaid, private, family)
- Estimated savings per ride (avoided ER visit cost)
- Community impact dashboard — total rides, appointments kept, estimated savings

**Partner and admin features:**
- Ride credit system — partners pre-purchase credits, credits consumed per ride
- Coordinator dashboard with live stat cards (pending, matched, fallback counts)
- Institutional partner portal — credit balance, usage history, ROI reporting

**Equity and access features:**
- Accessibility requirement matching — hard filter, not a hint
- Same-day fallback escalation for urgent-but-non-emergency rides
- Low-tech onboarding for patients with limited digital literacy
- Caregiver / advocate role — submit and track rides on behalf of patients

**Future / post-demo features:**
- QR code clinic check-in
- EHR webhook integration
- Medicaid reimbursement documentation export
- Offline-first patient intake
- AI-assisted ride matching
- Gamification for drivers (badges, leaderboard)

---

### What technology stack would your team like to use?

| Layer | Technology | Why |
|---|---|---|
| Backend API | Node.js + TypeScript + Express | Team has existing experience; TypeScript catches errors early; Express is lightweight and well-documented |
| Database | PostgreSQL + Prisma ORM | Relational data fits the ride/patient/driver model; Prisma provides type-safe queries and migration management |
| Frontend | Next.js 16 (App Router) + TypeScript | React-based, supports static export for Amplify deployment, strong ecosystem |
| Styling | Tailwind CSS | Utility-first, fast to build responsive layouts, no context switching between CSS files |
| Authentication | JWT (JSON Web Tokens) | Stateless, works well with role-based access control across 4 user types |
| SMS / Voice | Twilio | Industry standard for programmable SMS; team has it configured in the existing codebase |
| Hosting (UI) | AWS Amplify | Already deployed and live; free tier covers demo day needs |
| Hosting (API) | Local / Railway (demo) | Railway provides free-tier Node.js hosting for demo purposes |
| Icons | Lucide React | Consistent, lightweight icon set that pairs well with Tailwind |
| Version Control | GitHub | Already in use; team uses GitHub Projects for task tracking |

**Team experience:**
- Demond: Strong in backend architecture, Prisma, Express, PostgreSQL
- Remington: Strong in TypeScript, API development, troubleshooting
- Michelle: Strong in Next.js, Tailwind, component design, Amplify deployment

**Tradeoffs and limitations:**
- JWT without refresh tokens means sessions expire — acceptable for a demo, needs improvement for production
- Static export on Amplify limits server-side rendering — API calls happen client-side
- Twilio has per-message costs — kept minimal during development, using test credentials where possible
- No real-time WebSocket layer — ride status updates use polling (every 30 seconds) rather than push

---

### What costs could be incurred?

| Item | Estimated Cost | Notes |
|---|---|---|
| AWS Amplify hosting | Free tier | Covers demo day traffic easily |
| PostgreSQL (local) | $0 | Each developer runs locally; no cloud DB needed for demo |
| Twilio SMS | ~$0.0079/message | Minimal during development; test mode used where possible |
| Railway API hosting | Free tier | 500 hours/month free — sufficient for demo |
| GitHub | Free | Public repo on free plan |
| Domain name | $0 | Using Amplify-provided subdomain for demo |

**Total anticipated cost: Near $0 for demo day. No team member is expected to incur costs.**

---

### What are you hoping to learn by the end of this project?

**Technical skills:**
- Demond: How to architect a multi-role API with clean separation of concerns; how to write seed scripts that support realistic demo scenarios
- Remington: How to build and test a full REST API from schema to controller to route; how to integrate Twilio SMS into a real workflow
- Michelle: How to wire a Next.js frontend to a live API with JWT auth; how to build mobile-first responsive dashboards that work on real devices

**Soft skills (all team members):**
- How to divide technical work across a team without creating merge conflicts or blockers
- How to communicate progress and blockers clearly on a weekly cadence
- How to scope a project realistically and make hard decisions about what to cut
- How to present a technical product to a non-technical audience (Builders+Backers, Atlas School Demo Day)
- How to use validation evidence to justify product decisions

---

## Section 2: Features Table

| Feature Name | Critical for Audience? | Manageable in Timeline? | Status | Success Metric |
|---|---|---|---|---|
| User Authentication (Register / Login) | Yes | Yes | In Scope | Users can register, log in, and be redirected to their role-specific dashboard within 3 steps. JWT stored and used for all protected routes. |
| Patient Ride Request Form | Yes | Yes | In Scope | A patient can submit a ride request with appointment type, pickup address, time, and accessibility needs. Request appears in coordinator queue within 5 seconds. |
| Coordinator Pooling Hub | Yes | Yes | In Scope | Coordinator can view all pending rides, see matched driver candidates, assign a driver, and trigger fallback — all from one screen. |
| Driver Dashboard + Availability Toggle | Yes | Yes | In Scope | Driver can view assigned rides, toggle availability on/off, and update ride status (CONFIRMED → IN_PROGRESS → COMPLETED) from their dashboard. |
| Ride Status Lifecycle Tracking | Yes | Yes | In Scope | Ride moves through all 7 statuses. Each status change is logged as a RideEvent with actor, timestamp, and reason. |
| Fallback Escalation | Yes | Yes | In Scope | When fallback is triggered, ride status changes to FALLBACK_NEEDED, a RideEvent is logged, and an SMS alert is sent to the fallback driver pool. |
| SMS Ride Reminders (48hr / 24hr / 2hr) | Yes | Yes | In Scope | Patient and driver each receive 3 automated SMS reminders before pickup. Delivery status logged in CommunicationLog. |
| Accessibility Flag Matching | Yes | Yes | In Scope | Wheelchair flag on ride request filters driver pool to wheelchair-capable vehicles only. Non-accessible drivers do not appear as candidates. |
| Post-Ride NPS Survey | Yes | Yes | In Scope | After ride is marked COMPLETED, patient receives SMS with survey link. Survey captures NPS score (0–10) and optional comment. Score visible on coordinator dashboard. |
| Coordinator Dashboard Stat Cards | Yes | Yes | In Scope | Dashboard shows live counts: pending rides, matched rides, fallback events, rides completed today. Data pulls from live API. |
| Ride Pooling (Combine Rides) | Yes | No | Stretch | Coordinator can view multiple patients going to the same clinic on the same day and combine them into one ride with one driver. |
| Community Impact Dashboard | No | No | Stretch | Public-facing page shows total rides completed, appointments kept, and estimated ER visits avoided. Updates in real time from ride data. |
| Caregiver / Advocate Ride Tracking | No | No | Set Aside | Family member or advocate can view a patient's ride status via a shareable link without logging in. |
| SMS-Only Driver Workflow | Yes | No | Set Aside | Driver receives and responds to ride assignments entirely via SMS — no app required. |
| QR Code Clinic Check-In | No | No | Set Aside | Patient scans a QR code at the clinic on arrival, automatically marking the ride as COMPLETED in the system. |
| EHR Webhook Integration | No | No | Set Aside | When a ride is completed, a webhook notifies the clinic's EHR system to confirm the patient arrived. |
| Ride Credit System (Partner Portal) | No | Yes | Stretch | Institutional partner can view credit balance, see which rides consumed credits, and track remaining credits. |
| Driver Reliability Score Display | Yes | Yes | In Scope | Driver profile shows reliability score (0–5.0) calculated from completed rides and patient ratings. Score visible to coordinators when matching. |

---

## Section 3: Designs

Wireframes and screen designs are maintained in the live Amplify deployment and the carepath-ui source directory.

**Live UI:** https://main.d352gym2v1cw7h.amplifyapp.com

**Key screens and their corresponding features:**

| Screen | Feature | Location in Codebase |
|---|---|---|
| Login / Register | User Authentication | `carepath-ui/src/app/(auth)/` |
| Patient Dashboard | Ride Status Tracking, Ride Request | `carepath-ui/src/app/(dashboard)/patient/` |
| Patient Intake Form | Patient Ride Request Form, Accessibility Flags | `carepath-ui/src/app/(dashboard)/patient/` |
| Coordinator Pooling Hub | Coordinator Pooling Hub, Fallback Escalation, Ride Pooling | `carepath-ui/src/app/(dashboard)/coordinator/` |
| Coordinator Dashboard | Coordinator Stat Cards, Driver Reliability Score | `carepath-ui/src/app/(dashboard)/coordinator/` |
| Driver Dashboard | Driver Dashboard, Availability Toggle, Ride Status Lifecycle | `carepath-ui/src/app/(dashboard)/driver/` |
| Post-Ride Survey | Post-Ride NPS Survey | `carepath-ui/src/app/(dashboard)/patient/survey/` |
| Partner Portal | Ride Credit System | `carepath-ui/src/app/(dashboard)/admin/` |

**Design system:**
- Brand colors: Teal (#0d9488), Navy (#052b56), Purple (#5540a1)
- Typography: Inter (Google Fonts)
- Component library: Button, Card, Badge, StatCard, Sidebar, Topbar (all in `carepath-ui/src/components/`)
- Mobile-first: 44px touch targets, bottom tab nav on mobile, sidebar on desktop
- Responsive breakpoints: 375px (iPhone SE), 390px (iPhone 14), 768px (tablet), 1024px (desktop)

---

## Section 4: Risks & Mitigation Strategies

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| Twilio SMS integration fails or costs exceed free tier | Fallback escalation and ride reminders cannot be tested end-to-end; major demo feature blocked | Configure Twilio test credentials in Week 1. Use test phone numbers during development. Only switch to live credentials for final demo run. Cap usage to demo scenarios only. |
| Database migration conflicts between team members | Schema gets out of sync; API breaks for one or more teammates; blocked development | All schema changes go through a PR before merging. Run `prisma migrate dev` after every pull. Remington owns migration files — no one else edits schema without coordinating first. |
| AWS Amplify static export breaks after a Next.js update | Live demo URL goes down on demo day | Lock Next.js version in package.json. Test Amplify build locally with `next build` before every push to main. Keep the last known-good build artifact. |
| API and UI fall out of sync (endpoint changes break the frontend) | UI shows errors or blank data during demo | Remington documents every new or changed endpoint in `api-test/carepath.http`. Michelle tests against that file before wiring any new UI screen. |
| Team member unavailable during final week (illness, emergency) | Critical features unfinished; demo flow incomplete | Feature freeze is Aug 6 — one week before demo day. All critical features must be merged by then. Each team member documents their work so others can pick it up if needed. |

---

## Section 5: Development Sprints

### Part A: Project Management Tool

**Tool:** GitHub Projects (linked to the CarePath repository)
**URL:** https://github.com/Debalent/CarePath

The team uses GitHub Projects with a Kanban board organized into four columns: Backlog, In Progress, In Review, and Done. Each task is a GitHub Issue assigned to a team member with a milestone label (Week 1, Week 2, Week 3, Week 4, Demo). The PM (Demond) creates issues at the start of each sprint. Remington and Michelle self-assign from the backlog and move cards as work progresses. The team reviews the board at every Friday check-in.

---

### Part B: Sprint Overview

**Sprint duration:** 1 week
**Check-in cadence:** Every Friday
**Gate rule:** No new sprint work begins until the previous sprint's gate criteria are met. Unmet gates carry forward and the PM adjusts scope.

---

**Sprint 1 — July 14–18 | Foundation + Auth**
- Set up local dev environments for all teammates
- Confirm `prisma migrate dev` succeeds and seed data loads
- Complete patient and driver profile controllers
- Build Login and Register pages in the UI
- Wire JWT auth end-to-end: register → login → protected route
- **Milestone gate:** Both teammates have the app running locally. Login and register work via Postman and the UI.

**Sprint 2 — July 21–25 | Core Ride Flow**
- Complete coordinator controller (dashboard stats, rides in county)
- Add `GET /api/rides/my` and `GET /api/drivers/available`
- Build Patient Dashboard (active ride card, next appointment, request button)
- Build Driver Dashboard (assigned rides, availability toggle)
- Wire Patient Intake form to live API
- **Milestone gate:** A patient can submit a ride request via the UI and a coordinator can see it in the pooling hub.

**Sprint 3 — July 28 – August 1 | Coordinator Loop + Fallback**
- Wire fallback controller — FALLBACK_NEEDED status + SMS blast
- Add `PATCH /api/rides/:id/status` for driver ride progression
- Add `GET /api/coordinator/stats` for live stat cards
- Build Coordinator Dashboard with live stat cards
- Wire Coordinator Pooling Hub to real API
- Add ride pooling "combine rides" button (stretch)
- Add driver reliability score display
- **Milestone gate:** Coordinator can assign a driver, trigger fallback, and see status changes. Driver can move a ride to COMPLETED.

**Sprint 4 — August 4–6 | Polish + Demo Prep (Feature Freeze Aug 6)**
- Complete SMS reminder sequence (48hr / 24hr / 2hr)
- Build post-ride survey screen and `POST /api/survey`
- Add loading states and error banners to all API-connected forms
- Final mobile QA pass at 375px and 390px
- Run full demo flow end-to-end with seeded data
- Redeploy to Amplify
- **Milestone gate:** Full demo flow runs without errors on a mobile device. All API errors show user-facing banners.

**Flex Time — August 7–10**
- Buffer for any bugs found during demo run-throughs
- Slide deck finalization (8 slides max)
- At least one full team dry run

**Demo Week — August 11–13**
- Aug 11: All code merged, final Amplify deploy, seed demo data
- Aug 12: Full team dry run, fix any last display issues, no new features
- Aug 13: Demo Day — present to Builders+Backers and Atlas School cohort

---

## Section 6: Stakeholder Communication Plan

| Stakeholder | Information Needed | Frequency | Method | Point Person |
|---|---|---|---|---|
| Course Instructor | Progress updates, milestone completion, blockers, design document submission | Weekly | Class meeting + document submissions via course platform | Demond (Team Lead) |
| Builders+Backers (Donna Harris) | Product demo, validation evidence, investment readiness, data CarePath tracks | As requested + Demo Day (Aug 13) | Zoom meeting + live demo at Demo Day | Demond |
| Classmates / Cohort | Final product demo, what problem we solved, how we built it | End of project (Demo Day) | In-person or virtual presentation | Whole team |
| Atlas School Staff | Milestone gates, capstone deliverable submissions, team health | Weekly | Class check-ins + submitted documents | Demond |

**Clarifying requirements and getting feedback:**
- For Builders+Backers: Demond schedules check-ins as needed and brings specific questions about investor expectations. The validation workspace (`docs/validation/`) is maintained as a living evidence base to answer data questions in real time.
- For the course instructor: The team submits all deliverables on time and flags blockers at the weekly class meeting rather than waiting until the next submission.
- For classmates: The team will do at least one informal demo run with a classmate before Demo Day to get outside feedback on the flow.

---

*CarePath Design Document · Atlas School Capstone · July 2026*
