import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bus,
  HandHeart,
  TimerReset,
  CheckCircle,
  UserRound,
  CarFront,
} from "lucide-react";

const pillars = [
  {
    icon: Bus,
    color: "#e0d37f",
    bg: "#dbeafe",
    title: "Pool Every Network",
    description:
      "Medicaid transport, clinic shuttles, and local providers unified in one dispatch layer.",
  },
  {
    icon: HandHeart,
    color: "#c03182",
    bg: "#d0f4ee",
    title: "Activate Volunteers",
    description:
      "Vetted community volunteers as fallback coverage before missed appointments become a crisis.",
  },
  {
    icon: TimerReset,
    color: "#c01e39",
    bg: "#ede9f7",
    title: "Intervene Early",
    description:
      "Surface risk signals so teams can recover rides before the appointment window closes.",
  },
];

const validationSignals = [
  "Night-before no-provider calls repeatedly create no-recovery windows for caregivers.",
  "Rigid 72-hour scheduling rules fail urgent but non-emergency medical events.",
  "Families absorb cost and stress when systems default to ambulance plus paid rideshare.",
];

const stats = [
  {
    value: "15",
    label: "Validation interviews",
    color: "#5540a1",
  },
  {
    value: "13",
    label: "Strong signal cases",
    color: "#1b9c86",
  },
  {
    value: "4+",
    label: "Patient segments",
    color: "#0c6bc2",
  },
  {
    value: "0",
    label: "Dominant solutions",
    color: "#052b56",
  },
];
export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#0f172a",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ======================================================
          TOP NAVIGATION
      ====================================================== */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255, 255, 255, 0.94)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e2e8f0",
          padding: "0 32px",
          minHeight: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        {/* Logo and company name */}
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#0f172a",
            textDecoration: "none",
          }}
        >
          <Image
            src="/carepath-logo.png"
            alt="CarePath"
            width={38}
            height={38}
            style={{
              borderRadius: 8,
              objectFit: "contain",
            }}
          />

          <span
            style={{
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            CarePath
          </span>
        </Link>

        {/* Navigation buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 10,
            flexWrap: "wrap",
            padding: "10px 0",
           

          }}
        >
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 16px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              background: "#f3e2f7",
              color: "#0c6bc2",
              border: "1px solid #ae5a8b",
              textDecoration: "none",
               
            }}
          >
            <UserRound size={16} />
            Login
          </Link>

          <Link href="/patient/profile" className="..."
           
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 16px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              background: "#f3e2f",
              color: "#0c6bc2",
              border: "1px solid #ae5a8b",
              textDecoration: "none",
            }}
          >
            <UserRound size={16} />
            My Profile
          </Link>
          <Link
            href="/coordinator"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              background: "#f3e2f",
              color: "#0c6bc2",
              border: "1px solid #ae5a8b",
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(85, 64, 161, 0.25)",
            }}
          >
            Coordinator Hub
          </Link>
        </div>
      </nav>

      {/* ======================================================
          MAIN PAGE CONTENT
      ====================================================== */}
      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 64px",
        }}
      >
        {/* ====================================================
            HERO SECTION
        ==================================================== */}
        <section
          style={{
            marginTop: 32,
            borderRadius: 20,
            background:
              "linear-gradient(135deg, #7c2687 0%, #0c6bc2 40%, #5540a1 70%, #7c2687 100%)",
            padding: "48px 32px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(5, 43, 86, 0.3)",
          }}
        >
          {/* Decorative blurred circles */}
          <div
            style={{
              position: "absolute",
              top: -60,
              left: -60,
              width: 240,
              height: 240,
              borderRadius: "50%",
              background: "rgba(85, 64, 161, 0.3)",
              filter: "blur(60px)",
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: -80,
              right: 40,
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: "rgba(27, 156, 134, 0.25)",
              filter: "blur(60px)",
            }}
          />

          {/* Actual hero content */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <Image
                src="/carepath-logo.png"
                alt="CarePath"
                width={48}
                height={48}
                style={{
                  borderRadius: 12,
                  objectFit: "contain",
                  background: "rgba(255, 255, 255, 0.1)",
                }}
              />

              <span
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#ffffff",
                }}
              >
                CarePath
              </span>
            </div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "#bfdbfe",
                marginBottom: 10,
              }}
            >
              Transportation Coordination for Medical Care
            </p>
            <h1
              style={{
                maxWidth: 700,
                fontSize: 38,
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.2,
                marginBottom: 14,
              }}
            >
              Reliable rides to medical appointments, anywhere.
            </h1>
            <p
              style={{
                maxWidth: 610,
                fontSize: 16,
                color: "rgba(255, 255, 255, 0.88)",
                lineHeight: 1.7,
                marginBottom: 26,
              }}
            >
              CarePath helps patients, drivers, volunteers, and care
              coordinators work together so transportation problems do not
              become missed medical appointments.
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              {/* Patient Intake */}
              <Link
                href="/patient/intake"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 22px",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  background: "#dda072",
                  color: "#ffffff",
                  textDecoration: "none",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  minHeight: 48,
                }}
              >
                Patient Intake
              </Link>

              {/* Changed from Open Pooling Hub */}
              <Link
                href="/patient/request-ride"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 22px",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  background: "#b62ea1",
                  color: "#ffffff",
                  textDecoration: "none",
                  minHeight: 48,
                }}
              >
                Request a Ride
                <ArrowRight size={16} />
              </Link>
            </div>{" "}
          </div>
        </section>

        {/* ====================================================
            SERVICE PILLARS
        ==================================================== */}
        <section
          className="cp-grid-3"
          style={{
            marginTop: 24,
          }}
        >
          {pillars.map(({ icon: Icon, color, bg, title, description }) => (
            <div
              key={title}
              style={{
                background: "#ffffff",
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
                padding: 24,
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <Icon
                  size={23}
                  style={{
                    color,
                  }}
                />
              </div>

              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#0f172a",
                  marginBottom: 7,
                }}
              >
                {title}
              </h3>

              <p
                style={{
                  fontSize: 14,
                  color: "#64748b",
                  lineHeight: 1.65,
                }}
              >
                {description}
              </p>
            </div>
          ))}
        </section>

        {/* ====================================================
            MAIN CALL-TO-ACTION
        ==================================================== */}
        <section
          style={{
            marginTop: 28,
            borderRadius: 18,
            padding: "36px 28px",
            background: "linear-gradient(135deg, #0c6bc2, #6b2175)",
            boxShadow: "0 8px 32px rgba(85, 64, 161, 0.25)",
          }}
        >
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#ffffff",
              marginBottom: 8,
            }}
          >
            Where would you like to go?
          </h2>

          <p
            style={{
              maxWidth: 700,
              fontSize: 15,
              color: "rgba(255, 255, 255, 0.84)",
              lineHeight: 1.6,
              marginBottom: 22,
            }}
          >
            Patients can request transportation or complete an intake form.
            Drivers and coordinators can enter their own work areas.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/patient/request-ride"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 22px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                background: "#b62ea1",
                color: "#ffffff",
                textDecoration: "none",
                minHeight: 48,
              }}
            >
              Request a Ride
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        {/* ====================================================
            VALIDATION SECTION
            Moved down near the bottom
        ==================================================== */}
        {/* ====================================================
    VALIDATION SECTION
    Moved down near the bottom
==================================================== */}
        <section
          id="validation"
          style={{
            marginTop: 32,
            borderRadius: 20,
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
            padding: 32,
          }}
        >
          {/* Validation heading */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 4,
                height: 28,
                borderRadius: 2,
                background: "#1b9c86",
              }}
            />

            <div>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#1b9c86",
                  marginBottom: 4,
                }}
              >
                Validation-backed direction
              </p>

              <p
                style={{
                  fontSize: 14,
                  color: "#64748b",
                }}
              >
                Evidence gathered through patient and caregiver interviews
              </p>
            </div>
          </div>

          {/* Three matching columns */}
          <div
            className="cp-grid-3"
            style={{
              alignItems: "stretch",
            }}
          >
            {/* ==================================================
        FIRST COLUMN
    ================================================== */}
            <div
              style={{
                display: "grid",
                gridTemplateRows: "1fr auto",
                gap: 12,
              }}
            >
              {/* Night-before interview finding */}
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 12,
                  padding: 18,
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  gap: 10,
                  height: "100%",
                }}
              >
                <CheckCircle
                  size={17}
                  style={{
                    color: "#1b9c86",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />

                <p
                  style={{
                    fontSize: 14,
                    color: "#475569",
                    lineHeight: 1.6,
                  }}
                >
                  Night-before no-provider calls repeatedly create no-recovery
                  windows for caregivers.
                </p>
              </div>

              {/* 15 Validation interviews */}
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                  borderTop: "3px solid #5540a1",
                  padding: "18px 20px",
                }}
              >
                <p
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "#5540a1",
                    lineHeight: 1,
                  }}
                >
                  15
                </p>

                <p
                  style={{
                    fontSize: 13,
                    color: "#64748b",
                    marginTop: 7,
                    fontWeight: 500,
                  }}
                >
                  Validation interviews
                </p>
              </div>
            </div>

            {/* ==================================================
        SECOND COLUMN
    ================================================== */}
            <div
              style={{
                display: "grid",
                gridTemplateRows: "1fr auto",
                gap: 12,
              }}
            >
              {/* 72-hour scheduling finding */}
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 12,
                  padding: 18,
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  gap: 10,
                  height: "100%",
                }}
              >
                <CheckCircle
                  size={17}
                  style={{
                    color: "#1b9c86",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />

                <p
                  style={{
                    fontSize: 14,
                    color: "#475569",
                    lineHeight: 1.6,
                  }}
                >
                  Rigid 72-hour scheduling rules fail urgent but non-emergency
                  medical events.
                </p>
              </div>

              {/* 13 Strong signal cases */}
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                  borderTop: "3px solid #1b9c86",
                  padding: "18px 20px",
                }}
              >
                <p
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "#1b9c86",
                    lineHeight: 1,
                  }}
                >
                  13
                </p>

                <p
                  style={{
                    fontSize: 13,
                    color: "#64748b",
                    marginTop: 7,
                    fontWeight: 500,
                  }}
                >
                  Strong signal cases
                </p>
              </div>
            </div>

            {/* ==================================================
        THIRD COLUMN
    ================================================== */}
            <div
              style={{
                display: "grid",
                gridTemplateRows: "1fr auto",
                gap: 12,
              }}
            >
              {/* Family cost finding */}
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 12,
                  padding: 18,
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  gap: 10,
                  height: "100%",
                }}
              >
                <CheckCircle
                  size={17}
                  style={{
                    color: "#1b9c86",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />

                <p
                  style={{
                    fontSize: 14,
                    color: "#475569",
                    lineHeight: 1.6,
                  }}
                >
                  Families absorb cost and stress when systems default to
                  ambulance plus paid rideshare.
                </p>
              </div>

              {/* Two smaller statistic cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {/* 4+ Patient segments */}
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    borderTop: "3px solid #0c6bc2",
                    padding: "18px 20px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#0c6bc2",
                      lineHeight: 1,
                    }}
                  >
                    4+
                  </p>

                  <p
                    style={{
                      fontSize: 13,
                      color: "#64748b",
                      marginTop: 7,
                      fontWeight: 500,
                    }}
                  >
                    Patient segments
                  </p>
                </div>

                {/* 0 Dominant solutions */}
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    borderTop: "3px solid #052b56",
                    padding: "18px 20px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#052b56",
                      lineHeight: 1,
                    }}
                  >
                    0
                  </p>

                  <p
                    style={{
                      fontSize: 13,
                      color: "#64748b",
                      marginTop: 7,
                      fontWeight: 500,
                    }}
                  >
                    Dominant solutions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ======================================================
          FOOTER
      ====================================================== */}
      <footer
        style={{
          background: "#18185c",
          color: "#ffffff",
          padding: "40px 24px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 32,
              flexWrap: "wrap",
              paddingBottom: 28,
              borderBottom: "1px solid #5f236c33",
            }}
          >
            <div
              style={{
                maxWidth: 420,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <Image
                  src="/carepath-logo.png"
                  alt="CarePath"
                  width={38}
                  height={38}
                  style={{
                    borderRadius: 8,
                    objectFit: "contain",
                  }}
                />

                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                  }}
                >
                  CarePath
                </span>
              </div>

              <p
                style={{
                  color: "rgba(234, 222, 222, 0.72)",
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                Coordinating reliable transportation so patients can reach
                essential medical care.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: 48,
                flexWrap: "wrap",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 12,
                  }}
                >
                  Patients
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 9,
                  }}
                >
                  <Link
                    href="/patient/request-ride"
                    style={{
                      color: "rgba(210, 220, 220, 0.72)",
                      fontSize: 14,
                      textDecoration: "none",
                    }}
                  >
                    Patient Intake
                  </Link>

                  <Link
                    href="/customer/login"
                    style={{
                      color: "rgba(255, 255, 255, 0.72)",
                      fontSize: 14,
                      textDecoration: "none",
                    }}
                  >
                    Request a Ride
                  </Link>

                  <Link
                    href="/patient/intake"
                    style={{
                      color: "rgba(255, 255, 255, 0.72)",
                      fontSize: 14,
                      textDecoration: "none",
                    }}
                  >
                    Customer Login
                  </Link>
                </div>
              </div>

              <div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 12,
                  }}
                >
                  CarePath Team
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 9,
                  }}
                >
                  <Link
                    href="/driver/login"
                    style={{
                      color: "rgba(255, 255, 255, 0.72)",
                      fontSize: 14,
                      textDecoration: "none",
                    }}
                  >
                    Driver Login
                  </Link>

                  <Link
                    href="/coordinator"
                    style={{
                      color: "rgba(255, 255, 255, 0.72)",
                      fontSize: 14,
                      textDecoration: "none",
                    }}
                  >
                    Coordinator Hub
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <p
            style={{
              paddingTop: 20,
              textAlign: "center",
              color: "rgba(255, 255, 255, 0.58)",
              fontSize: 13,
            }}
          >
            © 2026 CarePath. Medical transportation coordination platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
