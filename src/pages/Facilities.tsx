import React from 'react';
import { FACILITIES } from '../data/content';
import { Laptop, Cpu, BookOpen, Trophy, Music, FlaskConical, CircleDot } from 'lucide-react';

export default function Facilities() {
  // Mapper for Lucide Icons
  const iconMap: Record<string, React.ReactNode> = {
    Laptop: <Laptop className="w-6 h-6 text-[#1A325D]" />,
    Beaker: <FlaskConical className="w-6 h-6 text-[#1A325D]" />,
    Cpu: <Cpu className="w-6 h-6 text-[#1A325D]" />,
    BookOpen: <BookOpen className="w-6 h-6 text-[#1A325D]" />,
    Trophy: <Trophy className="w-6 h-6 text-[#1A325D]" />,
    Music: <Music className="w-6 h-6 text-[#1A325D]" />,
  };

  return (
    <div className="space-y-24 pb-16 animate-fadeIn">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-[#001c46] to-[#1A325D] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-[#FFC907] text-xs font-bold uppercase tracking-widest block">
            School Infrastructure
          </span>
          <h1 className="text-3xl sm:text-4xl font-sans font-black tracking-tight">
            Advanced Learning Facilities & Environment
          </h1>
          <p className="text-gray-300 text-sm max-w-xl mx-auto">
            Providing our Nursery to Grade 12 students with standard laboratories, modern athletic courts, and digital smart class tools.
          </p>
        </div>
      </section>

      {/* Facilities Grid List */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-16">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-sans font-black text-[#001c46]">
            Campus Environments & Labs
          </h2>
          <div className="w-16 h-1 bg-[#FFC907] mx-auto rounded-full"></div>
          <p className="text-xs text-gray-400 uppercase tracking-widest">Optimized for Academic and Athletic Success</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FACILITIES.map((fac) => (
            <div
              key={fac.id}
              className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Header with smooth mask */}
              <div className="h-52 w-full overflow-hidden relative bg-gray-100">
                <img
                  src={fac.imageUrl}
                  alt={fac.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 p-3 bg-white/90 backdrop-blur rounded-xl shadow-md">
                  {iconMap[fac.iconName] || <CircleDot className="w-6 h-6 text-[#1A325D]" />}
                </div>
              </div>

              {/* Text Description */}
              <div className="p-6 space-y-3 flex-grow">
                <h3 className="font-sans font-extrabold text-[#001c46] text-xl">
                  {fac.name}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {fac.description}
                </p>
              </div>

              {/* Technical Indicator Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100/60 text-center">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-bold">
                  Conforms to CBSE National Benchmarks
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Safety & Logistics Callout */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-xl sm:text-2xl font-sans font-black text-[#001c46]">
              Safety, Sanitation & GPS Transport Systems
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              We prioritize physical safety and health parameters. Our campus features 24/7 CCTV vigilance, secure gated access controls, continuous pure water supply networks, and safe school bus routes equipped with live GPS tracking trackers and supervisors.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-600">
              <span className="px-3 py-1 bg-white border border-gray-200 rounded-full">✓ Complete Fire Safety Audited</span>
              <span className="px-3 py-1 bg-white border border-gray-200 rounded-full">✓ First-Aid Clinic Room on campus</span>
              <span className="px-3 py-1 bg-white border border-gray-200 rounded-full">✓ GPS Live-tracking buses</span>
            </div>
          </div>
          <div className="lg:col-span-4 relative h-48 rounded-2xl overflow-hidden border border-gray-100 shadow">
            <img
              src="https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&q=80&w=600"
              alt="Safe School Transport bus"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
