import { useState } from "react";
import { supabase } from "../supabase_client";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../contexts/UserAuthContext";
import {
  CheckCircle2,
  FileText,
  Home,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  LogOut,
} from "lucide-react";

export default function CreateComplaint() {
  const navigate = useNavigate();
  const { user, signOut } = useUserAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Academics");
  const [loading, setLoading] = useState(false);
  const [submittedCode, setSubmittedCode] = useState("");

  const createComplaintCode = () => {
    const value = Math.floor(100000 + Math.random() * 900000);
    return `C-${value}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    const complaintCode = createComplaintCode();

    const complaintData = {
      complaint_code: complaintCode,
      title,
      description,
      user_name: user?.email?.split("@")[0] || "Anonymous",
      user_email: user?.email || null,
      user_id: user?.id || null,
      department: category,
      status: "new",
    };

    const { error } = await supabase
      .from("complaints")
      .insert([complaintData]);

    setLoading(false);

    if (error) {
      const message =
        error.code === "42501"
          ? "Complaint submit permission is not enabled in Supabase. Please ask the admin to enable complaint inserts."
          : error.message;
      alert(message);
    } else {
      setSubmittedCode(complaintCode);
      setTitle("");
      setDescription("");
      setCategory("Academics");
    }
  };

  if (submittedCode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-700 to-sky-400 p-6">
        <div className="w-full max-w-md animate-[pop_0.55s_ease] rounded-[1.25rem] bg-white p-10 text-center shadow-xl shadow-blue-500/25">
          <div className="mx-auto mb-6 flex h-24 w-24 animate-[successPop_0.75s_ease] items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 size={64} strokeWidth={2.5} />
          </div>

          <h1 className="mb-2 text-2xl font-semibold text-slate-900">
            Complaint Successfully Submitted
          </h1>

          <p className="mb-6 text-sm leading-6 text-slate-500">
            Your complaint has been received. The administration will review it shortly.
          </p>

          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
              Reference Code
            </p>
            <p className="mt-2 text-2xl font-bold tracking-wide text-green-800">
              {submittedCode}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setSubmittedCode("")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 disabled:opacity-70"
            >
              <Plus size={18} />
              New Complaint
            </button>

            {user && (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:bg-purple-700"
              >
                <FileText size={18} />
                View Dashboard
              </button>
            )}

            <Link
              to="/"
              className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
            >
              <Home size={18} />
              Back Home
            </Link>
          </div>
        </div>

        <style>
          {`
            @keyframes pop {
              0% {
                opacity: 0;
                transform: scale(0.95) translateY(20px);
              }

              100% {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }

            @keyframes successPop {
              0% {
                opacity: 0;
                transform: scale(0.45);
              }

              55% {
                opacity: 1;
                transform: scale(1.12);
              }

              100% {
                opacity: 1;
                transform: scale(1);
              }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">

      {/* PAGE HEADER */}
      <div className="mb-8 animate-[fade_0.6s_ease]">

        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="text-blue-700" size={28} />

          <h1 className="text-4xl font-bold text-gray-800">
            New Complaint
          </h1>
        </div>

        <p className="text-gray-500 text-lg">
          Submit your issue securely and anonymously.
        </p>
      </div>

    
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

       
        <div className="space-y-6 animate-[slideLeft_0.8s_ease]">

          
          <div className="bg-gradient-to-br from-blue-800 to-blue-600 text-white p-6 rounded-3xl shadow-xl">

            <ShieldCheck size={42} className="mb-4" />

            <h2 className="text-2xl font-bold mb-3">
              Your Privacy Matters
            </h2>

            <p className="text-blue-100 leading-7">
              Complaints submitted through this portal are
              handled confidentially. Our administration reviews
              every complaint carefully to improve student life.
            </p>
          </div>

          {/* SUPPORT CARD */}
          <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100">

            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Complaint Guidelines
            </h3>

            <ul className="space-y-3 text-gray-600 text-sm">

              <li>
                ✔ Provide clear complaint details
              </li>

              <li>
                ✔ Choose the correct category
              </li>

              <li>
                ✔ Avoid inappropriate language
              </li>

              <li>
                ✔ Complaints are reviewed regularly
              </li>

            </ul>
          </div>

        </div>

       
        <div className="lg:col-span-2 animate-[pop_0.7s_ease]">

          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
          >

            
            <div className="flex items-center gap-3 mb-8">

              <div className="bg-blue-100 p-3 rounded-2xl">
                <FileText className="text-blue-700" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Complaint Form
                </h2>

                <p className="text-gray-500 text-sm">
                  Fill in the details below
                </p>
              </div>
            </div>

           
            <div className="mb-5">

              <label className="block mb-2 font-medium text-gray-700">
                Complaint Title
              </label>

              <input
                type="text"
                placeholder="Enter complaint title"
                className="w-full p-4 rounded-2xl border border-gray-200 
                           focus:ring-2 focus:ring-blue-500 
                           outline-none transition"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

         
            <div className="mb-5">

              <label className="block mb-2 font-medium text-gray-700">
                Description
              </label>

              <textarea
                rows="6"
                placeholder="Describe your issue..."
                className="w-full p-4 rounded-2xl border border-gray-200 
                           focus:ring-2 focus:ring-blue-500 
                           outline-none transition resize-none"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                required
              />
            </div>

           
            <div className="mb-8">

              <label className="block mb-2 font-medium text-gray-700">
                Category
              </label>

              <select
                className="w-full p-4 rounded-2xl border border-gray-200 
                           focus:ring-2 focus:ring-blue-500 
                           outline-none transition"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
              >
                <option>Academics</option>
                <option>Administration</option>
                <option>Campus Environment</option>
                <option>Facilities</option>
                <option>Transport</option>
                <option>WiFi</option>
                <option>Safety / Harassment</option>
              </select>
            </div>

            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-700 to-blue-500 
                         hover:from-blue-800 hover:to-blue-600
                         text-white py-4 rounded-2xl font-semibold
                         flex items-center justify-center gap-2
                         shadow-lg hover:shadow-2xl
                         transition-all duration-300
                         hover:scale-[1.02]
                         active:scale-95"
            >

              <Send size={18} />

              {loading
                ? "Submitting Complaint..."
                : "Submit Complaint"}

            </button>

          </form>
        </div>

      </div>

      {/* ANIMATIONS */}
      <style>
        {`
          @keyframes pop {
            0% {
              opacity: 0;
              transform: scale(0.95) translateY(20px);
            }

            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes fade {
            0% {
              opacity: 0;
              transform: translateY(-10px);
            }

            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideLeft {
            0% {
              opacity: 0;
              transform: translateX(-30px);
            }

            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
    </div>
  );
}
