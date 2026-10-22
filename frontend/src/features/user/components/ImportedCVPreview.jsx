import {FileText} from 'lucide-react';

const text = value => typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
const join = values => values.map(text).filter(Boolean).join(' · ');
const details = value => Array.isArray(value) ? value.map(text).filter(Boolean) : [];

export default function ImportedCVPreview({data, compact = false}) {
    const personal = data.personalInfo;
    const skills = data.skills.filter(skill => text(skill.name));
    const groups = [
        ['Kinh nghiệm', data.experiences.map(item => ({title: text(item.role), subtitle: text(item.company), meta: text(item.period), details: details(item.details)}))],
        ['Học vấn', data.education.map(item => ({title: text(item.school), subtitle: text(item.degree), meta: join([item.year || item.period, text(item.gpa) ? `GPA: ${text(item.gpa)}` : '']), details: details(item.details)}))],
        ['Dự án', data.projects.map(item => ({title: text(item.name), meta: text(item.period), subtitle: join([item.techStack, item.teamSize, item.url]), details: details(item.details)}))],
        ['Chứng chỉ', data.certificates.map(item => ({title: text(item.name), subtitle: join([item.issuer, item.url]), meta: text(item.date)}))],
        ['Ngoại ngữ', data.languages.map(item => ({title: text(item.name), subtitle: text(item.level)}))],
        ['Giải thưởng', data.awards.map(item => ({title: text(item.name), subtitle: text(item.issuer), meta: text(item.date)}))],
    ].map(([title, rows]) => [title, rows.filter(row => row.title || row.subtitle || row.meta || row.details?.length)]);
    const highlight = groups.flatMap(([, rows]) => rows)[0];
    const contacts = [personal.email, personal.phone, personal.dob, personal.address, personal.linkedin].map(text).filter(Boolean);
    const hasContent = text(personal.name) || text(data.professionalTitle) || text(data.summary)
        || contacts.length || skills.length || highlight || text(data.sourceText);

    return <article aria-label={compact ? 'Tóm tắt CV tải lên' : 'Nội dung CV tải lên'}
        className={`w-full min-w-0 bg-white text-left text-slate-800 ${compact ? 'h-60 overflow-hidden px-5 pb-4 pt-12' : 'space-y-6'}`}>
        <div className={compact ? 'space-y-1.5' : 'space-y-2 border-b border-slate-200 pb-5'}>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><FileText size={14}/>CV tải lên</p>
            <h3 className={`break-words font-bold text-slate-900 ${compact ? 'line-clamp-1 text-base' : 'text-xl'}`}>{text(personal.name) || 'Thông tin CV'}</h3>
            {text(data.professionalTitle) && <p className={`break-words font-medium text-slate-600 ${compact ? 'line-clamp-1 text-xs' : 'text-sm'}`}>{text(data.professionalTitle)}</p>}
            {!compact && <p className="text-xs text-slate-500">Nội dung được trích xuất từ CV đã tải lên.</p>}
        </div>
        {!hasContent && <p className="mt-3 text-sm text-slate-500">CV chưa có nội dung để xem trước.</p>}
        {compact ? <div className="mt-3 space-y-2">
            {skills.length > 0 && <p className="line-clamp-2 break-words text-xs leading-5 text-slate-700">{skills.slice(0, 6).map(skill => text(skill.name)).join(' · ')}</p>}
            {highlight && <p className="line-clamp-2 break-words text-xs text-slate-500">{join([highlight.title, highlight.subtitle]) || highlight.meta}</p>}
            {!skills.length && !highlight && <p className="line-clamp-3 break-words text-xs leading-5 text-slate-600">{text(data.summary) || contacts[0] || text(data.sourceText)}</p>}
        </div> : <>
            {contacts.length > 0 && <section><h4 className="mb-2 font-semibold text-slate-900">Thông tin liên hệ</h4>
                <ul className="space-y-1 text-sm text-slate-600">{contacts.map((contact, index) => <li key={index} className="break-words">{contact}</li>)}</ul>
            </section>}
            {text(data.summary) && <section><h4 className="mb-2 font-semibold text-slate-900">Giới thiệu</h4><p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{text(data.summary)}</p></section>}
            {skills.length > 0 && <section><h4 className="mb-2 font-semibold text-slate-900">Kỹ năng</h4>
                <ul className="flex flex-wrap gap-2">{skills.map((skill, index) => <li key={index} className="max-w-full break-words rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700">{join([skill.name, skill.category, skill.level])}</li>)}</ul>
            </section>}
            {groups.filter(([, rows]) => rows.length).map(([title, rows]) => <section key={title}>
                <h4 className="mb-3 border-b border-slate-200 pb-2 font-semibold text-slate-900">{title}</h4>
                <div className="space-y-4">{rows.map((row, index) => <div key={index} className="space-y-1 break-words text-sm">
                    {row.title && <p className="font-semibold text-slate-800">{row.title}</p>}
                    {row.subtitle && <p className="text-slate-600">{row.subtitle}</p>}
                    {row.meta && <p className="text-xs text-slate-500">{row.meta}</p>}
                    {row.details?.length > 0 && <ul className="list-disc space-y-1 pl-5 leading-6 text-slate-600">{row.details.map((line, index) => <li key={index} className="whitespace-pre-wrap">{line}</li>)}</ul>}
                </div>)}</div>
            </section>)}
            {text(data.sourceText) && <details className="rounded-xl border border-slate-200 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700">Văn bản trích xuất</summary>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{text(data.sourceText)}</p>
            </details>}
        </>}
    </article>;
}
