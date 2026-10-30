export default function FormInput({
  id,
  label,
  type,
  placeholder,
  iconClass,
  value,
  onChange,
  toggleVisibility,
  isVisible,
  isCompact = false,
}) {
  const paddingLeft = isCompact ? 'pl-9' : 'pl-10';
  const paddingRight = toggleVisibility ? 'pr-9' : 'pr-3.5';

  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className={`absolute inset-y-0 left-0 ${isCompact ? 'pl-3' : 'pl-3.5'} flex items-center pointer-events-none text-slate-400`}>
          <i className={`${iconClass} text-xs`}></i>
        </div>
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className={`w-full ${paddingLeft} ${paddingRight} py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:border-black-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none`}
        />
        {toggleVisibility && (
          <button
            type="button"
            onClick={toggleVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
            title={isVisible ? 'Hide password' : 'Show password'}
          >
            <i className={`fa-regular ${isVisible ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
          </button>
        )}
      </div>
    </div>
  );
}