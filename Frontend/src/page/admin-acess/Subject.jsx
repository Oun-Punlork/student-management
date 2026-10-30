import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchScores, updateScore } from "../../service/scoreApi";
import StatsSummary from "../../components/subject/StatsSummary";
import ScoresTable from "../../components/subject/ScoresTable";
import ScoreModal from "../../components/subject/ScoreModal";

export default function Subject() {
  const queryClient = useQueryClient();
  const [activeSubjectTab, setActiveSubjectTab] = useState("ALL");
  const [activeExamTab, setActiveExamTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    studentId: null,
    subjectId: null,
    studentName: "",
    subjectCode: "",
    subjectLabel: "",
    score: 0,
    remarks: "",
  });

  const {
    data: scoreResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["scores"],
    queryFn: fetchScores,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const assessmentData = useMemo(
    () => (Array.isArray(scoreResponse?.data) ? scoreResponse.data : []),
    [scoreResponse],
  );
  const subjectList = useMemo(
    () =>
      Array.isArray(scoreResponse?.subjects) ? scoreResponse.subjects : [],
    [scoreResponse],
  );

  const scoreMutation = useMutation({
    mutationFn: (payload) => updateScore(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["scores"] }),
  });

  const examConfig = useMemo(() => {
    if (activeExamTab === "MIDTERM")
      return { max: 40, passMark: 20, label: "Midterm", scoreKey: "midterm" };
    if (activeExamTab === "FINAL")
      return { max: 60, passMark: 30, label: "Final", scoreKey: "final" };
    return { max: 100, passMark: 50, label: "Total", scoreKey: "total" };
  }, [activeExamTab]);

  const { filteredStudents, stats } = useMemo(() => {
    const normalizeScores = (student) => {
      const normalized = {};
      subjectList.forEach(({ code }) => {
        const entry = student.scores?.[code];
        const midterm = entry ? Number(entry.midtermScore ?? 0) : null;
        const fin = entry?.finalScoreEntered ? Number(entry.finalScore) : null;
        const total = entry ? Number(entry.score ?? midterm + fin) : null;
        normalized[code] = { midterm, final: fin, total };
      });
      return normalized;
    };

    const search = searchQuery.toLowerCase().trim();
    const normalizedList = assessmentData.map((student) => {
      const normalizedScores = normalizeScores(student);
      let passedCount = 0,
        failedCount = 0,
        gradedCount = 0;
      const codes =
        activeSubjectTab === "ALL"
          ? subjectList.map(({ code }) => code)
          : [activeSubjectTab];
      codes.forEach((code) => {
        const val = normalizedScores[code]?.[examConfig.scoreKey];
        if (val === null || val === undefined) return;
        gradedCount++;
        if (val >= examConfig.passMark) passedCount++;
        else failedCount++;
      });
      return {
        ...student,
        normalizedScores,
        passedSubjectsCount: passedCount,
        failedSubjectsCount: failedCount,
        gradedSubjectsCount: gradedCount,
        isOverallPass: gradedCount > 0 && failedCount === 0,
      };
    });
    const filtered = normalizedList.filter(
      (s) =>
        !search ||
        (s.name || "").toLowerCase().includes(search) ||
        (s.code || "").toLowerCase().includes(search),
    );
    const totalStudents = filtered.length;
    const gradedStudents = filtered.filter((s) => s.gradedSubjectsCount > 0).length;
    const passCount = filtered.filter((s) => s.isOverallPass).length;
    const failCount = gradedStudents - passCount;
    const passRate =
      gradedStudents > 0
        ? ((passCount / gradedStudents) * 100).toFixed(1)
        : null;
    const failRate =
      gradedStudents > 0
        ? ((failCount / gradedStudents) * 100).toFixed(1)
        : null;
    return {
      filteredStudents: filtered,
      stats: {
        totalStudents,
        gradedStudents,
        ungradedStudents: totalStudents - gradedStudents,
        passCount,
        failCount,
        passRate,
        failRate,
      },
    };
  }, [assessmentData, searchQuery, activeSubjectTab, examConfig, subjectList]);

  const handleOpenEditor = (student, subjectCode, currentScore) => {
    const targetSubject = subjectList.find((s) => s.code === subjectCode);
    setModalData({
      studentId: student.id,
      subjectId: targetSubject?.id || null,
      studentName: student.name,
      subjectCode,
      subjectLabel: targetSubject
        ? `${targetSubject.code} - ${targetSubject.name}`
        : subjectCode,
      score: currentScore ?? "",
      remarks: student.scores?.[subjectCode]?.remarks || "",
    });
    setIsModalOpen(true);
  };

  const handleScoreSubmit = async (payload) => {
    try {
      await scoreMutation.mutateAsync({
        studentId: payload.studentId,
        subjectId: payload.subjectId,
        subjectCode: payload.subjectCode,
        score: parseFloat(payload.score),
        examType: activeExamTab,
        remarks: payload.remarks,
      });
      setIsModalOpen(false);
    } catch (error) {
      alert(error.message || "Failed to save score");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-book-bookmark text-indigo-600"></i>
            Subject &amp; Score Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage subject assessments, midterm, and final examination scores
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
            {["ALL", "MIDTERM", "FINAL"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActiveExamTab(type)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeExamTab === type ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-900"}`}>
                {type === "ALL"
                  ? "Total (100)"
                  : type === "MIDTERM"
                    ? "Midterm (40)"
                    : "Final (60)"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh scores"
            aria-label="Refresh scores"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>
      <StatsSummary stats={stats} />
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveSubjectTab("ALL")}
          className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${activeSubjectTab === "ALL" ? "bg-indigo-600 text-white shadow-xs" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
          All Subjects
        </button>
        {subjectList.map(({ code, name }) => (
          <button
            key={code}
            type="button"
            onClick={() => setActiveSubjectTab(code)}
            title={name}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${activeSubjectTab === code ? "bg-indigo-600 text-white shadow-xs" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
            {code}
          </button>
        ))}
        <Link
          to={`/results?exam=${activeExamTab === "FINAL" ? "FINAL" : "MIDTERM"}`}
          className="mb-1 ml-auto inline-flex shrink-0 items-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50">
         <i className="fa-regular fa-eye"></i>
          Result Preview
        </Link>
      </div>
      {isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center" role="alert">
          <p className="text-sm font-semibold text-rose-700">Unable to load student scores.</p>
          <p className="mt-1 text-xs text-rose-600">{error.message}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-lg bg-rose-700 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-800"
          >
            Try again
          </button>
        </div>
      ) : isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs font-medium">
          Loading student scores...
        </div>
      ) : (
        <ScoresTable
          students={filteredStudents}
          activeSubjectTab={activeSubjectTab}
          setActiveSubjectTab={setActiveSubjectTab}
          subjects={subjectList}
          examConfig={examConfig}
          onOpenEditor={handleOpenEditor}
        />
      )}
      <ScoreModal
        key={`${modalData.studentId ?? ""}-${modalData.subjectId ?? ""}-${examConfig.scoreKey}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalData={modalData}
        examConfig={examConfig}
        onSubmit={handleScoreSubmit}
      />
    </div>
  );
}
