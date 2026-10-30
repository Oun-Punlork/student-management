import { useEffect } from 'react';

export default function StudentDetailModal({ isOpen, onClose, student }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !student) return null;

  const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';

  const formattedDob = student.dateOfBirth 
    ? new Date(student.dateOfBirth).toLocaleDateString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'N/A';

  return (
    <div 
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          type="button" 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <img
            src={
              student.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=f1f5f9&color=334155`
            }
            alt={fullName}
            className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-slate-100 shadow-md mb-3"
          />
          <h3 className="text-base font-bold text-slate-900">{fullName}</h3>
          <p className="text-xs font-mono font-semibold text-emerald-600 mt-0.5">{student.studentCode || 'N/A'}</p>
        </div>

        <div className="space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-4">
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Gender:</span>
            <span className="font-medium text-slate-800 uppercase">{student.gender || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Date of Birth:</span>
            <span className="font-medium text-slate-800">{formattedDob}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Phone:</span>
            <span className="font-medium text-slate-800">{student.phone || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Email:</span>
            <span className="font-medium text-slate-800">{student.user?.email || student.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Address:</span>
            <span className="font-medium text-slate-800 text-right max-w-[60%] truncate">{student.address || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Status:</span>
            <span className={`font-semibold ${student.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-500'}`}>
              {student.status || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}