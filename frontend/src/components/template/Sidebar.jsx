import {Sparkles} from 'lucide-react';
import { TEMPLATE_CATEGORIES, TEMPLATE_STYLES } from '../../constants/templates';

export default function Sidebar({ activeCategory, setActiveCategory, activeStyle, setActiveStyle }){
    return(
        <>
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 flex flex-col gap-8">
                {/* Categories */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Categories</h3>
                    <ul className="space-y-1">
                        {TEMPLATE_CATEGORIES.map(cat => (
                            <li key={cat.id}>
                                <button
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`w-full text-left px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                                        activeCategory === cat.id
                                        ? 'bg-blue-700 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Design Style */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Design Style</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {TEMPLATE_STYLES.map(style => (
                            <button
                                key={style}
                                onClick={() => setActiveStyle(prev => prev === style ? null : style)}
                                className={`border rounded px-2 py-1.5 text-xs font-semibold transition-colors ${
                                    activeStyle === style
                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                    : 'border-slate-300 text-slate-600 hover:border-blue-500'
                                }`}
                            >
                                {style}
                            </button>
                        ))}
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
