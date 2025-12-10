import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  CircleUserRound,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, "")
  : "";

/* NavBar component for an salon owner user */
function SalonOwnerNavBar({ onClose, onLogout, userId, user, salonId }) {
    const navigate = useNavigate();

    const [verificationStatus, setVerificationStatus] = useState(null);

    useEffect(() => {
        const resolvedSalonId = salonId ?? user?.profile_id ?? userId ?? null;
        if (!resolvedSalonId) {
        return;
        }

        const controller = new AbortController();

        const fetchStatus = async () => {
        try {
            const res = await fetch(
            `${API_BASE}/api/salon_register/${resolvedSalonId}/verification_status`,
            { signal: controller.signal },
            );
            if (!res.ok) {
            console.error("Failed to fetch verification status");
            return;
            }
            const data = await res.json();
            setVerificationStatus(data.status);
        } catch (err) {
            if (err.name !== "AbortError") {
            console.error("Error fetching verification status:", err);
            }
        }
        };

        fetchStatus();

        return () => controller.abort();
    }, [salonId, user?.profile_id, userId]);

    const isVerified = verificationStatus === "APPROVED";

    const navTo = (path) => {
        const effectiveSalonId = salonId ?? user?.profile_id ?? userId ?? null;
        navigate(path, { state: { userId, user, salonId: effectiveSalonId } });
        onClose();
    };

    const navToDashboard = () => {
        navigate("/salonDashboard", {
        state: {
            salon: {
            id: salonId,
            },
            userId,
            user,
        },
        });
        onClose();
    };

    const navToSettings = () => {
        const effectiveSalonId = salonId ?? user?.profile_id ?? userId ?? null;
        navigate("/salonSettings", {
        state: {
            salonId: effectiveSalonId,
            user,
        },
        });
        onClose();
    };

    const displayName = user?.first_name
        ? `${user.first_name} ${user.last_name ?? ""}`.trim()
        : "SalonOwner";
    const employeeNumber = user?.profile_id ?? userId ?? "-";
    const effectiveSalonId = salonId ?? user?.profile_id ?? userId ?? null;

    const handleLogout = () => {
        console.log("Logout button clicked");
        if (onLogout) {
        onLogout();
        console.log("Logout succeeded");
        }
        onClose();
    };

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
                <p className="nb-user-tag">Salon Owner #{employeeNumber}</p>
                <div className="nb-verified">
                <ShieldCheck className="nb-verified-icon" />
                <span>
                    {isVerified
                    ? "Verified"
                    : verificationStatus === "REJECTED"
                    ? "Verification Rejected"
                    : "Pending Verification"}
                </span>
                </div>
            </div>
            </div>

            {/* Navigation Links */}

            {/* MyJade Account */}
            <div className="nb-section">
            <div className="nb-section-title">MyJade Account</div>
            <button className="nb-text-link" onClick={handleLogout}>
                Log Out
            </button>
            </div>

            {/* Salon Owner */}
            <div className="nb-section">
            <div className="nb-section-title">Salon Owner</div>

            {isVerified ? (
                <>
                <button className="nb-text-link" onClick={navToDashboard}>
                    Dashboard
                </button>
                <button className="nb-text-link" onClick={navToSettings}>
                    Settings
                </button>
                <button
                    className="nb-text-link"
                    onClick={() => navTo("/salonPayments")}
                >
                    Payments
                </button>
                </>
            ) : (
                <div className="nb-pending-message">
                <p className="nb-pending-title">
                    Your salon is not yet verified.
                </p>
                <p className="nb-pending-body">
                    Your salon registration has been submitted. Please wait to be
                    approved by an admin before accessing your Dashboard, Settings,
                    Payments, and Appointments.
                </p>
                {effectiveSalonId && (
                    <p className="nb-pending-id">
                    Salon ID: <strong>{effectiveSalonId}</strong>
                    </p>
                )}
                </div>
            )}
            </div>

            {/* Footer */}
            <div className="nb-footer">
            <button
                className="nb-footer-link"
                onClick={() => navTo("/contact")}
            >
                Contact
            </button>
            <button className="nb-footer-link" onClick={() => navTo("/faq")}>
                FAQ
            </button>
            <div className="nb-footer-link">Copywright ©</div>
            </div>
        </div>
        </div>
    );
}

export default SalonOwnerNavBar;
