"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    // Create demo user
    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@example.com' },
        update: {},
        create: {
            email: 'demo@example.com',
            name: 'Demo User',
            role: 'user',
        },
    });
    // Create admin user
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
        },
    });
    // Create sample buyers
    const sampleBuyers = [
        {
            fullName: 'Rajesh Kumar',
            email: 'rajesh@example.com',
            phone: '9876543210',
            city: 'Chandigarh',
            propertyType: 'Apartment',
            bhk: 'Three',
            purpose: 'Buy',
            budgetMin: 5000000,
            budgetMax: 7000000,
            timeline: 'ZeroToThree',
            source: 'Website',
            status: 'New',
            notes: 'Looking for a 3BHK apartment in Sector 22',
            tags: '["first-time-buyer", "urgent"]',
            ownerId: demoUser.id,
        },
        {
            fullName: 'Priya Sharma',
            email: 'priya@example.com',
            phone: '9876543211',
            city: 'Mohali',
            propertyType: 'Villa',
            bhk: 'Four',
            purpose: 'Buy',
            budgetMin: 8000000,
            budgetMax: 12000000,
            timeline: 'ThreeToSix',
            source: 'Referral',
            status: 'Qualified',
            notes: 'Interested in independent villa with garden',
            tags: '["premium", "villa"]',
            ownerId: demoUser.id,
        },
        {
            fullName: 'Amit Singh',
            email: 'amit@example.com',
            phone: '9876543212',
            city: 'Zirakpur',
            propertyType: 'Plot',
            bhk: null,
            purpose: 'Buy',
            budgetMin: 2000000,
            budgetMax: 3000000,
            timeline: 'MoreThanSix',
            source: 'Call',
            status: 'Contacted',
            notes: 'Looking for residential plot for construction',
            tags: '["plot", "construction"]',
            ownerId: demoUser.id,
        },
        {
            fullName: 'Neha Gupta',
            email: 'neha@example.com',
            phone: '9876543213',
            city: 'Panchkula',
            propertyType: 'Apartment',
            bhk: 'Two',
            purpose: 'Rent',
            budgetMin: 15000,
            budgetMax: 25000,
            timeline: 'ZeroToThree',
            source: 'Website',
            status: 'Visited',
            notes: 'Young professional looking for 2BHK rental',
            tags: '["rental", "professional"]',
            ownerId: demoUser.id,
        },
        {
            fullName: 'Suresh Patel',
            email: 'suresh@example.com',
            phone: '9876543214',
            city: 'Chandigarh',
            propertyType: 'Office',
            bhk: null,
            purpose: 'Buy',
            budgetMin: 3000000,
            budgetMax: 5000000,
            timeline: 'ThreeToSix',
            source: 'WalkIn',
            status: 'Negotiation',
            notes: 'Small business owner looking for office space',
            tags: '["commercial", "office"]',
            ownerId: demoUser.id,
        },
    ];
    for (const buyerData of sampleBuyers) {
        await prisma.buyer.create({
            data: buyerData,
        });
    }
    console.log('Database seeded successfully!');
    console.log(`Demo user: ${demoUser.email}`);
    console.log(`Admin user: ${adminUser.email}`);
    console.log(`Created ${sampleBuyers.length} sample buyers`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map