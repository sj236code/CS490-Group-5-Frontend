import { useState, useEffect, useRef } from "react";
import { User } from "lucide-react";

function UserProf({ user, onLogout }) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    if (!user) return null;

    const displayName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();

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
            <button onClick={handleLogoutClick}>Logout</button>
            </div>
        )}
        </div>
    );
}

export default UserProf;
