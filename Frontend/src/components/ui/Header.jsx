export default function Header() {
  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 px-8 py-8 text-center relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-600/15 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 text-white text-lg font-bold mb-3 rounded-2xl border border-white/10 shadow-sm backdrop-blur-xs">
          <i className="fa-solid fa-graduation-cap"></i>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">SV30</h1>
        <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mt-1">
          Student Management System
        </p>
      </div>
    </div>
  );
}