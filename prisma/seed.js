const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // 1. Platform Settings
  await prisma.platformSetting.upsert({
    where: { key: "COMMISSION_PERCENTAGE" },
    update: {},
    create: {
      key: "COMMISSION_PERCENTAGE",
      value: "15",
      description: "Platform commission percentage charged on completed bookings",
    },
  });

  // 2. Subjects
  const subjectsData = [
    { name: "Mathematics", slug: "mathematics", category: "STEM", description: "Algebra, Calculus, Trigonometry, Geometry, and General Math" },
    { name: "Physics", slug: "physics", category: "STEM", description: "Classical Mechanics, Electromagnetism, Modern Physics, and Lab concepts" },
    { name: "Chemistry", slug: "chemistry", category: "STEM", description: "Organic, Inorganic, Physical Chemistry, and Stoichiometry" },
    { name: "Biology", slug: "biology", category: "STEM", description: "Zoology, Botany, Genetics, Biochemistry, and MDCAT prep" },
    { name: "Computer Science", slug: "computer-science", category: "Technology", description: "Programming, Web Development, Data Structures, and Database design" },
    { name: "English", slug: "english", category: "Languages", description: "Grammar, Literature, Essay writing, IELTS, and TOEFL preparation" },
    { name: "Urdu", slug: "urdu", category: "Languages", description: "Adab, Insha-pardazi, Grammar, and Board exam preparation" },
    { name: "Economics", slug: "economics", category: "Commerce", description: "Microeconomics, Macroeconomics, Market structures, and Econometrics" },
    { name: "Accounting", slug: "accounting", category: "Commerce", description: "Financial accounting, Cost accounting, and Principles of Commerce" },
    { name: "Pakistan Studies", slug: "pakistan-studies", category: "Humanities", description: "History, Geography, Environment, and Constitutional development" },
    { name: "Islamiat", slug: "islamiat", category: "Humanities", description: "Quranic teachings, Hadith, Seerah, and Islamic history" },
  ];

  const subjects = {};
  for (const s of subjectsData) {
    const record = await prisma.subject.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
    subjects[s.slug] = record;
  }
  console.log(`Seeded ${Object.keys(subjects).length} subjects.`);

  // Password hash for all sample users
  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);
  const adminPasswordHash = await bcrypt.hash("AdminPassword123!", 10);

  // 3. Admin User
  await prisma.user.upsert({
    where: { email: "admin@tutorconnect.pk" },
    update: {},
    create: {
      name: "TutorConnect Admin",
      email: "admin@tutorconnect.pk",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log("Seeded Admin user (admin@tutorconnect.pk).");

  // 4. Sample Students
  const student1 = await prisma.user.upsert({
    where: { email: "zainab.student@example.com" },
    update: {},
    create: {
      name: "Zainab Ali",
      email: "zainab.student@example.com",
      passwordHash: defaultPasswordHash,
      role: "STUDENT",
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "hamza.student@example.com" },
    update: {},
    create: {
      name: "Hamza Ahmed",
      email: "hamza.student@example.com",
      passwordHash: defaultPasswordHash,
      role: "STUDENT",
    },
  });
  console.log("Seeded sample students.");

  // 5. Sample Teachers
  // Teacher 1: Dr. Ayesha Khan (Verified, Math & Physics)
  const teacherUser1 = await prisma.user.upsert({
    where: { email: "ayesha.khan@example.com" },
    update: {},
    create: {
      name: "Dr. Ayesha Khan",
      email: "ayesha.khan@example.com",
      passwordHash: defaultPasswordHash,
      role: "TEACHER",
      teacherProfile: {
        create: {
          bio: "PhD in Applied Mathematics with over 8 years of teaching experience. I specialize in making complex calculus and algebraic concepts intuitive for O/A-Level and University students.",
          qualification: "PhD in Mathematics, LUMS",
          experienceYears: 8,
          hourlyFee: 2500,
          city: "Lahore",
          languages: ["English", "Urdu"],
          photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
          introVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          verificationStatus: "VERIFIED",
          ratingAvg: 4.9,
          ratingCount: 15,
          subjects: {
            create: [
              { subjectId: subjects["mathematics"].id, classLevel: "O-Level" },
              { subjectId: subjects["mathematics"].id, classLevel: "A-Level" },
              { subjectId: subjects["mathematics"].id, classLevel: "University" },
              { subjectId: subjects["physics"].id, classLevel: "O-Level" },
            ],
          },
          availability: {
            create: [
              { dayOfWeek: "MONDAY", startTime: "16:00", endTime: "19:00" },
              { dayOfWeek: "WEDNESDAY", startTime: "16:00", endTime: "19:00" },
              { dayOfWeek: "FRIDAY", startTime: "16:00", endTime: "19:00" },
              { dayOfWeek: "SATURDAY", startTime: "11:00", endTime: "15:00" },
            ],
          },
        },
      },
    },
    include: { teacherProfile: true },
  });

  // Teacher 2: Muhammad Bilal (Verified, CS & Math)
  const teacherUser2 = await prisma.user.upsert({
    where: { email: "bilal.cs@example.com" },
    update: {},
    create: {
      name: "Muhammad Bilal",
      email: "bilal.cs@example.com",
      passwordHash: defaultPasswordHash,
      role: "TEACHER",
      teacherProfile: {
        create: {
          bio: "Senior Software Engineer and passionate educator. I help students master Python, web development, algorithms, and board-level computer science with hands-on practice.",
          qualification: "MS Computer Science, FAST-NUCES",
          experienceYears: 6,
          hourlyFee: 2000,
          city: "Karachi",
          languages: ["English", "Urdu"],
          photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
          verificationStatus: "VERIFIED",
          ratingAvg: 4.8,
          ratingCount: 12,
          subjects: {
            create: [
              { subjectId: subjects["computer-science"].id, classLevel: "Matric" },
              { subjectId: subjects["computer-science"].id, classLevel: "Intermediate" },
              { subjectId: subjects["computer-science"].id, classLevel: "University" },
              { subjectId: subjects["mathematics"].id, classLevel: "Intermediate" },
            ],
          },
          availability: {
            create: [
              { dayOfWeek: "TUESDAY", startTime: "17:00", endTime: "20:00" },
              { dayOfWeek: "THURSDAY", startTime: "17:00", endTime: "20:00" },
              { dayOfWeek: "SUNDAY", startTime: "10:00", endTime: "14:00" },
            ],
          },
        },
      },
    },
    include: { teacherProfile: true },
  });

  // Teacher 3: Fatima Zahra (Verified, Biology & Chemistry)
  const teacherUser3 = await prisma.user.upsert({
    where: { email: "fatima.biology@example.com" },
    update: {},
    create: {
      name: "Fatima Zahra",
      email: "fatima.biology@example.com",
      passwordHash: defaultPasswordHash,
      role: "TEACHER",
      teacherProfile: {
        create: {
          bio: "M.Phil in Biochemistry with university distinction. Experienced in preparing pre-medical students for MDCAT, FSc, and A-Level Biology exams through conceptual teaching.",
          qualification: "M.Phil Biochemistry, Quaid-i-Azam University",
          experienceYears: 5,
          hourlyFee: 1800,
          city: "Islamabad",
          languages: ["English", "Urdu"],
          photoUrl: "https://images.unsplash.com/photo-1580894732488-8fe9d9c9e831?w=400&auto=format&fit=crop&q=80",
          verificationStatus: "VERIFIED",
          ratingAvg: 5.0,
          ratingCount: 8,
          subjects: {
            create: [
              { subjectId: subjects["biology"].id, classLevel: "O-Level" },
              { subjectId: subjects["biology"].id, classLevel: "A-Level" },
              { subjectId: subjects["biology"].id, classLevel: "Intermediate" },
              { subjectId: subjects["chemistry"].id, classLevel: "Intermediate" },
            ],
          },
          availability: {
            create: [
              { dayOfWeek: "MONDAY", startTime: "15:00", endTime: "18:00" },
              { dayOfWeek: "TUESDAY", startTime: "15:00", endTime: "18:00" },
              { dayOfWeek: "THURSDAY", startTime: "15:00", endTime: "18:00" },
            ],
          },
        },
      },
    },
    include: { teacherProfile: true },
  });

  // Teacher 4: Usman Tariq (Pending verification)
  await prisma.user.upsert({
    where: { email: "usman.physics@example.com" },
    update: {},
    create: {
      name: "Usman Tariq",
      email: "usman.physics@example.com",
      passwordHash: defaultPasswordHash,
      role: "TEACHER",
      teacherProfile: {
        create: {
          bio: "Physics teacher with 7 years of classroom and tutoring experience in Matric and FSc syllabi.",
          qualification: "MSc Physics, Punjab University",
          experienceYears: 7,
          hourlyFee: 1500,
          city: "Rawalpindi",
          languages: ["English", "Urdu"],
          photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
          verificationStatus: "PENDING",
          ratingAvg: 0,
          ratingCount: 0,
          subjects: {
            create: [
              { subjectId: subjects["physics"].id, classLevel: "Matric" },
              { subjectId: subjects["physics"].id, classLevel: "Intermediate" },
            ],
          },
          availability: {
            create: [
              { dayOfWeek: "WEDNESDAY", startTime: "18:00", endTime: "21:00" },
              { dayOfWeek: "FRIDAY", startTime: "18:00", endTime: "21:00" },
            ],
          },
        },
      },
    },
  });
  console.log("Seeded sample teachers.");

  // 6. Sample Completed Booking & Review for Dr. Ayesha
  const sampleBooking = await prisma.booking.create({
    data: {
      studentId: student1.id,
      teacherId: teacherUser1.teacherProfile.id,
      subjectId: subjects["mathematics"].id,
      fee: 2500,
      status: "COMPLETED",
      jitsiRoomId: "tutorconnect-seed-room-ayesha-zainab",
      sessions: {
        create: [
          {
            title: "Calculus I: Limits and Continuity",
            startsAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            endsAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
            status: "COMPLETED",
            notes: "Covered epsilon-delta definitions and polynomial limit problems.",
          },
        ],
      },
      payments: {
        create: {
          amount: 2500,
          method: "JazzCash",
          transactionId: "JC9988776655",
          proofUrl: "https://placehold.co/600x400/png?text=JazzCash+Receipt+JC9988776655",
          status: "APPROVED",
          commissionAmount: 375, // 15%
          adminNotes: "Verified via JazzCash merchant portal.",
        },
      },
      review: {
        create: {
          studentId: student1.id,
          teacherId: teacherUser1.teacherProfile.id,
          rating: 5,
          comment: "Dr. Ayesha is an exceptional teacher! She explained complex calculus problems with such patience. My exam marks have improved tremendously.",
        },
      },
    },
  });
  console.log("Seeded sample booking, payment, and review.");

  // 7. Sample Open Requirement posted by Student 2
  const sampleRequirement = await prisma.requirement.create({
    data: {
      studentId: student2.id,
      subjectId: subjects["computer-science"].id,
      classLevel: "Intermediate",
      budget: 15000,
      timing: "3 days/week, Evenings (6:00 PM - 8:00 PM)",
      description: "Looking for an expert teacher for Intermediate Computer Science (ICS Part 2). Need help with C/C++ programming, database concepts, and board exam past papers.",
      status: "OPEN",
      proposals: {
        create: {
          teacherId: teacherUser2.teacherProfile.id,
          proposedFee: 14000,
          message: "Hello Hamza! I have been teaching ICS Computer Science for 6 years. I will provide hands-on coding exercises and solved past papers from Lahore and Federal boards. Let's start with a trial session!",
          status: "PENDING",
        },
      },
    },
  });
  console.log("Seeded sample student requirement and teacher proposal.");

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
