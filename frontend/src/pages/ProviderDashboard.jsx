
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProviderDashboard.css";
import PanelNavigation from "../components/PanelNavigation";

const API_URL = "http://localhost:5000/api/provider";

function ProviderDashboard() {
    const navigate = useNavigate();

    const [provider, setProvider] = useState(null);
    const [stats, setStats] = useState({
        totalRequests: 0,
        pendingRequests: 0,
        acceptedRequests: 0,
        activeJobs: 0,
        completedJobs: 0,
        rejectedRequests: 0,
        cancelledRequests: 0
    });

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [notice, setNotice] = useState("");

    const getHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
    });

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const [dashboardResponse, bookingsResponse] = await Promise.all([
                fetch(`${API_URL}/dashboard`, {
                    headers: getHeaders()
                }),
                fetch(`${API_URL}/bookings`, {
                    headers: getHeaders()
                })
            ]);

            if (
                dashboardResponse.status === 401 ||
                bookingsResponse.status === 401
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            const dashboardData = await dashboardResponse.json();
            const bookingsData = await bookingsResponse.json();

            if (!dashboardResponse.ok) {
                throw new Error(
                    dashboardData.message || "Could not load dashboard statistics"
                );
            }

            if (!bookingsResponse.ok) {
                throw new Error(
                    bookingsData.message || "Could not load service requests"
                );
            }

            setProvider(dashboardData.provider);
            setStats(dashboardData.stats);
            setBookings(bookingsData.bookings || []);
        } catch (err) {
            setError(
                err.message || "Unable to connect to the server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const updateStatus = async (bookingId, status) => {
        setUpdatingId(bookingId);
        setError("");
        setNotice("");

        try {
            const response = await fetch(
                `${API_URL}/bookings/${bookingId}/status`,
                {
                    method: "PATCH",
                    headers: getHeaders(),
                    body: JSON.stringify({ status })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not update booking");
            }

            setNotice(data.message || "Booking updated successfully.");
            await loadDashboard();
        } catch (err) {
            setError(err.message || "Could not update booking status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const getNextActions = (booking) => {
        switch (booking.status) {
            case "Pending":
                return (
                    <>
                        <button
                            className="provider-action provider-action-primary"
                            disabled={updatingId === booking._id}
                            onClick={() => updateStatus(booking._id, "Accepted")}
                        >
                            Accept
                        </button>
                        <button
                            className="provider-action provider-action-danger"
                            disabled={updatingId === booking._id}
                            onClick={() => updateStatus(booking._id, "Rejected")}
                        >
                            Reject
                        </button>
                    </>
                );

            case "Accepted":
                return (
                    <button
                        className="provider-action provider-action-primary"
                        disabled={updatingId === booking._id}
                        onClick={() => updateStatus(booking._id, "In Progress")}
                    >
                        Start Job
                    </button>
                );

            case "In Progress":
                return (
                    <button
                        className="provider-action provider-action-primary"
                        disabled={updatingId === booking._id}
                        onClick={() => updateStatus(booking._id, "Completed")}
                    >
                        Complete Job
                    </button>
                );

            default:
                return (
                    <span className="provider-no-action">
                        No further actions
                    </span>
                );
        }
    };

    const formatDate = (date) => {
        if (!date) return "Date unavailable";

        return new Date(date).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short"
        });
    };

    return (
        <div className="provider-page">
            <header className="provider-header">
                <div className="provider-brand">
                    <span className="provider-logo">R</span>
                    <span>
                        RoadMate<span className="provider-dot">.</span>
                    </span>
                </div>

                <PanelNavigation activePanel="provider" />
            </header>

            <main className="provider-container">
                <section className="provider-welcome">
                    <div>
                        <span className="provider-eyebrow">
                            PROVIDER WORKSPACE
                        </span>

                        <h1>
                            Welcome{provider?.name ? `, ${provider.name}` : ""} to
                            your Provider Panel<span>.</span>
                        </h1>

                        <p>
                            Manage roadside assistance requests and help customers
                            get back on the road.
                        </p>

                        <button onClick={() => navigate("/dashboard")}>
                            Explore Customer Panel →
                        </button>
                    </div>

                    <div className="provider-illustration">🛠️</div>
                </section>

                {error && (
                    <div className="provider-message provider-message-error">
                        {error}
                    </div>
                )}

                {notice && (
                    <div className="provider-message provider-message-success">
                        {notice}
                    </div>
                )}

                <div className="provider-section-heading">
                    <div>
                        <h2>Dashboard Overview</h2>
                        <p>Track your service requests and completed work.</p>
                    </div>

                    <button
                        className="provider-refresh"
                        onClick={loadDashboard}
                        disabled={loading}
                    >
                        {loading ? "Refreshing..." : "↻ Refresh"}
                    </button>
                </div>

                <section className="provider-stats">
                    <article className="provider-stat">
                        <span className="provider-stat-icon">📋</span>
                        <p>Total Requests</p>
                        <h2>{loading ? "—" : stats.totalRequests}</h2>
                        <small>Requests assigned to you</small>
                    </article>

                    <article className="provider-stat">
                        <span className="provider-stat-icon">⏳</span>
                        <p>Pending Requests</p>
                        <h2>{loading ? "—" : stats.pendingRequests}</h2>
                        <small>Awaiting your response</small>
                    </article>

                    <article className="provider-stat">
                        <span className="provider-stat-icon">🔧</span>
                        <p>Active Jobs</p>
                        <h2>{loading ? "—" : stats.activeJobs}</h2>
                        <small>Jobs currently in progress</small>
                    </article>

                    <article className="provider-stat">
                        <span className="provider-stat-icon">✅</span>
                        <p>Completed Jobs</p>
                        <h2>{loading ? "—" : stats.completedJobs}</h2>
                        <small>Successfully completed</small>
                    </article>
                </section>

                <section className="provider-requests">
                    <div className="provider-requests-heading">
                        <div>
                            <h2>Service Requests</h2>
                            <p>
                                Review requests and update their progress.
                            </p>
                        </div>

                        <span className="provider-request-count">
                            {bookings.length} request
                            {bookings.length !== 1 ? "s" : ""}
                        </span>
                    </div>

                    {loading ? (
                        <div className="provider-empty">
                            <span>⏳</span>
                            <h3>Loading your requests...</h3>
                            <p>Please wait while we fetch your latest data.</p>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="provider-empty">
                            <span>🛣️</span>
                            <h3>Ready for your first request?</h3>
                            <p>
                                No requests are assigned to your services yet.
                                Make sure a service is assigned to your provider
                                account.
                            </p>
                        </div>
                    ) : (
                        <div className="provider-booking-list">
                            {bookings.map((booking) => (
                                <article
                                    className="provider-booking-card"
                                    key={booking._id}
                                >
                                    <div className="provider-booking-top">
                                        <div>
                                            <span className="provider-booking-category">
                                                {booking.service?.category ||
                                                    "Roadside Assistance"}
                                            </span>

                                            <h3>
                                                {booking.service?.name ||
                                                    "Service request"}
                                            </h3>
                                        </div>

                                        <span
                                            className={`provider-status provider-status-${(
                                                booking.status || "Pending"
                                            )
                                                .toLowerCase()
                                                .replace(/\s+/g, "-")}`}
                                        >
                                            {booking.status}
                                        </span>
                                    </div>

                                    <div className="provider-booking-details">
                                        <p>
                                            <strong>Customer:</strong>{" "}
                                            {booking.user?.name || "Unavailable"}
                                        </p>

                                        <p>
                                            <strong>Email:</strong>{" "}
                                            {booking.user?.email || "Unavailable"}
                                        </p>

                                        <p>
                                            <strong>Vehicle:</strong>{" "}
                                            {booking.vehicleType || "N/A"}
                                        </p>

                                        <p>
                                            <strong>Vehicle number:</strong>{" "}
                                            {booking.vehicleNumber || "N/A"}
                                        </p>

                                        <p>
                                            <strong>Location:</strong>{" "}
                                            {booking.location || "Not provided"}
                                        </p>

                                        <p>
                                            <strong>Requested:</strong>{" "}
                                            {formatDate(booking.createdAt)}
                                        </p>

                                        {booking.description && (
                                            <p className="provider-booking-description">
                                                <strong>Description:</strong>{" "}
                                                {booking.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="provider-booking-footer">
                                        <span className="provider-price">
                                            ₹{booking.service?.price ?? 0}
                                        </span>

                                        <div className="provider-booking-actions">
                                            {updatingId === booking._id && (
                                                <span className="provider-updating">
                                                    Updating...
                                                </span>
                                            )}
                                            {getNextActions(booking)}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <footer className="provider-footer">
                © {new Date().getFullYear()} RoadMate · Every road. Every need.
            </footer>
        </div>
    );
}

export default ProviderDashboard;
