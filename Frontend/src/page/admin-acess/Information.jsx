import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, FileImage, RefreshCw, UsersRound } from "lucide-react";
import {
  fetchInformation,
  uploadScheduleImage,
} from "../../service/informationApi";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function Information() {
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData(["current-user"])?.data?.user;
  const canManageInformation = currentUser?.role === "ADMIN";
  const [uploadErrors, setUploadErrors] = useState({});
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["information"],
    queryFn: fetchInformation,
  });
  const uploadMutation = useMutation({
    mutationFn: ({ file, slot }) => uploadScheduleImage(file, slot),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["information"] }),
  });

  const handleFileChange = (event, slot) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      uploadMutation.reset();
      setUploadErrors((current) => ({
        ...current,
        [slot]: "Choose a JPEG, PNG, or WebP image.",
      }));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      uploadMutation.reset();
      setUploadErrors((current) => ({
        ...current,
        [slot]: "Schedule images must be 5 MB or smaller.",
      }));
      return;
    }

    setUploadErrors((current) => ({ ...current, [slot]: "" }));
    uploadMutation.reset();
    uploadMutation.mutate({ file, slot });
  };

  const scheduleImages = [
    {
      slot: "primary",
      title: "Exam schedule",
      image: data?.scheduleImage,
      imageName: data?.scheduleImageName,
      emptyMessage: "No schedule image has been uploaded.",
    },
    {
      slot: "additional",
      title: "Academic schedule",
      image: data?.additionalScheduleImage,
      imageName: data?.additionalScheduleImageName,
      emptyMessage: "No additional schedule image has been uploaded.",
    },
  ];
  const reexamStudents = Array.isArray(data?.reexamStudents)
    ? data.reexamStudents
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          School updates
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Information
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View the exam schedule and published re-examination information.
        </p>
      </header>

      {isError ? (
        <div
          className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700"
          role="alert">
          <p className="font-semibold">Unable to load information.</p>
          <p className="mt-1">{error.message}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-lg bg-rose-700 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-800">
            Try again
          </button>
        </div>
      ) : isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
          Loading information...
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {scheduleImages.map(
              ({ slot, title, image, imageName, emptyMessage }) => {
                const isUploading =
                  uploadMutation.isPending &&
                  uploadMutation.variables?.slot === slot;
                const hasUploadError =
                  uploadMutation.isError &&
                  uploadMutation.variables?.slot === slot;

                return (
                  <section
                    key={slot}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <CalendarDays
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </span>
                        <div>
                          <h2 className="font-bold text-slate-900">{title}</h2>
                          <p className="mt-1 text-xs text-slate-500">
                            {canManageInformation
                              ? "Upload a JPEG, PNG, or WebP image up to 5 MB."
                              : "View the current exam schedule."}
                          </p>
                        </div>
                      </div>
                      {canManageInformation && (
                        <label
                          className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 ${uploadMutation.isPending ? "pointer-events-none opacity-60" : ""}`}>
                          {isUploading ? (
                            <RefreshCw
                              className="h-4 w-4 animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <FileImage className="h-4 w-4" aria-hidden="true" />
                          )}
                          {image
                            ? "Replace image"
                            : slot === "additional"
                              ? "Upload image"
                              : "Upload schedule image"}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="sr-only"
                            disabled={uploadMutation.isPending}
                            onChange={(event) => handleFileChange(event, slot)}
                          />
                        </label>
                      )}
                    </div>

                    {canManageInformation &&
                      (uploadErrors[slot] || hasUploadError) && (
                        <p
                          className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
                          role="alert">
                          {uploadErrors[slot] || uploadMutation.error.message}
                        </p>
                      )}
                    {image ? (
                      <figure className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <img
                          src={image}
                          alt={title}
                          className="mx-auto max-h-[70vh] w-full object-contain"
                        />
                        {imageName && (
                          <figcaption className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500">
                            {imageName}
                          </figcaption>
                        )}
                      </figure>
                    ) : (
                      <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
                        {emptyMessage}
                      </div>
                    )}
                  </section>
                );
              },
            )}
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-start gap-3 border-b border-slate-100 p-5 sm:p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <UsersRound className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-bold text-slate-900">
                  Re-examination students
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Students with a recorded final score below 50 in every
                  subject.
                </p>
              </div>
            </div>

            {!data.finalResultsPublishedAt ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
                Re-examination information will appear here after final results
                are published from Results Preview.
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-50 px-5 py-3 text-xs text-emerald-800 sm:px-6">
                  <span className="font-semibold">Final results published</span>
                  <time dateTime={data.finalResultsPublishedAt}>
                    {formatDate(data.finalResultsPublishedAt)}
                  </time>
                </div>
                {reexamStudents.length === 0 ? (
                  <p className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
                    No students meet the re-examination criteria.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-5 py-3 text-center">#</th>
                          <th className="px-5 py-3">Student code</th>
                          <th className="px-5 py-3">Student name</th>
                          <th className="px-5 py-3">Final scores</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reexamStudents.map((student, index) => (
                          <tr
                            key={student.id}
                            className="align-top hover:bg-slate-50/70">
                            <td className="px-5 py-3 text-center text-slate-400">
                              {index + 1}
                            </td>
                            <td className="whitespace-nowrap px-5 py-3 font-mono font-semibold text-indigo-600">
                              {student.studentCode}
                            </td>
                            <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-800">
                              {student.name}
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex max-w-3xl flex-wrap gap-2">
                                {student.finalScores.map(({ code, score }) => (
                                  <span
                                    key={code}
                                    className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
                                    {code}: {score}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
