import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ActivePage } from '../types';
import { SCHOOL_DETAILS } from '../data/content';
import { 
  BookOpen, 
  Calendar, 
  User, 
  MapPin, 
  ArrowRight, 
  Search, 
  CheckCircle, 
  GraduationCap, 
  Award,
  Sparkles,
  ChevronRight,
  Clock,
  Tag
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  date: string;
  author: string;
  category: string;
  readTime: string;
  excerpt: string;
  content: string[];
  keywords: string[];
  imageUrl: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Choosing the Best CBSE School in Noida & Gautam Buddha Nagar: A Complete Guide for Parents',
    slug: 'choosing-best-cbse-school-in-noida-gautam-buddha-nagar',
    date: 'August 5, 2026',
    author: 'Principal Editorial Board, GP Academy',
    category: 'School Admissions',
    readTime: '5 min read',
    excerpt: 'Finding the top CBSE school in Noida and Gautam Buddha Nagar requires evaluating academic excellence, smart classroom infrastructure, student safety, and holistic skill development.',
    content: [
      'Selecting the right school for your child in Noida and the greater Gautam Buddha Nagar region is one of the most critical decisions for a parent. With numerous educational institutions in Bhangel, Salarpur, and Noida Expressway sectors, GP Academy stands out by offering a balanced blend of traditional values and modern technological education.',
      'When researching the best schools in Noida, parents should focus on three primary pillars: CBSE Board Curriculum Alignment, Hands-on Practical Science & Robotics Labs, and Individualized Student Care from Nursery through Class 12.',
      'At GP Academy Noida, we maintain optimum student-teacher ratios to ensure that every student receives personal attention. Our free admission drives and fee support initiatives make high-quality, smart education accessible to every deserving student in Gautam Buddha Nagar.'
    ],
    keywords: ['Best CBSE School Noida', 'Gautam Buddha Nagar School', 'Nursery Admission Noida', 'Top School Bhangel Salarpur'],
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'blog-2',
    title: 'Why Practical Science & Robotics Matter for Class 6-12 Students in Noida',
    slug: 'science-robotics-education-in-gautam-buddha-nagar-schools',
    date: 'August 1, 2026',
    author: 'Department of Science & Innovation',
    category: 'Academic Excellence',
    readTime: '4 min read',
    excerpt: 'How hands-on science projects, hydraulic models, and robotics exhibitions prepare students in Gautam Buddha Nagar for future STEM careers and competitive examinations.',
    content: [
      'Theoretical knowledge is most effective when paired with real-world application. In the modern educational landscape of Gautam Buddha Nagar, schools must go beyond textbooks to foster critical thinking and innovation.',
      'At GP Academy, our Annual Student Science Exhibition showcases over 60 working models created by middle and senior secondary students—ranging from renewable solar power systems to AI-powered robotics kits.',
      'By engaging in hands-on science experiments in our dedicated Physics, Chemistry, and Biology laboratories, students build the confidence and analytical mindset required for competitive exams like NEET, JEE, and NTSE.'
    ],
    keywords: ['Science Lab School Noida', 'Robotics Education Gautam Buddha Nagar', 'STEM Learning Noida', 'Best Science School Salarpur'],
    imageUrl: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'blog-3',
    title: 'Nursery to Class 12 Holistic Development: The GP Academy Edge in Gautam Buddha Nagar',
    slug: 'holistic-student-growth-noida-schools',
    date: 'July 28, 2026',
    author: 'Child Psychology & Guidance Cell',
    category: 'Child Growth & Care',
    readTime: '6 min read',
    excerpt: 'From foundational early learning in Nursery to board exam mastery in Class 12, explore how structured co-curricular activities build confident leaders.',
    content: [
      'A child’s educational journey spans nearly 14 foundational years. In the fast-growing city of Noida, ensuring continuous mental, emotional, and physical development throughout this timeline is paramount.',
      'Our early childhood pedagogy in Nursery, LKG, and UKG uses activity-based sensory games, phonics exercises, and creative arts to make learning joyful and natural. As students progress to primary and secondary grades, structured sports, public speaking debates, and cultural celebrations hone their leadership attributes.',
      'Parents across Gautam Buddha Nagar trust GP Academy for our secure campus environment, experienced teaching faculty, and commitment to moral and academic excellence.'
    ],
    keywords: ['CBSE School Nursery to 12 Noida', 'Best Primary School Gautam Buddha Nagar', 'GP Academy Noida Admission', 'Holistic Schooling Bhangel'],
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800'
  }
];

interface BlogProps {
  setActivePage?: (page: ActivePage) => void;
  onOpenApplyModal?: () => void;
}

export default function Blog({ setActivePage, onOpenApplyModal }: BlogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const filteredPosts = BLOG_POSTS.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
        
        {/* Header / Banner */}
        <div className="bg-gradient-to-br from-[#001c46] via-[#1a325d] to-[#001c46] rounded-3xl p-6 sm:p-12 text-white relative overflow-hidden shadow-xl border border-[#001c46]/20">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-[#FFC907]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[#FFC907] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Noida & Gautam Buddha Nagar Educational Insights</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-sans leading-tight text-white">
              GP Academy Educational Journal & News
            </h1>

            <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-normal">
              Official articles, admission guidance, and educational updates for parents in Noida, Bhangel, Salarpur, and Gautam Buddha Nagar.
            </p>

            {/* Quick Search Bar */}
            <div className="pt-2 max-w-md">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, CBSE topics, Noida admissions..."
                  className="w-full pl-11 pr-4 py-3 bg-white/95 text-gray-800 placeholder-gray-400 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFC907] shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Selected Post Modal / Detail View */}
        {selectedPost ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-md space-y-6"
          >
            <button
              onClick={() => setSelectedPost(null)}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#001c46] hover:text-[#1a325d] bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-all"
            >
              ← Back to All Articles
            </button>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="px-3 py-1 bg-[#001c46]/10 text-[#001c46] font-bold rounded-full">
                  {selectedPost.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedPost.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedPost.readTime}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[#001c46] leading-snug">
                {selectedPost.title}
              </h2>

              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                <User className="w-4 h-4 text-[#001c46]" />
                <span>{selectedPost.author}</span>
              </div>
            </div>

            <div className="h-64 sm:h-96 rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={selectedPost.imageUrl}
                alt={selectedPost.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed border-t border-gray-100 pt-6">
              {selectedPost.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Keyword Tags */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2 items-center">
              <Tag className="w-4 h-4 text-gray-400" />
              {selectedPost.keywords.map((kw, idx) => (
                <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-lg">
                  #{kw}
                </span>
              ))}
            </div>

            {/* Call to Action Box inside Article */}
            <div className="bg-gradient-to-r from-[#001c46] to-[#1a325d] text-white p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="text-lg font-bold text-[#FFC907]">Looking for CBSE School Admissions in Noida?</h3>
                <p className="text-xs sm:text-sm text-gray-200">
                  Admissions Open for Nursery to Class 12 at GP Academy, Salarpur Khadar, Noida, Gautam Buddha Nagar.
                </p>
              </div>
              <button
                onClick={() => {
                  if (onOpenApplyModal) onOpenApplyModal();
                  else if (setActivePage) setActivePage('admissions');
                }}
                className="bg-[#FFC907] hover:bg-[#e6b400] text-[#001c46] font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shrink-0 transition-all shadow-md"
              >
                Apply For Admission
              </button>
            </div>
          </motion.div>
        ) : (
          /* Articles Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="h-48 w-full overflow-hidden relative bg-gray-100">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-3 left-3 bg-[#001c46] text-[#FFC907] text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow">
                      {post.category}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.date}
                      </span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>

                    <h3 className="font-bold text-base text-[#001c46] group-hover:text-[#1a325d] line-clamp-2 leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-gray-100 mt-2">
                  <button
                    onClick={() => setSelectedPost(post)}
                    className="w-full mt-3 inline-flex items-center justify-center gap-2 text-xs font-bold text-[#001c46] group-hover:text-[#FFC907] bg-gray-50 group-hover:bg-[#001c46] py-2.5 px-4 rounded-xl transition-all duration-300"
                  >
                    <span>Read Full Article</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Local SEO CTA Footer Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center gap-2 text-[#001c46] text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-[#FFC907]" />
              <span>Noida & Gautam Buddha Nagar Campus</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#001c46]">
              Visit GP Academy Campus in Noida Today
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Address: {SCHOOL_DETAILS.address} | Call: {SCHOOL_DETAILS.phone}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col gap-3">
            <button
              onClick={() => {
                if (onOpenApplyModal) onOpenApplyModal();
                else if (setActivePage) setActivePage('admissions');
              }}
              className="w-full bg-[#001c46] hover:bg-[#1a325d] text-[#FFC907] font-extrabold px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all text-center"
            >
              Enquire Admission
            </button>
            <button
              onClick={() => {
                if (setActivePage) setActivePage('contact');
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-[#001c46] font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all text-center"
            >
              Get Directions
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
