const CATEGORY_LABELS = {
    backend: 'Back-end',
    frontend: 'Front-end',
    soft: 'Soft skills',
    softskill: 'Soft skills',
    softskills: 'Soft skills',
    other: 'Other skills',
};

function formatCategory(category) {
    const legacyLabel = CATEGORY_LABELS[category.trim().toLowerCase().replace(/[\s_-]/g, '')];
    if (legacyLabel) return legacyLabel;
    return category;
}

const VARIANTS = {
    neutral: {
        label: 'font-bold text-slate-700',
        list: 'text-slate-800',
        item: 'bg-slate-100',
    },
    teal: {
        label: 'font-bold text-teal-100',
        list: 'text-teal-50',
        item: 'border border-teal-600 bg-teal-800/50 text-white',
    },
    red: {
        label: 'font-semibold text-slate-700',
        list: 'text-slate-800',
        item: 'bg-red-50 text-slate-800',
    },
    blue: {
        label: 'font-semibold text-[#A2CAEA]',
        list: 'text-white',
        item: 'border border-white/30 text-white',
    },
};

export default function SkillCategoryList({
    skills,
    layout = 'rows',
    variant = 'neutral',
    className = '',
}) {
    const groups = Object.entries(skills || {}).filter(([, items]) => Array.isArray(items) && items.length > 0);
    if (!groups.length) return null;

    const styles = VARIANTS[variant] || VARIANTS.neutral;
    const isRows = layout === 'rows';

    return (
        <div className={`${isRows ? 'grid grid-cols-[140px_1fr] gap-x-4 gap-y-4' : 'flex flex-col gap-4'} ${className}`}>
            {groups.map(([category, items]) => (
                <div key={category} className={isRows ? 'contents' : 'min-w-0'}>
                    <div className={`${styles.label} ${isRows ? 'pt-1' : 'mb-2'} break-words`}>
                        {formatCategory(category)}
                    </div>
                    <div className={`flex min-w-0 flex-wrap gap-1.5 ${styles.list}`}>
                        {items.map((skill, index) => (
                            <span
                                key={`${category}-${skill}-${index}`}
                                className={`rounded px-2.5 py-1 text-xs font-medium break-words ${styles.item}`}
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
