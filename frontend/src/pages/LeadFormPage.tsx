import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { LeadsAPI } from "../lib/api";
import { useNavigate, useParams } from "react-router-dom";

// Custom CSS to fix number input spinners
const numberInputStyles = `
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
    background: white !important;
    color: #374151 !important;
  }
  
  input[type="number"] {
    -moz-appearance: textfield;
    background: white !important;
    color: #374151 !important;
  }
  
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    opacity: 1;
    background: white !important;
    color: #374151 !important;
  }
`;

export default function LeadFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<any>({
    defaultValues: { status: "new", source: "website" },
  });

  useEffect(() => {
    if (id) {
      LeadsAPI.get(id).then(({ data }) => reset(data));
    }
  }, [id, reset]);

  // Inject custom CSS for number inputs
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = numberInputStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        fontFamily: "system-ui, -apple-system, sans-serif",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 64,
          height: "100vh",
          backgroundColor: "#660090",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 20,
          gap: 16,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            backgroundColor: "white",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: "bold",
            color: "#660090",
          }}
        >
          E
        </div>

        <div
          onClick={() => navigate("/")}
          style={{
            width: 32,
            height: 32,
            backgroundColor: "white",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            color: "#660090",
            cursor: "pointer",
          }}
          title="Home"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: 64,
          padding: "24px",
          width: "calc(100% - 64px)",
          boxSizing: "border-box",
        }}
      >
        {/* Page Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 4 }}>
              Leads
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#1F2937" }}>
              {id ? "Edit Lead" : "New Lead"}
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            style={{
              backgroundColor: "#F3F4F6",
              color: "#374151",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            ← Back to Leads
          </button>
        </div>

        {/* Form */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 32,
            border: "1px solid #E5E7EB",
            maxWidth: 800,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <form
            onSubmit={handleSubmit(async (v) => {
              try {
                // Process the form data before sending
                const processedData = {
                  ...v,
                  // Convert datetime-local to ISO string if present
                  last_activity_at: v.last_activity_at
                    ? new Date(v.last_activity_at).toISOString()
                    : undefined,
                  // Ensure numeric values are properly formatted
                  score: v.score ? Number(v.score) : undefined,
                  lead_value: v.lead_value ? Number(v.lead_value) : undefined,
                  // Remove undefined values
                };

                // Remove undefined values to avoid validation issues
                Object.keys(processedData).forEach((key) => {
                  if (
                    processedData[key] === undefined ||
                    processedData[key] === ""
                  ) {
                    delete processedData[key];
                  }
                });

                if (id) {
                  await LeadsAPI.update(id, processedData);
                } else {
                  await LeadsAPI.create(processedData);
                }
                navigate("/");
              } catch (error) {
                console.error("Error saving lead:", error);
                alert(
                  "Failed to save lead. Please check your input and try again."
                );
              }
            })}
            style={{ display: "flex", flexDirection: "column", gap: 24 }}
          >
            {/* Personal Information */}
            <div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1F2937",
                  marginBottom: 16,
                  borderBottom: "1px solid #E5E7EB",
                  paddingBottom: 8,
                }}
              >
                Personal Information
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    First Name *
                  </label>
                  <input
                    {...register("first_name", { required: true })}
                    placeholder="Enter first name"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #D1D5DB",
                      borderRadius: 8,
                      fontSize: 14,
                      outline: "none",
                      backgroundColor: "white",
                      color: "#374151",
                      boxSizing: "border-box",
                      backgroundColor: "white",
                      color: "#374151",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Last Name *
                  </label>
                  <input
                    {...register("last_name", { required: true })}
                    placeholder="Enter last name"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #D1D5DB",
                      borderRadius: 8,
                      fontSize: 14,
                      outline: "none",
                      backgroundColor: "white",
                      color: "#374151",
                      boxSizing: "border-box",
                      backgroundColor: "white",
                      color: "#374151",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Email *
                  </label>
                  <input
                    {...register("email", { required: true })}
                    type="email"
                    placeholder="Enter email address"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #D1D5DB",
                      borderRadius: 8,
                      fontSize: 14,
                      outline: "none",
                      backgroundColor: "white",
                      color: "#374151",
                      boxSizing: "border-box",
                      backgroundColor: "white",
                      color: "#374151",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Phone
                  </label>
                  <input
                    {...register("phone")}
                    placeholder="Enter phone number"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #D1D5DB",
                      borderRadius: 8,
                      fontSize: 14,
                      outline: "none",
                      backgroundColor: "white",
                      color: "#374151",
                      boxSizing: "border-box",
                      backgroundColor: "white",
                      color: "#374151",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1F2937",
                  marginBottom: 16,
                  borderBottom: "1px solid #E5E7EB",
                  paddingBottom: 8,
                }}
              >
                Company Information
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 16,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Company
                  </label>
                  <input
                    {...register("company")}
                    placeholder="Enter company name"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #D1D5DB",
                      borderRadius: 8,
                      fontSize: 14,
                      outline: "none",
                      backgroundColor: "white",
                      color: "#374151",
                      boxSizing: "border-box",
                      backgroundColor: "white",
                      color: "#374151",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    City
                  </label>
                  <input
                    {...register("city")}
                    placeholder="Enter city"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #D1D5DB",
                      borderRadius: 8,
                      fontSize: 14,
                      outline: "none",
                      backgroundColor: "white",
                      color: "#374151",
                      boxSizing: "border-box",
                      backgroundColor: "white",
                      color: "#374151",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    State
                  </label>
                  <input
                    {...register("state")}
                    placeholder="Enter state"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #D1D5DB",
                      borderRadius: 8,
                      fontSize: 14,
                      outline: "none",
                      backgroundColor: "white",
                      color: "#374151",
                      boxSizing: "border-box",
                      backgroundColor: "white",
                      color: "#374151",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Lead Details */}
            <div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1F2937",
                  marginBottom: 16,
                  borderBottom: "1px solid #E5E7EB",
                  paddingBottom: 8,
                }}
              >
                Lead Details
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Source *
                  </label>
                  <select
                    {...register("source", { required: true })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #D1D5DB",
                      borderRadius: 8,
                      fontSize: 14,
                      outline: "none",
                      backgroundColor: "white",
                      color: "#374151",
                      backgroundColor: "white",
                      color: "#374151",
                      boxSizing: "border-box",
                    }}
                  >
                    {[
                      "website",
                      "facebook_ads",
                      "google_ads",
                      "referral",
                      "events",
                      "other",
                    ].map((s) => (
                      <option key={s} value={s}>
                        {s
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Status *
                  </label>
                  <select
                    {...register("status", { required: true })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #D1D5DB",
                      borderRadius: 8,
                      fontSize: 14,
                      outline: "none",
                      backgroundColor: "white",
                      color: "#374151",
                      backgroundColor: "white",
                      color: "#374151",
                      boxSizing: "border-box",
                    }}
                  >
                    {["new", "contacted", "qualified", "lost", "won"].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Score (0-100)
                  </label>
                  <input
                    {...register("score", { valueAsNumber: true })}
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter score"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #D1D5DB",
                      borderRadius: 8,
                      fontSize: 14,
                      outline: "none",
                      backgroundColor: "white",
                      color: "#374151",
                      boxSizing: "border-box",
                      backgroundColor: "white",
                      color: "#374151",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Lead Value ($)
                  </label>
                  <input
                    {...register("lead_value", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="Enter lead value"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #D1D5DB",
                      borderRadius: 8,
                      fontSize: 14,
                      outline: "none",
                      backgroundColor: "white",
                      color: "#374151",
                      boxSizing: "border-box",
                      backgroundColor: "white",
                      color: "#374151",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Last Activity
                  </label>
                  <input
                    {...register("last_activity_at")}
                    type="datetime-local"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #D1D5DB",
                      borderRadius: 8,
                      fontSize: 14,
                      outline: "none",
                      backgroundColor: "white",
                      color: "#374151",
                      boxSizing: "border-box",
                      backgroundColor: "white",
                      color: "#374151",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    paddingTop: 28,
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#374151",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      {...register("is_qualified")}
                      style={{
                        width: 16,
                        height: 16,
                        accentColor: "#660090",
                      }}
                    />
                    Qualified Lead
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                paddingTop: 16,
                borderTop: "1px solid #E5E7EB",
              }}
            >
              <button
                type="button"
                onClick={() => navigate("/")}
                style={{
                  backgroundColor: "#F3F4F6",
                  color: "#374151",
                  border: "none",
                  borderRadius: 8,
                  padding: "12px 24px",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: isSubmitting ? "#9CA3AF" : "#6366F1",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  padding: "12px 24px",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  transition: "background-color 0.2s",
                }}
              >
                {isSubmitting
                  ? "Saving..."
                  : id
                  ? "Update Lead"
                  : "Create Lead"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
