import { UserButton } from "@clerk/clerk-react";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  isAdmin?: boolean;
}

export default function Navbar({ isAdmin }: Props) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <Link to="/dashboard" className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white text-sm">🏛️</div>
        <span className="text-base font-bold text-gray-900">Red Tape Translator</span>
      </Link>
      <div className="flex items-center gap-4">
        {isAdmin && (
          <Link
            to="/admin"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            <Shield size={13} /> Admin
          </Link>
        )}
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}