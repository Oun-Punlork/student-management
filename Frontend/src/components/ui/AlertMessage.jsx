

export default function AlertMessage({ message }) {
  if (!message) return null;

  return (
    <div className="mb-5 p-3 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-100 flex items-center gap-2">
      <i className="fa-solid fa-circle-exclamation text-sm"></i>
      <span>{message}</span>
    </div>
  );
}