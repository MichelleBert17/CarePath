const {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, HeadingLevel, AlignmentType, WidthType, BorderStyle,
  ShadingType, convertInchesToTwip
} = require('docx');
const fs = require('fs');

const TEAL = '0d9488';
const LIGHT_TEAL = 'e6faf8';
const SLATE = '1e293b';
const LIGHT_GRAY = 'f8fafc';
const MID_GRAY = 'e2e8f0';
const WHITE = 'ffffff';

function h1(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 30, color: TEAL, font: 'Calibri' })],
    spacing: { before: 360, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: MID_GRAY } },
  });
}

function h2(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24, color: SLATE, font: 'Calibri' })],
    spacing: { before: 280, after: 120 },
  });
}

function h3(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, color: TEAL, font: 'Calibri' })],
    spacing: { before: 200, after: 80 },
  });
}

function body(text, bold = false) {
  return new Paragraph({
    children: [new TextRun({ text, size: 21, color: SLATE, bold, font: 'Calibri' })],
    spacing: { after: 100 },
  });
}

function bullet(text) {
  return new Paragraph({
    children: [new TextRun({ text: `• ${text}`, size: 21, color: SLATE, font: 'Calibri' })],
    spacing: { after: 80 },
    indent: { left: convertInchesToTwip(0.3) },
  });
}

function spacer() {
  return new Paragraph({ text: '', spacing: { after: 60 } });
}

function cell(text, isHeader = false, shade = null, width = null) {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: isHeader, size: isHeader ? 19 : 18, color: isHeader ? WHITE : SLATE, font: 'Calibri' })],
      spacing: { before: 60, after: 60 },
    })],
    shading: isHeader
      ? { type: ShadingType.SOLID, color: TEAL }
      : shade ? { type: ShadingType.SOLID, color: shade } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    ...(width ? { width: { size: width, type: WidthType.PERCENTAGE } } : {}),
  });
}

function makeTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: headers.map(h => cell(h, true)), tableHeader: true }),
      ...rows.map((row, i) =>
        new TableRow({ children: row.map(c => cell(c, false, i % 2 === 0 ? LIGHT_GRAY : WHITE)) })
      ),
    ],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: MID_GRAY },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: MID_GRAY },
      left: { style: BorderStyle.SINGLE, size: 1, color: MID_GRAY },
      right: { style: BorderStyle.SINGLE, size: 1, color: MID_GRAY },
      insideH: { style: BorderStyle.SINGLE, size: 1, color: MID_GRAY },
      insideV: { style: BorderStyle.SINGLE, size: 1, color: MID_GRAY },
    },
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Calibri', size: 21, color: SLATE } } },
  },
  sections: [{
    properties: {
      page: {
        margin: {
          top: convertInchesToTwip(1), bottom: convertInchesToTwip(1),
          left: convertInchesToTwip(1), right: convertInchesToTwip(1),
        },
      },
    },
    children: [

      // Title
      new Paragraph({
        children: [new TextRun({ text: 'CarePath', bold: true, size: 56, color: TEAL, font: 'Calibri' })],
        alignment: AlignmentType.CENTER, spacing: { after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Design Document', size: 30, color: SLATE, font: 'Calibri' })],
        alignment: AlignmentType.CENTER, spacing: { after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Demond Balentine  ·  Michelle Berthiaume  ·  Remington Neustadter', size: 21, color: '64748b', font: 'Calibri' })],
        alignment: AlignmentType.CENTER, spacing: { after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Atlas School Capstone  ·  July 2026', size: 19, color: '94a3b8', italics: true, font: 'Calibri' })],
        alignment: AlignmentType.CENTER, spacing: { after: 480 },
      }),

      // ── SECTION 1 ──────────────────────────────────────────────
      h1('Section 1: General MVP Discovery'),

      h2('What problem will your capstone solve?'),
      body('Patients in rural and low-income areas miss critical medical appointments — dialysis, oncology, cardiology, post-surgical follow-ups — not because they choose to, but because they have no reliable way to get there. Transportation failures cause no-shows. No-shows cause health deterioration, emergency hospitalizations, and preventable deaths.'),
      spacer(),
      body('The current system fails at every layer:', true),
      bullet('Medicaid transportation cancels rides at 2am with no notice'),
      bullet('Volunteer drivers have no visibility into patient needs or appointment times'),
      bullet('Coordinators manage everything manually across phone calls, texts, and paper'),
      bullet('When a ride falls through, there is no organized fallback — patients are simply left behind'),
      bullet('No one tracks whether rides actually happened or what the health outcome was'),
      spacer(),
      body('CarePath solves this by providing a transportation coordination platform that connects patients, volunteer drivers, coordinators, and institutional partners — with ride matching, fallback escalation, SMS communication, and outcome tracking — without requiring mileage as a decision factor.'),
      body('This problem is validated by 15 interviews across 5 stakeholder types, producing 13 strong signals of pain and willingness to use a solution.'),
      spacer(),

      h2('Who is your target audience?'),
      makeTable(
        ['User Group', 'Description'],
        [
          ['Patients', 'Adults with chronic or acute conditions who need rides to medical appointments and rely on Medicaid transport, volunteers, or family — all of which are unreliable'],
          ['Volunteer Drivers', 'Community members (often from churches or nonprofits) who are willing to drive patients but have no coordination tool'],
          ['Coordinators', 'Staff at clinics, nonprofits, or community organizations who currently manage ride logistics manually via phone and text'],
          ['Institutional Partners', 'Hospitals, churches, and nonprofits that want to pre-fund ride credits for patients in their community'],
          ['Caregivers / Advocates', 'Family members, CNAs, home health aides, and veteran advocates who arrange rides on behalf of patients'],
        ]
      ),
      spacer(),
      body('Primary geographic focus: rural and low-income communities in Arkansas and similar markets where public transit is limited and Medicaid transportation is unreliable.'),
      spacer(),

      h2('What features could be in this application?'),
      h3('Core Coordination'),
      bullet('Patient ride request with accessibility flags (wheelchair, oxygen, stretcher)'),
      bullet('Driver matching based on availability, county, and vehicle capability'),
      bullet('Ride status lifecycle: PENDING → MATCHED → CONFIRMED → IN_PROGRESS → COMPLETED → CANCELLED → FALLBACK_NEEDED'),
      bullet('Coordinator pooling hub — view all pending rides, match drivers, trigger fallback'),
      bullet('Fallback escalation — when a ride fails, alert the backup driver pool instantly'),
      bullet('Depot route builder — recurring community van runs (e.g. every Tuesday to dialysis)'),
      h3('Communication'),
      bullet('Automated SMS reminders at 48hr, 24hr, and 2hr before pickup'),
      bullet('Ride confirmation SMS to patient and driver'),
      bullet('SMS-only workflow for patients and drivers without smartphones'),
      bullet('Voice call fallback for patients who cannot receive SMS'),
      bullet('Communication log — every message tracked with delivery status'),
      h3('Outcomes & Data'),
      bullet('Post-ride NPS survey (0–10 score + comments)'),
      bullet('Driver reliability score (calculated from completed rides and ratings)'),
      bullet('Ride cost log with funding source (grant, Medicaid, private, family)'),
      bullet('Estimated savings per ride (avoided ER visit cost)'),
      bullet('Community impact dashboard — total rides, appointments kept, estimated savings'),
      h3('Partner & Admin'),
      bullet('Ride credit system — partners pre-purchase credits, credits consumed per ride'),
      bullet('Coordinator dashboard with live stat cards (pending, matched, fallback counts)'),
      bullet('Institutional partner portal — credit balance, usage history, ROI reporting'),
      h3('Future / Post-Demo'),
      bullet('QR code clinic check-in'),
      bullet('EHR webhook integration'),
      bullet('Medicaid reimbursement documentation export'),
      bullet('Offline-first patient intake'),
      bullet('AI-assisted ride matching'),
      spacer(),

      h2('What technology stack would your team like to use?'),
      makeTable(
        ['Layer', 'Technology', 'Why'],
        [
          ['Backend API', 'Node.js + TypeScript + Express', 'Team has existing experience; TypeScript catches errors early; Express is lightweight and well-documented'],
          ['Database', 'PostgreSQL + Prisma ORM', 'Relational data fits the ride/patient/driver model; Prisma provides type-safe queries and migration management'],
          ['Frontend', 'Next.js 16 (App Router) + TypeScript', 'React-based, supports static export for Amplify deployment, strong ecosystem'],
          ['Styling', 'Tailwind CSS', 'Utility-first, fast to build responsive layouts, no context switching between CSS files'],
          ['Authentication', 'JWT (JSON Web Tokens)', 'Stateless, works well with role-based access control across 4 user types'],
          ['SMS / Voice', 'Twilio', 'Industry standard for programmable SMS; already configured in the existing codebase'],
          ['Hosting (UI)', 'AWS Amplify', 'Already deployed and live; free tier covers demo day needs'],
          ['Hosting (API)', 'Local / Railway (demo)', 'Railway provides free-tier Node.js hosting for demo purposes'],
          ['Icons', 'Lucide React', 'Consistent, lightweight icon set that pairs well with Tailwind'],
          ['Version Control', 'GitHub', 'Already in use; team uses GitHub Projects for task tracking'],
        ]
      ),
      spacer(),
      body('Team experience:', true),
      bullet('Demond: Strong in backend architecture, Prisma, Express, PostgreSQL'),
      bullet('Remington: Strong in TypeScript, API development, troubleshooting'),
      bullet('Michelle: Strong in Next.js, Tailwind, component design, Amplify deployment'),
      spacer(),
      body('Tradeoffs and limitations:', true),
      bullet('JWT without refresh tokens means sessions expire — acceptable for demo, needs improvement for production'),
      bullet('Static export on Amplify limits server-side rendering — API calls happen client-side'),
      bullet('Twilio has per-message costs — kept minimal during development using test credentials'),
      bullet('No real-time WebSocket layer — ride status updates use polling (every 30 seconds) rather than push'),
      spacer(),

      h2('What costs could be incurred?'),
      makeTable(
        ['Item', 'Estimated Cost', 'Notes'],
        [
          ['AWS Amplify hosting', 'Free tier', 'Covers demo day traffic easily'],
          ['PostgreSQL (local)', '$0', 'Each developer runs locally; no cloud DB needed for demo'],
          ['Twilio SMS', '~$0.0079/message', 'Minimal during development; test mode used where possible'],
          ['Railway API hosting', 'Free tier', '500 hours/month free — sufficient for demo'],
          ['GitHub', 'Free', 'Public repo on free plan'],
          ['Domain name', '$0', 'Using Amplify-provided subdomain for demo'],
        ]
      ),
      spacer(),
      body('Total anticipated cost: Near $0 for demo day. No team member is expected to incur costs.'),
      spacer(),

      h2('What are you hoping to learn by the end of this project?'),
      body('Technical skills:', true),
      bullet('Demond: How to architect a multi-role API with clean separation of concerns; how to write seed scripts that support realistic demo scenarios'),
      bullet('Remington: How to build and test a full REST API from schema to controller to route; how to integrate Twilio SMS into a real workflow'),
      bullet('Michelle: How to wire a Next.js frontend to a live API with JWT auth; how to build mobile-first responsive dashboards that work on real devices'),
      spacer(),
      body('Soft skills (all team members):', true),
      bullet('How to divide technical work across a team without creating merge conflicts or blockers'),
      bullet('How to communicate progress and blockers clearly on a weekly cadence'),
      bullet('How to scope a project realistically and make hard decisions about what to cut'),
      bullet('How to present a technical product to a non-technical audience (Builders+Backers, Demo Day)'),
      bullet('How to use validation evidence to justify product decisions'),
      spacer(),

      // ── SECTION 2 ──────────────────────────────────────────────
      h1('Section 2: Features Table'),
      makeTable(
        ['Feature Name', 'Critical for Audience?', 'Manageable in Timeline?', 'Status', 'Success Metric'],
        [
          ['User Authentication (Register / Login)', 'Yes', 'Yes', 'In Scope', 'Users can register, log in, and reach their role dashboard within 3 steps. JWT stored and used for all protected routes.'],
          ['Patient Ride Request Form', 'Yes', 'Yes', 'In Scope', 'Patient submits a ride request with appointment type, pickup address, time, and accessibility needs. Request appears in coordinator queue within 5 seconds.'],
          ['Coordinator Pooling Hub', 'Yes', 'Yes', 'In Scope', 'Coordinator can view all pending rides, see matched driver candidates, assign a driver, and trigger fallback — all from one screen.'],
          ['Driver Dashboard + Availability Toggle', 'Yes', 'Yes', 'In Scope', 'Driver can view assigned rides, toggle availability, and update ride status (CONFIRMED → IN_PROGRESS → COMPLETED) from their dashboard.'],
          ['Ride Status Lifecycle Tracking', 'Yes', 'Yes', 'In Scope', 'Ride moves through all 7 statuses. Each change is logged as a RideEvent with actor, timestamp, and reason.'],
          ['Fallback Escalation', 'Yes', 'Yes', 'In Scope', 'When triggered, ride status changes to FALLBACK_NEEDED, a RideEvent is logged, and an SMS alert is sent to the fallback driver pool.'],
          ['SMS Ride Reminders (48hr / 24hr / 2hr)', 'Yes', 'Yes', 'In Scope', 'Patient and driver each receive 3 automated SMS reminders before pickup. Delivery status logged in CommunicationLog.'],
          ['Accessibility Flag Matching', 'Yes', 'Yes', 'In Scope', 'Wheelchair flag on ride request filters driver pool to wheelchair-capable vehicles only. Non-accessible drivers do not appear as candidates.'],
          ['Post-Ride NPS Survey', 'Yes', 'Yes', 'In Scope', 'After ride is COMPLETED, patient receives SMS with survey link. Survey captures NPS score (0–10) and optional comment. Score visible on coordinator dashboard.'],
          ['Coordinator Dashboard Stat Cards', 'Yes', 'Yes', 'In Scope', 'Dashboard shows live counts: pending rides, matched rides, fallback events, rides completed today. Data pulls from live API.'],
          ['Driver Reliability Score Display', 'Yes', 'Yes', 'In Scope', 'Driver profile shows reliability score (0–5.0) calculated from completed rides and ratings. Score visible to coordinators when matching.'],
          ['Ride Pooling (Combine Rides)', 'Yes', 'No', 'Stretch', 'Coordinator can view multiple patients going to the same clinic on the same day and combine them into one ride with one driver.'],
          ['Community Impact Dashboard', 'No', 'No', 'Stretch', 'Public-facing page shows total rides completed, appointments kept, and estimated ER visits avoided. Updates in real time from ride data.'],
          ['Ride Credit System (Partner Portal)', 'No', 'Yes', 'Stretch', 'Institutional partner can view credit balance, see which rides consumed credits, and track remaining credits.'],
          ['Caregiver / Advocate Ride Tracking', 'No', 'No', 'Set Aside', 'Family member or advocate can view a patient\'s ride status via a shareable link without logging in.'],
          ['SMS-Only Driver Workflow', 'Yes', 'No', 'Set Aside', 'Driver receives and responds to ride assignments entirely via SMS — no app required.'],
          ['QR Code Clinic Check-In', 'No', 'No', 'Set Aside', 'Patient scans a QR code at the clinic on arrival, automatically marking the ride as COMPLETED.'],
          ['EHR Webhook Integration', 'No', 'No', 'Set Aside', 'When a ride is completed, a webhook notifies the clinic\'s EHR system to confirm the patient arrived.'],
        ]
      ),
      spacer(),

      // ── SECTION 3 ──────────────────────────────────────────────
      h1('Section 3: Designs'),
      body('Wireframes and screen designs are maintained in the live Amplify deployment and the carepath-ui source directory.'),
      spacer(),
      body('Live UI: https://main.d352gym2v1cw7h.amplifyapp.com', true),
      spacer(),
      makeTable(
        ['Screen', 'Feature', 'Location in Codebase'],
        [
          ['Login / Register', 'User Authentication', 'carepath-ui/src/app/(auth)/'],
          ['Patient Dashboard', 'Ride Status Tracking, Ride Request', 'carepath-ui/src/app/(dashboard)/patient/'],
          ['Patient Intake Form', 'Patient Ride Request Form, Accessibility Flags', 'carepath-ui/src/app/(dashboard)/patient/'],
          ['Coordinator Pooling Hub', 'Coordinator Pooling Hub, Fallback Escalation, Ride Pooling', 'carepath-ui/src/app/(dashboard)/coordinator/'],
          ['Coordinator Dashboard', 'Coordinator Stat Cards, Driver Reliability Score', 'carepath-ui/src/app/(dashboard)/coordinator/'],
          ['Driver Dashboard', 'Driver Dashboard, Availability Toggle, Ride Status Lifecycle', 'carepath-ui/src/app/(dashboard)/driver/'],
          ['Post-Ride Survey', 'Post-Ride NPS Survey', 'carepath-ui/src/app/(dashboard)/patient/survey/'],
          ['Partner Portal', 'Ride Credit System', 'carepath-ui/src/app/(dashboard)/admin/'],
        ]
      ),
      spacer(),
      body('Design system:', true),
      bullet('Brand colors: Teal (#0d9488), Navy (#052b56), Purple (#5540a1)'),
      bullet('Typography: Inter (Google Fonts)'),
      bullet('Component library: Button, Card, Badge, StatCard, Sidebar, Topbar'),
      bullet('Mobile-first: 44px touch targets, bottom tab nav on mobile, sidebar on desktop'),
      bullet('Responsive breakpoints: 375px (iPhone SE), 390px (iPhone 14), 768px (tablet), 1024px (desktop)'),
      spacer(),

      // ── SECTION 4 ──────────────────────────────────────────────
      h1('Section 4: Risks & Mitigation Strategies'),
      makeTable(
        ['Risk', 'Impact', 'Mitigation Strategy'],
        [
          ['Twilio SMS integration fails or costs exceed free tier', 'Fallback escalation and ride reminders cannot be tested end-to-end; major demo feature blocked', 'Configure Twilio test credentials in Week 1. Use test phone numbers during development. Only switch to live credentials for final demo run. Cap usage to demo scenarios only.'],
          ['Database migration conflicts between team members', 'Schema gets out of sync; API breaks for one or more teammates; blocked development', 'All schema changes go through a PR before merging. Run prisma migrate dev after every pull. Remington owns migration files — no one else edits schema without coordinating first.'],
          ['AWS Amplify static export breaks after a Next.js update', 'Live demo URL goes down on demo day', 'Lock Next.js version in package.json. Test Amplify build locally with next build before every push to main. Keep the last known-good build artifact.'],
          ['API and UI fall out of sync (endpoint changes break the frontend)', 'UI shows errors or blank data during demo', 'Remington documents every new or changed endpoint in api-test/carepath.http. Michelle tests against that file before wiring any new UI screen.'],
          ['Team member unavailable during final week (illness, emergency)', 'Critical features unfinished; demo flow incomplete', 'Feature freeze is Aug 6 — one week before demo day. All critical features must be merged by then. Each team member documents their work so others can pick it up if needed.'],
        ]
      ),
      spacer(),

      // ── SECTION 5 ──────────────────────────────────────────────
      h1('Section 5: Development Sprints'),

      h2('Part A: Project Management Tool'),
      body('Tool: GitHub Projects (linked to the CarePath repository)', true),
      body('URL: https://github.com/Debalent/CarePath'),
      spacer(),
      body('The team uses GitHub Projects with a Kanban board organized into four columns: Backlog, In Progress, In Review, and Done. Each task is a GitHub Issue assigned to a team member with a milestone label (Week 1, Week 2, Week 3, Week 4, Demo). The PM (Demond) creates issues at the start of each sprint. Remington and Michelle self-assign from the backlog and move cards as work progresses. The team reviews the board at every Friday check-in.'),
      spacer(),

      h2('Part B: Sprint Overview'),
      body('Sprint duration: 1 week  |  Check-in cadence: Every Friday'),
      body('Gate rule: No new sprint work begins until the previous sprint\'s gate criteria are met.'),
      spacer(),
      makeTable(
        ['Sprint', 'Dates', 'Key Goals', 'Milestone Gate'],
        [
          ['Sprint 1 — Foundation + Auth', 'July 14–18', 'Local dev setup for all teammates, prisma migrate dev, patient/driver profile controllers, Login + Register UI, JWT auth end-to-end', 'Both teammates have the app running locally. Login and register work via Postman and the UI.'],
          ['Sprint 2 — Core Ride Flow', 'July 21–25', 'Coordinator controller, GET /api/rides/my, GET /api/drivers/available, Patient Dashboard, Driver Dashboard, Patient Intake wired to API', 'A patient can submit a ride request via the UI and a coordinator can see it in the pooling hub.'],
          ['Sprint 3 — Coordinator Loop + Fallback', 'July 28 – Aug 1', 'Fallback controller + SMS blast, PATCH /api/rides/:id/status, GET /api/coordinator/stats, Coordinator Dashboard live, Pooling Hub wired, Driver reliability score', 'Coordinator can assign a driver, trigger fallback, and see status changes. Driver can move a ride to COMPLETED.'],
          ['Sprint 4 — Polish + Demo Prep', 'Aug 4–6', 'SMS reminder sequence, post-ride survey screen + API, loading states + error banners, mobile QA at 375px/390px, full demo run, Amplify redeploy', 'Full demo flow runs without errors on a mobile device. Feature freeze Aug 6.'],
          ['Flex Time', 'Aug 7–10', 'Bug fixes from demo run-throughs, slide deck finalization (8 slides max), at least one full team dry run', 'Slide deck final. No new features.'],
          ['Demo Week', 'Aug 11–13', 'Aug 11: Final deploy + seed data. Aug 12: Full team dry run. Aug 13: Demo Day presentation to Builders+Backers and Atlas School cohort', 'Full demo flow runs without errors on a mobile device. Team has completed at least one dry run together.'],
        ]
      ),
      spacer(),

      // ── SECTION 6 ──────────────────────────────────────────────
      h1('Section 6: Stakeholder Communication Plan'),
      makeTable(
        ['Stakeholder', 'Information Needed', 'Frequency', 'Method', 'Point Person'],
        [
          ['Course Instructor', 'Progress updates, milestone completion, blockers, document submissions', 'Weekly', 'Class meeting + course platform submissions', 'Demond (Team Lead)'],
          ['Builders+Backers (Donna Harris)', 'Product demo, validation evidence, investment readiness, data CarePath tracks', 'As requested + Demo Day (Aug 13)', 'Zoom meeting + live demo at Demo Day', 'Demond'],
          ['Classmates / Cohort', 'Final product demo, problem solved, how it was built', 'End of project (Demo Day)', 'In-person or virtual presentation', 'Whole team'],
          ['Atlas School Staff', 'Milestone gates, capstone deliverable submissions, team health', 'Weekly', 'Class check-ins + submitted documents', 'Demond'],
        ]
      ),
      spacer(),
      body('Clarifying requirements and getting feedback:', true),
      bullet('For Builders+Backers: Demond schedules check-ins as needed and brings specific questions about investor expectations. The validation workspace (docs/validation/) is maintained as a living evidence base to answer data questions in real time.'),
      bullet('For the course instructor: The team submits all deliverables on time and flags blockers at the weekly class meeting rather than waiting until the next submission.'),
      bullet('For classmates: The team will do at least one informal demo run with a classmate before Demo Day to get outside feedback on the flow.'),
      spacer(),

      new Paragraph({
        children: [new TextRun({ text: 'CarePath Design Document  ·  Atlas School Capstone  ·  July 2026', size: 18, color: '94a3b8', italics: true, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
      }),
    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('docs/design-document.docx', buffer);
  console.log('design-document.docx created successfully');
});
