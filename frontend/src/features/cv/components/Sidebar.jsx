import {Sparkles} from 'lucide-react';
import { TEMPLATE_CATEGORIES, TEMPLATE_STYLES } from '../constants/templates.js';

export default function Sidebar({ activeCategory, setActiveCategory, activeStyle, setActiveStyle }){
    return(
        <>
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 flex flex-col gap-8">
                {/* Categories */}
                <section>
                    <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Categories</h3>
                    <ul className="space-y-1">
                        {TEMPLATE_CATEGORIES.map(cat => (
                            <li key={cat.id}>
                                <button
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`w-full text-left px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                                        activeCategory === cat.id
                                        ? 'bg-primary text-on-primary'
                                        : 'text-on-surface-variant hover:bg-surface-container'
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
                    <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Design Style</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {TEMPLATE_STYLES.map(style => (
                            <button
                                key={style}
                                onClick={() => setActiveStyle(prev => prev === style ? null : style)}
                                className={`border rounded px-2 py-1.5 text-xs font-semibold transition-colors ${
                                    activeStyle === style
                                        ? 'border-primary text-primary bg-surface-container' 
                                        : 'border-white text-on-surface-variant hover:border-primary' 
                                }`}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                </section>

                {/* AI Recommendations Widget */}
                <section className="mt-auto">
                    <div className="glass-panel rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <span className="text-sm font-bold text-on-surface">AI Recommendations</span>
                        </div>
                        <button className="w-full py-2 bg-primary text-on-primary rounded-md text-sm font-bold hover:opacity-90 transition-colors">Try</button>
                    </div>
                </section>
            </aside>
        </>
    )
}
