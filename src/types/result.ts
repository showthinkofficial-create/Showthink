export interface SubjectMarkItem {
  subject: string;
  subjectName?: string;
  marksObtained: number;
  maxMarks: number;
  grade?: string;
  remarks?: string;
}

export interface ExamResult {
  id: string;
  examName: string;
  academicSession: string;
  studentUid: string;
  studentId: string;
  studentName: string;
  rollNumber?: string;
  className: string;
  section: string;
  board?: 'CBSE' | 'UP Board' | string;
  subject?: string;
  subjects: SubjectMarkItem[];
  totalObtained: number;
  totalMarksObtained?: number;
  totalMax: number;
  totalMaxMarks?: number;
  percentage: number;
  grade?: string;
  status: 'PASSED' | 'FAILED' | 'PUBLISHED' | 'DRAFT' | string;
  resultStatus?: 'PASSED' | 'FAILED' | 'SUPPLEMENTARY';
  remarks?: string;
  date?: string;
  teacherId?: string;
  teacherUid?: string;
  teacherName?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResultSummaryStats {
  studentsAppeared: number;
  passed: number;
  failed: number;
  passPercentage: number;
  averagePercentage: number;
  highestPercentage: number;
  lowestPercentage: number;
}
