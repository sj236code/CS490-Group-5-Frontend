import { useState, useEffect, useRef } from "react";
import { User } from "lucide-react";
import {useNavigate} from "react-router-dom";

function UserProf({ user, userType, ownerSalonId, onLogout }) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();

    if (!user) return null;

    const displayName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();

    const effectiveSalonId = ownerSalonId ?? user?.profile_id ?? user?.id ?? null;

    const toggleOpen = () => {
        setOpen((prev) => !prev);
    };

    const handleLogoutClick = () => {
        console.log("Logout button clicked");
        if (onLogout) {
            onLogout();
            console.log("Logout succeeded");
        }
        setOpen(false); // closes the dropdown after logout
    };

      const handleSettingsClick = () => {
        // OWNER → same salon settings as SalonOwnerNavBar
        if (userType === "OWNER") {
            navigate("/salonSettings", {
                state: {
                    salonId: effectiveSalonId,
                    user,
                },
            });
        }
        else if (userType === "CUSTOMER") {
            navigate("/customerSettings", {
                state: {
                    user,
                    customerId: user?.profile_id ?? user?.id,
                },
            });
        } 
        else if (userType === "EMPLOYEE") {
            navigate("/employeeSettings", {
                state: {
                    user,
                    employeeId: user?.profile_id ?? user?.id,
                },
            });
        } 
        else if (userType === "ADMIN") {
            navigate("/adminSettings", {
                state: {
                    user,
                },
            });
        } 
        else{}
        setOpen(false);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className="userprof-wrapper">
        {/* Profile pill */}
        <div className="userprof-pill" onClick={toggleOpen}>
            <User size={18} strokeWidth={2} />
            <span>{displayName}</span>
        </div>

        {/* Dropdown */}
        {open && (
            <div className="userprof-dropdown">
            <button
                type="button"
                className="userprof-dropdown-item"
                onClick={handleSettingsClick}
            >
                Settings
            </button>
            <button
                type="button"
                className="userprof-dropdown-item"
                onClick={handleLogoutClick}
            >
                Logout
            </button>
            </div>
        )}
        </div>
    );
}

export default UserProf;
