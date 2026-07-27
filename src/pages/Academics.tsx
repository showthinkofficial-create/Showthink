import React from 'react';
import { BookOpen, Globe, Laptop, Landmark, Sparkles, CheckSquare, Layers } from 'lucide-react';

export default function Academics() {
  const segments = [
    {
      title: 'Pre-Primary Education (Nursery - UKG)',
      focus: 'Play-based Exploration, Social Bonding, Fine Motor Skills',
      desc: 'Our earliest classrooms provide a warm, nurturing environment. Children learn basic vocabulary, alphabet sequencing, counting parameters, social etiquette, and arts through touch-and-feel sensory setups.',
      subjects: ['Tactile Language Development', 'Basic Counting & Numbers', 'Sensory Arts & Crafts', 'Yoga Assembly & Music Discovery'],
      iconBg: 'bg-yellow-50',
      iconText: 'text-yellow-600'
    },
    {
      title: 'Primary School (Class I - V)',
      focus: 'Foundational Literacy, Logic, Math, Natural Discovery',
      desc: 'Conforming strictly to CBSE specifications, the primary years focus on solid concept retention. We construct early logical faculties, introduce digital modules, and teach basic linguistic composition.',
      subjects: ['English Literature & Hindi Grammar', 'Core Mathematics', 'Environmental Studies (EVS)', 'Foundational Coding & Keyboarding'],
      iconBg: 'bg-blue-50',
      iconText: 'text-blue-700'
    },
    {
      title: 'Middle School (Class VI - VIII)',
      focus: 'Critical Evaluation, Concept-based Experiments, Civil Studies',
      desc: 'Transitioning from rote mechanics to analytical evaluation. Students are introduced to formal scientific laboratories, algebraic equations, global geography, and cultural civic rights.',
      subjects: ['Combined Science (Physics, Chemistry, Biology)', 'Pre-Algebra & Geometry', 'Social Sciences & Civics', 'Information Technology & Web Basics'],
      iconBg: 'bg-purple-50',
      iconText: 'text-purple-700'
    },
    {
      title: 'High & Senior Secondary (Class IX - XII)',
      focus: 'National Board Master, Competitive Readiness, Specialized Streams',
      desc: 'We offer intensive preparation for the Secondary (Class 10) and Senior Secondary (Class 12) CBSE Boards. UP Board options are also structured, ensuring complete academic readiness and robust subject mastery.',
      subjects: ['Science Stream (Physics, Chemistry, Biology, Math)', 'Commerce Stream (Accountancy, Business Studies, Economics)', 'English Core & Elective Hindi', 'Advanced IT & Python Programming'],
      iconBg: 'bg-teal-50',
      iconText: 'text-teal-700'
    }
  ];

  return (
    <div className="space-y-24 pb-16 animate-fadeIn">
      {/* Page Title */}
      <section className="bg-gradient-to-r from-[#001c46] to-[#1A325D] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-[#FFC907] text-xs font-bold uppercase tracking-widest block">
            Academic Pathways
          </span>
          <h1 className="text-3xl sm:text-4xl font-sans font-black tracking-tight">
            Curriculum & Stage Segmentation (K-12)
          </h1>
          <p className="text-gray-300 text-sm max-w-xl mx-auto">
            Providing parents with a fully mapped, progressive educational path designed for optimal conceptual growth.
          </p>
        </div>
      </section>

      {/* Curriculum Board Choice Panels */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-4 border-l-4 border-[#001c46]">
            <span className="text-[10px] font-mono uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-1 rounded inline-block font-bold">
              National Standard
            </span>
            <h3 className="text-2xl font-sans font-black text-[#001c46]">CBSE Board Curriculum</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              We offer CBSE curriculum from Nursery to Class XII. CBSE provides a highly structured, conceptually robust national framework that is optimal for academic excellence, core subject mastery, and higher education readiness.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs font-bold text-gray-700">
              <li className="flex items-center gap-2">✔ Integrated CBSE Syllabus</li>
              <li className="flex items-center gap-2">✔ Objective Concept Assessments</li>
              <li className="flex items-center gap-2">✔ Active STEM Lab Alignment</li>
              <li className="flex items-center gap-2">✔ Language, Sports & Logic focus</li>
            </ul>
          </div>

          <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-4 border-l-4 border-[#FFC907]">
            <span className="text-[10px] font-mono uppercase tracking-wider bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded inline-block font-bold">
              State Option
            </span>
            <h3 className="text-2xl font-sans font-black text-[#001c46]">UP Board Pathways</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              To support local families preferring state examinations, we offer UP Board integrated coaching tracks for Class 10 and Class 12. These modules focus heavily on vernacular writing standards, previous ten years of past exam solving, and board grading metrics.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs font-bold text-gray-700">
              <li className="flex items-center gap-2">✔ UP Board syllabus mapped</li>
              <li className="flex items-center gap-2">✔ High Speed Writing Exercises</li>
              <li className="flex items-center gap-2">✔ Bilateral Language Support</li>
              <li className="flex items-center gap-2">✔ Strategic Marks Optimizers</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Segments Display */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-sans font-black text-[#001c46]">
            Stage Wise Class Mappings
          </h2>
          <div className="w-16 h-1 bg-[#FFC907] mx-auto rounded-full"></div>
          <p className="text-xs text-gray-400 uppercase tracking-widest">Targeted Pedagogy for Every Age</p>
        </div>

        <div className="space-y-8">
          {segments.map((seg, idx) => (
            <div
              key={idx}
              className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${seg.iconBg} ${seg.iconText} rounded-lg flex items-center justify-center font-bold font-sans`}>
                    0{idx + 1}
                  </div>
                  <h3 className="text-xl font-sans font-black text-[#001c46]">
                    {seg.title}
                  </h3>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-1">
                    Primary Academic Focus:
                  </span>
                  <p className="text-xs font-bold text-[#1A325D]">{seg.focus}</p>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {seg.desc}
                </p>
              </div>

              <div className="lg:col-span-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 block mb-3">
                  Featured Course Modules
                </span>
                <ul className="space-y-2 text-xs font-bold text-gray-700">
                  {seg.subjects.map((sub, sIdx) => (
                    <li key={sIdx} className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-[#FFC907] shrink-0" />
                      <span>{sub}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Special Features section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-800 text-[10px] font-bold uppercase tracking-widest rounded-full">
                <Sparkles className="w-3 h-3 text-[#FFC907]" /> Dynamic Teaching Metrics
              </span>
              <h3 className="text-2xl sm:text-3xl font-sans font-black text-[#001c46]">
                Our Conceptual Assessment Methodology
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                We reject standard memorization. Every topic starts with physical experiments, visual smart boards, or laboratory previews. Assessment is divided into formative checks (weekly mini-quizzes, tech worksheets, and presentation reviews) and term assessments. This keeps students highly motivated and stress-free.
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs font-bold text-gray-700">
                <div className="flex items-center gap-2">✔ Bi-Weekly Concept Re-checks</div>
                <div className="flex items-center gap-2">✔ Multi-disciplinary School Projects</div>
                <div className="flex items-center gap-2">✔ Specialized Speaking Skills Track</div>
                <div className="flex items-center gap-2">✔ Comprehensive Parents Consultation</div>
              </div>
            </div>

            <div className="lg:col-span-5 relative h-64 lg:h-80 rounded-2xl overflow-hidden border border-gray-100 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=800"
                alt="Analytical Student Learning"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
