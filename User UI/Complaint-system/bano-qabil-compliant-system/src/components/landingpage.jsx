import { Link } from "react-router-dom";
import { adminLoginUrl } from "../supabase_client";
import { useUserAuth } from "../contexts/UserAuthContext";
import logo from "../assets/logo.png";
import {
  ShieldCheck,
  MessageSquareWarning,
  CircleCheckBig,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  LogOut,
} from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated, user, signOut } = useUserAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">

          <Link to="/" className="flex items-center gap-3 min-w-0">
            <img
              src={logo}
              alt="ComplaintHub logo"
              className="h-10 w-10 rounded-xl bg-white object-contain p-1 shadow-sm"
            />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-blue-700 whitespace-nowrap">
                ComplaintHub
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 truncate">
                Student Support System
              </p>
            </div>
          </Link>

          <div className="flex flex-1 flex-wrap items-center justify-end gap-3 min-w-0">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition duration-200 ease-out hover:scale-[1.02]">
                    My Complaints
                  </button>
                </Link>
                <Link to="/create-complaint" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition duration-200 ease-out hover:scale-[1.02]">
                    New Complaint
                  </button>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-red-600 text-red-600 text-sm font-medium hover:bg-red-600 hover:text-white transition duration-200 ease-out hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/create-complaint" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition duration-200 ease-out hover:scale-[1.02]">
                    New Complaint
                  </button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition duration-200 ease-out hover:scale-[1.02]">
                    Sign In
                  </button>
                </Link>
                <a href={adminLoginUrl} className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full sm:w-auto px-4 py-2 rounded-xl border border-blue-600 text-blue-600 text-sm font-medium hover:bg-blue-600 hover:text-white transition duration-200 ease-out hover:scale-[1.02]"
                  >
                    Admin Login
                  </button>
                </a>
              </>
            )}
          </div>

        </div>
      </nav>

      {/* HERO */}
      <section className="flex-1 max-w-7xl mx-auto px-6 py-20">

        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* LEFT */}
          <div className="space-y-6 animate-fadeIn">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm">
              <Sparkles size={16} />
              Anonymous Complaint System
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight">
              Your Voice
              <span className="text-blue-600"> Matters</span>
            </h1>

            <p className="text-slate-600 text-lg leading-8 max-w-lg">
              Submit complaints about campus issues like WiFi, transport,
              classrooms, or administration. We ensure every complaint is
              reviewed and resolved properly.
            </p>

            <div className="flex gap-4 pt-4">
              <Link to="/create-complaint">
                <button className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition hover:scale-105 shadow-lg">
                  Submit Complaint
                </button>
              </Link>

              {isAuthenticated ? (
                <Link to="/dashboard">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 transition hover:scale-105"
                  >
                    My Complaints
                  </button>
                </Link>
              ) : (
                <Link to="/login">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 transition hover:scale-105"
                  >
                    Sign In
                  </button>
                </Link>
              )}
            </div>

          </div>

          {/* RIGHT CARD */}
          <div className="animate-pop">
            <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white shadow-2xl p-6 space-y-5">

              <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <ShieldCheck size={40} className="mb-3" />
                <h2 className="text-xl font-semibold mb-2">
                  Secure & Confidential
                </h2>
                <p className="text-blue-100 text-sm">
                  All complaints are securely stored and reviewed only by authorized staff.
                </p>
              </div>

              <Feature
                icon={<CircleCheckBig className="text-green-600" />}
                title="Anonymous Submission"
                desc="Submit complaints without revealing identity."
              />

              <Feature
                icon={<MessageSquareWarning className="text-yellow-500" />}
                title="Fast Review System"
                desc="Complaints are processed quickly."
              />

              <Feature
                icon={<ShieldCheck className="text-blue-600" />}
                title="Track Progress"
                desc="Sign in to track complaint progress anytime."
              />

            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white mt-20">

        <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10">

          {/* BRAND */}
          <div>
            <h2 className="text-xl font-bold mb-3">
              Complaint Portal
            </h2>
            <p className="text-slate-400 text-sm leading-6">
              A modern student complaint management system designed to
              improve communication between students and administration.
            </p>
          </div>

          {/* LINKS */}
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/create-complaint" className="hover:text-white">Submit Complaint</Link></li>
              <li>
                <a href={adminLoginUrl} className="hover:text-white">
                  Admin Login
                </a>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="font-semibold mb-3">Contact</h3>

            <div className="space-y-2 text-sm text-slate-400">
              <p className="flex items-center gap-2">
                <Mail size={16} /> support@complaintportal.com
              </p>
              <p className="flex items-center gap-2">
                <Phone size={16} /> +92 300 0000000
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={16} /> Pakistan
              </p>
            </div>
          </div>

          {/* NOTE */}
          <div>
            <h3 className="font-semibold mb-3">System</h3>
            <p className="text-sm text-slate-400 leading-6">
              Built with React, Tailwind CSS, and Supabase for secure data handling.
            </p>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-slate-800 text-center py-5 text-sm text-slate-500">
          © 2026 Complaint Portal. All rights reserved.
        </div>

      </footer>

      {/* ANIMATIONS */}
      <style>
        {`
          .animate-fadeIn {
            animation: fadeIn 0.8s ease-out;
          }

          .animate-pop {
            animation: pop 0.9s ease-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes pop {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>

    </div>
  );
}

/* FEATURE COMPONENT */
function Feature({ icon, title, desc }) {
  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition">
      <div className="mt-1">{icon}</div>
      <div>
        <h3 className="font-medium text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
    </div>
  );
}
