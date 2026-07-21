"use client";

import { FormEvent, useState } from "react";

type Doctor = {
  id: string;
};

type EmergencyContact = {
  id: string;
};

type SectionHeaderProps = {
  icon: string;
  title: string;
  description: string;
};

function SectionHeader({
  icon,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div
      style={{
        marginBottom: "36px",
        paddingBottom: "18px",
        borderBottom: "1px solid #ede9f2",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          columnGap: "12px",
          rowGap: "8px",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            fontSize: "18px",
            lineHeight: 1,
          }}
        >
          {icon}
        </span>

        <h2
          style={{
            margin: 0,
            color: "#703c91",
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
    </div>
  );
}

export default function PatientIntakePage() {
  const [doctors, setDoctors] = useState<Doctor[]>([
    { id: "doctor-1" },
  ]);

  const [emergencyContacts, setEmergencyContacts] = useState<
    EmergencyContact[]
  >([{ id: "contact-1" }]);

  function addDoctor() {
    setDoctors((currentDoctors) => [
      ...currentDoctors,
      { id: `doctor-${Date.now()}` },
    ]);
  }

  function removeDoctor(id: string) {
    setDoctors((currentDoctors) =>
      currentDoctors.filter((doctor) => doctor.id !== id),
    );
  }

  function addEmergencyContact() {
    setEmergencyContacts((currentContacts) => [
      ...currentContacts,
      { id: `contact-${Date.now()}` },
    ]);
  }

  function removeEmergencyContact(id: string) {
    setEmergencyContacts((currentContacts) =>
      currentContacts.filter((contact) => contact.id !== id),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Temporary until this form is connected to the CarePath API.
    alert("Patient intake profile saved!");
  }

  const cardStyles = "rounded-xl border bg-white";

  const cardPadding = {
    paddingTop: "28px",
    paddingBottom: "32px",
    paddingLeft: "42px",
    paddingRight: "42px",
  };

  const inputStyles =
    "mt-2 min-h-[48px] w-full rounded-lg border border-purple-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ae5a8b] focus:ring-4 focus:ring-[#ae5a8b]/10";

  const labelStyles = "block text-sm font-bold text-slate-700";

  const checkboxCardStyles =
    "flex cursor-pointer items-start gap-3 rounded-lg border border-purple-100 bg-[#fcf9fd] p-4 text-sm font-semibold text-slate-700 transition hover:border-[#ae5a8b]";

  return (
    <main
      className="min-h-screen px-4 py-10 sm:px-6"
      style={{
        background:
          "linear-gradient(135deg, #f8edf5 0%, #f8f9ff 48%, #edf4ff 100%)",
      }}
    >
      <div
        className="w-full"
        style={{
          maxWidth: "1100px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {/* Page heading */}
        <div className="mb-10 text-center">
          <p
            style={{
              marginBottom: "8px",
              color: "#ae5a8b",
              fontSize: "18px",
              fontWeight: 900,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            CarePath
          </p>

          <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
            Patient Intake Profile
          </h1>

          <p
            style={{
              maxWidth: "680px",
              margin: "18px auto 0",
              textAlign: "center",
              color: "#475569",
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            Tell us about your transportation, accessibility, and contact needs
            so we can provide safer and more dependable rides.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal information */}
          <section
            className={cardStyles}
            style={{
              ...cardPadding,
              borderColor: "#e8d8eb",
              boxShadow: "0 8px 24px rgba(85, 64, 161, 0.08)",
            }}
          >
            <SectionHeader
              icon="👤"
              title="Personal Information"
              description="Enter the patient’s basic identifying and address information."
            />

            <div className="grid gap-6 md:grid-cols-2">
              <label className={labelStyles}>
                First Name
                <input
                  type="text"
                  name="firstName"
                  required
                  autoComplete="given-name"
                  placeholder="First name"
                  className={inputStyles}
                />
              </label>

              <label className={labelStyles}>
                Last Name
                <input
                  type="text"
                  name="lastName"
                  required
                  autoComplete="family-name"
                  placeholder="Last name"
                  className={inputStyles}
                />
              </label>

              <label className={`${labelStyles} md:col-span-2`}>
                Street Address
                <input
                  type="text"
                  name="streetAddress"
                  required
                  autoComplete="street-address"
                  placeholder="123 Main Street, Apartment 4"
                  className={inputStyles}
                />
              </label>

              <label className={labelStyles}>
                City
                <input
                  type="text"
                  name="city"
                  required
                  autoComplete="address-level2"
                  placeholder="City"
                  className={inputStyles}
                />
              </label>

              <label className={labelStyles}>
                County
                <input
                  type="text"
                  name="county"
                  placeholder="County"
                  className={inputStyles}
                />
              </label>

              <label className={labelStyles}>
                State
                <input
                  type="text"
                  name="state"
                  required
                  autoComplete="address-level1"
                  placeholder="State"
                  className={inputStyles}
                />
              </label>

              <label className={labelStyles}>
                ZIP Code
                <input
                  type="text"
                  name="zipCode"
                  required
                  autoComplete="postal-code"
                  placeholder="ZIP code"
                  className={inputStyles}
                />
              </label>

              <label className={`${labelStyles} md:col-span-2`}>
                Date of Birth
                <input
                  type="date"
                  name="dateOfBirth"
                  className={inputStyles}
                />
              </label>
            </div>
          </section>

          {/* Contact information */}
          <section
            className={cardStyles}
            style={{
              ...cardPadding,
              borderColor: "#d9e6f7",
              boxShadow: "0 8px 24px rgba(12, 107, 194, 0.08)",
            }}
          >
            <SectionHeader
              icon="☎️"
              title="Contact and Communication"
              description="Choose how CarePath should contact the patient and send ride updates."
            />

            <div className="grid gap-6 md:grid-cols-2">
              <label className={labelStyles}>
                Phone Number
                <input
                  type="tel"
                  name="phone"
                  required
                  autoComplete="tel"
                  placeholder="(555) 555-5555"
                  className={inputStyles}
                />
              </label>

              <label className={labelStyles}>
                Email Address
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="patient@example.com"
                  className={inputStyles}
                />
              </label>

              <label className={labelStyles}>
                Primary Language
                <input
                  type="text"
                  name="primaryLanguage"
                  defaultValue="English"
                  placeholder="English"
                  className={inputStyles}
                />
              </label>

              <label className={labelStyles}>
                Preferred Method of Contact
                <select
                  name="preferredContactMethod"
                  required
                  defaultValue=""
                  className={inputStyles}
                >
                  <option value="" disabled>
                    Select a contact method
                  </option>
                  <option value="text-message">Text message</option>
                  <option value="phone-call">Phone call</option>
                  <option value="email">Email</option>
                  <option value="caregiver">Contact my caregiver</option>
                </select>
              </label>

              <label className={checkboxCardStyles}>
                <input
                  type="checkbox"
                  name="hasSmartphone"
                  className="mt-1 h-5 w-5 shrink-0 accent-[#ae5a8b]"
                />
                <span>The patient has access to a smartphone.</span>
              </label>

              <label className={checkboxCardStyles}>
                <input
                  type="checkbox"
                  name="appointmentReminders"
                  className="mt-1 h-5 w-5 shrink-0 accent-[#ae5a8b]"
                />
                <span>Send appointment and transportation reminders.</span>
              </label>
            </div>
          </section>

          {/* Coverage and ride planning */}
          <section
            className={cardStyles}
            style={{
              ...cardPadding,
              borderColor: "#d8e4f3",
              boxShadow: "0 8px 24px rgba(5, 43, 86, 0.07)",
            }}
          >
            <SectionHeader
              icon="🪪"
              title="Coverage and Ride Planning"
              description="Provide insurance, funding, and scheduling information used to coordinate transportation."
            />

            <div className="grid gap-6 md:grid-cols-2">
              <label className={labelStyles}>
                Transportation Funding Source
                <select
                  name="defaultFundingSource"
                  defaultValue=""
                  className={inputStyles}
                >
                  <option value="" disabled>
                    Select a funding source
                  </option>
                  <option value="MEDICAID_NEMT">Medicaid NEMT</option>
                  <option value="MEDICARE">Medicare</option>
                  <option value="PRIVATE_INSURANCE">
                    Private insurance
                  </option>
                  <option value="SELF_PAY">Self-pay</option>
                  <option value="FAMILY">Family assistance</option>
                  <option value="GRANT">
                    Grant or nonprofit assistance
                  </option>
                  <option value="OTHER">Other</option>
                </select>
              </label>

              <label className={labelStyles}>
                Primary Insurance Provider
                <input
                  type="text"
                  name="primaryInsuranceProvider"
                  placeholder="Insurance company name"
                  className={inputStyles}
                />
              </label>

              <label className={labelStyles}>
                Member or Policy ID
                <input
                  type="text"
                  name="insuranceMemberId"
                  placeholder="Member or policy number"
                  className={inputStyles}
                />
              </label>

              <label className={labelStyles}>
                Ride Scheduling Requirement
                <select
                  name="schedulingConstraint"
                  defaultValue="STANDARD"
                  className={inputStyles}
                >
                  <option value="STANDARD">Standard</option>
                  <option value="SAME_DAY">
                    Same-day scheduling permitted
                  </option>
                  <option value="ADVANCE_48H">
                    Must schedule 48 hours ahead
                  </option>
                  <option value="ADVANCE_72H">
                    Must schedule 72 hours ahead
                  </option>
                  <option value="OTHER">
                    Other scheduling requirement
                  </option>
                </select>
              </label>

              <label className={`${labelStyles} md:col-span-2`}>
                Other Coverage or Scheduling Information
                <textarea
                  name="coverageNotes"
                  rows={4}
                  placeholder="Include authorization requirements, transportation benefits, scheduling restrictions, or other helpful coverage information."
                  className={inputStyles}
                />
              </label>
            </div>
          </section>

          {/* Doctors */}
          <section
            className={cardStyles}
            style={{
              ...cardPadding,
              borderColor: "#e7d8ef",
              boxShadow: "0 8px 24px rgba(112, 60, 145, 0.08)",
            }}
          >
            <SectionHeader
              icon="🏥"
              title="Doctors and Medical Offices"
              description="Add each doctor, clinic, hospital, pharmacy, or treatment center the patient regularly visits."
            />

            <div className="space-y-6">
              {doctors.map((doctor, index) => (
                <div
                  key={doctor.id}
                  className="rounded-lg border border-purple-200 bg-[#fcf9fd] p-5 sm:p-6"
                >
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3
                      className="text-lg font-extrabold"
                      style={{ color: "#703c91" }}
                    >
                      Medical Provider #{index + 1}
                    </h3>

                    {doctors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDoctor(doctor.id)}
                        className="self-start rounded-md border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 sm:self-auto"
                      >
                        Remove Provider
                      </button>
                    )}
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <label className={labelStyles}>
                      Doctor or Provider Name
                      <input
                        type="text"
                        name={`doctors[${index}].providerName`}
                        required={index === 0}
                        placeholder="Dr. Jane Smith"
                        className={inputStyles}
                      />
                    </label>

                    <label className={labelStyles}>
                      Office or Facility Name
                      <input
                        type="text"
                        name={`doctors[${index}].facilityName`}
                        placeholder="Tulsa Medical Center"
                        className={inputStyles}
                      />
                    </label>

                    <label className={labelStyles}>
                      Specialty or Type of Care
                      <input
                        type="text"
                        name={`doctors[${index}].specialty`}
                        placeholder="Cardiology, dialysis, primary care"
                        className={inputStyles}
                      />
                    </label>

                    <label className={labelStyles}>
                      Office Phone Number
                      <input
                        type="tel"
                        name={`doctors[${index}].phone`}
                        placeholder="(555) 555-5555"
                        className={inputStyles}
                      />
                    </label>

                    <label className={`${labelStyles} md:col-span-2`}>
                      Office Address
                      <input
                        type="text"
                        name={`doctors[${index}].address`}
                        placeholder="Medical office street address"
                        className={inputStyles}
                      />
                    </label>

                    <label className={`${labelStyles} md:col-span-2`}>
                      Transportation or Appointment Notes
                      <textarea
                        name={`doctors[${index}].notes`}
                        rows={3}
                        placeholder="Examples: treatment schedule, entrance location, pickup instructions, or appointment timing."
                        className={inputStyles}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addDoctor}
              className="mt-7 w-full rounded-lg border-2 border-dashed border-[#ae5a8b] bg-[#fdf6fa] px-8 py-4 text-base font-extrabold text-[#8f4773] transition hover:bg-[#f8eaf2]"
              style={{
                minHeight: "58px",
              }}
            >
              ＋ Add Another Doctor or Medical Office
            </button>
          </section>

          {/* Accessibility */}
          <section
            className={cardStyles}
            style={{
              ...cardPadding,
              borderColor: "#d5ece7",
              boxShadow: "0 8px 24px rgba(27, 156, 134, 0.08)",
            }}
          >
            <SectionHeader
              icon="♿"
              title="Accessibility and Transportation Needs"
              description="Select anything that may affect the vehicle, pickup, drop-off, or assistance required."
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["wheelchairAccess", "Wheelchair-accessible vehicle"],
                [
                  "nonTransferableWheelchair",
                  "Non-transferable wheelchair",
                ],
                ["stretcher", "Stretcher transportation"],
                ["walker", "Uses a walker"],
                ["cane", "Uses a cane"],
                ["oxygen", "Travels with oxygen"],
                ["serviceAnimal", "Travels with a service animal"],
                ["caregiver", "Caregiver or companion rides along"],
                ["doorAssistance", "Needs door-to-door assistance"],
                ["visionAssistance", "Vision-related assistance"],
                ["hearingAssistance", "Hearing-related assistance"],
              ].map(([name, label]) => (
                <label key={name} className={checkboxCardStyles}>
                  <input
                    type="checkbox"
                    name={name}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[#ae5a8b]"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <label className={`${labelStyles} mt-6`}>
              Other Accessibility or Transportation Needs
              <textarea
                name="otherAccessibilityNeeds"
                rows={4}
                placeholder="Describe any other mobility, communication, vehicle, pickup, or drop-off needs."
                className={inputStyles}
              />
            </label>
          </section>

          {/* Transportation barriers */}
          <section
            className={cardStyles}
            style={{
              ...cardPadding,
              borderColor: "#eadfc8",
              boxShadow: "0 8px 24px rgba(170, 110, 30, 0.06)",
            }}
          >
            <SectionHeader
              icon="🚧"
              title="Transportation Barriers"
              description="Explain circumstances that make it difficult for the patient to reach medical care."
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["noVehicle", "No personal vehicle"],
                ["noBackupDriver", "No backup driver"],
                ["limitedPublicTransit", "Limited public transit"],
                ["ruralLocation", "Rural or remote location"],
                ["financialBarrier", "Transportation cost concerns"],
                ["unreliableTransportation", "Unreliable transportation"],
              ].map(([name, label]) => (
                <label key={name} className={checkboxCardStyles}>
                  <input
                    type="checkbox"
                    name={name}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[#ae5a8b]"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <label className={`${labelStyles} mt-6`}>
              Other Transportation Barriers
              <textarea
                name="transportationBarriers"
                rows={4}
                placeholder="Describe any additional transportation difficulties or recurring concerns."
                className={inputStyles}
              />
            </label>
          </section>

          {/* Emergency contacts */}
          <section
            className={cardStyles}
            style={{
              ...cardPadding,
              borderColor: "#f3d7df",
              boxShadow: "0 8px 24px rgba(190, 57, 93, 0.07)",
            }}
          >
            <SectionHeader
              icon="🚨"
              title="Emergency Contacts"
              description="Add one or more people CarePath may contact if there is an urgent problem."
            />

            <div className="space-y-6">
              {emergencyContacts.map((contact, index) => (
                <div
                  key={contact.id}
                  className="rounded-lg border border-rose-200 bg-[#fff9fa] p-5 sm:p-6"
                >
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-extrabold text-rose-700">
                      Emergency Contact #{index + 1}
                    </h3>

                    {emergencyContacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeEmergencyContact(contact.id)
                        }
                        className="self-start rounded-md border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 sm:self-auto"
                      >
                        Remove Contact
                      </button>
                    )}
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    <label className={labelStyles}>
                      Full Name
                      <input
                        type="text"
                        name={`emergencyContacts[${index}].name`}
                        required={index === 0}
                        placeholder="Contact name"
                        className={inputStyles}
                      />
                    </label>

                    <label className={labelStyles}>
                      Phone Number
                      <input
                        type="tel"
                        name={`emergencyContacts[${index}].phone`}
                        required={index === 0}
                        placeholder="(555) 555-5555"
                        className={inputStyles}
                      />
                    </label>

                    <label className={labelStyles}>
                      Relationship
                      <input
                        type="text"
                        name={`emergencyContacts[${index}].relationship`}
                        required={index === 0}
                        placeholder="Family, friend, caregiver"
                        className={inputStyles}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addEmergencyContact}
              className="mt-7 w-full rounded-lg border-2 border-dashed border-rose-400 bg-rose-50 px-8 py-4 text-base font-extrabold text-rose-700 transition hover:bg-rose-100"
              style={{
                minHeight: "58px",
              }}
            >
              ＋ Add Another Emergency Contact
            </button>
          </section>

          {/* Driver preferences */}
          <section
            className={cardStyles}
            style={{
              ...cardPadding,
              borderColor: "#dce4f3",
              boxShadow: "0 8px 24px rgba(5, 43, 86, 0.07)",
            }}
          >
            <SectionHeader
              icon="🚗"
              title="Driver Preferences"
              description="These preferences can help coordinators make safe and comfortable ride assignments."
            />

            <div className="grid gap-6 md:grid-cols-2">
              <label className={labelStyles}>
                Preferred Drivers
                <textarea
                  name="preferredDrivers"
                  rows={5}
                  placeholder="List drivers the patient has had a positive experience with."
                  className={inputStyles}
                />
              </label>

              <label className={labelStyles}>
                Drivers to Avoid
                <textarea
                  name="driversToAvoid"
                  rows={5}
                  placeholder="List driver restrictions or concerns. Include an explanation when appropriate."
                  className={inputStyles}
                />
              </label>
            </div>
          </section>

          {/* Additional notes */}
          <section
            className={cardStyles}
            style={{
              ...cardPadding,
              borderColor: "#eadcf1",
              boxShadow: "0 8px 24px rgba(174, 90, 139, 0.08)",
            }}
          >
            <SectionHeader
              icon="📝"
              title="Other Things We Should Know"
              description="Share anything else that may make transportation safer, easier, or more comfortable."
            />

            <label className={labelStyles}>
              Additional Notes
              <textarea
                name="additionalNotes"
                rows={7}
                placeholder="Examples: gate codes, pickup instructions, communication preferences, anxiety concerns, scheduling limitations, caregiver information, or other helpful details."
                className={inputStyles}
              />
            </label>
          </section>

          {/* Form buttons */}
          <div className="flex flex-col-reverse gap-4 pb-8 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="rounded-lg border border-slate-300 bg-white px-10 py-4 text-base font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-100"
              style={{
                minHeight: "58px",
                minWidth: "180px",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg px-10 py-4 text-base font-extrabold text-white transition hover:brightness-95"
              style={{
                minHeight: "58px",
                minWidth: "250px",
                background:
                  "linear-gradient(90deg, #ae5a8b 0%, #703c91 100%)",
                boxShadow: "0 8px 20px rgba(174, 90, 139, 0.30)",
              }}
            >
              Save Patient Intake
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}