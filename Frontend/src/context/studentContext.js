import { createContext, useContext } from 'react';

export const StudentContext = createContext(null);

export const useStudentContext = () => {
  const context = useContext(StudentContext);
  if (!context) throw new Error('useStudentContext must be used within a StudentProvider');
  return context;
};
