export type ActivePage =
  | 'home'
  | 'about'
  | 'academics'
  | 'admissions'
  | 'facilities'
  | 'gallery'
  | 'news'
  | 'contact'
  | 'legal'
  | 'blog'
  | 'login'
  | 'forgot-password'
  | 'admin'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'portal';

export interface AdmissionEnquiry {
  id: string;
  studentName: string;
  parentName: string;
  phone: string;
  alternatePhone?: string;
  currentClass?: string;
  admissionClass?: string;
  boardPreference?: 'CBSE' | 'UP Board' | 'Not Sure' | 'Not Applicable';
  enquiryType?: string;
  previousSchool?: string;
  area?: string;
  preferredContactMethod?: 'Call' | 'WhatsApp';
  message?: string;
  consent?: boolean;
  status: 'New' | 'Received' | 'Reviewing' | 'Scheduled' | 'Approved';
  source?: string;
  createdAt: string;
  // Backward compatibility fields
  grade?: string;
  board?: string;
  email?: string;
  interestType?: string;
  remarks?: string;
  studentAge?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: 'Notice' | 'Event' | 'Achievement' | 'Academics' | 'Science Project';
  summary: string;
  content: string;
  imageUrl: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Campus' | 'Activities' | 'Sports' | 'Labs' | 'Celebrations';
  imageUrl: string;
}

export interface FacilityItem {
  id: string;
  name: string;
  description: string;
  iconName: string; // Lucide icon name matching
  imageUrl: string;
}
