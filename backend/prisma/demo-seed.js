require('dotenv').config();
const prisma = require('../src/prismaClient');

// End date roughly two months (60 days) from now.
const now = new Date();
const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // opened yesterday
const endTime = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // ~2 months out

const manifesto = (name, role) =>
  `${name} is contesting for ${role} with a clear plan to improve student welfare, drive transparency, and represent every voice on campus. If elected, ${name} pledges accountable leadership and measurable results within the first semester.`;

const elections = [
  {
    title: 'Student Union Government Election 2026',
    description: 'Annual SUG election for the 2026/2027 session. Choose the executives who will represent the entire student body.',
    positions: [
      {
        title: 'President',
        candidates: [
          { fullName: 'Adeola Ogunlade', department: 'Political Science', level: '400', slogan: 'Unity and Progress' },
          { fullName: 'Babatunde Fashola', department: 'Law', level: '400', slogan: 'Your Voice Matters' },
        ],
      },
      {
        title: 'Vice President',
        candidates: [
          { fullName: 'Chiamaka Nwosu', department: 'Economics', level: '300', slogan: 'Service First' },
          { fullName: 'Amina Yusuf', department: 'Mass Communication', level: '300', slogan: 'Together We Rise' },
        ],
      },
      {
        title: 'General Secretary',
        candidates: [
          { fullName: 'Emeka Okonkwo', department: 'Accounting', level: '200', slogan: 'Efficiency and Accountability' },
          { fullName: 'Ngozi Chukwu', department: 'Business Administration', level: '300', slogan: 'Leading with Integrity' },
        ],
      },
    ],
  },
  {
    title: 'Faculty of Engineering Representative Election 2026',
    description: 'Election of representatives for the Faculty of Engineering student association.',
    positions: [
      {
        title: 'Faculty President',
        candidates: [
          { fullName: 'Tobiloba Adeyemi', department: 'Mechanical Engineering', level: '400', slogan: 'Engineering a Better Faculty' },
          { fullName: 'Fatima Bello', department: 'Electrical Engineering', level: '300', slogan: 'Innovation for All' },
        ],
      },
      {
        title: 'Financial Secretary',
        candidates: [
          { fullName: 'Chinedu Eze', department: 'Civil Engineering', level: '300', slogan: 'Prudence and Transparency' },
          { fullName: 'Halima Sani', department: 'Chemical Engineering', level: '200', slogan: 'Every Naira Counts' },
        ],
      },
    ],
  },
  {
    title: 'Sports and Social Committee Election 2026',
    description: 'Vote for the team that will coordinate sporting and social activities across the campus this session.',
    positions: [
      {
        title: 'Sports Director',
        candidates: [
          { fullName: 'Ibrahim Musa', department: 'Human Kinetics', level: '300', slogan: 'Champions on and off the Field' },
          { fullName: 'Blessing Okafor', department: 'Physiology', level: '200', slogan: 'Fitness for Everyone' },
        ],
      },
      {
        title: 'Social Director',
        candidates: [
          { fullName: 'Zainab Lawal', department: 'Theatre Arts', level: '300', slogan: 'Bringing Campus to Life' },
          { fullName: 'David Adewale', department: 'Music', level: '200', slogan: 'Culture, Colour and Community' },
        ],
      },
    ],
  },
];

async function run() {
  console.log('Seeding demo elections and candidates...');

  for (const e of elections) {
    const election = await prisma.election.create({
      data: {
        title: e.title,
        description: e.description,
        startTime,
        endTime,
        status: 'ACTIVE',
        positions: { create: e.positions.map((p) => ({ title: p.title })) },
      },
      include: { positions: true },
    });

    // Open eligibility (all students may vote).
    await prisma.eligibilityRule.create({ data: { electionId: election.id } });

    for (const p of e.positions) {
      const position = election.positions.find((x) => x.title === p.title);
      for (const c of p.candidates) {
        await prisma.candidate.create({
          data: {
            fullName: c.fullName,
            department: c.department,
            level: c.level,
            slogan: c.slogan,
            manifesto: manifesto(c.fullName, p.title),
            electionId: election.id,
            positionId: position.id,
          },
        });
      }
    }

    await prisma.announcement.create({
      data: {
        title: `${e.title} is now open`,
        content: `Voting for the ${e.title} has commenced and closes on ${endTime.toDateString()}. Cast your vote before the deadline.`,
        electionId: election.id,
      },
    });

    const count = e.positions.reduce((sum, p) => sum + p.candidates.length, 0);
    console.log(`  Created "${e.title}" with ${e.positions.length} positions and ${count} candidates.`);
  }

  console.log(`Done. Elections end on ${endTime.toDateString()}.`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
