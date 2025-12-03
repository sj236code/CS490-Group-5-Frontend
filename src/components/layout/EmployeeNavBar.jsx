import React, { useEffect, useState } from "react";
import { ChevronLeft, CircleUserRound, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, "")
  : "";

/* NavBar component for an employee user */
function EmployeeNavBar({ onClose, onLogout, userId, user }) {
    const navigate = useNavigate();

    const [employmentStatus, setEmploymentStatus] = useState(null);

    useEffect(() => {
        const employeeProfileId = user?.profile_id ?? userId ?? null;
        if (!employeeProfileId) {
        return;
        }

        const controller = new AbortController();

        const fetchStatus = async () => {
        try {
            const res = await fetch(
            `${API_BASE}/api/employee/verification/status/${employeeProfileId}`,
            { signal: controller.signal }
            );
            if (!res.ok) {
            console.error("Failed to fetch employee verification status");
            return;
            }
            const data = await res.json();
            setEmploymentStatus(data.status);
        } catch (err) {
            if (err.name !== "AbortError") {
            console.error("Error fetching employee verification status:", err);
            }
        }
        };

        fetchStatus();

        return () => controller.abort();
    }, [user?.profile_id, userId]);

    const isVerified = employmentStatus === "APPROVED";
    const isPending = employmentStatus === "INACTIVE";
    const isRejected = employmentStatus === "REJECTED";

    const navTo = (path) => {
        navigate(path, { state: { userId, user } });
        onClose();
    };

    const handleLogout = () => {
        console.log("Logout button clicked");
        if (onLogout) {
        onLogout();
        console.log("Logout succeeded");
        }
        onClose();
    };

    const displayName = user?.first_name
        ? `${user.first_name} ${user.last_name ?? ""}`.trim()
        : "Employee";

    const employeeNumber = user?.profile_id ?? userId ?? "-";

    return (
        <div className="nav-bar-overlay" onClick={onClose}>
        <div className="nav-bar" onClick={(e) => e.stopPropagation()}>
            <button className="nav-close-button" onClick={onClose}>
            <ChevronLeft strokeWidth={3} />
            </button>

            {/* Profile Section */}
            <div className="nb-profile-section">
            <CircleUserRound className="nb-profile-icon" />
            <div className="nb-profile-info">
                <p className="nb-user-name">{displayName}</p>
                <p className="nb-user-tag">Employee #{employeeNumber}</p>
                <div className="nb-verified">
                <ShieldCheck className="nb-verified-icon" />
                <span>
                    {isVerified
                    ? "Verified"
                    : isRejected
                    ? "Verification Rejected"
                    : "Pending Verification"}
                </span>
                </div>
            </div>
            </div>

            {/* MyJade Account */}
            <div className="nb-section">
            <div className="nb-section-title">MyJade Account</div>

            {isVerified ? (
                <>
                <button
                    className="nb-text-link"
                    onClick={() => navTo("/employee-appointments")}
                >
                    Appointments
                </button>
                <button
                    className="nb-text-link"
                    onClick={() => navTo("/employee-availability")}
                >
                    Scheduling
                </button>
                <button
                    className="nb-text-link"
                    onClick={() => navTo("/employee-payment-portal")}
                >
                    Payment Portal
                </button>
                </>
            ) : isRejected ? (
                <div className="nb-pending-message">
                <p className="nb-pending-title">
                    Your employee application was rejected.
                </p>
                <p className="nb-pending-body">
                    Unfortunately, your employee account was not approved at this
                    time. Please contact the salon owner directly for more details
                    or next steps.
                </p>
                <p className="nb-pending-id">
                    Employee ID: <strong>{employeeNumber}</strong>
                </p>
                </div>
            ) : (
                <div className="nb-pending-message">
                <p className="nb-pending-title">
                    Your employee account is not yet verified.
                </p>
                <p className="nb-pending-body">
                    Your application has been submitted. Please wait to be approved
                    by the salon owner or an admin before accessing your
                    Appointments, Scheduling, Payment Portal, and Messages.
                </p>
                <p className="nb-pending-id">
                    Employee ID: <strong>{employeeNumber}</strong>
                </p>
                </div>
            )}

            <button className="nb-text-link" onClick={handleLogout}>
                Log Out
            </button>
            </div>

            {/* Footer */}
            <div className="nb-footer">
            <button className="nb-footer-link" onClick={() => navTo("/contact")}>
                Contact
            </button>
            <button className="nb-footer-link" onClick={() => navTo("/faq")}>
                FAQ
            </button>
            <div className="nb-footer-link">Copyright ©</div>
            </div>
        </div>
        </div>
    );
}

export default EmployeeNavBar;
