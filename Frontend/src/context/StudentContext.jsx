import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchStudentsApi,
  createStudentApi,
  updateStudentApi,
  deleteStudentApi,
} from '../service/studentApi';
import { StudentContext } from './studentContext';
import { STUDENT_QUERY_KEY } from './studentQueryKeys';

export const StudentProvider = ({ children }) => {
  const queryClient = useQueryClient();

  const { data: students = [], isLoading, isFetching, error, refetch: refetchStudents } = useQuery({
    queryKey: STUDENT_QUERY_KEY,
    queryFn: async () => {
      const result = await fetchStudentsApi();
      const list = Array.isArray(result) ? result : result?.data;
      return Array.isArray(list) ? list : [];
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => createStudentApi(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEY }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateStudentApi(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEY }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteStudentApi(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEY }),
  });

  return (
    <StudentContext.Provider value={{
      students,
      isLoading,
      isFetching,
      error: error?.message || null,
      refetchStudents,
      addStudent: (data) => createMutation.mutateAsync(data),
      updateStudent: (id, data) => updateMutation.mutateAsync({ id, payload: data }),
      deleteStudent: (id) => deleteMutation.mutateAsync(id),
      isSubmitting: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    }}>
      {children}
    </StudentContext.Provider>
  );
};

export default StudentContext;
