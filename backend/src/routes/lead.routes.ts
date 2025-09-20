import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createLead,
  deleteLead,
  getLeadById,
  listLeads,
  updateLead,
} from "../controllers/lead.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", createLead);

router.get("/", listLeads);

router.get("/:id", getLeadById);

router.put("/:id", updateLead);

router.delete("/:id", deleteLead);

export default router;
