import { studentService } from './studentService';
import { teacherService } from './teacherService';
import { attendanceService } from './attendanceService';
import { feesService } from './feesService';
import { admissionService } from './admissionService';
import { resultService } from './resultService';

import { Student } from '../types/student';
import { Teacher } from '../types/teacher';
import { AttendanceRecord } from '../types/attendance';
import { StudentFeeSummary, PaymentRecord } from '../types/fees';
import { AdmissionEnquiry } from '../types/admission';
import { ExamResult, ResultSummaryStats } from '../types/result';

export interface ReportOverviewStats {
  totalStudents: number;
  activeStudents: number;
  disabledStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  newAdmissionEnquiries: number;
  confirmedAdmissions: number;
  totalFeeCollected: number;
  totalPendingFee: number;
}

export interface ClassStudentCount {
  className: string;
  totalCount: number;
  activeCount: number;
  cbseCount: number;
  upBoardCount: number;
}

export interface AttendanceReportStats {
  totalRecords: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  attendancePercentage: number;
}

export interface FeesReportStats {
  totalExpectedFee: number;
  paidAmount: number;
  pendingAmount: number;
  paymentCount: number;
  paidStudentCount: number;
  partialStudentCount: number;
  pendingStudentCount: number;
}

export interface AdmissionReportStats {
  total: number;
  newCount: number;
  contactedCount: number;
  followUpCount: number;
  confirmedCount: number;
  notInterestedCount: number;
  closedCount: number;
}

export interface TeacherReportStats {
  totalTeachers: number;
  activeTeachers: number;
  disabledTeachers: number;
  totalSubjects: number;
  totalClassesAssigned: number;
}

export interface ReportFilterState {
  academicSession: string;
  className: string;
  section: string;
  board: string;
  startDate: string;
  endDate: string;
  status: string;
  searchQuery: string;
}

export const reportsService = {
  /**
   * Fetch all base data and calculate full analytics
   */
  async loadAllReportData() {
    try {
      const [
        students,
        teachers,
        attendances,
        feeSummaries,
        payments,
        enquiries,
        examResults
      ] = await Promise.all([
        studentService.getStudents(),
        teacherService.getTeachers(),
        attendanceService.getAttendanceHistory({}),
        feesService.getStudentFeeSummaries(),
        feesService.getAllPayments(),
        admissionService.getEnquiries(),
        resultService.getExamResults(),
      ]);

      return {
        students,
        teachers,
        attendances,
        feeSummaries,
        payments,
        enquiries,
        examResults,
      };
    } catch (error) {
      console.warn('Error fetching report analytics datasets:', error);
      return {
        students: [],
        teachers: [],
        attendances: [],
        feeSummaries: [],
        payments: [],
        enquiries: [],
        examResults: [],
      };
    }
  },

  /**
   * Calculate top overview stats card metrics
   */
  calculateOverviewStats(
    students: Student[],
    teachers: Teacher[],
    enquiries: AdmissionEnquiry[],
    feeSummaries: StudentFeeSummary[],
    payments: PaymentRecord[]
  ): ReportOverviewStats {
    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.status === 'ACTIVE').length;
    const disabledStudents = students.filter((s) => s.status === 'DISABLED').length;

    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter((t) => t.status === 'ACTIVE').length;

    const newAdmissionEnquiries = enquiries.filter((e) => e.status === 'NEW').length;
    const confirmedAdmissions = enquiries.filter((e) => e.status === 'ADMISSION_CONFIRMED').length;

    let totalFeeCollected = 0;
    payments.forEach((p) => {
      totalFeeCollected += Number(p.amount || 0);
    });

    let totalPendingFee = 0;
    feeSummaries.forEach((f) => {
      totalPendingFee += Number(f.pendingAmount || 0);
    });

    return {
      totalStudents,
      activeStudents,
      disabledStudents,
      totalTeachers,
      activeTeachers,
      newAdmissionEnquiries,
      confirmedAdmissions,
      totalFeeCollected,
      totalPendingFee,
    };
  },

  /**
   * Calculate Classwise student distribution
   */
  calculateClasswiseStudents(students: Student[]): ClassStudentCount[] {
    const classMap = new Map<string, { total: number; active: number; cbse: number; upBoard: number }>();

    students.forEach((s) => {
      const cls = s.className || 'Unassigned';
      const current = classMap.get(cls) || { total: 0, active: 0, cbse: 0, upBoard: 0 };
      current.total++;
      if (s.status === 'ACTIVE') current.active++;
      if (s.board === 'CBSE') current.cbse++;
      if (s.board === 'UP Board') current.upBoard++;
      classMap.set(cls, current);
    });

    const result: ClassStudentCount[] = [];
    classMap.forEach((val, className) => {
      result.push({
        className,
        totalCount: val.total,
        activeCount: val.active,
        cbseCount: val.cbse,
        upBoardCount: val.upBoard,
      });
    });

    // Custom class order sorting
    const classOrder = [
      'Nursery', 'LKG', 'UKG',
      'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
      'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
      'Class 11', 'Class 12'
    ];

    return result.sort((a, b) => {
      const idxA = classOrder.indexOf(a.className);
      const idxB = classOrder.indexOf(b.className);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.className.localeCompare(b.className);
    });
  },

  /**
   * Filter students for Student Report tab
   */
  filterStudents(students: Student[], filters: ReportFilterState): Student[] {
    return students.filter((s) => {
      if (filters.className && filters.className !== 'ALL' && s.className !== filters.className) return false;
      if (filters.section && filters.section !== 'ALL' && s.section.toUpperCase() !== filters.section.toUpperCase()) return false;
      if (filters.board && filters.board !== 'ALL' && s.board !== filters.board) return false;
      if (filters.status && filters.status !== 'ALL' && s.status !== filters.status) return false;
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchName = s.name.toLowerCase().includes(q);
        const matchId = s.studentId.toLowerCase().includes(q);
        const matchParent = s.parentName?.toLowerCase().includes(q);
        const matchPhone = s.phone?.includes(q);
        if (!matchName && !matchId && !matchParent && !matchPhone) return false;
      }
      return true;
    });
  },

  /**
   * Filter attendance records
   */
  filterAttendance(records: AttendanceRecord[], filters: ReportFilterState): AttendanceRecord[] {
    return records.filter((r) => {
      if (filters.className && filters.className !== 'ALL' && r.className !== filters.className) return false;
      if (filters.section && filters.section !== 'ALL' && r.section.toUpperCase() !== filters.section.toUpperCase()) return false;
      if (filters.status && filters.status !== 'ALL' && r.status !== filters.status) return false;
      if (filters.startDate && r.date < filters.startDate) return false;
      if (filters.endDate && r.date > filters.endDate) return false;
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchName = r.studentName?.toLowerCase().includes(q);
        const matchId = r.studentId?.toLowerCase().includes(q);
        const matchRoll = r.rollNumber?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchRoll) return false;
      }
      return true;
    });
  },

  /**
   * Calculate Attendance Report Stats
   */
  calculateAttendanceStats(records: AttendanceRecord[]): AttendanceReportStats {
    let present = 0;
    let absent = 0;
    let late = 0;
    let halfDay = 0;

    records.forEach((r) => {
      if (r.status === 'PRESENT') present++;
      else if (r.status === 'ABSENT') absent++;
      else if (r.status === 'LATE') late++;
      else if (r.status === 'HALF_DAY') halfDay++;
    });

    const total = records.length;
    // Count full present + half for percentage
    const weightedPresent = present + (late * 0.8) + (halfDay * 0.5);
    const attendancePercentage = total > 0 ? Math.round((weightedPresent / total) * 1000) / 10 : 0;

    return {
      totalRecords: total,
      present,
      absent,
      late,
      halfDay,
      attendancePercentage,
    };
  },

  /**
   * Filter Fees Summaries
   */
  filterFeeSummaries(summaries: StudentFeeSummary[], filters: ReportFilterState): StudentFeeSummary[] {
    return summaries.filter((f) => {
      if (filters.className && filters.className !== 'ALL' && f.className !== filters.className) return false;
      if (filters.section && filters.section !== 'ALL' && f.section.toUpperCase() !== filters.section.toUpperCase()) return false;
      if (filters.board && filters.board !== 'ALL' && f.board !== filters.board) return false;
      if (filters.status && filters.status !== 'ALL' && f.status !== filters.status) return false;
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchName = f.studentName.toLowerCase().includes(q);
        const matchId = f.studentId.toLowerCase().includes(q);
        const matchPhone = f.phone?.includes(q);
        if (!matchName && !matchId && !matchPhone) return false;
      }
      return true;
    });
  },

  /**
   * Calculate Fees Report Stats
   */
  calculateFeesStats(summaries: StudentFeeSummary[], payments: PaymentRecord[]): FeesReportStats {
    let totalExpectedFee = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    let paidStudentCount = 0;
    let partialStudentCount = 0;
    let pendingStudentCount = 0;

    summaries.forEach((s) => {
      totalExpectedFee += Number(s.totalFee || 0);
      paidAmount += Number(s.paidAmount || 0);
      pendingAmount += Number(s.pendingAmount || 0);

      if (s.status === 'PAID') paidStudentCount++;
      else if (s.status === 'PARTIAL') partialStudentCount++;
      else pendingStudentCount++;
    });

    return {
      totalExpectedFee,
      paidAmount,
      pendingAmount,
      paymentCount: payments.length,
      paidStudentCount,
      partialStudentCount,
      pendingStudentCount,
    };
  },

  /**
   * Filter Admission Enquiries
   */
  filterEnquiries(enquiries: AdmissionEnquiry[], filters: ReportFilterState): AdmissionEnquiry[] {
    return enquiries.filter((e) => {
      if (filters.className && filters.className !== 'ALL' && e.grade !== filters.className) return false;
      if (filters.board && filters.board !== 'ALL' && e.board !== filters.board) return false;
      if (filters.status && filters.status !== 'ALL' && e.status !== filters.status) return false;
      if (filters.startDate && e.createdAt.split('T')[0] < filters.startDate) return false;
      if (filters.endDate && e.createdAt.split('T')[0] > filters.endDate) return false;
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchStudent = e.studentName?.toLowerCase().includes(q);
        const matchParent = e.parentName?.toLowerCase().includes(q);
        const matchPhone = e.phone?.includes(q);
        const matchId = e.enquiryId?.toLowerCase().includes(q);
        if (!matchStudent && !matchParent && !matchPhone && !matchId) return false;
      }
      return true;
    });
  },

  /**
   * Calculate Admission Report Stats
   */
  calculateAdmissionStats(enquiries: AdmissionEnquiry[]): AdmissionReportStats {
    let newCount = 0;
    let contactedCount = 0;
    let followUpCount = 0;
    let confirmedCount = 0;
    let notInterestedCount = 0;
    let closedCount = 0;

    enquiries.forEach((e) => {
      if (e.status === 'NEW') newCount++;
      else if (e.status === 'CONTACTED') contactedCount++;
      else if (e.status === 'FOLLOW_UP') followUpCount++;
      else if (e.status === 'ADMISSION_CONFIRMED') confirmedCount++;
      else if (e.status === 'NOT_INTERESTED') notInterestedCount++;
      else if (e.status === 'CLOSED') closedCount++;
    });

    return {
      total: enquiries.length,
      newCount,
      contactedCount,
      followUpCount,
      confirmedCount,
      notInterestedCount,
      closedCount,
    };
  },

  /**
   * Filter Teachers for Teacher Report tab
   */
  filterTeachers(teachers: Teacher[], filters: ReportFilterState): Teacher[] {
    return teachers.filter((t) => {
      if (filters.status && filters.status !== 'ALL' && t.status !== filters.status) return false;
      if (filters.className && filters.className !== 'ALL' && !t.assignedClasses.includes(filters.className)) return false;
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchName = t.name.toLowerCase().includes(q);
        const matchId = t.teacherId.toLowerCase().includes(q);
        const matchEmail = t.email.toLowerCase().includes(q);
        const matchPhone = t.phone.includes(q);
        const matchSubjects = t.subjects.some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchId && !matchEmail && !matchPhone && !matchSubjects) return false;
      }
      return true;
    });
  },

  /**
   * Calculate Teacher Report Stats
   */
  calculateTeacherStats(teachers: Teacher[]): TeacherReportStats {
    const activeTeachers = teachers.filter((t) => t.status === 'ACTIVE').length;
    const disabledTeachers = teachers.filter((t) => t.status === 'DISABLED').length;

    const subjectsSet = new Set<string>();
    const classesSet = new Set<string>();

    teachers.forEach((t) => {
      t.subjects?.forEach((s) => subjectsSet.add(s));
      t.assignedClasses?.forEach((c) => classesSet.add(c));
    });

    return {
      totalTeachers: teachers.length,
      activeTeachers,
      disabledTeachers,
      totalSubjects: subjectsSet.size,
      totalClassesAssigned: classesSet.size,
    };
  },

  /**
   * Filter Exam Results
   */
  filterExamResults(results: ExamResult[], filters: ReportFilterState): ExamResult[] {
    return results.filter((r) => {
      if (filters.academicSession && filters.academicSession !== 'ALL' && r.academicSession !== filters.academicSession) return false;
      if (filters.className && filters.className !== 'ALL' && r.className !== filters.className) return false;
      if (filters.section && filters.section !== 'ALL' && r.section.toUpperCase() !== filters.section.toUpperCase()) return false;
      if (filters.board && filters.board !== 'ALL' && r.board !== filters.board) return false;
      if (filters.status && filters.status !== 'ALL' && r.status !== filters.status) return false;
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchName = r.studentName.toLowerCase().includes(q);
        const matchId = r.studentId.toLowerCase().includes(q);
        const matchExam = r.examName.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchExam) return false;
      }
      return true;
    });
  },
};
