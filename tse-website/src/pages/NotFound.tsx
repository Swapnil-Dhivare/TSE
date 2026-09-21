import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-28 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-forest">
        <Compass className="h-7 w-7" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold text-ink">Page not found</h1>
      <p className="mt-3 text-muted-foreground">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 font-semibold text-paper"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>
    </div>
  );
}
