"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Accessibility,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Languages,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  Smartphone,
  User,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const DEFAULT_API_BASE =
  process.env.NEXT_PUBLIC_CAREPATH_API_URL ??
  "http://localhost:3001/api";

type Form = {
  county: string;
  state: string;
  zipCode: string;
  primaryLanguage: string;
  hasSmartphone: boolean;
  prefersSms: boolean;
  prefersVoice: boolean;
  accessibilityRequirement: string;
  schedulingConstraint: string;
  defaultFundingSource: string;
  primaryInsuranceProvider: string;
  raceEthnicity: string;
  disability: string;
  incomeBracket: string;
  barriers: string;
  notes: string;
};

const initial: Form = {
  county: "",
  state: "AR",
  zipCode: "",
  primaryLanguage: "English",
  hasSmartphone: true,
  prefersSms: true,
  prefersVoice: false,
  accessibilityRequirement: "STANDARD",
  schedulingConstraint: "STANDARD",
  defaultFundingSource: "MEDICAID_NEMT",
  primaryInsuranceProvider: "",
  raceEthnicity: "",
  disability: "",
  incomeBracket: "",
  barriers: "",
  notes: "",
};

type SectionHeadingProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function SectionHeading({
  icon,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10px",
        marginBottom: "28px",
        paddingBottom: "16px",
        borderBottom: "1px solid #dbe7ee",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          color: "#136e5e",
        }}
      >
        {icon}
      </span>

      <h2
        style={{
          margin: 0,
          color: "#052b56",
          fontSize: "20px",
          fontWeight: 800,
        }}
      >
        {title}
      </h2>

      <span
        aria-hidden="true"
        style={{
          width: "1px",
          height: "20px",
          backgroundColor: "#cbd5e1",
        }}
      />

      <p
        style={{
          margin: 0,
          color: "#64748b",
          fontSize: "14px",
        }}
      >
        {description}
      </p>
    </div>
  );
}

export default function PatientProfilePage() {
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE);
  const [token, setToken] = useState("");
  const [form, setForm] = useState<Form>(initial);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (update: Partial<Form>) => {
    setForm((previous) => ({
      ...previous,
      ...update,
    }));
  };

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("carepath.patient.token");

    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const load = async () => {
    setError(null);
    setResult(null);

    if (mode === "demo") {
      setResult("Demo mode: showing default profile.");
      return;
    }

    if (!token) {
      setError("Patient JWT token required.");
      return;
    }

    try {
      const response = await fetch(`${apiBase}/patients/profile`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Load failed (${response.status})`);
      }

      const data = await response.json();

      setForm({
        county: data.county ?? "",
        state: data.state ?? "AR",
        zipCode: data.zipCode ?? "",
        primaryLanguage: data.primaryLanguage ?? "English",
        hasSmartphone: data.hasSmartphone ?? true,
        prefersSms: data.prefersSms ?? true,
        prefersVoice: data.prefersVoice ?? false,
        accessibilityRequirement:
          data.accessibilityRequirement ?? "STANDARD",
        schedulingConstraint:
          data.schedulingConstraint ?? "STANDARD",
        defaultFundingSource:
          data.defaultFundingSource ?? "MEDICAID_NEMT",
        primaryInsuranceProvider:
          data.primaryInsuranceProvider ?? "",
        raceEthnicity: data.raceEthnicity ?? "",
        disability: data.disability ?? "",
        incomeBracket: data.incomeBracket ?? "",
        barriers: data.barriers ?? "",
        notes: data.notes ?? "",
      });

      setResult("Profile loaded.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load.",
      );
    }
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setResult(null);

    if (mode === "demo") {
      setResult("Demo: profile saved.");
      return;
    }

    if (!token) {
      setError("Patient JWT token required.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${apiBase}/patients/profile`, {
        method: "PUT",
        headers,
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error(`Save failed (${response.status})`);
      }

      setResult("Profile saved successfully.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to save.",
      );
    } finally {
      setSaving(false);
    }
  };

  const cardStyle = {
    borderRadius: "14px",
    border: "1px solid #dce7ed",
    backgroundColor: "#ffffff",
    boxShadow: "0 6px 20px rgba(5, 43, 86, 0.06)",
    padding: "30px 36px",
  };

  return (
    <DashboardLayout
      role="patient"
      title="My Profile"
      subtitle="Accessibility, communication, and funding preferences"
      userName="Patient"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Profile information banner */}
        <section
          style={{
            borderRadius: "16px",
            padding: "28px 30px",
            background:
              "linear-gradient(135deg, #136e5e 0%, #0c6bc2 100%)",
            boxShadow: "0 10px 24px rgba(9, 79, 145, 0.18)",
          }}
        >
          <p
            style={{
              margin: 0,
              marginBottom: "8px",
              color: "#b9f3e9",
              fontSize: "12px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
            }}
          >
            Patient Profile
          </p>

          <h2
            style={{
              margin: 0,
              maxWidth: "850px",
              color: "#ffffff",
              fontSize: "22px",
              fontWeight: 800,
              lineHeight: 1.4,
            }}
          >
            Keep your profile current so coordinators can match the right
            ride, driver, and support for your needs.
          </h2>
        </section>

        {/* Developer tools */}
        <details
          style={{
            borderRadius: "14px",
            border: "1px solid #dce7ed",
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 14px rgba(5, 43, 86, 0.05)",
            overflow: "hidden",
          }}
        >
          <summary
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              padding: "18px 22px",
              color: "#374151",
              fontSize: "15px",
              fontWeight: 800,
              cursor: "pointer",
              listStyle: "none",
            }}
          >
            <span>Developer Testing Tools</span>
            <ChevronDown size={18} aria-hidden="true" />
          </summary>

          <div
            style={{
              padding: "0 22px 22px",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <p
              style={{
                marginTop: "18px",
                marginBottom: "16px",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              These temporary controls let the team test demo and live API
              behavior.
            </p>

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <Badge variant={mode === "live" ? "success" : "warning"}>
                {mode === "live" ? "Live" : "Demo"}
              </Badge>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => setMode("demo")}
              >
                Demo
              </Button>

              <Button
                size="sm"
                onClick={() => setMode("live")}
              >
                Live
              </Button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <div>
                <label className="cp-label">API base URL</label>
                <input
                  value={apiBase}
                  onChange={(event) => setApiBase(event.target.value)}
                  placeholder="API base URL"
                  className="cp-input"
                />
              </div>

              <div>
                <label className="cp-label">Patient JWT token</label>
                <input
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="Patient JWT token"
                  className="cp-input"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const storedToken = localStorage.getItem(
                      "carepath.patient.token",
                    );

                    if (storedToken) {
                      setToken(storedToken);
                      setResult("Token loaded.");
                    }
                  }}
                >
                  Load token
                </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    localStorage.setItem(
                      "carepath.patient.token",
                      token,
                    );
                    setResult("Token saved.");
                  }}
                >
                  Save token
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={load}
                >
                  Load profile
                </Button>
              </div>
            </div>
          </div>
        </details>

        {/* Feedback messages */}
        {result && (
          <div className="cp-alert cp-alert-success">
            <CheckCircle2 size={16} />
            {result}
          </div>
        )}

        {error && (
          <div className="cp-alert cp-alert-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form
          onSubmit={save}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* Location and communication */}
          <section style={cardStyle}>
            <SectionHeading
              icon={<MapPin size={21} />}
              title="Location and Communication"
              description="Keep your service area and communication preferences current."
            />

            <div className="cp-grid-2">
              <div>
                <label className="cp-label">County</label>
                <input
                  value={form.county}
                  onChange={(event) =>
                    set({ county: event.target.value })
                  }
                  placeholder="County"
                  className="cp-input"
                />
              </div>

              <div>
                <label className="cp-label">State</label>
                <input
                  value={form.state}
                  onChange={(event) =>
                    set({ state: event.target.value })
                  }
                  placeholder="State"
                  className="cp-input"
                />
              </div>

              <div>
                <label className="cp-label">ZIP code</label>
                <input
                  value={form.zipCode}
                  onChange={(event) =>
                    set({ zipCode: event.target.value })
                  }
                  placeholder="ZIP code"
                  className="cp-input"
                />
              </div>

              <div>
                <label className="cp-label">
                  Primary language
                </label>
                <input
                  value={form.primaryLanguage}
                  onChange={(event) =>
                    set({ primaryLanguage: event.target.value })
                  }
                  placeholder="Primary language"
                  className="cp-input"
                />
              </div>
            </div>

            <div
              className="cp-grid-2"
              style={{ marginTop: "18px" }}
            >
              <label className="cp-checkbox-row">
                <input
                  type="checkbox"
                  checked={form.hasSmartphone}
                  onChange={(event) =>
                    set({ hasSmartphone: event.target.checked })
                  }
                />
                <Smartphone size={18} />
                Has smartphone
              </label>

              <label className="cp-checkbox-row">
                <input
                  type="checkbox"
                  checked={form.prefersSms}
                  onChange={(event) =>
                    set({ prefersSms: event.target.checked })
                  }
                />
                <MessageSquareText size={18} />
                Prefers SMS
              </label>

              <label className="cp-checkbox-row">
                <input
                  type="checkbox"
                  checked={form.prefersVoice}
                  onChange={(event) =>
                    set({ prefersVoice: event.target.checked })
                  }
                />
                Prefers voice call
              </label>
            </div>
          </section>

          {/* Accessibility */}
          <section style={cardStyle}>
            <SectionHeading
              icon={<Accessibility size={22} />}
              title="Accessibility and Scheduling"
              description="Tell coordinators what kind of vehicle and scheduling support is needed."
            />

            <div className="cp-grid-2">
              <div>
                <label className="cp-label">
                  Accessibility requirement
                </label>

                <select
                  value={form.accessibilityRequirement}
                  onChange={(event) =>
                    set({
                      accessibilityRequirement: event.target.value,
                    })
                  }
                  className="cp-select"
                >
                  <option value="STANDARD">Standard</option>
                  <option value="WHEELCHAIR_ACCESSIBLE">
                    Wheelchair accessible
                  </option>
                  <option value="NON_TRANSFERABLE_WHEELCHAIR">
                    Non-transferable wheelchair
                  </option>
                  <option value="STRETCHER">Stretcher</option>
                </select>
              </div>

              <div>
                <label className="cp-label">
                  Scheduling requirement
                </label>

                <select
                  value={form.schedulingConstraint}
                  onChange={(event) =>
                    set({
                      schedulingConstraint: event.target.value,
                    })
                  }
                  className="cp-select"
                >
                  <option value="STANDARD">Standard</option>
                  <option value="SAME_DAY">Same day</option>
                  <option value="ADVANCE_48H">
                    48 hours in advance
                  </option>
                  <option value="ADVANCE_72H">
                    72 hours in advance
                  </option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: "18px" }}>
              <label className="cp-label">
                Disability or mobility notes
              </label>

              <textarea
                rows={3}
                value={form.disability}
                onChange={(event) =>
                  set({ disability: event.target.value })
                }
                placeholder="Describe mobility, transfer, seating, or assistance needs."
                className="cp-textarea"
              />
            </div>

            <div style={{ marginTop: "18px" }}>
              <label className="cp-label">
                Transportation barriers
              </label>

              <textarea
                rows={3}
                value={form.barriers}
                onChange={(event) =>
                  set({ barriers: event.target.value })
                }
                placeholder="Examples: no vehicle, no backup driver, limited public transit, or rural location."
                className="cp-textarea"
              />
            </div>
          </section>

          {/* Funding and insurance */}
          <section style={cardStyle}>
            <SectionHeading
              icon={<ShieldCheck size={22} />}
              title="Coverage and Insurance"
              description="Keep transportation funding and insurance information available for coordination."
            />

            <div className="cp-grid-2">
              <div>
                <label className="cp-label">
                  Default funding source
                </label>

                <select
                  value={form.defaultFundingSource}
                  onChange={(event) =>
                    set({
                      defaultFundingSource: event.target.value,
                    })
                  }
                  className="cp-select"
                >
                  <option value="MEDICAID_NEMT">
                    Medicaid NEMT
                  </option>
                  <option value="MEDICARE">Medicare</option>
                  <option value="PRIVATE_INSURANCE">
                    Private insurance
                  </option>
                  <option value="FAMILY">Family</option>
                  <option value="GRANT">Grant</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="cp-label">
                  Insurance provider
                </label>

                <input
                  value={form.primaryInsuranceProvider}
                  onChange={(event) =>
                    set({
                      primaryInsuranceProvider:
                        event.target.value,
                    })
                  }
                  placeholder="Insurance provider"
                  className="cp-input"
                />
              </div>
            </div>
          </section>

          {/* Additional notes */}
          <section style={cardStyle}>
            <SectionHeading
              icon={<Languages size={21} />}
              title="Additional Profile Notes"
              description="Add anything else coordinators should know before arranging transportation."
            />

            <label className="cp-label">Additional notes</label>

            <textarea
              rows={5}
              value={form.notes}
              onChange={(event) =>
                set({ notes: event.target.value })
              }
              placeholder="Add other communication, scheduling, medical destination, or transportation information."
              className="cp-textarea"
            />
          </section>

          {/* Save button */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              paddingBottom: "24px",
            }}
          >
            <Button
              type="submit"
              disabled={saving}
              style={{
                minWidth: "240px",
                minHeight: "54px",
                fontSize: "16px",
              }}
            >
              {saving ? "Saving…" : "Save Profile"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}