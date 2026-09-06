import React from 'react';
import {
  Users,
  UserCheck,
  CalendarCheck,
  Award,
  BookOpen,
  CreditCard,
  Clock,
  Megaphone,
  UserPlus,
  Image,
  BarChart3,
  Settings,
  Plus,
  Search,
  Filter,
  Layers
} from 'lucide-react';

interface SubpageConfig {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  actionText?: string;
  emptyTitle: string;
  emptyDescription: string;
}

const SUBPAGE_CONFIGS: Record<string, SubpageConfig> = {
  students: {
    title: 'Student Directory',
    subtitle: 'Manage student profiles, enrollments, and academic records.',
    icon: Users,
    actionText: 'Add New Student',
    emptyTitle: 'No student records registered',
    emptyDescription: 'Student enrollment database will be connected in upcoming phase. You will be able to search, filter, and manage student files here.',
  },
  teachers: {
    title: 'Faculty & Staff Directory',
    subtitle: 'Manage teacher profiles, subject allocations, and staff schedules.',
    icon: UserCheck,
    actionText: 'Add New Teacher',
    emptyTitle: 'No faculty profiles registered',
    emptyDescription: 'Teacher roster and subject assignment modules will be connected in upcoming phase.',
  },
  attendance: {
    title: 'Attendance Management',
    subtitle: 'Track daily attendance logs for students and teaching faculty.',
    icon: CalendarCheck,
    actionText: 'Mark Attendance',
    emptyTitle: 'Attendance records clean',
    emptyDescription: 'Daily attendance tracking and report generation will be initialized in upcoming phase.',
  },
  results: {
    title: 'Results & Examinations',
    subtitle: 'Manage exam schedules, grade entry, report cards, and academic marksheets.',
    icon: Award,
    actionText: 'Publish Result',
    emptyTitle: 'No exam results published',
    emptyDescription: 'Examination management and report card publication engine will be initialized in upcoming phase.',
  },
  homework: {
    title: 'Homework & Assignments',
    subtitle: 'Oversee daily homework, syllabus tracking, and submission logs.',
    icon: BookOpen,
    actionText: 'Assign Homework',
    emptyTitle: 'No active assignments',
    emptyDescription: 'Digital homework and classwork assignment tools will be initialized in upcoming phase.',
  },
  fees: {
    title: 'Fee Collection & Accounting',
    subtitle: 'Track fee structures, tuition invoices, pending balances, and receipts.',
    icon: CreditCard,
    actionText: 'Collect Fee',
    emptyTitle: 'No fee records logged',
    emptyDescription: 'Fee collection ledger and instant receipt generation system will be connected in upcoming phase.',
  },
  timetable: {
    title: 'Class & Exam Timetables',
    subtitle: 'Configure daily schedules, class periods, and exam timetables.',
    icon: Clock,
    actionText: 'Create Timetable',
    emptyTitle: 'No timetables published',
    emptyDescription: 'Interactive class schedule planner and timetable engine will be initialized in upcoming phase.',
  },
  notices: {
    title: 'Notice & Announcement Board',
    subtitle: 'Broadcast official circulars, exam dates, and holiday notifications.',
    icon: Megaphone,
    actionText: 'Post New Notice',
    emptyTitle: 'No circulars posted',
    emptyDescription: 'Notice broadcasting and parental sms/email communication will be initialized in upcoming phase.',
  },
  admissions: {
    title: 'Admission Enquiries & Applications',
    subtitle: 'Review incoming admission applications and schedule parent interviews.',
    icon: UserPlus,
    actionText: 'New Enquiry',
    emptyTitle: 'No admission enquiries',
    emptyDescription: 'Live admission enquiries submitted on the public website will sync directly to this workspace in upcoming phase.',
  },
  gallery: {
    title: 'School Media & Event Gallery',
    subtitle: 'Upload campus photographs, sports day highlights, and event albums.',
    icon: Image,
    actionText: 'Upload Album',
    emptyTitle: 'No media uploaded',
    emptyDescription: 'Photo and video gallery content manager will be initialized in upcoming phase.',
  },
  reports: {
    title: 'Institutional Analytics & Reports',
    subtitle: 'Generate comprehensive academic, financial, and attendance reports.',
    icon: BarChart3,
    actionText: 'Export Report',
    emptyTitle: 'No analytical reports generated',
    emptyDescription: 'Automated statistical report generation and PDF exports will be connected in upcoming phase.',
  },
  settings: {
    title: 'System & School Settings',
    subtitle: 'Configure school details, academic session years, and administrative preferences.',
    icon: Settings,
    actionText: 'Save Changes',
    emptyTitle: 'Configuration Default Settings Active',
    emptyDescription: 'School session metadata and administrative security preferences are running on system default values.',
  },
};

interface AdminSubpageProps {
  sectionKey: string;
}

export default function AdminSubpage({ sectionKey }: AdminSubpageProps) {
  const config = SUBPAGE_CONFIGS[sectionKey] || {
    title: sectionKey.toUpperCase(),
    subtitle: 'Administrative management section.',
    icon: Layers,
    emptyTitle: 'Module initialized',
    emptyDescription: 'This administrative section will be connected in upcoming phase.',
  };

  const Icon = config.icon;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-[#001c46] text-[#FFC907] rounded-2xl shadow-xs shrink-0">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#001c46] tracking-tight">
              {config.title}
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5 max-w-xl">
              {config.subtitle}
            </p>
          </div>
        </div>

        {config.actionText && (
          <button
            disabled
            className="inline-flex items-center gap-2 bg-[#001c46]/40 text-[#FFC907] px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-not-allowed shadow-xs shrink-0 opacity-70"
            title="Action button disabled - module under construction for phase 2"
          >
            <Plus className="w-4 h-4" />
            <span>{config.actionText}</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            disabled
            placeholder={`Search ${config.title.toLowerCase()}...`}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-400 cursor-not-allowed"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            disabled
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-400 rounded-xl text-xs font-bold cursor-not-allowed"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Main Content Area - Clean Empty State Card */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-10 text-center space-y-4 max-w-2xl mx-auto my-6">
        <div className="w-16 h-16 bg-blue-50 text-[#001c46] rounded-2xl flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
          <Icon className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-black text-[#001c46]">{config.emptyTitle}</h3>
          <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
            {config.emptyDescription}
          </p>
        </div>

        <div className="pt-2">
          <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
            Phase 2 Infrastructure Module
          </span>
        </div>
      </div>
    </div>
  );
}
