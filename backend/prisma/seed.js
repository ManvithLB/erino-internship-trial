import { prisma } from "../src/utils/prisma.js";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
async function main() {
    const email = "test@erino.io";
    const password = "Erino@123";
    const hash = await bcrypt.hash(password, 10);
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        user = await prisma.user.create({ data: { email, password: hash } });
    }
    const sources = [
        "website",
        "facebook_ads",
        "google_ads",
        "referral",
        "events",
        "other",
    ];
    const statuses = ["new", "contacted", "qualified", "lost", "won"];
    const existing = await prisma.lead.count();
    const target = 120;
    if (existing < target) {
        const toCreate = target - existing;
        const leads = Array.from({ length: toCreate }).map(() => {
            const first = faker.person.firstName();
            const last = faker.person.lastName();
            const maybeDate = faker.helpers.maybe(() => faker.date.recent({ days: 60 }), { probability: 0.7 });
            return {
                first_name: first,
                last_name: last,
                email: faker.internet
                    .email({ firstName: first, lastName: last })
                    .toLowerCase(),
                phone: faker.phone.number(),
                company: faker.company.name(),
                city: faker.location.city(),
                state: faker.location.state(),
                source: faker.helpers.arrayElement(sources),
                status: faker.helpers.arrayElement(statuses),
                score: faker.number.int({ min: 0, max: 100 }),
                lead_value: faker.number.float({
                    min: 0,
                    max: 10000,
                    fractionDigits: 2,
                }),
                last_activity_at: maybeDate ?? null,
                is_qualified: faker.datatype.boolean({ probability: 0.4 }),
                ownerId: user.id,
            };
        });
        for (const chunk of chunked(leads, 50)) {
            await prisma.lead.createMany({ data: chunk });
        }
    }
    console.log("Seed complete. Test user:", email, "password:", password);
}
function* chunked(arr, size) {
    for (let i = 0; i < arr.length; i += size)
        yield arr.slice(i, i + size);
}
main().finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map