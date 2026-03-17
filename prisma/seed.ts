import { PrismaClient, type Prisma } from '@prisma/client';
import { generateIndustryAccurateSeedData } from '../src/lib/accurateRateCalculation';

const prisma = new PrismaClient();

const industryAccurateRates: Prisma.RateCreateManyInput[] = generateIndustryAccurateSeedData().map((rate) => ({
  ...rate,
  lastUpdated: new Date(),
}));

async function main() {
  console.log('Seeding industry-accurate rates...');

  await prisma.rate.deleteMany();

  await prisma.rate.createMany({
    data: industryAccurateRates,
  });

  console.log(`Seeded ${industryAccurateRates.length} rate entries.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
