import React from 'react';
import { Target, Eye, ShieldCheck, Heart, Award, Users, BookOpen, GraduationCap } from 'lucide-react';
import { SCHOOL_DETAILS } from '../data/content';
import { motion } from 'motion/react';

const departments = [
  {
    id: 'senior',
    name: 'Senior Secondary (Classes XI-XII)',
    description: 'Expert faculty preparing students for board exams and national entrance examinations (JEE/NEET).',
    teachers: [
      {
        name: 'Mr. Raju Singh',
        role: 'Principal & Senior Physics Faculty',
        qualification: 'M.Sc (Physics), B.Ed',
        experience: '15+ Years',
        subjects: ['Physics', 'Career Guidance'],
        image: 'https://www.aashrayvani.com/web/image/1320-8182ed66/WhatsApp%20Image%202025-12-10%20at%2008.32.58_427d4b8b.webp'
      },
      {
        name: 'Dr. Anita Sharma',
        role: 'HOD Chemistry & Biology',
        qualification: 'Ph.D, M.Sc (Chemistry), B.Ed',
        experience: '12 Years',
        subjects: ['Chemistry', 'Biology'],
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=300'
      },
      {
        name: 'Mr. Vivek Upadhyay',
        role: 'Senior Mathematics Faculty',
        qualification: 'M.Sc (Maths), B.Ed',
        experience: '10 Years',
        subjects: ['Mathematics', 'Applied Mathematics'],
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300&h=300'
      },
      {
        name: 'Mrs. Sharmila Singh',
        role: 'Managing Director & Senior Faculty',
        qualification: 'M.A, M.Ed',
        experience: '12 Years',
        subjects: ['Administration', 'Humanities', 'Social Guidance'],
        image: 'https://www.aashrayvani.com/web/image/1319-c76a00f7/WhatsApp%20Image%202025-12-10%20at%2008.33.37_3f3199e3.webp'
      }
    ]
  },
  {
    id: 'high',
    name: 'High & Middle School (Classes VI-X)',
    description: 'Focusing on conceptual clarity, scientific temper, and robust language communication.',
    teachers: [
      {
        name: 'Mr. Sanjay Mishra',
        role: 'HOD Computer Sciences & IT',
        qualification: 'MCA, B.Ed',
        experience: '9 Years',
        subjects: ['Computer Applications', 'Python Programming', 'AI Basics'],
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300'
      },
      {
        name: 'Mrs. Preeti Saxena',
        role: 'Senior English Faculty',
        qualification: 'M.A (English), B.Ed',
        experience: '11 Years',
        subjects: ['English Literature', 'Communication Skills', 'Elocution'],
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300'
      },
      {
        name: 'Mrs. Richa Singh',
        role: 'Social Science & Humanities Head',
        qualification: 'M.A (History), B.Ed',
        experience: '8 Years',
        subjects: ['History', 'Geography', 'Civics', 'Moral Science'],
        image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=300&h=300'
      },
      {
        name: 'Mr. Deepak Kumar',
        role: 'Sanskrit & Hindi Language Expert',
        qualification: 'M.A (Hindi), Acharya (Sanskrit), B.Ed',
        experience: '14 Years',
        subjects: ['Hindi Literature', 'Sanskrit Grammar'],
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300'
      }
    ]
  },
  {
    id: 'primary',
    name: 'Primary & Pre-Primary (Nursery-Class V)',
    description: 'Loving, patient, and highly trained specialists creating a joyful early learning foundation.',
    teachers: [
      {
        name: 'Mrs. Megha Verma',
        role: 'Pre-Primary Coordinator',
        qualification: 'N.T.T (Nursery Teacher Training), B.A',
        experience: '10 Years',
        subjects: ['Activity-Based Learning', 'Phonics & Speech', 'Sensory Play'],
        image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=300&h=300'
      },
      {
        name: 'Mrs. Kavita Joshi',
        role: 'Primary Science & EVS Instructor',
        qualification: 'B.Sc, B.Ed',
        experience: '7 Years',
        subjects: ['Environmental Studies', 'Creative Arts', 'Elementary Mathematics'],
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300&h=300'
      },
      {
        name: 'Mrs. Pooja Rani',
        role: 'Primary English Teacher',
        qualification: 'M.A (English), B.Ed',
        experience: '6 Years',
        subjects: ['English Grammar', 'Storytelling', 'Spelling Bee Practice'],
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300&h=300'
      }
    ]
  }
];

export default function AboutUs() {
  const [activeDept, setActiveDept] = React.useState('senior');
  return (
    <div className="space-y-24 pb-16 animate-fadeIn">
      {/* Mini Header banner */}
      <section className="bg-gradient-to-r from-[#001c46] to-[#1A325D] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-[#FFC907] text-xs font-bold uppercase tracking-widest block">
            About GP Academy
          </span>
          <h1 className="text-3xl sm:text-4xl font-sans font-black tracking-tight">
            Our Legacy, Philosophy, & Commitment
          </h1>
          <p className="text-gray-300 text-sm max-w-xl mx-auto">
            Providing high-caliber education near Goyal Colony, Bhangel and Salarpur Khadar since our inception.
          </p>
        </div>
      </section>

      {/* Vision & Mission bento cards */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-4">
          <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-sans font-extrabold text-[#001c46]">Our Vision</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            To emerge as Noida's premier value-driven educational sanctuary, recognized globally for producing disciplined, technically fluent, and ethically sound leaders who recognize that true knowledge is the most durable asset.
          </p>
        </div>

        <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-sans font-extrabold text-[#001c46]">Our Mission</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            GP Academy is committed to delivering a structured CBSE and UP Board curriculum. We challenge students academically, inspire physical excellence, build unwavering discipline, and encourage social responsibility.
          </p>
        </div>
      </section>

      {/* Message from School Principal */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-gray-50 rounded-[32px] overflow-hidden border border-gray-100 grid grid-cols-1 lg:grid-cols-12 gap-0 shadow-sm">
          {/* Portrait side */}
          <div className="lg:col-span-5 bg-[#001c46] text-white p-12 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full pointer-events-none"></div>
            <div className="space-y-6 relative z-10 text-center lg:text-left">
              <span className="inline-block px-3 py-1 bg-[#FFC907] text-[#001c46] text-[10px] font-bold uppercase tracking-widest rounded">
                Leadership Team
              </span>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-6 items-center lg:items-start">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full border-2 border-[#FFC907] overflow-hidden shadow-lg shrink-0">
                    <img
                      src="https://www.aashrayvani.com/web/image/1320-8182ed66/WhatsApp%20Image%202025-12-10%20at%2008.32.58_427d4b8b.webp"
                      alt="Mr. Raju Singh"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-sans font-black text-white">Mr. Raju Singh</h4>
                    <p className="text-xs text-[#FFC907] font-bold uppercase tracking-wider">
                      School Principal
                    </p>
                    <p className="text-[10px] text-gray-300 mt-0.5">CBSE Academic Advisor</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-white/10 w-full">
                  <div className="w-20 h-20 rounded-full border-2 border-[#FFC907] overflow-hidden shadow-lg shrink-0">
                    <img
                      src="https://www.aashrayvani.com/web/image/1319-c76a00f7/WhatsApp%20Image%202025-12-10%20at%2008.33.37_3f3199e3.webp"
                      alt="Mrs. Sharmila Singh"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-sans font-black text-white">Mrs. Sharmila Singh</h4>
                    <p className="text-xs text-[#FFC907] font-bold uppercase tracking-wider">
                      Managing Director
                    </p>
                    <p className="text-[10px] text-gray-300 mt-0.5">Educational Administrator</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 pt-6 mt-8 text-center lg:text-left text-xs text-gray-300">
              In collaboration with families, teachers, and student groups.
            </div>
          </div>

          {/* Letter text side */}
          <div className="lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center space-y-6 bg-white">
            <h3 className="text-2xl sm:text-3xl font-sans font-black text-[#001c46] relative pb-3 border-b border-gray-100">
              Welcome from Mr. Raju Singh
            </h3>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed font-sans italic">
              <p>
                "At GP Academy, we envision schooling as a collaborative voyage of discovery. Academic statistics and board certificates are important, but the core character, determination, and ethical values of our graduates are the true tests of our academy's standards."
              </p>
              <p>
                "We implement a rigorous, double-checked concept building framework. Whether learning nursery letters or reviewing advanced engineering equations in our high-school coaching, we assure absolute discipline. It is indeed true: <strong>Knowledge Is the Biggest Money</strong>—it is the one treasure that remains secure and yields lifelong dividends."
              </p>
              <p>
                "We welcome you to inspect our labs, explore our digital corridors, and secure a place for your children in Noida's premier institution."
              </p>
            </div>
            <div className="pt-4 flex flex-wrap gap-6 text-xs text-gray-500 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#FFC907]" /> CBSE Affiliated</span>
              <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-[#FFC907]" /> Dynamic Guidance</span>
              <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-[#FFC907]" /> 100% Board Success</span>
            </div>
          </div>
        </div>
      </section>

      {/* Teachers / Faculty Section */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden rounded-3xl border border-gray-100">
        {/* Decorative background shape */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#FFC907]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
        <div className="absolute top-12 right-0 w-96 h-96 bg-[#1A325D]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 animate-fadeIn">
            <span className="text-xs md:text-sm font-bold text-[#1A325D] uppercase tracking-[0.25em] bg-[#1A325D]/5 px-3 py-1.5 rounded-full">
              Our Educators
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-extrabold text-[#1A325D] leading-tight">
              Meet Our Highly Qualified & Dedicated Faculty
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">
              GP Academy prides itself on a diverse team of 45+ expert teachers and mentors who combine academic mastery with nurturing guidance.
            </p>
            <div className="w-24 h-1.5 bg-[#FFC907] mx-auto rounded-full"></div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            <div className="p-5 bg-white border border-gray-150 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.01)] text-center space-y-2">
              <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center mx-auto">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-sans font-black text-[#1A325D]">45+</div>
              <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Expert Teachers</p>
            </div>
            <div className="p-5 bg-white border border-gray-150 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.01)] text-center space-y-2">
              <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center mx-auto">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-sans font-black text-[#1A325D]">100%</div>
              <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Trained & Certified</p>
            </div>
            <div className="p-5 bg-white border border-gray-150 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.01)] text-center space-y-2">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center mx-auto">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-sans font-black text-[#1A325D]">1:15</div>
              <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Student-Teacher Ratio</p>
            </div>
            <div className="p-5 bg-white border border-gray-150 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.01)] text-center space-y-2">
              <div className="w-10 h-10 bg-rose-50 text-rose-700 rounded-xl flex items-center justify-center mx-auto">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-sans font-black text-[#1A325D]">8+ Yrs</div>
              <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Avg. Experience</p>
            </div>
          </div>

          {/* Department Selection Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-10 max-w-2xl mx-auto">
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setActiveDept(dept.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeDept === dept.id
                    ? 'bg-[#1A325D] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {dept.name.split(' (')[0]}
              </button>
            ))}
          </div>

          {/* Active Department Details & Teachers */}
          {departments.filter(d => d.id === activeDept).map((dept) => (
            <div key={dept.id} className="space-y-8">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-[#1A325D]">{dept.name}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{dept.description}</p>
              </div>

              {/* Grid of Teachers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {dept.teachers.map((teacher, idx) => (
                  <motion.div
                    key={teacher.name}
                    className="bg-white border border-gray-150 hover:border-[#FFC907] rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_25px_rgba(26,50,93,0.05)] transition-all duration-300 flex flex-col justify-between"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <div className="space-y-4">
                      {/* Avatar */}
                      <div className="w-20 h-20 rounded-full overflow-hidden mx-auto border-2 border-gray-100 shadow-inner">
                        <img 
                          src={teacher.image} 
                          alt={teacher.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Info */}
                      <div className="text-center space-y-1">
                        <h4 className="font-bold text-xs sm:text-sm text-[#1A325D]">{teacher.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{teacher.role}</p>
                        <p className="text-[9px] text-gray-500 italic bg-gray-50 py-0.5 px-2 rounded-md inline-block mt-1">
                          {teacher.qualification}
                        </p>
                      </div>
                    </div>

                    {/* Footer Subjects & Experience */}
                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {teacher.subjects.map((sub, sIdx) => (
                          <span 
                            key={sIdx} 
                            className="px-2 py-0.5 text-[9px] font-medium bg-[#1A325D]/5 text-[#1A325D] rounded"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                      <div className="text-center pt-1 border-t border-gray-50/50">
                        <span className="text-[9px] text-gray-400 font-mono font-bold">
                          EXP: {teacher.experience}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Foundational Milestones / Timeline */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-sans font-black text-[#001c46]">
            Our Educational Milestones
          </h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest">A Decade of Raising Standards</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <h4 className="text-2xl font-sans font-black text-[#1A325D] mb-2">2014</h4>
            <h5 className="font-bold text-sm text-[#001c46] mb-1">Inception</h5>
            <p className="text-xs text-gray-500 leading-relaxed">
              Founded near Goyal Colony with nursery to class 5 options, serving local Noida pupils.
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <h4 className="text-2xl font-sans font-black text-[#1A325D] mb-2">2018</h4>
            <h5 className="font-bold text-sm text-[#001c46] mb-1">CBSE Recognition</h5>
            <p className="text-xs text-gray-500 leading-relaxed">
              Awarded standard CBSE board recognition up to Class 10 with specialized science labs.
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <h4 className="text-2xl font-sans font-black text-[#1A325D] mb-2">2021</h4>
            <h5 className="font-bold text-sm text-[#001c46] mb-1">Senior Secondary Expand</h5>
            <p className="text-xs text-gray-500 leading-relaxed">
              Launched Classes 11 & 12 (Science & Commerce stream) and introduced UP Board choices.
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <h4 className="text-2xl font-sans font-black text-[#1A325D] mb-2">Present Day</h4>
            <h5 className="font-bold text-sm text-[#001c46] mb-1">Academic & Innovation Hub</h5>
            <p className="text-xs text-gray-500 leading-relaxed">
              Nurturing modern scientific thinking with advanced labs and digital classrooms to foster high student achievement.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
