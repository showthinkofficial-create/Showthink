export interface SubjectMarkItem {
  subject: string;
  marksObtained: number;
  maxMarks: number;
}

export interface ExamResult {
  id: string;
  examName: string;
  academicSession: string;
  studentUid: string;
  studentId: string;
  studentName: string;
  className: string;
  section: string;
  board: 'CBSE' | 'UP Board';
  subjects: SubjectMarkItem[];
  totalObtained: number;
  totalMax: number;
  percentage: number;
  status: 'PASSED' | 'FAILED';
  remarks?: string;
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
