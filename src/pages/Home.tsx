import React from 'react';
import { motion } from 'motion/react';
import { ActivePage } from '../types';
import { GALLERY_IMAGES } from '../data/content';
import { 
  CheckCircle, 
  Globe, 
  GraduationCap, 
  Award, 
  Compass, 
  BookOpen, 
  Beaker, 
  ArrowRight,
  ShieldCheck,
  Star,
  MessageSquare,
  Plus,
  Quote,
  ThumbsUp,
  Filter,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Send,
  Check,
  Calculator,
  Code,
  Cpu,
  Camera,
  Image as ImageIcon,
  ZoomIn,
  X,
  ChevronDown,
  HelpCircle
} from 'lucide-react';

interface HomeProps {
  setActivePage: (page: ActivePage) => void;
  onOpenApplyModal: () => void;
}

export default function Home({ setActivePage, onOpenApplyModal }: HomeProps) {
  const [reviews, setReviews] = React.useState([
    {
      name: "Rajesh Kumar Sharma",
      relation: "Father of Aarav, Class X",
      rating: 5,
      text: "The board results of GP Academy speak for themselves. The rigorous weekly mock tests and disciplined study environment helped my son score 95% in his secondary exams. Highly recommended school in the region!",
      tag: "Academics",
      date: "June 2026"
    },
    {
      name: "Meenakshi Jha",
      relation: "Mother of Ananya, Class II",
      rating: 5,
      text: "Such a warm and caring atmosphere for small kids! The teachers of Pre-Primary are extremely patient. My daughter used to cry going to her previous school, but now she is excited every morning.",
      tag: "Pre-Primary",
      date: "July 2026"
    },
    {
      name: "Dr. Vikram Aditya Singh",
      relation: "Father of Shreya, Class XII",
      rating: 5,
      text: "An exceptional institution that balances academic pressure with emotional support. The science labs are state-of-the-art, and the focus on career guidance in high school is excellent.",
      tag: "Infrastructure",
      date: "May 2026"
    },
    {
      name: "Sunita Yadav",
      relation: "Mother of Rohan & Amit, Class VI & VIII",
      rating: 5,
      text: "GP Academy's discipline is outstanding. They teach moral values alongside modern education. The digital smart classes have made learning very engaging for my sons.",
      tag: "Discipline",
      date: "July 2026"
    },
    {
      name: "Gopal Prasad Gupta",
      relation: "Father of Divya, Class V",
      rating: 5,
      text: "Very transparent administration and regular parent-teacher interactions. The school portal keeps us updated daily on homework and attendance. Excellent communication.",
      tag: "Academics",
      date: "June 2026"
    },
    {
      name: "Preeti Deshmukh",
      relation: "Mother of Kabir, Class I",
      rating: 5,
      text: "We shifted to this city mid-term, but the transition was completely smooth. The remedial classes provided by the teachers helped my son catch up with the CBSE syllabus very quickly.",
      tag: "Academics",
      date: "April 2026"
    },
    {
      name: "Sandeep Srivastava",
      relation: "Father of Yash, Class XI",
      rating: 5,
      text: "Excellent coaching for national competitive examinations. The teachers don't just focus on boards, but also guide students for JEE/NEET basics. Very satisfied parent.",
      tag: "Academics",
      date: "June 2026"
    },
    {
      name: "Anjali Saxena",
      relation: "Mother of Riya, Class VII",
      rating: 5,
      text: "The holistic development focus is real. Riya participates in debates, science exhibitions, and music clubs. It has boosted her public speaking confidence tremendously.",
      tag: "Activities",
      date: "May 2026"
    },
    {
      name: "Mohammad Imran",
      relation: "Father of Sara, Class IX",
      rating: 5,
      text: "Excellent computer education lab. My daughter has learned Python basics in class 8 itself. The teachers are highly tech-savvy and encourage logical thinking.",
      tag: "Infrastructure",
      date: "July 2026"
    },
    {
      name: "Kiran Mazumdar",
      relation: "Mother of Devansh, Class II",
      rating: 5,
      text: "The focus on sports is what I love most. The school has a massive playground and professional trainers. Devansh has won a regional medal in skating already!",
      tag: "Activities",
      date: "March 2026"
    },
    {
      name: "Rameshwar Tripathi",
      relation: "Father of Gauri, Class XII",
      rating: 5,
      text: "A pure legacy of educational excellence. GP Academy prioritizes student safety with strict bus tracking and fully monitored campus. Peace of mind for us parents.",
      tag: "Infrastructure",
      date: "January 2026"
    },
    {
      name: "Shalini Mishra",
      relation: "Mother of Prisha, Class IV",
      rating: 5,
      text: "I appreciate the individual attention each child gets here. The low student-teacher ratio ensures no child is left behind. My daughter's reading speed has improved twice over.",
      tag: "Academics",
      date: "June 2026"
    },
    {
      name: "Baldev Singh",
      relation: "Father of Gurpreet, Class VIII",
      rating: 5,
      text: "Character building and patriotism are core pillars here. The morning assemblies are full of positivity, and student council activities teach leadership early.",
      tag: "Discipline",
      date: "May 2026"
    },
    {
      name: "Nutan Chawla",
      relation: "Mother of Sahil, Class X",
      rating: 5,
      text: "The counseling and emotional support desk at GP Academy is top-notch. It helped my son deal with exam anxiety wonderfully. They care about mental health.",
      tag: "Discipline",
      date: "February 2026"
    },
    {
      name: "Sanjay Joshi",
      relation: "Father of Nitin, Class VI",
      rating: 5,
      text: "We love the Student Referral Program. More than that, the fee structure is extremely transparent with no hidden charges or sudden developmental fees. Pure trust.",
      tag: "Academics",
      date: "April 2026"
    },
    {
      name: "Poonam Chaturvedi",
      relation: "Mother of Kavya, Class K.G.",
      rating: 5,
      text: "Beautiful sensory play area and activity rooms for tiny tots. GP Academy understands that early years need touch, play, and visual stimuli rather than heavy bags.",
      tag: "Pre-Primary",
      date: "July 2026"
    },
    {
      name: "Ajay Rathore",
      relation: "Father of Abhay, Class IX",
      rating: 5,
      text: "Excellent discipline and anti-bullying policies. The faculty is very strict about respectful behavior, which is rare to find in schools nowadays.",
      tag: "Discipline",
      date: "May 2026"
    },
    {
      name: "Rashmi Agrawal",
      relation: "Mother of Tanya, Class XI",
      rating: 5,
      text: "Special praise to the English communication environment. My daughter speaks so fluently now, and she won the inter-school English elocution competition!",
      tag: "Activities",
      date: "June 2026"
    },
    {
      name: "Vikas Dwivedi",
      relation: "Father of Ishaan, Class V",
      rating: 5,
      text: "The digital smart classes are brilliant. Instead of rote learning, teachers explain science concepts using interactive 3D videos. Ishaan loves science now!",
      tag: "Infrastructure",
      date: "July 2026"
    },
    {
      name: "Gurumurthy Iyer",
      relation: "Father of Srinivas, Class XII",
      rating: 5,
      text: "GP Academy is definitely the best school in the region for board preparation. Their structured revision schedules, regular assessments, and expert guidance are highly professional.",
      tag: "Academics",
      date: "June 2026"
    }
  ]);

  const [activeFilter, setActiveFilter] = React.useState('All');
  const [visibleCount, setVisibleCount] = React.useState(6);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const filteredReviews = activeFilter === 'All' 
    ? reviews 
    : reviews.filter(r => r.tag === activeFilter);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const cardWidth = 380; // approximate width of card + gap
      const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const [marqueeDirection, setMarqueeDirection] = React.useState<'left' | 'right'>('left');

  // Form states
  const [newReview, setNewReview] = React.useState({
    name: '',
    relation: '',
    rating: 5,
    text: '',
    tag: 'Academics'
  });

  // Coaching Enquiry Form States
  const [coachingEnquiry, setCoachingEnquiry] = React.useState({
    studentName: '',
    parentName: '',
    phone: '',
    studentClass: 'Class 10',
    selectedCourse: 'Foundation Coaching (Classes 6-8)',
    message: ''
  });
  const [isCoachingSubmitted, setIsCoachingSubmitted] = React.useState(false);

  // Gallery Lightbox states for homepage
  const [activeHomeLightboxImg, setActiveHomeLightboxImg] = React.useState<string | null>(null);
  const [activeHomeLightboxTitle, setActiveHomeLightboxTitle] = React.useState('');

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);

  const handleCoachingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCoachingEnquiry(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitCoachingEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachingEnquiry.studentName.trim() || !coachingEnquiry.phone.trim()) {
      return;
    }
    setIsCoachingSubmitted(true);
    setTimeout(() => {
      setIsCoachingSubmitted(false);
      setCoachingEnquiry({
        studentName: '',
        parentName: '',
        phone: '',
        studentClass: 'Class 10',
        selectedCourse: 'Foundation Coaching (Classes 6-8)',
        message: ''
      });
    }, 3500);
  };

  const handleRatingChange = (rating: number) => {
    setNewReview(prev => ({ ...prev, rating }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewReview(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.relation.trim() || !newReview.text.trim()) {
      return;
    }

    const reviewToAdd = {
      ...newReview,
      date: 'Today'
    };

    setReviews(prev => [reviewToAdd, ...prev]);
    setIsSubmitted(true);
    setNewReview({
      name: '',
      relation: '',
      rating: 5,
      text: '',
      tag: 'Academics'
    });

    setTimeout(() => {
      setIsSubmitted(false);
      setIsFormOpen(false);
    }, 2500);
  };

  return (
    <div className="pb-16 animate-fadeIn">
      {/* Hero Section */}
      <section className="relative bg-[#1A325D] py-12 lg:py-0 lg:h-[428px] flex items-center overflow-hidden text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-6 relative z-10">
            <div className="flex flex-wrap gap-3">
              <div className="bg-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
                <CheckCircle className="w-4 h-4 text-[#1A325D]" />
                <span className="text-[#1A325D] font-bold text-[11px] md:text-xs tracking-wide">
                  Admissions Open 2026-27
                </span>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
                <Globe className="w-4 h-4 text-[#1A325D]" />
                <span className="text-[#1A325D] font-bold text-[11px] md:text-xs tracking-wide">
                  Globally Recognized
                </span>
              </div>
            </div>
            
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-white">
              GP Academy: India's <span className="text-[#FFC907]">Leading Institution</span> for Excellence
            </h1>
            
            <div className="flex flex-wrap gap-5 text-white/80 text-[11px] md:text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#FFC907]" /> CBSE Curriculum
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#FFC907]" /> Holistic Development
              </span>
            </div>

            {/* Program Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="border border-white/20 rounded-xl p-3 bg-white/5 hover:bg-white/10 transition-all text-center">
                <p className="text-[#FFC907] font-bold text-sm">Nursery</p>
                <p className="text-white/60 text-[9px] uppercase tracking-wider">Foundation</p>
              </div>
              <div className="border border-white/20 rounded-xl p-3 bg-white/5 hover:bg-white/10 transition-all text-center">
                <p className="text-[#FFC907] font-bold text-sm">Primary</p>
                <p className="text-white/60 text-[9px] uppercase tracking-wider">Class 1-5</p>
              </div>
              <div className="border border-white/20 rounded-xl p-3 bg-white/5 hover:bg-white/10 transition-all text-center">
                <p className="text-[#FFC907] font-bold text-sm">Middle</p>
                <p className="text-white/60 text-[9px] uppercase tracking-wider">Class 6-8</p>
              </div>
              <div className="border border-white/20 rounded-xl p-3 bg-white/5 hover:bg-white/10 transition-all text-center">
                <p className="text-[#FFC907] font-bold text-sm">Secondary</p>
                <p className="text-white/60 text-[9px] uppercase tracking-wider">Class 9-12</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                onClick={onOpenApplyModal}
                className="bg-[#FFC907] text-[#1A325D] hover:bg-yellow-500 px-6 py-3 rounded-xl font-bold text-xs md:text-sm text-center transition-all active:scale-95 cursor-pointer border-2 border-black shadow-[0_4px_15px_rgba(255,255,255,0.25)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.4)]"
              >
                Get Free Counselling
              </button>
              <button 
                onClick={() => setActivePage('academics')}
                className="bg-white text-[#1A325D] hover:bg-gray-100 px-6 py-3 rounded-xl font-bold text-xs md:text-sm text-center transition-all active:scale-95 cursor-pointer border-2 border-black shadow-[0_4px_15px_rgba(255,255,255,0.25)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.4)]"
              >
                Explore All Programs
              </button>
            </div>
          </div>

          {/* Right Image with Curved Mask */}
          <div className="lg:col-span-5 relative h-[260px] sm:h-[320px] lg:h-[380px]">
            <div className="absolute inset-0 overflow-hidden rounded-2xl lg:rounded-none lg:rounded-l-[140px] border-l-8 border-t-8 lg:border-t-0 border-[#FFC907] shadow-2xl">
              <img 
                alt="GP Academy Academic Excellence" 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=1200"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>


      {/* Excellence Numbers */}
      <section className="bg-gradient-to-br from-[#1A325D] to-[#2A4E8C] text-white" style={{ height: '105px', paddingTop: '0px' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center w-full" style={{ fontSize: '4px', lineHeight: '22px' }}>
            <motion.div 
              className="p-1 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors cursor-default"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{ type: 'spring', stiffness: 180, damping: 12 }}
              style={{ paddingTop: '8px', marginTop: '0px', lineHeight: '28px' }}
            >
              <div className="font-bold text-[#FFC907]" style={{ fontSize: '40px' }}>14+</div>
              <p className="text-[10px] uppercase tracking-widest opacity-80">Grades (K-12)</p>
            </motion.div>

            <motion.div 
              className="p-1 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors cursor-default"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 0.1 }}
              style={{ lineHeight: '29px' }}
            >
              <div className="font-bold text-[#FFC907]" style={{ fontSize: '40px' }}>CBSE</div>
              <p className="text-[10px] uppercase tracking-widest opacity-80">Curriculum</p>
            </motion.div>

            <motion.div 
              className="p-1 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors cursor-default"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 0.2 }}
              style={{ lineHeight: '30px' }}
            >
              <div className="font-bold text-[#FFC907]" style={{ fontSize: '40px' }}>100%</div>
              <p className="text-[10px] uppercase tracking-widest opacity-80">Board Results</p>
            </motion.div>

            <motion.div 
              className="p-1 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors cursor-default"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 0.3 }}
              style={{ lineHeight: '31px' }}
            >
              <div className="font-bold text-[#FFC907]" style={{ fontSize: '40px' }}>24/7</div>
              <p className="text-[10px] uppercase tracking-widest opacity-80">Academic Support</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why GP Academy */}
      <section className="bg-gray-50 animate-fadeIn py-12 lg:py-0 lg:h-[500px] lg:pt-[3px]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10 lg:mb-[34px] lg:h-[68px] flex flex-col justify-between">
            <span className="text-xs md:text-sm font-bold text-[#1A325D] uppercase tracking-widest">Core Values</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#1A325D]">Why Choose Our Institution?</h2>
            <div className="w-24 h-1.5 bg-[#FFC907] mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:h-auto pt-0">
            {/* Feature 1 */}
            <div className="relative overflow-hidden bg-white p-6 lg:p-8 rounded-2xl border border-gray-150 hover:border-[#FFC907] transition-all duration-300 group hover:-translate-y-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_24px_50px_rgba(26,50,93,0.12)] flex flex-col justify-between">
              {/* Top accent glow line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1A325D] to-[#FFC907] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Decorative background watermark number */}
              <span className="text-6xl font-black text-gray-100 absolute right-4 top-3 select-none pointer-events-none group-hover:text-[#FFC907]/10 group-hover:scale-110 transition-all duration-300 z-0">01</span>
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-[#1A325D] to-[#2A4E8C] rounded-xl flex items-center justify-center text-[#FFC907] mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-sm">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-[#1A325D] group-hover:text-[#2A4E8C] transition-colors">Rigorous Academics</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">Structured learning path designed to master core concepts and excel in national board examinations.</p>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#1A325D] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4 text-[#FFC907]" />
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="relative overflow-hidden bg-white p-6 lg:p-8 rounded-2xl border border-gray-150 hover:border-[#FFC907] transition-all duration-300 group hover:-translate-y-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_24px_50px_rgba(26,50,93,0.12)] flex flex-col justify-between">
              {/* Top accent glow line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1A325D] to-[#FFC907] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Decorative background watermark number */}
              <span className="text-6xl font-black text-gray-100 absolute right-4 top-3 select-none pointer-events-none group-hover:text-[#FFC907]/10 group-hover:scale-110 transition-all duration-300 z-0">02</span>
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-[#1A325D] to-[#2A4E8C] rounded-xl flex items-center justify-center text-[#FFC907] mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-sm">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-[#1A325D] group-hover:text-[#2A4E8C] transition-colors">Holistic Development</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">Focus on physical education, mental well-being, and emotional intelligence for well-rounded growth.</p>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#1A325D] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4 text-[#FFC907]" />
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="relative overflow-hidden bg-white p-6 lg:p-8 rounded-2xl border border-gray-150 hover:border-[#FFC907] transition-all duration-300 group hover:-translate-y-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_24px_50px_rgba(26,50,93,0.12)] flex flex-col justify-between">
              {/* Top accent glow line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1A325D] to-[#FFC907] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Decorative background watermark number */}
              <span className="text-6xl font-black text-gray-100 absolute right-4 top-3 select-none pointer-events-none group-hover:text-[#FFC907]/10 group-hover:scale-110 transition-all duration-300 z-0">03</span>
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-[#1A325D] to-[#2A4E8C] rounded-xl flex items-center justify-center text-[#FFC907] mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-sm">
                  <Beaker className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-[#1A325D] group-hover:text-[#2A4E8C] transition-colors">Modern Facilities</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">Advanced science labs, computer centers, and digital smart classes to foster innovation.</p>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#1A325D] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4 text-[#FFC907]" />
              </div>
            </div>
          </div>

          {/* Referral Banner */}
          <div className="mt-12 lg:mt-[26px] bg-gray-200/60 rounded-3xl p-6 md:p-8 lg:pt-[14px] lg:pb-[15px] lg:mb-0 flex flex-col md:flex-row items-center justify-between gap-6 border-l-8 border-[#FFC907]">
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#1A325D]">Parents Admission Promotion Scheme</h3>
              <p className="text-xs sm:text-sm text-gray-600">June se August tak tuition fees bilkul free, agar koi parents 3 students ka admission karwate hain! (Get 100% tuition fee exemption from June to August for securing admission of 3 students.)</p>
            </div>
            <button 
              onClick={() => setActivePage('contact')}
              className="bg-[#1A325D] text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap hover:bg-opacity-90 transition-all cursor-pointer shadow-md"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Academic Programs */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28">
              <span className="text-xs md:text-sm font-bold text-[#FFC907] uppercase tracking-[0.2em]">Learning Paths</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#1A325D] leading-tight">Educational Excellence at Every Stage</h2>
              <p className="text-sm text-gray-500 leading-relaxed">Our curriculum is carefully sequenced to provide a progressive learning journey from the earliest years to professional preparation.</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                  <ShieldCheck className="w-6 h-6 text-[#1A325D]" />
                  <span className="font-bold text-[#1A325D]">CBSE National Standard</span>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                  <ShieldCheck className="w-6 h-6 text-[#1A325D]" />
                  <span className="font-bold text-[#1A325D]">UP Board Integrated Options</span>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Pre-Primary */}
              <motion.div 
                onClick={() => setActivePage('academics')}
                className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/60 border border-amber-200/80 hover:border-amber-400 hover:bg-gradient-to-br hover:from-amber-100/80 hover:to-orange-100/60 transition-all group cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-lg">Stage 1</span>
                    <span className="text-sm font-extrabold text-amber-400">01</span>
                  </div>
                  <h3 className="text-lg font-bold text-amber-950 mb-2 group-hover:text-amber-900">Pre-Primary</h3>
                  <p className="text-xs sm:text-sm text-amber-800/80 mb-4">Play-based learning focusing on motor skills and social discovery. (Nursery - UKG)</p>
                </div>
                <span className="text-xs text-amber-900 font-bold flex items-center gap-2 group-hover:gap-4 transition-all mt-auto pt-2">
                  Explore <ArrowRight className="w-4 h-4 text-amber-600" />
                </span>
              </motion.div>

              {/* Primary */}
              <motion.div 
                onClick={() => setActivePage('academics')}
                className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/60 border border-emerald-200/80 hover:border-emerald-400 hover:bg-gradient-to-br hover:from-emerald-100/80 hover:to-teal-100/60 transition-all group cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03, y: -6 }}
                transition={{ duration: 0.3, delay: 0.05 }}
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-lg">Stage 2</span>
                    <span className="text-sm font-extrabold text-emerald-400">02</span>
                  </div>
                  <h3 className="text-lg font-bold text-emerald-950 mb-2 group-hover:text-emerald-900">Primary</h3>
                  <p className="text-xs sm:text-sm text-emerald-800/80 mb-4">Building strong foundations in numeracy, literacy, and creative thinking. (Class 1 - 5)</p>
                </div>
                <span className="text-xs text-emerald-900 font-bold flex items-center gap-2 group-hover:gap-4 transition-all mt-auto pt-2">
                  Explore <ArrowRight className="w-4 h-4 text-emerald-600" />
                </span>
              </motion.div>

              {/* Middle */}
              <motion.div 
                onClick={() => setActivePage('academics')}
                className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/60 border border-blue-200/80 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-100/80 hover:to-indigo-100/60 transition-all group cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03, y: -6 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-lg">Stage 3</span>
                    <span className="text-sm font-extrabold text-blue-400">03</span>
                  </div>
                  <h3 className="text-lg font-bold text-blue-950 mb-2 group-hover:text-blue-900">Middle</h3>
                  <p className="text-xs sm:text-sm text-blue-800/80 mb-4">Transitioning to complex problem solving and scientific inquiry. (Class 6 - 8)</p>
                </div>
                <span className="text-xs text-blue-900 font-bold flex items-center gap-2 group-hover:gap-4 transition-all mt-auto pt-2">
                  Explore <ArrowRight className="w-4 h-4 text-blue-600" />
                </span>
              </motion.div>

              {/* Secondary */}
              <motion.div 
                onClick={() => setActivePage('academics')}
                className="p-6 rounded-2xl bg-gradient-to-br from-purple-50/80 to-pink-50/60 border border-purple-200/80 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-100/80 hover:to-pink-100/60 transition-all group cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03, y: -6 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-2.5 py-1 text-xs font-bold bg-purple-100 text-purple-800 rounded-lg">Stage 4</span>
                    <span className="text-sm font-extrabold text-purple-400">04</span>
                  </div>
                  <h3 className="text-lg font-bold text-purple-950 mb-2 group-hover:text-purple-900">Secondary</h3>
                  <p className="text-xs sm:text-sm text-purple-800/80 mb-4">Advanced preparation for board exams and career orientation. (Class 9 - 12)</p>
                </div>
                <span className="text-xs text-purple-900 font-bold flex items-center gap-2 group-hover:gap-4 transition-all mt-auto pt-2">
                  Explore <ArrowRight className="w-4 h-4 text-purple-600" />
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Coaching Classes & Entrance Prep Section */}
      <section className="py-24 bg-[#1A325D] text-white relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFC907]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFC907]/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
          
          {/* Section Header & Full-Width Visual Banner at the Top (Head) */}
          <div className="space-y-8">
            <div className="space-y-4 text-center max-w-3xl mx-auto">
              <span className="text-xs md:text-sm font-bold text-[#FFC907] uppercase tracking-[0.2em] bg-white/10 px-3.5 py-1.5 rounded-full inline-block">
                Specialized Coaching Division
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-white leading-tight">
                GP Academy Coaching & Competitive Prep
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mx-auto">
                We offer high-results-oriented specialized coaching classes in the school campus after regular hours. Empowering students to excel both in school exams and top competitive examinations with distinct fee models.
              </p>
              <div className="w-20 h-1.5 bg-[#FFC907] rounded-full mx-auto"></div>
            </div>

            {/* Visual Banner for Coaching - Full Width Head Banner */}
            <div className="relative h-48 sm:h-64 md:h-80 rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1600&h=600" 
                alt="Specialized Coaching & Mentorship"
                className="w-full h-full object-cover brightness-50 group-hover:scale-102 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A325D] via-transparent to-transparent flex flex-col justify-end p-6 sm:p-10">
                <span className="text-[10px] sm:text-xs font-bold text-[#FFC907] uppercase tracking-[0.2em] mb-1">Interactive & Expert Tutoring</span>
                <h3 className="text-base sm:text-xl md:text-2xl font-bold text-white leading-snug">
                  Unlock Academic Excellence with GP Super Coaching
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-200 mt-2 max-w-2xl leading-relaxed">
                  Guided by highly experienced mentors, using modern conceptual learning toolkits, daily doubt clearance, and continuous progress analytics.
                </p>
              </div>
            </div>
          </div>

          {/* Grid Layout: Left (Subjects) and Right (Enquiry Form) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Coaching Courses/Subjects */}
            <div className="lg:col-span-7 space-y-6">
              <div className="border-b border-white/15 pb-3">
                <h3 className="text-lg sm:text-xl font-bold text-[#FFC907] tracking-tight">
                  Available Coaching Courses & Fees
                </h3>
                <p className="text-xs text-gray-300 mt-1">Explore our current offline specialized coaching batches.</p>
              </div>

              {/* Coaching Courses Grid */}
              <div className="space-y-4">
                {[
                  {
                    name: 'Foundation Coaching (Science & Maths)',
                    classes: 'Classes 6-8',
                    fee: '₹1,200 / Month',
                    icon: <Calculator className="w-5 h-5" />,
                    color: 'text-indigo-400',
                    subjects: ['Mathematics', 'Science', 'Logical Reasoning', 'English'],
                    desc: 'Enhances cognitive abilities, conceptual reasoning and fundamental clarity to build confidence for senior levels.'
                  },
                  {
                    name: 'Coding, Robotics & AI Special',
                    classes: 'Classes 6-12',
                    fee: '₹1,500 / Month',
                    icon: <Code className="w-5 h-5" />,
                    color: 'text-teal-400',
                    subjects: ['Python Programming', 'HTML/CSS/JS', 'AI & Machine Learning Basics', 'Robotics Kits'],
                    desc: 'Practical, project-based laboratory classes equipping kids with critical future-ready technological and coding skillsets.'
                  }
                ].map((course, idx) => (
                  <motion.div
                    key={course.name}
                    className="p-5 bg-white/5 border border-white/10 hover:border-[#FFC907]/40 rounded-2xl transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ${course.color}`}>
                          {course.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-white">{course.name}</h4>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#FFC907]">
                            {course.classes}
                          </span>
                        </div>
                      </div>
                      
                      {/* Price tag */}
                      <div className="bg-white/15 px-3 py-1 rounded-full text-right shrink-0 border border-white/5">
                        <span className="text-[10px] text-gray-400 block font-medium leading-none">Coaching Fee</span>
                        <span className="text-xs sm:text-sm font-black text-[#FFC907]">{course.fee}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-300 leading-relaxed mb-3">
                      {course.desc}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {course.subjects.map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 text-[9px] bg-white/10 text-gray-200 rounded font-medium"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column: Coaching Enquiry Form */}
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <div className="bg-white text-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-150 shadow-xl space-y-6">
                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl font-serif font-black text-[#1A325D]">
                    Coaching Enquiry Form
                  </h3>
                  <p className="text-xs text-gray-400">
                    Submit your query to book a free 3-day demo coaching session in your preferred stream.
                  </p>
                  <div className="w-16 h-1 bg-[#FFC907] mx-auto sm:mx-0 rounded-full"></div>
                </div>

                {isCoachingSubmitted ? (
                  <motion.div 
                    className="py-12 text-center space-y-4"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
                      <Check className="w-8 h-8 stroke-[3]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm sm:text-base text-[#1A325D]">Enquiry Received!</h4>
                      <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                        Our Coaching Coordinator will get in touch with you within 24 hours to schedule the demo class.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmitCoachingEnquiry} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Student Name */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Student Name *</label>
                        <input
                          type="text"
                          name="studentName"
                          required
                          value={coachingEnquiry.studentName}
                          onChange={handleCoachingInputChange}
                          placeholder="Aarav Sharma"
                          className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A325D] focus:border-[#1A325D] bg-gray-50/50"
                        />
                      </div>

                      {/* Parent Name */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Parent Name</label>
                        <input
                          type="text"
                          name="parentName"
                          value={coachingEnquiry.parentName}
                          onChange={handleCoachingInputChange}
                          placeholder="Rajesh Sharma"
                          className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A325D] focus:border-[#1A325D] bg-gray-50/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Mobile Number */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Contact Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={coachingEnquiry.phone}
                          onChange={handleCoachingInputChange}
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A325D] focus:border-[#1A325D] bg-gray-50/50"
                        />
                      </div>

                      {/* Student Class */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Student's Class</label>
                        <select
                          name="studentClass"
                          value={coachingEnquiry.studentClass}
                          onChange={handleCoachingInputChange}
                          className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A325D] focus:border-[#1A325D] bg-gray-50/50 cursor-pointer"
                        >
                          {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Passout'].map((cls) => (
                            <option key={cls} value={cls}>{cls}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Course Preference */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Select Coaching Course</label>
                      <select
                        name="selectedCourse"
                        value={coachingEnquiry.selectedCourse}
                        onChange={handleCoachingInputChange}
                        className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A325D] focus:border-[#1A325D] bg-gray-50/50 cursor-pointer"
                      >
                        <option value="Foundation Coaching (Classes 6-8)">Foundation Coaching (Classes 6-8)</option>
                        <option value="Coding, Robotics & AI Special">Coding, Robotics & AI Special</option>
                      </select>
                    </div>

                    {/* Notes/Questions */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Questions or special requirements</label>
                      <textarea
                        name="message"
                        rows={3}
                        value={coachingEnquiry.message}
                        onChange={handleCoachingInputChange}
                        placeholder="Any queries related to schedule, trial, batch size..."
                        className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A325D] focus:border-[#1A325D] bg-gray-50/50 resize-none"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#1A325D] text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm hover:bg-[#2A4E8C] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 mt-2 active:scale-[0.98]"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Coaching Enquiry</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Parents' Reviews & Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 animate-fadeIn">
            <span className="text-xs md:text-sm font-bold text-[#1A325D] uppercase tracking-[0.25em] bg-[#1A325D]/5 px-3 py-1.5 rounded-full">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#1A325D] leading-tight">
              What Our Parents Say About Us
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Read real stories and direct feedback from the families whose children study and grow within our academic ecosystem.
            </p>
            <div className="w-24 h-1.5 bg-[#FFC907] mx-auto rounded-full"></div>
          </div>

          {/* Filtering and Write Review controls */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
            <div className="flex flex-wrap gap-2 justify-center">
              {['All', 'Academics', 'Discipline', 'Infrastructure', 'Activities', 'Pre-Primary'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setActiveFilter(filter);
                    setVisibleCount(6); // reset pagination
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === filter
                      ? 'bg-[#1A325D] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {/* Sliding Navigation Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMarqueeDirection('right')}
                  className={`w-10 h-10 rounded-full border transition-all shadow-sm flex items-center justify-center cursor-pointer active:scale-95 ${
                    marqueeDirection === 'right'
                      ? 'bg-[#1A325D] text-white border-[#1A325D]'
                      : 'border-gray-200 bg-white text-[#1A325D] hover:bg-[#1A325D] hover:text-white hover:border-[#1A325D]'
                  }`}
                  title="Slide to Right"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setMarqueeDirection('left')}
                  className={`w-10 h-10 rounded-full border transition-all shadow-sm flex items-center justify-center cursor-pointer active:scale-95 ${
                    marqueeDirection === 'left'
                      ? 'bg-[#1A325D] text-white border-[#1A325D]'
                      : 'border-gray-200 bg-white text-[#1A325D] hover:bg-[#1A325D] hover:text-white hover:border-[#1A325D]'
                  }`}
                  title="Slide to Left"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="flex items-center gap-2 bg-[#FFC907] text-[#1A325D] px-5 py-2.5 rounded-full font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <MessageSquare className="w-4 h-4" />
                Write a Review
              </button>
            </div>
          </div>

          {/* Inline Write Review Form */}
          {isFormOpen && (
            <motion.div
              className="bg-white border-2 border-[#FFC907]/30 rounded-3xl p-6 md:p-8 mb-12 shadow-xl max-w-2xl mx-auto overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {isSubmitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto animate-bounce">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-emerald-900">Thank You for Your Feedback!</h4>
                  <p className="text-xs text-emerald-700/80">Your review has been successfully added to our testimonial section instantly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <h3 className="text-base font-bold text-[#1A325D] border-b pb-2 mb-2">Share Your Experience</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-600 uppercase">Your Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={newReview.name}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Rajesh Kumar Sharma"
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1A325D] focus:border-[#1A325D] outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-600 uppercase">Your Relation / Student's Class</label>
                      <input
                        type="text"
                        name="relation"
                        value={newReview.relation}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Father of Aarav, Class X"
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1A325D] focus:border-[#1A325D] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-600 uppercase block">Category</label>
                      <select
                        name="tag"
                        value={newReview.tag}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1A325D] focus:border-[#1A325D] outline-none bg-white"
                      >
                        <option value="Academics">Academics</option>
                        <option value="Discipline">Discipline</option>
                        <option value="Infrastructure">Infrastructure</option>
                        <option value="Activities">Activities</option>
                        <option value="Pre-Primary">Pre-Primary</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-600 uppercase block">Rating</label>
                      <div className="flex gap-1.5 pt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(star)}
                            className="focus:outline-none cursor-pointer"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= newReview.rating
                                  ? 'text-[#FFC907] fill-[#FFC907]'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-600 uppercase">Your Review</label>
                    <textarea
                      name="text"
                      value={newReview.text}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      placeholder="Share what makes GP Academy special for your child..."
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1A325D] focus:border-[#1A325D] outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#1A325D] text-white rounded-xl text-xs font-bold shadow-md hover:bg-opacity-95 cursor-pointer"
                    >
                      Submit Feedback
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {/* Style to hide scrollbars globally and define marquee animations */}
          <style>{`
            .scrollbar-none::-webkit-scrollbar {
              display: none !important;
            }
            .scrollbar-none {
              -ms-overflow-style: none !important;
              scrollbar-width: none !important;
            }
            @keyframes marquee-left {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(calc(-100% - 24px));
              }
            }
            @keyframes marquee-right {
              0% {
                transform: translateX(calc(-100% - 24px));
              }
              100% {
                transform: translateX(0);
              }
            }
            .animate-marquee-left {
              animation: marquee-left 45s linear infinite;
            }
            .animate-marquee-right {
              animation: marquee-right 45s linear infinite;
            }
            .marquee-container:hover .animate-marquee-left,
            .marquee-container:hover .animate-marquee-right {
              animation-play-state: paused;
            }
          `}</style>

          {/* Testimonial Cards Slider Track */}
          {filteredReviews.length > 0 ? (
            <div className="relative overflow-hidden w-full py-4 marquee-container">
              <div 
                ref={scrollRef}
                className="flex gap-6 w-max"
              >
                {/* First Set of Cards */}
                <div className={`flex gap-6 shrink-0 ${marqueeDirection === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}`}>
                  {filteredReviews.map((review, idx) => (
                    <div
                      key={`review-1-${review.name}-${idx}`}
                      className="flex-shrink-0 w-[290px] sm:w-[360px] relative overflow-hidden bg-white p-6 rounded-2xl border border-gray-150 hover:border-[#FFC907] transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_30px_rgba(26,50,93,0.07)] flex flex-col justify-between h-[230px]"
                    >
                      {/* Background quote decoration */}
                      <Quote className="absolute right-4 bottom-4 w-10 h-10 text-gray-100/50 select-none pointer-events-none" />

                      <div className="space-y-3">
                        {/* Rating stars & tag */}
                        <div className="flex justify-between items-center">
                          <div className="flex gap-0.5 text-[#FFC907]">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < review.rating ? 'fill-[#FFC907] text-[#FFC907]' : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 rounded-md">
                            {review.tag}
                          </span>
                        </div>

                        {/* Review Text */}
                        <p className="text-xs sm:text-sm text-gray-600 italic leading-relaxed line-clamp-4 relative z-10">
                          "{review.text}"
                        </p>
                      </div>

                      {/* Footer parent details */}
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center relative z-10">
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-[#1A325D] truncate">
                            {review.name}
                          </h4>
                          <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                            {review.relation}
                          </p>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono flex-shrink-0">
                          {review.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Duplicate Set of Cards for Seamless Loop */}
                <div className={`flex gap-6 shrink-0 ${marqueeDirection === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}`} aria-hidden="true">
                  {filteredReviews.map((review, idx) => (
                    <div
                      key={`review-2-${review.name}-${idx}`}
                      className="flex-shrink-0 w-[290px] sm:w-[360px] relative overflow-hidden bg-white p-6 rounded-2xl border border-gray-150 hover:border-[#FFC907] transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_30px_rgba(26,50,93,0.07)] flex flex-col justify-between h-[230px]"
                    >
                      {/* Background quote decoration */}
                      <Quote className="absolute right-4 bottom-4 w-10 h-10 text-gray-100/50 select-none pointer-events-none" />

                      <div className="space-y-3">
                        {/* Rating stars & tag */}
                        <div className="flex justify-between items-center">
                          <div className="flex gap-0.5 text-[#FFC907]">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < review.rating ? 'fill-[#FFC907] text-[#FFC907]' : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 rounded-md">
                            {review.tag}
                          </span>
                        </div>

                        {/* Review Text */}
                        <p className="text-xs sm:text-sm text-gray-600 italic leading-relaxed line-clamp-4 relative z-10">
                          "{review.text}"
                        </p>
                      </div>

                      {/* Footer parent details */}
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center relative z-10">
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-[#1A325D] truncate">
                            {review.name}
                          </h4>
                          <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                            {review.relation}
                          </p>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono flex-shrink-0">
                          {review.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtle Gradient Overlays on Left/Right for depth hint */}
              <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-gray-50/70 to-transparent pointer-events-none z-10 hidden md:block" />
              <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-gray-50/70 to-transparent pointer-events-none z-10 hidden md:block" />
            </div>
          ) : (
            <div className="text-center py-16 bg-white border rounded-2xl">
              <span className="text-sm text-gray-400">No reviews found in this category yet.</span>
            </div>
          )}
        </div>
      </section>

      {/* Visual Gallery Preview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[#1A325D] text-xs font-bold uppercase tracking-[0.2em] bg-gray-100 px-3.5 py-1.5 rounded-full inline-block">
              Inside GP Academy
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#1A325D] tracking-tight">
              Our Campus Life Gallery
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Explore visual moments of our vibrant learning atmosphere, specialized laboratory experiments, sports tournaments, and student celebrations.
            </p>
            <div className="w-20 h-1.5 bg-[#FFC907] mx-auto rounded-full"></div>
          </div>

          {/* Gallery Grid Preview (First 4 images) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {GALLERY_IMAGES.slice(0, 4).map((img, idx) => (
              <motion.div
                key={img.id}
                onClick={() => {
                  setActiveHomeLightboxImg(img.imageUrl);
                  setActiveHomeLightboxTitle(img.title);
                }}
                className="group bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <div className="h-56 w-full overflow-hidden bg-gray-50 relative">
                  <img
                    src={img.imageUrl}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {/* Hover mask with zoom icon */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center">
                      <ZoomIn className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-1 bg-white">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                    {img.category}
                  </span>
                  <h4 className="font-sans font-extrabold text-[#1A325D] text-sm truncate">
                    {img.title}
                  </h4>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Action Button to Full Gallery */}
          <div className="text-center pt-4">
            <button
              onClick={() => {
                setActivePage('gallery');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 bg-[#1A325D] text-white px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm shadow-md hover:bg-[#2A4E8C] transition-all cursor-pointer active:scale-95 group"
            >
              <span>Explore All Campus Photos</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </section>

      {/* Lightbox Modal for Homepage Gallery */}
      {activeHomeLightboxImg && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActiveHomeLightboxImg(null)}
        >
          <button
            onClick={() => setActiveHomeLightboxImg(null)}
            className="absolute top-6 right-6 p-2.5 text-white/70 hover:text-white bg-white/10 rounded-full hover:scale-105 transition-all z-[110]"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl border border-white/10 relative">
            <img
              src={activeHomeLightboxImg}
              alt={activeHomeLightboxTitle}
              className="w-full h-auto max-h-[80vh] object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-[#FFC907] font-sans font-black mt-4 text-base tracking-wide text-center max-w-xl">
            {activeHomeLightboxTitle}
          </p>
        </div>
      )}

      {/* Frequently Asked Questions (FAQ) Section */}
      <section className="py-20 bg-gray-50/70 border-t border-b border-gray-150">
        <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-12">
          
          {/* Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs md:text-sm font-bold text-[#1A325D] uppercase tracking-[0.2em] bg-white px-3.5 py-1.5 rounded-full inline-block shadow-sm border border-gray-200/80">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#1A325D] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Find quick answers regarding admissions, special fee schemes, curriculum, coaching programs, and campus facilities.
            </p>
            <div className="w-20 h-1.5 bg-[#FFC907] mx-auto rounded-full"></div>
          </div>

          {/* FAQ Accordion List (5 Questions) */}
          <div className="space-y-4">
            {[
              {
                q: "What is the admission process and age eligibility for Nursery to Class 12?",
                a: "Admissions at GP Academy are open from Nursery to Class 12. For Nursery, the child must be at least 3+ years old by March 31st. For Classes 1 to 12, admissions are processed based on previous school academic records and an informal interaction session with the student and parents. You can apply online or visit our school office during working hours."
              },
              {
                q: "What is the June to August Parents Admission Promotion Scheme?",
                a: "Under our special scheme, new admissions during June to August get 100% Free Admission Fees along with a complimentary school tie & belt! Additionally, if a parent refers and secures admissions for 3 students, they receive 100% tuition fee exemption for 3 months (June to August)."
              },
              {
                q: "Which curriculum and board standards are followed at GP Academy?",
                a: "GP Academy follows an enriched CBSE and UP Board curriculum with digital smart classrooms, practical science laboratories, foundational coding, sports, and holistic co-curricular development to ensure students excel in both school and competitive examinations."
              },
              {
                q: "Are specialized coaching classes available on campus after school hours?",
                a: "Yes! We run the GP Academy Specialized Coaching Division right on campus after regular school hours. We offer Foundation Coaching (Classes 6-8), JEE/NEET competitive preparation, and Coding & AI classes with dedicated, expert mentors and affordable monthly fee structures."
              },
              {
                q: "What safety, transport, and parent communication facilities exist on campus?",
                a: "Student safety is our highest priority. The campus is monitored 24/7 with CCTV cameras and biometric systems. We provide safe school transport options along major routes, first-aid care, and a direct digital parent portal for daily attendance, homework, and performance updates."
              }
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen 
                      ? 'border-[#1A325D] shadow-md ring-1 ring-[#1A325D]/10' 
                      : 'border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isOpen ? 'bg-[#1A325D] text-[#FFC907]' : 'bg-gray-100 text-[#1A325D]'
                      }`}>
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <h3 className="font-sans font-bold text-sm sm:text-base text-[#1A325D] leading-snug">
                        {faq.q}
                      </h3>
                    </div>
                    <div className={`p-1.5 rounded-full shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-gray-100 text-[#1A325D]' : 'text-gray-400'
                    }`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4 animate-fadeIn pl-16">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Need More Assistance Banner */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm text-center sm:text-left">
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-[#1A325D]">Have more questions or need personal counselling?</h4>
              <p className="text-xs text-gray-500">Our admissions desk is available Mon-Sat, 8:00 AM to 3:00 PM.</p>
            </div>
            <button
              onClick={() => setActivePage('contact')}
              className="bg-[#1A325D] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-[#2A4E8C] transition-all shrink-0 cursor-pointer shadow"
            >
              Contact Admissions
            </button>
          </div>

        </div>
      </section>

      {/* Call to Action */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-gradient-to-br from-[#1A325D] via-[#112447] to-[#2A4E8C] rounded-[32px] p-8 md:p-16 text-center relative overflow-hidden shadow-2xl">
            {/* Education banner background image with 50% opacity */}
            <div className="absolute inset-0 pointer-events-none select-none">
              <img 
                src="https://img.freepik.com/free-photo/little-girl-glasses-blue-backpack-with-oranges-created-with-generative-ai-technology_264312518.jpg" 
                alt="Education Background"
                className="w-full h-full object-cover opacity-50 mix-blend-overlay"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute top-0 left-0 w-48 h-48 bg-[#FFC907]/15 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 blur-2xl"></div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-extrabold text-white leading-tight">Shape Your Future with Us</h2>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">Registrations for the upcoming academic session are now open. Secure your child's place in a legacy of excellence and disciplined learning.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <button 
                  onClick={onOpenApplyModal}
                  className="bg-[#FFC907] text-[#1A325D] px-8 py-3.5 rounded-full font-bold text-xs md:text-sm shadow-xl hover:scale-105 transition-all cursor-pointer active:scale-95 animate-pulse"
                >
                  Apply Online
                </button>
                <button 
                  onClick={() => setActivePage('contact')}
                  className="border-2 border-white text-white px-8 py-3.5 rounded-full font-bold text-xs md:text-sm hover:bg-white hover:text-[#1A325D] transition-all cursor-pointer active:scale-95"
                >
                  Download Prospectus
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
