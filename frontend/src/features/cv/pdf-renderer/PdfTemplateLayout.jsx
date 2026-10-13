import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import notoLatinRegular from '@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff';
import notoLatinBold from '@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff';
import notoVietnameseRegular from '@fontsource/noto-sans/files/noto-sans-vietnamese-400-normal.woff';
import notoVietnameseBold from '@fontsource/noto-sans/files/noto-sans-vietnamese-700-normal.woff';

Font.register({ family: 'CV Noto Sans Latin', fonts: [
    { src: notoLatinRegular, fontWeight: 400 }, { src: notoLatinBold, fontWeight: 700 },
] });
Font.register({ family: 'CV Noto Sans Vietnamese', fonts: [
    { src: notoVietnameseRegular, fontWeight: 400 }, { src: notoVietnameseBold, fontWeight: 700 },
] });

const themes = {
    'data-scientist': { accent: '#111827', tint: '#f1f5f9', sidebar: '#ffffff', sideText: '#334155', layout: 'single' },
    'boardroom-ready': { accent: '#475569', tint: '#f1f5f9', sidebar: '#ffffff', sideText: '#334155', layout: 'single' },
    'security-analyst': { accent: '#dc2626', tint: '#fef2f2', sidebar: '#f8fafc', sideText: '#334155', layout: 'security' },
    'cloud-expert': { accent: '#0B2039', tint: '#A2CAEA', sidebar: '#0B2039', sideText: '#ffffff', layout: 'cloud' },
    'portfolio-hybrid': { accent: '#1b5e60', tint: '#e6f4f1', sidebar: '#1b5e60', sideText: '#ffffff', layout: 'portfolio' },
};

const s = StyleSheet.create({
    page: { fontFamily: ['CV Noto Sans Latin', 'CV Noto Sans Vietnamese'], fontSize: 9, color: '#1e293b', backgroundColor: '#fff' },
    row: { flexDirection: 'row', flexGrow: 1 },
    main: { width: '65%', padding: 32 },
    side: { width: '35%', padding: 26 },
    single: { padding: 42 },
    header: { marginBottom: 23, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    centered: { textAlign: 'center', alignItems: 'center' },
    name: { fontSize: 25, fontWeight: 700, marginBottom: 4 },
    title: { fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 9 },
    contactLine: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 7, fontSize: 8, color: '#475569' },
    section: { marginBottom: 21 },
    heading: { fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', paddingBottom: 5, marginBottom: 10, borderBottomWidth: 1.5 },
    summary: { fontSize: 9, lineHeight: 1.45, color: '#475569' },
    item: { marginBottom: 12 },
    itemTitle: { fontSize: 9.5, fontWeight: 700, marginBottom: 2 },
    muted: { fontSize: 8, color: '#64748b', marginBottom: 3 },
    body: { fontSize: 8.5, lineHeight: 1.4, marginBottom: 3, color: '#334155' },
    bullet: { fontSize: 8.3, lineHeight: 1.4, paddingLeft: 9, marginBottom: 3 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    chip: { backgroundColor: '#f1f5f9', borderRadius: 3, paddingHorizontal: 6, paddingVertical: 3, fontSize: 7.5 },
    skillGroup: { marginBottom: 8 },
    skillCategory: { fontSize: 8, fontWeight: 700, marginBottom: 3 },
    contact: { fontSize: 8, lineHeight: 1.35, marginBottom: 7 },
    photo: { width: 96, height: 96, objectFit: 'cover', alignSelf: 'center', marginBottom: 20 },
});

const text = value => value === null || value === undefined ? '' : String(value).trim();
const has = (...values) => values.some(value => text(value));
const filled = values => Array.isArray(values) ? values.filter(item => item && Object.values(item).some(value => typeof value === 'string' && text(value))) : [];

function skillsByCategory(skills = [], languages = []) {
    const languageSet = new Set(languages.map(item => text(item.name).toLocaleLowerCase()).filter(Boolean));
    const groups = new Map();
    skills.forEach(item => {
        const name = text(item.name);
        if (!name || languageSet.has(name.toLocaleLowerCase())) return;
        const category = text(item.category) || 'Other skills';
        if (!groups.has(category)) groups.set(category, []);
        groups.get(category).push(name);
    });
    return [...groups.entries()];
}

function ContactBlock({ data, color = '#475569', stacked = false }) {
    const values = [data.phone, data.email, data.dob, data.address, data.linkedin].map(text).filter(Boolean);
    return values.length ? <View style={[s.contactLine, stacked && { flexDirection: 'column' }]}>{values.map((value, index) => <Text key={`${index}-${value}`} style={[{ color }, stacked && s.contact]}>{value}</Text>)}</View> : null;
}

function Heading({ children, theme, light = false }) {
    return <Text style={[s.heading, { color: light ? theme.tint : theme.accent, borderBottomColor: light ? '#64748b' : '#cbd5e1' }]}>{children}</Text>;
}

function Section({ title, theme, children, light = false }) {
    return <View style={s.section}><Heading theme={theme} light={light}>{title}</Heading>{children}</View>;
}

function Summary({ data, theme, light = false, showHeading = true }) {
    if (!has(data.summary)) return null;
    const summary = <Text style={[s.summary, light && { color: '#e2e8f0' }]}>{text(data.summary)}</Text>;
    return showHeading ? <Section title="About Me" theme={theme} light={light}>{summary}</Section> : <View style={s.section}>{summary}</View>;
}

function Experience({ items = [], theme }) {
    const visible = items.filter(item => has(item.role, item.company, item.period) || item.details.some(text));
    return visible.length ? <Section title="Work Experience" theme={theme}>
        {visible.map((item, index) => <View key={item.id || `${item.role}-${index}`} style={s.item}>
            {has(item.role) && <Text style={[s.itemTitle, { color: theme.accent }]}>{text(item.role)}</Text>}
            {has(item.company, item.period) && <Text style={s.muted}>{[text(item.company), text(item.period)].filter(Boolean).join('  |  ')}</Text>}
            {item.details.filter(text).map((detail, i) => <Text key={i} style={s.bullet}>•  {text(detail)}</Text>)}
        </View>)}
    </Section> : null;
}

function Projects({ items = [], theme, title = 'Projects' }) {
    const visible = items.filter(item => has(item.name, item.period, item.url, item.techStack, item.teamSize) || item.details.some(text));
    return visible.length ? <Section title={title} theme={theme}>
        {visible.map((item, index) => <View key={`${item.name || 'project'}-${index}`} style={s.item}>
            {has(item.name) && <Text style={[s.itemTitle, { color: theme.accent }]}>{text(item.name)}</Text>}
            {has(item.period) && <Text style={s.muted}>{text(item.period)}</Text>}
            {item.details.filter(text).map((detail, i) => <Text key={i} style={s.bullet}>•  {text(detail)}</Text>)}
            {has(item.techStack) && <Text style={s.body}>Tech stack: {text(item.techStack)}</Text>}
            {has(item.teamSize) && <Text style={s.body}>Team size: {text(item.teamSize)}</Text>}
            {has(item.url) && <Text style={s.muted}>{text(item.url)}</Text>}
        </View>)}
    </Section> : null;
}

function Education({ items = [], theme, light = false }) {
    const visible = items.filter(item => has(item.school, item.degree, item.year, item.period, item.gpa));
    return visible.length ? <Section title="Education" theme={theme} light={light}>
        {visible.map((item, index) => <View key={`${item.school}-${index}`} style={s.item}>
            {has(item.school) && <Text style={[s.itemTitle, light && { color: '#fff' }]}>{text(item.school)}</Text>}
            {has(item.degree) && <Text style={[s.body, light && { color: '#e2e8f0' }]}>{text(item.degree)}</Text>}
            {has(item.year, item.period) && <Text style={[s.muted, light && { color: '#cbd5e1' }]}>{text(item.year || item.period)}</Text>}
            {has(item.gpa) && <Text style={[s.muted, light && { color: '#cbd5e1' }]}>GPA: {text(item.gpa)}</Text>}
        </View>)}
    </Section> : null;
}

function Skills({ data, theme, light = false, chips = false }) {
    const groups = skillsByCategory(data.skills, data.languages);
    return groups.length ? <Section title="Skills" theme={theme} light={light}>
        {groups.map(([category, items]) => <View key={category} style={s.skillGroup}>
            <Text style={[s.skillCategory, light && { color: '#fff' }]}>{category}</Text>
            {chips ? <View style={s.chipRow}>{items.map((item, index) => <Text key={`${item}-${index}`} style={s.chip}>{item}</Text>)}</View>
                : <Text style={[s.body, light && { color: '#e2e8f0' }]}>{items.join(' · ')}</Text>}
        </View>)}
    </Section> : null;
}

function OtherSections({ data, theme, light = false }) {
    const certificates = filled(data.certificates);
    const awards = filled(data.awards);
    const languages = filled(data.languages);
    return <>
        {certificates.length > 0 && <Section title="Certificates" theme={theme} light={light}>{certificates.map((item, index) => <View key={index} style={s.item}>
            {has(item.name) && <Text style={[s.itemTitle, light && { color: '#fff' }]}>{text(item.name)}</Text>}
            {has(item.issuer) && <Text style={[s.body, light && { color: '#e2e8f0' }]}>{text(item.issuer)}</Text>}
            {has(item.date) && <Text style={[s.muted, light && { color: '#cbd5e1' }]}>{text(item.date)}</Text>}
        </View>)}</Section>}
        {languages.length > 0 && <Section title="Languages" theme={theme} light={light}>{languages.map((item, index) => <Text key={index} style={[s.body, light && { color: '#e2e8f0' }]}>{[text(item.name), text(item.level)].filter(Boolean).join('  ·  ')}</Text>)}</Section>}
        {awards.length > 0 && <Section title="Awards" theme={theme} light={light}>{awards.map((item, index) => <View key={index} style={s.item}>
            {has(item.name) && <Text style={[s.itemTitle, light && { color: '#fff' }]}>{text(item.name)}</Text>}
            {has(item.issuer) && <Text style={[s.body, light && { color: '#e2e8f0' }]}>{text(item.issuer)}</Text>}
            {has(item.date) && <Text style={[s.muted, light && { color: '#cbd5e1' }]}>{text(item.date)}</Text>}
        </View>)}</Section>}
    </>;
}

function Header({ data, theme, centered = false, light = false, showContact = true, borderless = false }) {
    return <View style={[s.header, centered && s.centered, { borderBottomColor: light ? '#64748b' : '#e2e8f0' }, borderless && { borderBottomWidth: 0 }]}>
        {has(data.personalInfo.name) && <Text style={[s.name, { color: light ? '#fff' : '#1e293b' }]}>{text(data.personalInfo.name)}</Text>}
        {has(data.professionalTitle) && <Text style={[s.title, { color: light ? theme.tint : theme.accent }]}>{text(data.professionalTitle)}</Text>}
        {showContact && <ContactBlock data={data.personalInfo} color={light ? '#e2e8f0' : '#475569'} />}
    </View>;
}

function SingleColumn({ data, theme, templateId }) {
    return <Page size="A4" style={s.page} wrap>
        <View style={s.single}>
            <Header data={data} theme={theme} centered={templateId === 'data-scientist'} />
            <Summary data={data} theme={theme} />
            {templateId === 'boardroom-ready' && <Skills data={data} theme={theme} chips />}
            <Experience items={data.experiences} theme={theme} />
            <Projects items={data.projects} theme={theme} />
            <Education items={data.education} theme={theme} />
            {templateId !== 'boardroom-ready' && <Skills data={data} theme={theme} chips />}
            <OtherSections data={data} theme={theme} />
        </View>
    </Page>;
}

function SecurityAnalyst({ data, theme }) {
    return <Page size="A4" style={s.page} wrap>
        <View style={s.row}>
            <View style={[s.side, { backgroundColor: theme.sidebar }]}>
                <Section title="Personal Details" theme={theme}>{[data.personalInfo.phone, data.personalInfo.email, data.personalInfo.address, data.personalInfo.linkedin, data.personalInfo.dob].filter(has).map((value, index) => <Text key={index} style={s.contact}>{text(value)}</Text>)}</Section>
                <Education items={data.education} theme={theme} />
                <Skills data={data} theme={theme} />
                <OtherSections data={{ ...data, awards: [] }} theme={theme} />
            </View>
            <View style={s.main}>
                <Header data={data} theme={theme} showContact={false} />
                <Summary data={data} theme={theme} />
                <Experience items={data.experiences} theme={theme} />
                <Projects items={data.projects} theme={theme} />
                <OtherSections data={{ ...data, certificates: [], languages: [] }} theme={theme} />
            </View>
        </View>
    </Page>;
}

function SidebarTemplate({ data, theme, portfolio = false }) {
    return <Page size="A4" style={s.page} wrap>
        <View style={s.row}>
            <View style={[s.side, { backgroundColor: theme.sidebar }]}>
                {data.profilePhoto && <Image src={data.profilePhoto} style={s.photo} />}
                {portfolio ? <>
                    <ContactBlock data={data.personalInfo} color="#e6f4f1" stacked />
                    <Skills data={data} theme={theme} light chips />
                    <Education items={data.education} theme={theme} light />
                </> : <>
                    <Header data={data} theme={theme} light />
                    <Education items={data.education} theme={theme} light />
                    <Skills data={data} theme={theme} light />
                    <OtherSections data={{ ...data, awards: [], languages: [] }} theme={theme} light />
                </>}
            </View>
            <View style={s.main}>
                {portfolio && <>
                    <Header data={data} theme={theme} showContact={false} borderless={portfolio} />
                    <Summary data={data} theme={theme} showHeading={false} />
                </>}
                {!portfolio && <Summary data={data} theme={theme} />}
                <Experience items={data.experiences} theme={theme} />
                <Projects items={data.projects} theme={theme} title={portfolio ? 'Highlight Project' : 'Projects'} />
                {!portfolio && <OtherSections data={{ ...data, certificates: [], awards: [] }} theme={theme} />}
            </View>
        </View>
    </Page>;
}

function SecurityLayout({ data, theme }) { return <SecurityAnalyst data={data} theme={theme} />; }

export function PdfTemplateLayout({ data, templateId }) {
    const theme = themes[templateId] || themes['data-scientist'];
    const personalInfo = data?.personalInfo || {};
    const document = theme.layout === 'single'
        ? <SingleColumn data={data} theme={theme} templateId={templateId} />
        : theme.layout === 'security'
            ? <SecurityLayout data={data} theme={theme} />
            : <SidebarTemplate data={data} theme={theme} portfolio={theme.layout === 'portfolio'} />;
    return <Document title={`CV ${text(personalInfo.name)}`.trim()} language="vi">{document}</Document>;
}
