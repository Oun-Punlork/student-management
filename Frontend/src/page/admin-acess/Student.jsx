import { useState, useMemo } from 'react';
import StudentHeader from '../../components/student/StudentHeader';
import StudentCard from '../../components/student/StudentCard';
import StudentFormModal from '../../components/student/StudentFormModal';
import StudentDetailModal from '../../components/student/StudentDetailModal';
import { useStudentContext } from '../../context/studentContext';

const DEFAULT_FORM_STATE = {
  studentCode: '', firstName: '', lastName: '', khmerName: '',
  gender: 'MALE', dateOfBirth: '', phone: '', address: '', status: 'ACTIVE',
};

export default function Student() {
  const { students: studentsData = [], isLoading, addStudent, updateStudent, deleteStudent } = useStudentContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [nameRangeFilter, setNameRangeFilter] = useState('ALL');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);

  const filteredStudents = useMemo(() => {
    return studentsData.filter((student) => {
      const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
      const code = (student.studentCode || '').toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = fullName.includes(query) || code.includes(query);
      const matchesStatus = statusFilter === 'ALL' || student.status === statusFilter;
      let matchesNameRange = true;
      if (nameRangeFilter !== 'ALL' && nameRangeFilter.includes('-')) {
        const firstChar = (student.firstName || '').charAt(0).toUpperCase();
        const [start = 'A', end = 'Z'] = nameRangeFilter.split('-');
        matchesNameRange = firstChar >= start && firstChar <= end;
      }
      return matchesSearch && matchesStatus && matchesNameRange;
    });
  }, [studentsData, searchQuery, statusFilter, nameRangeFilter]);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormError('');
    setFormData({ ...DEFAULT_FORM_STATE, studentCode: `STU-${Math.floor(1000 + Math.random() * 9000)}` });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setActiveMenuId(null);
    setEditingStudent(student);
    setFormError('');
    setFormData({
      studentCode: student.studentCode || '', firstName: student.firstName || '',
      lastName: student.lastName || '', khmerName: student.khmerName || '',
      gender: student.gender || 'MALE',
      dateOfBirth: student.dateOfBirth ? String(student.dateOfBirth).slice(0, 10) : '',
      phone: student.phone || '', address: student.address || '', status: student.status || 'ACTIVE',
    });
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingStudent(null);
    setFormError('');
    setFormData(DEFAULT_FORM_STATE);
  };

  const handleOpenDetailModal = (student) => {
    setActiveMenuId(null);
    setViewingStudent(student);
    setIsDetailModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, formData);
      } else {
        await addStudent(formData);
      }
      handleCloseFormModal();
    } catch (error) {
      setFormError(error.message || 'An error occurred while saving the student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    setActiveMenuId(null);
    if (!window.confirm(`Are you sure you want to delete ${studentName}?`)) return;
    try {
      await deleteStudent(studentId);
    } catch (error) {
      alert(error.message || 'Unable to delete student.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 bg-[#f4f6f9] min-h-screen text-slate-800">
      <StudentHeader
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        nameRangeFilter={nameRangeFilter} setNameRangeFilter={setNameRangeFilter}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        totalCount={filteredStudents.length} onOpenAddModal={handleOpenAddModal}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="bg-white/60 p-5 rounded-3xl border border-slate-200 animate-pulse h-64 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-2xl"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
              <div className="h-8 bg-slate-200 rounded-xl w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">No student records found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or add a new student.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredStudents.map((student) => (
            <StudentCard key={student.id} student={student} activeMenuId={activeMenuId}
              setActiveMenuId={setActiveMenuId} onEdit={handleOpenEditModal}
              onView={handleOpenDetailModal} onDelete={handleDeleteStudent} />
          ))}
        </div>
      )}

      <StudentFormModal isOpen={isFormModalOpen} onClose={handleCloseFormModal}
        editingStudent={editingStudent} formData={formData} setFormData={setFormData}
        onSubmit={handleFormSubmit} isSubmitting={isSubmitting} errorMessage={formError} />

      <StudentDetailModal isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setViewingStudent(null); }}
        student={viewingStudent} />
    </div>
  );
}
