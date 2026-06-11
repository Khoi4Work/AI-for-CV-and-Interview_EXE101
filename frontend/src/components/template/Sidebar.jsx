import {Sparkles} from 'lucide-react';
export default function Sidebar(){
    return(
        <>
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 flex flex-col gap-8">
                {/* Categories */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Categories</h3>
                    <ul className="space-y-1">
                        <li><button className="w-full text-left px-4 py-2 bg-blue-700 text-white rounded-md font-medium text-sm">All Templates</button></li>
                        <li><button className="w-full text-left px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm transition-colors">Technology</button></li>
                        <li><button className="w-full text-left px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm transition-colors">Marketing</button></li>
                        <li><button className="w-full text-left px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm transition-colors">Design</button></li>
                        <li><button className="w-full text-left px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm transition-colors">Communication</button></li>
                    </ul>
                </section>

                {/* Design Style */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Design Style</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <button className="border border-slate-300 rounded px-2 py-1.5 text-xs font-semibold hover:border-blue-500 transition-colors">Minimalist</button>
                        <button className="border border-slate-300 rounded px-2 py-1.5 text-xs font-semibold hover:border-blue-500 transition-colors">Creative</button>
                        <button className="border border-slate-300 rounded px-2 py-1.5 text-xs font-semibold hover:border-blue-500 transition-colors">Executive</button>
                        <button className="border border-slate-300 rounded px-2 py-1.5 text-xs font-semibold hover:border-blue-500 transition-colors">Modern</button>
                    </div>
                </section>

                {/* AI Recommendations Widget */}
                <section className="mt-auto">
                    <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-blue-700" />
                            <span className="text-sm font-bold text-blue-900">AI Recommendations</span>
                        </div>
                        <button className="w-full py-2 bg-blue-900 text-white rounded-lg text-sm font-bold hover:bg-blue-800 transition-colors">Try</button>
                    </div>
                </section>
            </aside>
        </>
    )
}