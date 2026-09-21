import { Link } from "react-router-dom";
import { AtSign, Globe, Mail, Share2 } from "lucide-react";
import { Logo } from "@/components/marketing/Logo";
import { SERVICES } from "@/content/services";

export function SiteFooter() {
  return (
    <footer className="bg-forest text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-3">
        <div className="md:col-span-2">
          <Logo inverted />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/70">
            Social media growth, websites and the content that fuels both — digital growth
            infrastructure for ambitious businesses.
          </p>
          <div className="mt-6 flex gap-3">
            {[AtSign, Globe, Share2, Mail].map((Icon, index) => (
              <a
                key={index}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-paper/20 text-paper/70 transition-colors hover:border-lime hover:text-lime"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-lime">
            Services
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-paper/70">
            {SERVICES.map((service) => (
              <li key={service.slug}>
                <Link to="/services" className="hover:text-paper">
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-paper/10 px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-paper/50 sm:flex-row">
          <p>© {new Date().getFullYear()} TSE Agency. All rights reserved.</p>
          <p>Built for businesses that refuse to blend in.</p>
        </div>
      </div>
    </footer>
  );
}
