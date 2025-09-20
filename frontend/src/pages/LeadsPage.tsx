import { useEffect, useMemo, useState, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { LeadsAPI, AuthAPI } from "../lib/api";
import { useNavigate } from "react-router-dom";

const customStyles = `
  .ag-theme-quartz input {
    background-color: white !important;
    color: #374151 !important;
  }
  
  .ag-theme-quartz .ag-header-cell {
    background-color: #F9FAFB !important;
  }
  
  .ag-theme-quartz .ag-row {
    border-bottom: 1px solid #F3F4F6 !important;
  }
  
  .ag-theme-quartz .ag-row:hover {
    background-color: #F9FAFB !important;
  }
`;

if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = customStyles;
  document.head.appendChild(styleElement);
}

ModuleRegistry.registerModules([AllCommunityModule]);

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const getStatusColor = (status: string) => {
  const colors = {
    new: "#3B82F6", // Blue
    contacted: "#10B981", // Green
    qualified: "#F59E0B", // Amber
    lost: "#EF4444", // Red
    won: "#8B5CF6", // Purple
  };
  return colors[status as keyof typeof colors] || "#6B7280";
};

const getSourceColor = (source: string) => {
  const colors = {
    website: "#3B82F6",
    facebook_ads: "#1877F2",
    google_ads: "#4285F4",
    referral: "#10B981",
    events: "#F59E0B",
    other: "#6B7280",
  };
  return colors[source as keyof typeof colors] || "#6B7280";
};

export default function LeadsPage() {
  const navigate = useNavigate();
  const [rowData, setRowData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showLeadDetail, setShowLeadDetail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleDeleteLead = async (leadId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this lead? This action cannot be undone."
      )
    ) {
      try {
        await LeadsAPI.remove(leadId);
        fetchLeads();
      } catch (error) {
        console.error("Error deleting lead:", error);
        alert("Failed to delete lead. Please try again.");
      }
    }
  };

  const handleLeadClick = (lead: any) => {
    setSelectedLead(lead);
    setShowLeadDetail(true);
  };

  const clearAllFilters = () => {
    setFilters({});
    const emailInput = document.querySelector(
      'input[placeholder="Email contains"]'
    ) as HTMLInputElement;
    const companyInput = document.querySelector(
      'input[placeholder="Company contains"]'
    ) as HTMLInputElement;
    const cityInput = document.querySelector(
      'input[placeholder="City contains"]'
    ) as HTMLInputElement;
    const statusSelect = document.querySelector("select") as HTMLSelectElement;

    if (emailInput) emailInput.value = "";
    if (companyInput) companyInput.value = "";
    if (cityInput) cityInput.value = "";
    if (statusSelect) statusSelect.selectedIndex = 0;
  };

  const columnDefs = useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        width: 280,
        cellRenderer: (params: any) => {
          const initials = getInitials(
            params.data.first_name,
            params.data.last_name
          );
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: "#660090",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontWeight: 600,
                    color: "#1F2937",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={`${params.data.first_name} ${params.data.last_name}`}
                >
                  {params.data.first_name} {params.data.last_name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={params.data.email}
                >
                  {params.data.email}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        field: "status",
        headerName: "Stage",
        width: 180,
        cellRenderer: (params: any) => {
          const color = getStatusColor(params.value);
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: color,
                }}
              />
              <span style={{ color: "#374151", textTransform: "capitalize" }}>
                {params.value}
              </span>
            </div>
          );
        },
      },
      {
        field: "lead_value",
        headerName: "Deal Size",
        width: 120,
        cellRenderer: (params: any) => (
          <span style={{ fontWeight: 600, color: "#059669" }}>
            ${params.value?.toLocaleString() || "0"}
          </span>
        ),
      },
      {
        field: "source",
        headerName: "Source",
        width: 140,
        cellRenderer: (params: any) => {
          const color = getSourceColor(params.value);
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: color,
                }}
              />
              <span style={{ color: "#374151", textTransform: "capitalize" }}>
                {params.value?.replace("_", " ")}
              </span>
            </div>
          );
        },
      },
      {
        field: "company",
        headerName: "Company",
        width: 160,
        cellRenderer: (params: any) => (
          <span style={{ color: "#374151" }}>{params.value || "—"}</span>
        ),
      },
      {
        field: "createdAt",
        headerName: "Created at",
        width: 180,
        cellRenderer: (params: any) => {
          const date = new Date(params.value);
          return (
            <span style={{ color: "#6B7280", fontSize: 12 }}>
              {date.toLocaleDateString("en-US", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          );
        },
      },
      {
        field: "phone",
        headerName: "Phone Number",
        width: 160,
        cellRenderer: (params: any) => (
          <span style={{ color: "#374151", fontSize: 12 }}>
            {params.value || "—"}
          </span>
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 100,
        cellRenderer: (params: any) => (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => navigate(`/leads/${params.data.id}`)}
              style={{
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Edit Lead"
            >
              <span style={{ fontSize: 16, color: "#6B7280" }}>✏️</span>
            </button>
            <button
              onClick={() => handleDeleteLead(params.data.id)}
              style={{
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Delete Lead"
            >
              <span style={{ fontSize: 16, color: "#EF4444" }}>🗑️</span>
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit, ...filters };
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === "") {
          delete params[key];
        }
      });
      const { data } = await LeadsAPI.list(params);
      setRowData(data.data);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

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
          style={{
            width: 32,
            height: 32,
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            color: "white",
            cursor: "pointer",
          }}
          title="Leads"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>

      <div
        style={{
          marginLeft: 64,
          padding: "8px 8px 24px 8px",
          width: "calc(100% - 64px)",
          boxSizing: "border-box",
          height: "100vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 4 }}>
              Leads
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#1F2937" }}>
              My Follow Ups
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => navigate("/leads/new")}
              style={{
                backgroundColor: "#660090",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>+</span>
              Add Record
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                backgroundColor: showFilters ? "#660090" : "white",
                color: showFilters ? "white" : "#374151",
                border: "1px solid #D1D5DB",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>🔍</span>
              {showFilters ? "Hide Filters" : "Filter"}
            </button>
            <button
              onClick={async () => {
                await AuthAPI.logout();
                navigate("/login");
              }}
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
              Logout
            </button>
          </div>
        </div>

        {showFilters && (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
              border: "1px solid #E5E7EB",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                placeholder="Email contains"
                onChange={(e) => {
                  setPage(1);
                  setFilters((f) => ({
                    ...f,
                    email_contains: e.target.value || undefined,
                  }));
                }}
                style={{
                  border: "1px solid #D1D5DB",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 14,
                  outline: "none",
                  width: 200,
                  backgroundColor: "white",
                  color: "#374151",
                }}
              />
              <input
                placeholder="Company contains"
                onChange={(e) => {
                  setPage(1);
                  setFilters((f) => ({
                    ...f,
                    company_contains: e.target.value || undefined,
                  }));
                }}
                style={{
                  border: "1px solid #D1D5DB",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 14,
                  outline: "none",
                  width: 200,
                  backgroundColor: "white",
                  color: "#374151",
                }}
              />
              <select
                onChange={(e) => {
                  setPage(1);
                  setFilters((f) => ({
                    ...f,
                    status: e.target.value || undefined,
                  }));
                }}
                style={{
                  border: "1px solid #D1D5DB",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 14,
                  outline: "none",
                  backgroundColor: "white",
                  color: "#374151",
                  width: 150,
                }}
              >
                <option value="">All Status</option>
                {["new", "contacted", "qualified", "lost", "won"].map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <select
                onChange={(e) => {
                  setPage(1);
                  setFilters((f) => ({
                    ...f,
                    source: e.target.value || undefined,
                  }));
                }}
                style={{
                  border: "1px solid #D1D5DB",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 14,
                  outline: "none",
                  backgroundColor: "white",
                  color: "#374151",
                  width: 150,
                }}
              >
                <option value="">All Sources</option>
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
              <button
                onClick={() => {
                  setPage(1);
                  clearAllFilters();
                }}
                style={{
                  backgroundColor: "#F3F4F6",
                  color: "#374151",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            border: "1px solid #E5E7EB",
            overflow: "hidden",
            width: "100%",
            height: showFilters ? "calc(100vh - 280px)" : "calc(100vh - 200px)",
          }}
        >
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#6B7280" }}>
              Loading leads...
            </div>
          ) : (
            <div
              className="ag-theme-quartz"
              style={{
                height: showFilters
                  ? "calc(100vh - 280px)"
                  : "calc(100vh - 200px)",
                width: "100%",
              }}
            >
              <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                pagination={false}
                suppressRowClickSelection={true}
                rowHeight={60}
                headerHeight={48}
                defaultColDef={{
                  sortable: true,
                  resizable: true,
                  cellStyle: { borderBottom: "1px solid #F3F4F6" },
                }}
                gridOptions={{
                  suppressRowHoverHighlight: false,
                  rowClass: "lead-row",
                }}
                onRowClicked={(event) => handleLeadClick(event.data)}
              />
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 20,
            padding: "0 8px",
          }}
        >
          <div style={{ color: "#6B7280", fontSize: 14 }}>
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{" "}
            of {total} results
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  backgroundColor: page <= 1 ? "#F3F4F6" : "white",
                  color: page <= 1 ? "#9CA3AF" : "#374151",
                  border: "1px solid #D1D5DB",
                  borderRadius: 6,
                  padding: "8px 12px",
                  fontSize: 14,
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: 14, color: "#374151" }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                style={{
                  backgroundColor: page >= totalPages ? "#F3F4F6" : "white",
                  color: page >= totalPages ? "#9CA3AF" : "#374151",
                  border: "1px solid #D1D5DB",
                  borderRadius: 6,
                  padding: "8px 12px",
                  fontSize: 14,
                  cursor: page >= totalPages ? "not-allowed" : "pointer",
                }}
              >
                Next
              </button>
            </div>
            <select
              style={{
                border: "1px solid #D1D5DB",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 14,
                outline: "none",
                backgroundColor: "white",
                color: "#374151",
              }}
              value={limit}
              onChange={(e) => {
                setPage(1);
                setLimit(Number(e.target.value));
              }}
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} per page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showLeadDetail && selectedLead && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowLeadDetail(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 24,
              maxWidth: 600,
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#1F2937",
                  margin: 0,
                }}
              >
                Lead Details
              </h2>
              <button
                onClick={() => setShowLeadDetail(false)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: "#6B7280",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div>
                  <label
                    style={{ fontSize: 14, fontWeight: 500, color: "#6B7280" }}
                  >
                    First Name
                  </label>
                  <div style={{ fontSize: 16, color: "#1F2937", marginTop: 4 }}>
                    {selectedLead.first_name || "—"}
                  </div>
                </div>
                <div>
                  <label
                    style={{ fontSize: 14, fontWeight: 500, color: "#6B7280" }}
                  >
                    Last Name
                  </label>
                  <div style={{ fontSize: 16, color: "#1F2937", marginTop: 4 }}>
                    {selectedLead.last_name || "—"}
                  </div>
                </div>
              </div>

              <div>
                <label
                  style={{ fontSize: 14, fontWeight: 500, color: "#6B7280" }}
                >
                  Email
                </label>
                <div style={{ fontSize: 16, color: "#1F2937", marginTop: 4 }}>
                  {selectedLead.email || "—"}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div>
                  <label
                    style={{ fontSize: 14, fontWeight: 500, color: "#6B7280" }}
                  >
                    Phone
                  </label>
                  <div style={{ fontSize: 16, color: "#1F2937", marginTop: 4 }}>
                    {selectedLead.phone || "—"}
                  </div>
                </div>
                <div>
                  <label
                    style={{ fontSize: 14, fontWeight: 500, color: "#6B7280" }}
                  >
                    Company
                  </label>
                  <div style={{ fontSize: 16, color: "#1F2937", marginTop: 4 }}>
                    {selectedLead.company || "—"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div>
                  <label
                    style={{ fontSize: 14, fontWeight: 500, color: "#6B7280" }}
                  >
                    City
                  </label>
                  <div style={{ fontSize: 16, color: "#1F2937", marginTop: 4 }}>
                    {selectedLead.city || "—"}
                  </div>
                </div>
                <div>
                  <label
                    style={{ fontSize: 14, fontWeight: 500, color: "#6B7280" }}
                  >
                    State
                  </label>
                  <div style={{ fontSize: 16, color: "#1F2937", marginTop: 4 }}>
                    {selectedLead.state || "—"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div>
                  <label
                    style={{ fontSize: 14, fontWeight: 500, color: "#6B7280" }}
                  >
                    Source
                  </label>
                  <div style={{ fontSize: 16, color: "#1F2937", marginTop: 4 }}>
                    {selectedLead.source || "—"}
                  </div>
                </div>
                <div>
                  <label
                    style={{ fontSize: 14, fontWeight: 500, color: "#6B7280" }}
                  >
                    Status
                  </label>
                  <div style={{ fontSize: 16, color: "#1F2937", marginTop: 4 }}>
                    {selectedLead.status || "—"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div>
                  <label
                    style={{ fontSize: 14, fontWeight: 500, color: "#6B7280" }}
                  >
                    Score
                  </label>
                  <div style={{ fontSize: 16, color: "#1F2937", marginTop: 4 }}>
                    {selectedLead.score || "—"}
                  </div>
                </div>
                <div>
                  <label
                    style={{ fontSize: 14, fontWeight: 500, color: "#6B7280" }}
                  >
                    Lead Value
                  </label>
                  <div style={{ fontSize: 16, color: "#1F2937", marginTop: 4 }}>
                    {selectedLead.lead_value
                      ? `$${selectedLead.lead_value.toLocaleString()}`
                      : "—"}
                  </div>
                </div>
              </div>

              <div>
                <label
                  style={{ fontSize: 14, fontWeight: 500, color: "#6B7280" }}
                >
                  Last Activity
                </label>
                <div style={{ fontSize: 16, color: "#1F2937", marginTop: 4 }}>
                  {selectedLead.last_activity_at
                    ? new Date(selectedLead.last_activity_at).toLocaleString()
                    : "—"}
                </div>
              </div>

              <div>
                <label
                  style={{ fontSize: 14, fontWeight: 500, color: "#6B7280" }}
                >
                  Qualified
                </label>
                <div style={{ fontSize: 16, color: "#1F2937", marginTop: 4 }}>
                  {selectedLead.is_qualified ? "Yes" : "No"}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 24,
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowLeadDetail(false)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#F3F4F6",
                  color: "#374151",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowLeadDetail(false);
                  navigate(`/leads/${selectedLead.id}`);
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#660090",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Edit Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
