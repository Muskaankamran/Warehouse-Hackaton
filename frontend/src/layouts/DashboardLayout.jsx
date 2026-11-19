import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import gsap from "gsap";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const mainRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initials = user?.name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        mainRef.current,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.3, ease: "power1.out" }
      );
      gsap.fromTo(
        ".page-header, .stats-grid > *, .dashboard-section, .card, .product-card, .warehouse-card, .order-card",
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.045, ease: "power2.out" }
      );
    }, mainRef);

    return () => context.revert();
  }, [location.pathname]);

  return (
    <div className="dashboard-layout">
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar
        isOpen={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />
      <main className="dashboard-main" ref={mainRef}>
        <header className="workspace-topbar">
          <button
            type="button"
            className="mobile-menu-button"
            aria-label="Open navigation menu"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="workspace-brand">
            <span className="workspace-brand-mark">W</span>
            <span>Warehouse workspace</span>
          </div>
          <div className="workspace-tools">
            <span className="workspace-date">
              {new Intl.DateTimeFormat(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              }).format(new Date())}
            </span>
            <div className="workspace-user">
              <div className="workspace-user-copy">
                <div className="workspace-user-name">{user?.name}</div>
                <div className="workspace-user-role">
                  {user?.role === "warehouseManager"
                    ? "Warehouse Manager"
                    : user?.role === "salesRepresentative"
                      ? "Sales Representative"
                      : user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </div>
              </div>
              {user?.image ? (
                <img className="workspace-avatar" src={user.image} alt="" />
              ) : (
                <span className="workspace-avatar" aria-hidden="true">
                  {initials || "U"}
                </span>
              )}
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
