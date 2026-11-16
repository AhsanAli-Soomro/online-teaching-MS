# TutorConnect — Online Tutoring Marketplace

TutorConnect is a full-stack, production-ready MVP of an online tutoring marketplace tailored for the Pakistani educational ecosystem. It connects certified educators with students and parents across Matric, FSc, O/A Levels, and University curricula, featuring interactive 1-on-1 Jitsi Meet video classrooms, verified tutor profiles, tuition request boards, and manual payment verification (JazzCash, Easypaisa, Bank Transfer) with configurable platform commissions.

---

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, JavaScript only — no TypeScript)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/) with PostCSS & Lucide Icons
- **Database**: [Neon](https://neon.tech/) Serverless PostgreSQL
- **ORM**: [Prisma ORM](https://www.prisma.io/) (pooled connection for queries + direct connection for migrations)
- **Authentication**: [Auth.js / NextAuth](https://next-auth.js.org/) with Credentials provider & `bcryptjs` password hashing
- **Validation**: [Zod](https://zod.dev/) for strict server-side validation
- **Video Classrooms**: Integrated [Jitsi Meet](https://meet.jit.si/) links generated per booking
- **Payments**: Manual payment proof verification (JazzCash, Easypaisa, Bank Transfer) structured for future automated gateway integration

---

## 👥 User Roles & Features

### 1. 🎓 Teacher (Educator)
- **Authentication**: Sign up and log in as `TEACHER`.
- **Profile Management** (`/teacher/profile`):
  - Personal details: Full name, photo URL, highest qualification, experience (years), city.
  - Hourly rate in PKR and languages (English, Urdu, regional languages).
  - Video introduction link (YouTube/Vimeo embed preview).
  - Multi-subject pairings across 7 levels (*Primary, Middle, Matric, O-Level, A-Level, Intermediate, University*).
  - Weekly availability schedule (days of week and 24-hour time slots).
  - Verification badge and status explanation (`PENDING`, `VERIFIED`, `REJECTED`).
- **Tuition Marketplace** (`/teacher/requirements`):
  - Browse open student tuition postings with subject and class level filters.
  - Submit customized proposals with proposed fee (PKR) and teaching pitch.
- **Direct Hire Requests** (`/teacher/requests`):
  - Receive direct tuition requests from students with preferred timings and class frequency.
  - Accept or decline requests with automatic booking creation.
- **Virtual Classrooms** (`/teacher/classes`):
  - 1-click **Start Live Class** button opening the dedicated Jitsi Meet room.
  - Mark completed sessions and schedule additional classes in the booking package.
- **Earnings Summary** (`/teacher/dashboard`):
  - Net earnings computed automatically after platform commission deduction.

### 2. 📚 Student & Parent
- **Authentication**: Sign up and log in as `STUDENT`.
- **Search & Discovery** (`/teachers`):
  - Search by teacher name, subject, or keywords.
  - Multi-attribute filters: Subject, academic level, city, fee range (PKR), minimum star rating, language.
  - Sorting: Highest Rated, Fee (Low &rarr; High, High &rarr; Low), Experience.
  - Pagination controls.
- **Public Teacher Profile** (`/teachers/[id]`):
  - Bio, qualification, experience, city, languages, intro video.
  - Structured subjects taught, weekly schedule, and verified reviews.
  - Direct **Hire This Tutor** modal.
- **Post Tuition Requirements** (`/student/requirements/new`):
  - Specify subject, class level, PKR budget, preferred days/hours, and learning goals.
- **Proposals Management** (`/student/requirements`):
  - Inspect proposals received from teachers.
  - 1-click **Accept** (creates booking, Jitsi room ID, and schedules first session) or **Decline**.
- **Bookings & Classes** (`/student/bookings`):
  - Join live Jitsi classes directly from the dashboard.
  - Submit manual payment proof (JazzCash, Easypaisa, Bank Transfer) with Transaction ID and receipt URL.
  - Submit 1 to 5 star ratings and written reviews after completed classes.

### 3. 🛡 Platform Admin
- **Admin Dashboard** (`/admin/dashboard`):
  - Real-time statistics: Total teachers, students, active bookings, processed revenue, and platform commission.
- **Teacher Verification** (`/admin/teachers`):
  - Review educator credentials and approve (`VERIFIED`) or decline (`REJECTED`).
- **Payment Approvals** (`/admin/payments`):
  - Inspect submitted JazzCash, Easypaisa, and bank transfer receipts.
  - **Approve Payment**: Automatically deducts the configurable platform commission (default 15%), marks payment approved, confirms the booking, and notifies both parties.
  - **Reject Payment**: Declines receipt with customizable rejection notes.
  - **Configurable Commission**: Live-update platform commission percentage (0–50%).
- **Bookings Oversight** (`/admin/bookings`):
  - Platform-wide view of all student-teacher bookings, classroom links, and session counts.

---

## 🗄 Database Schema (Prisma)

The Prisma schema is synced with Neon PostgreSQL and includes indexes, cascade deletions, and enums:

| Model | Purpose | Key Relations |
| :--- | :--- | :--- |
| `User` | Accounts and credentials | Links to `TeacherProfile`, Bookings, Requirements, Notifications |
| `TeacherProfile` | Educator details, rates, bio | `User`, `TeacherSubject`, `Availability`, `Proposal`, `Review` |
| `Subject` | Academic disciplines | Linked to teachers, requirements, hire requests, bookings |
| `TeacherSubject` | Many-to-many teacher & subject | Pairs teacher with academic class levels |
| `Availability` | Tutor weekly schedule slots | Day of week (`MONDAY`..`SUNDAY`) + start/end time |
| `Requirement` | Student tuition requests | `User` (student), `Subject`, `Proposal[]` |
| `Proposal` | Tutor bids on requirements | `Requirement`, `TeacherProfile` |
| `HireRequest` | Direct hiring requests | Student `User`, `TeacherProfile`, `Subject` |
| `Booking` | Active tutoring agreement | Student `User`, `TeacherProfile`, `ClassSession[]`, `Payment[]` |
| `ClassSession` | Individual lesson schedule | `Booking`, status (`SCHEDULED`, `COMPLETED`, `CANCELLED`) |
| `Payment` | Manual payment proofs | `Booking`, method, transaction ID, proof URL, commission |
| `Review` | Ratings & student testimonials | `Booking`, `TeacherProfile`, rating (1–5 stars) |
| `Notification` | In-app user notifications | Target `User`, message, read status |
| `PlatformSetting` | Dynamic configuration | Platform commission percentage |

---

## 🚀 Setup & Installation Instructions

### 1. Prerequisites
- Node.js `v18+` (or `v20+`)
- npm `v9+`
- Neon Serverless PostgreSQL database (or compatible PostgreSQL instance)

### 2. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd "School MS"

# Install project dependencies
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root (a template is available in `.env.example`):

```env
# Neon PostgreSQL Connection Strings
DATABASE_URL="postgresql://neondb_owner:npg_Yhiwax30eEfk@ep-mute-lake-bd2zubv6-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:npg_Yhiwax30eEfk@ep-mute-lake-bd2zubv6.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tutorconnect_super_secret_jwt_and_session_signing_key_9876543210"

# Application Settings
NEXT_PUBLIC_APP_NAME="TutorConnect"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Push Schema & Seed Database

```bash
# Push Prisma schema to Neon PostgreSQL
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Populate database with curriculum subjects, platform settings, and demo accounts
node prisma/seed.js
```

### 5. Run the Application

```bash
# Start development server
npm run dev

# Or build and run for production
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Pre-Seeded Testing Accounts

The database comes pre-seeded with accounts for all roles. You can sign in using the **1-Click Demo Accounts** on the `/login` page:

| Role | Email | Password | Profile Highlights |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@tutorconnect.pk` | `AdminPassword123!` | System administrator with full access to verifications, payments, and settings |
| **TEACHER** | `ayesha.khan@example.com` | `Password123!` | Dr. Ayesha Khan (LUMS PhD, Math & Physics, Verified, 4.9★, Lahore) |
| **TEACHER** | `bilal.cs@example.com` | `Password123!` | Muhammad Bilal (FAST MS CS, Computer Science, Verified, 4.8★, Karachi) |
| **TEACHER** | `fatima.biology@example.com` | `Password123!` | Fatima Zahra (QAU M.Phil, Biology & Chem, Verified, 5.0★, Islamabad) |
| **TEACHER** | `usman.physics@example.com` | `Password123!` | Usman Tariq (Physics educator, Pending admin verification) |
| **STUDENT** | `zainab.student@example.com` | `Password123!` | Zainab Ali (Has completed booking with Dr. Ayesha Khan & review) |
| **STUDENT** | `hamza.student@example.com` | `Password123!` | Hamza Ahmed (Has open ICS requirement with proposal from Muhammad Bilal) |

---

## 📁 Project Structure

```
├── actions/                         # Server actions
├── app/
│   ├── (auth)/
│   │   ├── login/page.js            # Login page with 1-click demo accounts
│   │   └── register/page.js         # Registration with role toggle (Student / Teacher)
│   ├── admin/
│   │   ├── bookings/page.js         # Bookings oversight
│   │   ├── dashboard/page.js        # Admin metrics & revenue
│   │   ├── payments/page.js         # Manual payment verification & commission setting
│   │   └── teachers/page.js         # Teacher verification & review
│   ├── api/
│   │   ├── admin/
│   │   │   ├── payments/[id]/route.js
│   │   │   ├── settings/route.js
│   │   │   └── teachers/[id]/route.js
│   │   ├── auth/[...nextauth]/route.js
│   │   ├── bookings/route.js
│   │   ├── bookings/[id]/sessions/route.js
│   │   ├── hire-requests/route.js
│   │   ├── hire-requests/[id]/route.js
│   │   ├── notifications/route.js
│   │   ├── notifications/[id]/route.js
│   │   ├── payments/route.js
│   │   ├── proposals/route.js
│   │   ├── proposals/[id]/route.js
│   │   ├── register/route.js
│   │   ├── requirements/route.js
│   │   ├── reviews/route.js
│   │   ├── sessions/[id]/route.js
│   │   └── teacher/profile/route.js
│   ├── student/
│   │   ├── bookings/page.js         # Student bookings & live classroom links
│   │   ├── dashboard/page.js        # Student portal dashboard
│   │   ├── requirements/page.js     # My requirements & teacher proposals
│   │   └── requirements/new/page.js # Post tuition requirement
│   ├── teacher/
│   │   ├── classes/page.js          # Teacher classroom & sessions schedule
│   │   ├── dashboard/page.js        # Teacher dashboard & earnings
│   │   ├── profile/page.js          # Profile, subjects, and availability editor
│   │   ├── requests/page.js         # Incoming direct hire requests
│   │   └── requirements/page.js     # Browse open student tuition postings
│   ├── teachers/
│   │   ├── page.js                  # Public tutor search with multi-filters
│   │   └── [id]/page.js             # Public teacher profile with video & reviews
│   ├── error.js                     # Global error boundary
│   ├── globals.css                  # Tailwind styles
│   ├── layout.js                    # Root layout with AuthProvider, Navbar, Footer
│   ├── loading.js                   # Global loading state
│   ├── not-found.js                 # 404 handler
│   └── page.js                      # Landing page with hero, subjects, featured tutors
├── components/
│   ├── admin/                       # Admin client components
│   ├── layout/                      # Navbar, Footer, NotificationBell
│   ├── providers/                   # AuthProvider
│   ├── student/                     # Student client components & modals
│   ├── teacher/                     # Teacher client components & modals
│   ├── teachers/                    # Public search and profile components
│   └── ui/                          # Button, Input, Card, Modal, Badge
├── lib/
│   ├── auth.js                      # NextAuth configuration
│   ├── prisma.js                    # Prisma client singleton
│   ├── session.js                   # Session & role guard helpers
│   └── validations/                 # Zod validation schemas
├── prisma/
│   ├── schema.prisma                # Database schema
│   └── seed.js                      # Database seeder
├── middleware.js                    # Role-based route protection
├── next.config.mjs                  # Next.js configuration
├── postcss.config.mjs               # PostCSS configuration
└── package.json
```

---

## 💳 Payment Gateway Extensibility

In this MVP, payments are conducted manually via JazzCash, Easypaisa, or direct bank transfer:
1. Student transfers funds to platform accounts and submits the Transaction ID + receipt image.
2. Admin reviews the receipt in `/admin/payments`, verifies the transaction ID in the banking portal, and clicks **Approve**.
3. The platform auto-deducts the configured commission percentage and credits the booking.

### Extending to Automated Gateways (e.g. Stripe, JazzCash Merchant API)
The codebase is structured to make gateway replacement trivial:
- `app/api/payments/route.js`: Can be modified or replaced with an endpoint creating a Checkout Session or intent (`/api/checkout`).
- A webhook handler (`app/api/webhooks/payment/route.js`) can listen for `payment.succeeded` events and execute the exact same Prisma transaction currently found in `app/api/admin/payments/[id]/route.js`:
  ```javascript
  await prisma.$transaction([
    prisma.payment.create({ data: { status: 'APPROVED', amount, commissionAmount, ... } }),
    prisma.booking.update({ where: { id: bookingId }, data: { status: 'CONFIRMED' } })
  ]);
  ```

---

## 🌐 Localization & Urdu / RTL Readiness

- All interface typography uses standard system font stacks that cleanly render Nastaliq/Urdu Unicode fonts.
- Component layouts utilize modern flexbox and CSS grid alignments without hardcoded directional assumptions, enabling simple addition of `dir="rtl"` in `app/layout.js` when Arabic/Urdu translations are introduced.
- Currency formatting displays amounts in Pakistani Rupees (`PKR` / `Rs`), and dates format to the Pakistan Standard Time (`Asia/Karachi`) standard.

---

## 📄 License

This project is licensed under the MIT License.
