import { useState } from 'react';
import Template1_DataScientist from './Template1_DataScientist.jsx';
import Template2_BoardroomReady from './Template2_BoardroomReady.jsx';
import Template3_SecurityAnalyst from './Template3_SecurityAnalyst.jsx';
import Template4 from './Template4_CouldSpecialist.jsx';
import Template5_PortfolioHybrid from './Template5_PortfolioHybrid.jsx';
import Template6_TheStandard from './Template6_TheStandard.jsx';
import { resumeData } from '../../../constants/cv/cv-mock-data.js';

export default function TemplateInterview() {
    const [activeTemplate, setActiveTemplate] = useState(1);

    return (
        <div className="min-h-screen pb-20">

            {/* Theme Switcher */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-2xl border border-gray-200 p-2 flex gap-1 z-50 print:hidden overflow-x-auto max-w-[95vw]">
                {[
                    { id: 1, name: 'Data Scientist', bg: 'bg-black text-white' },
                    { id: 2, name: 'Boardroom Ready', bg: 'bg-slate-700 text-white' },
                    { id: 3, name: 'Security Analyst', bg: 'bg-[#dc2626] text-white' },
                    { id: 4, name: 'Could Specialist', bg: 'bg-[#0e274c] text-white' },
                    { id: 5, name: 'Portfolio Hybrid', bg: 'bg-[#1b5e60] text-white' },
                    { id: 6, name: 'The Standard', bg: 'bg-[#564234] text-white' },
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTemplate(t.id)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeTemplate === t.id ? t.bg : 'hover:bg-gray-100 text-slate-600'}`}
                    >
                        {t.name}
                    </button>
                ))}
            </div>

            <div className="pt-8 print:p-0 transition-opacity duration-300">
                {activeTemplate === 1 && <Template1_DataScientist data={resumeData} />}
                {activeTemplate === 2 && <Template2_BoardroomReady data={resumeData} />}
                {activeTemplate === 3 && <Template3_SecurityAnalyst data={resumeData} />}
                {activeTemplate === 4 && <Template4 data={resumeData} />}
                {activeTemplate === 5 && <Template5_PortfolioHybrid data={resumeData} />}
                {activeTemplate === 6 && <Template6_TheStandard data={resumeData} />}
            </div>

        </div>
    );
}
