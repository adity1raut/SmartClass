import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function Footer() {
  const { themeName } = useContext(ThemeContext);
  const currentYear = new Date().getFullYear();

  return (
    <footer
      data-theme={themeName}
      className="border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] backdrop-blur-xl"
    >
      <div className="w-full px-4 sm:px-6 py-8 sm:py-12">
        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto">
          {/* Mobile: 2 columns, Tablet: 2 columns, Desktop: 4 columns */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            {/* Brand Section - Full width on mobile, spans 2 rows */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-1 flex flex-col gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-[var(--accent)] text-[var(--accent-contrast)]">
                  🎓
                </div>
                <span className="text-lg sm:text-lg font-bold text-[var(--text)]">
                  SmartClass
                </span>
              </div>
              <p className="text-[11px] sm:text-sm text-[var(--muted)] leading-relaxed">
                Modern learning management platform for teachers and students.
              </p>
            </div>

            {/* Product Links */}
            <div className="col-span-1 text-center sm:text-left">
              <h4 className="text-xs sm:text-sm font-bold text-[var(--text)] mb-2 sm:mb-4 uppercase tracking-wide">
                Product
              </h4>
              <ul className="space-y-1 sm:space-y-2.5 text-[11px] sm:text-sm">
                {["Features", "Pricing", "Security", "Enterprise"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors inline-block"
                      >
                        {item}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Company Links */}
            <div className="col-span-1 text-center sm:text-left">
              <h4 className="text-xs sm:text-sm font-bold text-[var(--text)] mb-2 sm:mb-4 uppercase tracking-wide">
                Company
              </h4>
              <ul className="space-y-1 sm:space-y-2.5 text-[11px] sm:text-sm">
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors inline-block"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div className="col-span-1 text-center sm:text-left">
              <h4 className="text-xs sm:text-sm font-bold text-[var(--text)] mb-2 sm:mb-4 uppercase tracking-wide">
                Legal
              </h4>
              <ul className="space-y-1 sm:space-y-2.5 text-[11px] sm:text-sm">
                {["Privacy", "Terms", "Cookies", "License"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors inline-block"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--border)]/50 pt-6 sm:pt-8">
            {/* Copyright & Social - Centered on mobile, flex on desktop */}
            <div className="flex flex-col items-center justify-center text-center gap-4">
              <p className="text-[10px] sm:text-xs text-[var(--muted)] order-2 sm:order-1">
                © {currentYear} SmartClass. All rights reserved.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-2 sm:gap-3 justify-center order-1 sm:order-2">
                {[
                  { icon: "𝕏", label: "Twitter", color: "hover:text-blue-400" },
                  {
                    icon: "f",
                    label: "Facebook",
                    color: "hover:text-blue-500",
                  },
                  {
                    icon: "in",
                    label: "LinkedIn",
                    color: "hover:text-blue-600",
                  },
                ].map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    title={social.label}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] 
                               flex items-center justify-center text-xs font-bold text-[var(--muted)] 
                               ${social.color} border-opacity-50 hover:border-[var(--accent)]/40 
                               transition-all active:scale-95`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
