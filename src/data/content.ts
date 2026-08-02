import { NewsItem, GalleryItem, FacilityItem } from '../types';

export const SCHOOL_DETAILS = {
  name: 'GP Academy',
  tagline: 'Knowledge Is the Biggest Money',
  address: 'Bhangel, Goyal Colony, Salarpur Khadar, Noida, Uttar Pradesh 201304',
  phone: '+91 9818776563',
  email: 'admissions@gpacademy.edu.in',
  hoursWeekday: 'Mon-Sat: 8:00 AM - 3:00 PM',
  hoursWeekend: 'Sun: 9:00 AM - 2:00 PM',
  classes: 'Nursery to Class 12',
  curriculum: 'CBSE & UP Board',
  offers: {
    admission: 'Free Admission (June to August)',
    extras: 'Free School Tie & Belt upon successful onboarding',
    referral: 'Bring 3 Admissions, Get 3 Months Tuition Fee waiver (T&C Apply)',
    duration: 'Valid from June to August'
  }
};

export const FACILITIES: FacilityItem[] = [
  {
    id: 'fac-1',
    name: 'Smart Classrooms',
    description: 'Digitally enabled learning spaces with projectors, high-definition displays, and interactive touch systems to bring complex topics to life.',
    iconName: 'Laptop',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'fac-2',
    name: 'Advanced Science Labs',
    description: 'Fully equipped Physics, Chemistry, and Biology laboratories enabling practical experimentation and scientific analysis conforming strictly to board standards.',
    iconName: 'Beaker',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'fac-3',
    name: 'Tech & Computer Center',
    description: 'High-speed computer systems paired with industry-grade software for foundational coding, AI introduction, and overall digital fluency.',
    iconName: 'Cpu',
    imageUrl: 'https://images.unsplash.com/photo-1548345680-f5475ea5df84?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'fac-4',
    name: 'Resource-Rich Library',
    description: 'An expansive library hosting academic text reference material, educational magazines, international periodicals, and self-study cabins.',
    iconName: 'BookOpen',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'fac-5',
    name: 'Modern Sports Complex',
    description: 'Indoor and outdoor playfields with provisions for basketball, cricket nets, football, table tennis, and dedicated physical instructors.',
    iconName: 'Trophy',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'fac-6',
    name: 'Performing Arts & Audio Center',
    description: 'A platform to encourage music, classical and contemporary dance, theater acts, and visual self-expression through arts and crafts.',
    iconName: 'Music',
    imageUrl: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&q=80&w=1000'
  }
];

export const GALLERY_IMAGES: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Annual Function Celebrations',
    category: 'Celebrations',
    imageUrl: 'https://cdn.phototourl.com/free/2026-08-02-be920722-7e17-435f-bc56-772a27761430.jpg'
  },
  {
    id: 'gal-2',
    title: "Teachers' Day Celebration",
    category: 'Celebrations',
    imageUrl: 'https://cdn.phototourl.com/free/2026-08-02-08240ee6-f703-4cd7-b526-b9f57c7c07d7.jpg'
  },
  {
    id: 'gal-3',
    title: 'School Teachers Celebration',
    category: 'Celebrations',
    imageUrl: 'https://cdn.phototourl.com/free/2026-08-02-b5095f4c-7a71-419b-8ba3-327afc842161.jpg'
  },
  {
    id: 'gal-4',
    title: 'Chief Guest Welcome',
    category: 'Celebrations',
    imageUrl: 'https://cdn.phototourl.com/free/2026-08-02-ec40fea8-19ca-438f-a187-c79e36248765.jpg'
  },
  {
    id: 'gal-5',
    title: 'Computer Lab Session',
    category: 'Labs',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=90&w=1600'
  },
  {
    id: 'gal-6',
    title: 'Nursery Creative Corner',
    category: 'Activities',
    imageUrl: 'https://images.unsplash.com/photo-1564424224827-cd24b8915874?auto=format&fit=crop&q=90&w=1600'
  },
  {
    id: 'gal-7',
    title: 'Student Science Project Exhibition',
    category: 'Labs',
    imageUrl: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&q=90&w=1600'
  },
  {
    id: 'gal-8',
    title: 'Yoga and Meditation Assembly',
    category: 'Activities',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=90&w=1600'
  }
];

export const NEWS_EVENTS: NewsItem[] = [
  {
    id: 'news-1',
    title: 'GP Academy Noida Announces WAIVED Admission Fees!',
    date: 'July 10, 2026',
    category: 'Notice',
    summary: 'In an effort to promote local accessibility, all standard registration & admission charges are fully waived from June through August.',
    content: 'We are delighted to declare that parents applying for Nursery up to Class 12 for the current cycle can secure admission with ZERO registration fees. Furthermore, a complimentary Academy set (official Tie and Belt) is gifted to all new admissions upon onboarding.',
    imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'news-2',
    title: 'Exceptional CBSE and UP Board High-Tier Results',
    date: 'May 28, 2026',
    category: 'Achievement',
    summary: 'Our Tenth & Twelfth Graders achieve a 100% Board Pass Rate, securing highest tier ranks in Noida region.',
    content: 'Once again, students at GP Academy have demonstrated outstanding focus. Over 40% of our Senior Secondary students scored above 90% aggregate in CBSE and UP Board examinations, with exemplary subject-toppers in Mathematics, Chemistry, and English.',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'news-3',
    title: 'Annual Student Science Project & Innovation Exhibition',
    date: 'August 12, 2026',
    category: 'Science Project',
    summary: 'Our talented students from Classes 6-12 showcased innovative working science projects, hydraulic models, solar energy systems, and smart robotics prototypes.',
    content: 'GP Academy hosted its grand Annual Science Project & Innovation Fair. Over 60 working models were presented by students covering renewable solar power grids, automated drip irrigation, working hydraulic lift bridges, environmental pollution sensors, and AI-powered robotics kits. Parents and visiting chief guests highly appreciated the practical problem-solving skills and scientific creativity displayed by our young innovators.',
    imageUrl: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&q=80&w=800'
  }
];

export const FAQ_ITEMS = [
  {
    question: 'Where is GP Academy located?',
    answer: 'We are situated in Noida: Bhangel, Goyal Colony, Salarpur Khadar, Noida, Uttar Pradesh 201304. Our central location makes us easily accessible for students nearby Goyal Colony and Salarpur.'
  },
  {
    question: 'What are the current admission benefits?',
    answer: 'We have exclusive seasonal offers running from June to August: Free Admission (Zero admission fee), Free School Tie & Belt, and a robust referral offer: bring 3 admissions, get 3 months fee absolutely free!'
  },
  {
    question: 'What boards and classes are offered?',
    answer: 'We run classes from Nursery to Class 12. We offer standard CBSE curriculum throughout all grades, and flexible UP Board stream choices for Classes 10 to 12.'
  },
  {
    question: 'Are extra academic support classes available?',
    answer: 'Yes! GP Academy features premium after-school remedial and foundation support classes to help students clarify doubts and strengthen core academic concepts.'
  },
  {
    question: 'What are the operating hours?',
    answer: 'We operate Monday to Saturday from 8:00 AM to 3:00 PM, and on Sundays from 9:00 AM to 2:00 PM to support extra-curricular activities, special projects, and student guidance assessments.'
  }
];
