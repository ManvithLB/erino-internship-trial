export type LeadInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  city?: string;
  state?: string;
  source:
    | "website"
    | "facebook_ads"
    | "google_ads"
    | "referral"
    | "events"
    | "other";
  status?: "new" | "contacted" | "qualified" | "lost" | "won";
  score?: number;
  lead_value?: number;
  last_activity_at?: string;
  is_qualified?: boolean;
};
