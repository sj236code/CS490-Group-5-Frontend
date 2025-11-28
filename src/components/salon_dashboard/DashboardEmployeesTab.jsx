import React, { useState, useEffect } from "react";
import {
  Check,
  X,
  Users,
  ArrowUpDown,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

function DashboardEmployeesTab({ salon }) {
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | PENDING | APPROVED | REJECTED
    const [sortBy, setSortBy] = useState("STATUS"); // STATUS | NAME
    const [sortDirection, setSortDirection] = useState("ASC"); // ASC | DESC

    // Fetch employees when salon changes
    useEffect(() => {
        if (salon?.id) {
            fetchEmployees();
        }
    }, [salon?.id]);

    const fetchEmployees = async () => {
        if (!salon?.id) return;

        setIsLoading(true);
        setError(null);

        try {
        const API_URL = import.meta.env.VITE_API_URL;
        const statuses = ["inactive", "APPROVED", "REJECTED"];

        const results = await Promise.all(
            statuses.map(async (status) => {
            const res = await fetch(
                `${API_URL}/api/employee/verification/${salon.id}?status=${status}`
            );
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to load employees");
            }

            return Array.isArray(data.employees) ? data.employees : [];
            })
        );

        const mergedEmployees = results.flat();
        setEmployees(mergedEmployees);
        console.log("Employees loaded: ", mergedEmployees);
        } catch (err) {
        console.error("Unable to fetch employees. Error:", err);
        setError(err.message || "Unable to fetch employees");
        } finally {
        setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (employeeId, newStatus) => {
        try {
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await fetch(
            `${API_URL}/api/employee/verification/${employeeId}`,
            {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ employment_status: newStatus }),
            }
        );

        const data = await res.json();

        if (!res.ok) {
            console.error("Failed to update employee status:", data);
            alert(data.message || "Failed to update employee status");
            return;
        }

        console.log("Employee status updated:", data);

        // Update local state
        setEmployees((prev) =>
            prev.map((emp) =>
            emp.id === employeeId
                ? { ...emp, employment_status: newStatus }
                : emp
            )
        );
        } catch (err) {
        console.error("Error updating employee status:", err);
        alert("Error updating employee status");
        }
    };

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
    };

    const handleSortByChange = (e) => {
        setSortBy(e.target.value);
    };

    const toggleSortDirection = () => {
        setSortDirection((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    };

    const getStatusOrder = (status) => {
        // Order: PENDING -> APPROVED -> REJECTED
        if (status === "PENDING") return 0;
        if (status === "APPROVED") return 1;
        if (status === "REJECTED") return 2;
        return 3;
    };

    // Filter + sort employees
    const filteredEmployees = employees.filter((emp) => {
        if (statusFilter === "ALL") return true;
        return emp.employment_status === statusFilter;
    });

    const sortedEmployees = [...filteredEmployees].sort((a, b) => {
        let compare = 0;

        if (sortBy === "STATUS") {
        compare =
            getStatusOrder(a.employment_status) -
            getStatusOrder(b.employment_status);
        } else if (sortBy === "NAME") {
        const nameA = `${a.first_name || ""} ${a.last_name || ""}`.trim().toLowerCase();
        const nameB = `${b.first_name || ""} ${b.last_name || ""}`.trim().toLowerCase();
        compare = nameA.localeCompare(nameB);
        }

        return sortDirection === "ASC" ? compare : -compare;
    });

    if (!salon?.id) {
        return <p>No salon selected.</p>;
    }

    return (
        <div className="employee-manage-container">
        {/* Header / Controls */}
        <div
            style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Users size={24} />
            <h2 className="shop-service-title">Employees</h2>
            </div>

            <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
            }}
            >
            {/* Status Filter */}
            <div className="employee-filter-group">
                <label
                htmlFor="statusFilter"
                style={{ fontSize: "0.85rem", marginRight: "0.25rem" }}
                >
                Status:
                </label>
                <select
                id="statusFilter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="employee-select"
                >
                <option value="ALL">All</option>
                <option value="Inactive">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                </select>
            </div>

            {/* Sort By */}
            <div className="employee-filter-group">
                <label
                htmlFor="sortBy"
                style={{ fontSize: "0.85rem", marginRight: "0.25rem" }}
                >
                Sort by:
                </label>
                <select
                id="sortBy"
                value={sortBy}
                onChange={handleSortByChange}
                className="employee-select"
                >
                <option value="STATUS">Status</option>
                <option value="NAME">Name (A–Z)</option>
                </select>
            </div>

            {/* Sort Direction */}
            <button
                type="button"
                onClick={toggleSortDirection}
                className="employee-sort-btn"
                style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.35rem 0.6rem",
                }}
            >
                <ArrowUpDown size={16} />
                <span style={{ fontSize: "0.85rem" }}>
                {sortDirection === "ASC" ? "Asc" : "Desc"}
                </span>
            </button>
            </div>
        </div>

        {/* Loading / Error States */}
        {isLoading && <p>Loading employees...</p>}
        {error && (
            <p style={{ color: "red", marginBottom: "0.5rem" }}>
            {error}
            </p>
        )}

        {/* Empty State */}
        {!isLoading && sortedEmployees.length === 0 && (
            <p>No employees found for this salon.</p>
        )}

        {/* Employee List */}
        <div className="employee-list">
            {sortedEmployees.map((emp) => {
            const fullName = `${emp.first_name || ""} ${
                emp.last_name || ""
            }`.trim();

            const isPending = emp.employment_status === "inactive";

            return (
                <div key={emp.id} className="employee-card">
                <div
                    className="employee-card-header"
                    style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.25rem",
                    }}
                >
                    <div>
                    <div className="employee-name">
                        {fullName || `Employee #${emp.id}`}
                    </div>
                    <div
                        className="employee-meta"
                        style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.8rem",
                        marginTop: "0.1rem",
                        }}
                    >
                        <span
                        className={`employee-status employee-status-${(
                            emp.employment_status || ""
                        ).toLowerCase()}`}
                        >
                        {emp.employment_status}
                        </span>
                        {emp.employee_type && (
                        <span className="employee-role-badge">
                            {emp.employee_type}
                        </span>
                        )}
                    </div>
                    </div>

                    {/* Approve / Reject Buttons for Pending Employees */}
                    {isPending && (
                    <div
                        className="employee-actions"
                        style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        }}
                    >
                        <button
                        type="button"
                        onClick={() =>
                            handleUpdateStatus(emp.id, "APPROVED")
                        }
                        className="employee-approve-btn"
                        title="Approve"
                        >
                        <Check size={18} />
                        </button>
                        <button
                        type="button"
                        onClick={() =>
                            handleUpdateStatus(emp.id, "REJECTED")
                        }
                        className="employee-reject-btn"
                        title="Reject"
                        >
                        <X size={18} />
                        </button>
                    </div>
                    )}
                </div>

                {/* Contact / Details row */}
                <div
                    className="employee-card-body"
                    style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    fontSize: "0.8rem",
                    }}
                >
                    {emp.email && (
                    <div
                        style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        }}
                    >
                        <Mail size={14} />
                        <span>{emp.email}</span>
                    </div>
                    )}

                    {emp.phone_number && (
                    <div
                        style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        }}
                    >
                        <Phone size={14} />
                        <span>{emp.phone_number}</span>
                    </div>
                    )}

                    {emp.address && (
                    <div
                        style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        }}
                    >
                        <MapPin size={14} />
                        <span>{emp.address}</span>
                    </div>
                    )}
                </div>
                </div>
            );
            })}
        </div>
        </div>
    );
}

export default DashboardEmployeesTab;
