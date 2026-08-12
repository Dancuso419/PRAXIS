require('dotenv').config();
const prisma = require('../src/prismaClient');
const { hashPassword } = require('../src/utils/hashPassword');

async function seed() {
  console.log('Seeding database...');

  // Super admin password is configurable via env for production; falls back for local dev.
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin123';
  const adminPassword = await hashPassword(superAdminPassword);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@praxis.edu' },
    update: {},
    create: {
      fullName: 'System Administrator',
      matricNumber: 'ADMIN001',
      email: 'admin@praxis.edu',
      password: adminPassword,
      faculty: 'Administration',
      department: 'ICT',
      level: 'N/A',
      role: 'SUPER_ADMIN',
      isVerified: true,
    },
  });
  console.log(`Created SUPER_ADMIN: ${admin.email}`);

  const officerPassword = await hashPassword('officer123');
  const officer = await prisma.user.upsert({
    where: { email: 'officer@praxis.edu' },
    update: {},
    create: {
      fullName: 'Election Officer',
      matricNumber: 'OFF001',
      email: 'officer@praxis.edu',
      password: officerPassword,
      faculty: 'Administration',
      department: 'ICT',
      level: 'N/A',
      role: 'ELECTION_OFFICER',
      isVerified: true,
    },
  });
  console.log(`Created ELECTION_OFFICER: ${officer.email}`);

  const studentPassword = await hashPassword('student123');
  const student = await prisma.user.upsert({
    where: { email: 'student@praxis.edu' },
    update: {},
    create: {
      fullName: 'John Student',
      matricNumber: 'STU2024001',
      email: 'student@praxis.edu',
      password: studentPassword,
      faculty: 'Engineering',
      department: 'Computer Science',
      level: '300',
      role: 'STUDENT',
      isVerified: true,
    },
  });
  console.log(`Created STUDENT: ${student.email}`);

  const election = await prisma.election.create({
    data: {
      title: 'Student Union Government Elections 2024',
      description: 'Annual SUG elections for the 2024/2025 academic session. Vote for your preferred candidates.',
      startTime: new Date('2024-09-01T08:00:00'),
      endTime: new Date('2026-12-31T23:59:59'),
      status: 'ACTIVE',
      positions: {
        create: [
          { title: 'President' },
          { title: 'Vice President' },
          { title: 'General Secretary' },
        ],
      },
    },
    include: { positions: true },
  });
  console.log(`Created election: ${election.title}`);

  for (const position of election.positions) {
    const candidates = [
      {
        fullName: position.title === 'President' ? 'Adeola Ogunlade' : position.title === 'Vice President' ? 'Chiamaka Nwosu' : 'Emeka Okonkwo',
        department: position.title === 'General Secretary' ? 'Law' : 'Computer Science',
        level: position.title === 'General Secretary' ? '400' : '300',
        manifesto: `As your ${position.title}, I promise to bring positive change, transparency, and student-focused leadership. I will work tirelessly to ensure every student's voice is heard and their concerns addressed promptly.`,
        slogan: position.title === 'President' ? 'Unity and Progress' : position.title === 'Vice President' ? 'Service First' : 'Efficiency and Accountability',
      },
      {
        fullName: position.title === 'President' ? 'Babatunde Fashola' : position.title === 'Vice President' ? 'Amina Yusuf' : 'Ngozi Chukwu',
        department: position.title === 'General Secretary' ? 'English' : 'Economics',
        level: position.title === 'General Secretary' ? '300' : '400',
        manifesto: `My vision for the ${position.title} role is to bridge the gap between students and administration. Together, we can build a more inclusive and responsive student union.`,
        slogan: position.title === 'President' ? 'Your Voice Matters' : position.title === 'Vice President' ? 'Together We Rise' : 'Leading with Integrity',
      },
    ];

    for (const c of candidates) {
      await prisma.candidate.create({
        data: {
          ...c,
          electionId: election.id,
          positionId: position.id,
        },
      });
    }
    console.log(`  Added candidates for ${position.title}`);
  }

  await prisma.eligibilityRule.create({
    data: {
      electionId: election.id,
    },
  });
  console.log('  Set eligibility rules (open to all)');

  await prisma.announcement.create({
    data: {
      title: 'SUG Elections Now Open',
      content: 'Voting for the 2024 Student Union Government elections has commenced. All eligible students are encouraged to participate.',
      electionId: election.id,
    },
  });
  console.log('Created announcement');

  console.log('\nSeed complete! Test accounts:');
  console.log(`  SUPER_ADMIN: admin@praxis.edu / ${process.env.SUPER_ADMIN_PASSWORD ? '(set via SUPER_ADMIN_PASSWORD)' : 'admin123'}`);
  console.log('  ELECTION_OFFICER: officer@praxis.edu / officer123');
  console.log('  STUDENT: student@praxis.edu / student123');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
