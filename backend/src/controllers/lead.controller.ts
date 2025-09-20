import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { z } from "zod";
import type { AuthRequest } from "../middleware/auth.js";

const createSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  source: z.enum([
    "website",
    "facebook_ads",
    "google_ads",
    "referral",
    "events",
    "other",
  ]),
  status: z.enum(["new", "contacted", "qualified", "lost", "won"]).optional(),
  score: z.number().int().min(0).max(100).optional(),
  lead_value: z.number().optional(),
  last_activity_at: z.string().datetime().optional(),
  is_qualified: z.boolean().optional(),
});

export async function createLead(req: AuthRequest, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid input" });
  try {
    const data = parsed.data as any;
    if (data.last_activity_at)
      data.last_activity_at = new Date(data.last_activity_at);
    const lead = await prisma.lead.create({
      data: { ...data, ownerId: req.userId ?? null },
    });
    return res.status(201).json(lead);
  } catch (e: any) {
    if (e.code === "P2002")
      return res.status(409).json({ message: "Email must be unique" });
    return res.status(500).json({ message: "Server error" });
  }
}

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  email: z.string().optional(),
  email_contains: z.string().optional(),
  company: z.string().optional(),
  company_contains: z.string().optional(),
  city: z.string().optional(),
  city_contains: z.string().optional(),
  status: z.enum(["new", "contacted", "qualified", "lost", "won"]).optional(),
  status_in: z.string().optional(),
  source: z
    .enum([
      "website",
      "facebook_ads",
      "google_ads",
      "referral",
      "events",
      "other",
    ])
    .optional(),
  source_in: z.string().optional(),
  score: z.coerce.number().optional(),
  score_gt: z.coerce.number().optional(),
  score_lt: z.coerce.number().optional(),
  score_between: z.string().optional(), // a,b
  lead_value: z.coerce.number().optional(),
  lead_value_gt: z.coerce.number().optional(),
  lead_value_lt: z.coerce.number().optional(),
  lead_value_between: z.string().optional(),
  created_at_on: z.string().optional(),
  created_at_before: z.string().optional(),
  created_at_after: z.string().optional(),
  created_at_between: z.string().optional(), // a,b
  last_activity_on: z.string().optional(),
  last_activity_before: z.string().optional(),
  last_activity_after: z.string().optional(),
  last_activity_between: z.string().optional(),
  is_qualified: z.enum(["true", "false"]).optional(),
});

export async function listLeads(req: Request, res: Response) {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid query" });
  const { page, limit, ...filters } = parsed.data as any;

  const where: any = {};
  if (filters.email) where.email = filters.email;
  if (filters.email_contains)
    where.email = { contains: filters.email_contains, mode: "insensitive" };
  if (filters.company) where.company = filters.company;
  if (filters.company_contains)
    where.company = { contains: filters.company_contains, mode: "insensitive" };
  if (filters.city) where.city = filters.city;
  if (filters.city_contains)
    where.city = { contains: filters.city_contains, mode: "insensitive" };
  // Enums
  if (filters.status) where.status = filters.status;
  if (filters.status_in) where.status = { in: filters.status_in.split(",") };
  if (filters.source) where.source = filters.source;
  if (filters.source_in) where.source = { in: filters.source_in.split(",") };
  const numRange = (val?: string) =>
    val
      ?.split(",")
      .map(Number)
      .filter((v) => !Number.isNaN(v));
  if (filters.score !== undefined) where.score = filters.score;
  if (filters.score_gt !== undefined)
    where.score = { ...(where.score || {}), gt: filters.score_gt };
  if (filters.score_lt !== undefined)
    where.score = { ...(where.score || {}), lt: filters.score_lt };
  const sBetween = numRange(filters.score_between);
  if (sBetween && sBetween.length === 2)
    where.score = { gte: sBetween[0], lte: sBetween[1] };
  if (filters.lead_value !== undefined) where.lead_value = filters.lead_value;
  if (filters.lead_value_gt !== undefined)
    where.lead_value = {
      ...(where.lead_value || {}),
      gt: filters.lead_value_gt,
    };
  if (filters.lead_value_lt !== undefined)
    where.lead_value = {
      ...(where.lead_value || {}),
      lt: filters.lead_value_lt,
    };
  const vBetween = numRange(filters.lead_value_between);
  if (vBetween && vBetween.length === 2)
    where.lead_value = { gte: vBetween[0], lte: vBetween[1] };
  // Dates
  const dateRange = (val?: string) => val?.split(",").map((v) => new Date(v));
  if (filters.created_at_on) {
    const d = new Date(filters.created_at_on);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    where.createdAt = { gte: d, lt: next };
  }
  if (filters.created_at_before)
    where.createdAt = {
      ...(where.createdAt || {}),
      lt: new Date(filters.created_at_before),
    };
  if (filters.created_at_after)
    where.createdAt = {
      ...(where.createdAt || {}),
      gt: new Date(filters.created_at_after),
    };
  const cBetween = dateRange(filters.created_at_between);
  if (cBetween && cBetween.length === 2)
    where.createdAt = { gte: cBetween[0], lte: cBetween[1] };
  if (filters.last_activity_on) {
    const d = new Date(filters.last_activity_on);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    where.last_activity_at = { gte: d, lt: next };
  }
  if (filters.last_activity_before)
    where.last_activity_at = {
      ...(where.last_activity_at || {}),
      lt: new Date(filters.last_activity_before),
    };
  if (filters.last_activity_after)
    where.last_activity_at = {
      ...(where.last_activity_at || {}),
      gt: new Date(filters.last_activity_after),
    };
  const aBetween = dateRange(filters.last_activity_between);
  if (aBetween && aBetween.length === 2)
    where.last_activity_at = { gte: aBetween[0], lte: aBetween[1] };
  // Boolean
  if (filters.is_qualified)
    where.is_qualified = filters.is_qualified === "true";

  const skip = (page - 1) * limit;
  const [total, data] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const totalPages = Math.ceil(total / limit) || 1;
  return res.status(200).json({ data, page, limit, total, totalPages });
}

export async function getLeadById(req: Request, res: Response) {
  const id = req.params.id as string;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return res.status(404).json({ message: "Not found" });
  return res.status(200).json(lead);
}

export async function updateLead(req: Request, res: Response) {
  const id = req.params.id as string;
  const parsed = createSchema.partial().safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid input" });
  const data = parsed.data as any;
  if (data.last_activity_at)
    data.last_activity_at = new Date(data.last_activity_at);
  try {
    const lead = await prisma.lead.update({ where: { id }, data });
    return res.status(200).json(lead);
  } catch (e: any) {
    if (e.code === "P2002")
      return res.status(409).json({ message: "Email must be unique" });
    if (e.code === "P2025")
      return res.status(404).json({ message: "Not found" });
    return res.status(500).json({ message: "Server error" });
  }
}

export async function deleteLead(req: Request, res: Response) {
  const id = req.params.id as string;
  try {
    await prisma.lead.delete({ where: { id } });
    return res.status(204).send();
  } catch (e: any) {
    if (e.code === "P2025")
      return res.status(404).json({ message: "Not found" });
    return res.status(500).json({ message: "Server error" });
  }
}
