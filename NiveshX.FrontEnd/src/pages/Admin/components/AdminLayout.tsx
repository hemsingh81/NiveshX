import React, { useMemo } from "react";
import {
  MdBusiness,
  MdDomain,
  MdFormatQuote,
  MdGroup,
  MdLocalOffer,
  MdPublic,
  MdShowChart,
} from "react-icons/md";
import { Link, useLocation } from "react-router-dom";

type MenuItem = {
  key: string;
  to: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const BASE_LINK =
  "block px-4 py-2 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200";
const ACTIVE_LINK =
  "bg-blue-100 text-blue-900 font-semibold shadow-sm border-l-4 border-blue-500";
const INACTIVE_LINK = "hover:bg-blue-50 hover:text-blue-700";
const ICON_SIZE = "text-lg";

const MENU: MenuItem[] = [
  {
    key: "motivation",
    to: "/admin/motivation",
    label: "Motivation Quotes",
    Icon: MdFormatQuote,
  },
  {
    key: "users",
    to: "/admin/user-management",
    label: "User Management",
    Icon: MdGroup,
  },
  {
    key: "countries",
    to: "/admin/country",
    label: "Countries",
    Icon: MdPublic,
  },
  {
    key: "industries",
    to: "/admin/industry",
    label: "Industries",
    Icon: MdBusiness,
  },
  { key: "sectors", to: "/admin/sector", label: "Sectors", Icon: MdDomain },
  {
    key: "classificationTags",
    to: "/admin/classification-tag",
    label: "Classification Tags",
    Icon: MdLocalOffer,
  },
  {
    key: "stockMarkets",
    to: "/admin/stock-market",
    label: "Stock Markets",
    Icon: MdShowChart,
  },
];

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const items = useMemo(() => {
    return MENU.map((m) => {
      const active = location.pathname.startsWith(m.to);
      return { ...m, active };
    });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-br from-white via-slate-50 to-slate-100 text-gray-800 p-6 space-y-4 shadow-lg border-r">
        <h2 className="text-2xl font-semibold mb-6 tracking-wide text-blue-700">
          Admin Panel
        </h2>

        <nav className="space-y-2" aria-label="Admin navigation">
          {items.map((item) => {
            const linkClasses = `${BASE_LINK} ${
              item.active ? ACTIVE_LINK : INACTIVE_LINK
            }`;
            const iconColorClass = item.active
              ? "text-[#125DFF]"
              : "text-gray-500 hover:text-[#0F4FE6]";
            const Icon = item.Icon;

            return (
              <Link
                key={item.key}
                to={item.to}
                className={linkClasses}
                aria-current={item.active ? "page" : undefined}
              >
                <span
                  className={`inline-flex items-center gap-2 ${iconColorClass}`}
                >
                  <Icon className={ICON_SIZE} />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white shadow-inner rounded-lg overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
