import {
    Document,
    Font,
    Image,
    Page,
    StyleSheet,
    Text,
    View,
} from '@react-pdf/renderer';
import notoLatinRegular from '@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff';
import notoLatinBold from '@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff';
import notoVietnameseRegular from '@fontsource/noto-sans/files/noto-sans-vietnamese-400-normal.woff';
import notoVietnameseBold from '@fontsource/noto-sans/files/noto-sans-vietnamese-700-normal.woff';
import { getVisibleCvPdfSections } from '../sectionVisibility.js';

Font.register({
    family: 'Noto Sans Latin',
    fonts: [
        { src: notoLatinRegular, fontWeight: 400 },
        { src: notoLatinBold, fontWeight: 700 },
    ],
});

Font.register({
    family: 'Noto Sans Vietnamese',
    fonts: [
        { src: notoVietnameseRegular, fontWeight: 400 },
        { src: notoVietnameseBold, fontWeight: 700 },
    ],
});

const FONT_FAMILY = ['Noto Sans Latin', 'Noto Sans Vietnamese'];
const CATEGORY_LABELS = {
    backend: 'Back-end',
    frontend: 'Front-end',
    soft: 'Soft Skills',
    softskill: 'Soft Skills',
    softskills: 'Soft Skills',
    other: 'Other skills',
};

const styles = StyleSheet.create({
    page: {
        fontFamily: FONT_FAMILY,
        fontSize: 9,
        color: '#1e293b',
        backgroundColor: '#ffffff',
    },
    columns: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    mainColumn: {
        width: '60%',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
    },
    sideColumn: {
        width: '40%',
        paddingTop: 48,
        paddingHorizontal: 30,
        paddingBottom: 30,
        backgroundColor: '#f4f4f4',
        borderLeftWidth: 1,
        borderLeftColor: '#e2e8f0',
        gap: 26,
    },
    header: {
        paddingHorizontal: 30,
        paddingTop: 36,
        paddingBottom: 24,
        backgroundColor: '#564234',
        color: '#ffffff',
    },
    name: {
        fontSize: 27,
        fontWeight: 700,
        lineHeight: 1.15,
        textTransform: 'uppercase',
        marginBottom: 3,
    },
    title: {
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: 1.25,
        textTransform: 'uppercase',
        color: '#e7e5e4',
        marginBottom: 16,
    },
    summary: {
        maxWidth: '90%',
        fontSize: 9.75,
        lineHeight: 1.45,
        color: '#f5f5f4',
    },
    mainContent: {
        flexGrow: 1,
        paddingHorizontal: 30,
        paddingTop: 24,
        paddingBottom: 30,
    },
    section: {
        marginBottom: 26,
    },
    sectionTitle: {
        fontSize: 13.5,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 1.1,
        color: '#564234',
        borderBottomWidth: 1.5,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 6,
        marginBottom: 16,
    },
    skillGroup: {
        flexDirection: 'row',
        marginBottom: 11,
    },
    skillCategory: {
        width: 75,
        paddingTop: 3,
        paddingRight: 8,
        fontWeight: 700,
        color: '#334155',
    },
    skillList: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    },
    skill: {
        paddingVertical: 3,
        paddingHorizontal: 7,
        backgroundColor: '#f1f5f9',
        borderRadius: 4,
        color: '#1e293b',
        fontSize: 8,
    },
    experienceList: {
        borderLeftWidth: 1.5,
        borderLeftColor: '#564234',
        marginLeft: 2,
        paddingLeft: 15,
        gap: 18,
    },
    experience: {
        position: 'relative',
    },
    timelineDot: {
        position: 'absolute',
        left: -20,
        top: 4,
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#564234',
    },
    period: {
        fontSize: 8,
        fontWeight: 700,
        color: '#64748b',
        marginBottom: 3,
    },
    role: {
        fontSize: 11,
        fontWeight: 700,
        color: '#564234',
        marginBottom: 2,
    },
    company: {
        fontSize: 9,
        color: '#475569',
        marginBottom: 7,
    },
    bullet: {
        fontSize: 8.5,
        lineHeight: 1.4,
        marginBottom: 5,
        paddingLeft: 10,
    },
    projectDetail: {
        fontSize: 8,
        lineHeight: 1.35,
        marginBottom: 3,
        paddingLeft: 8,
    },
    photoWrap: {
        alignItems: 'center',
        marginBottom: 2,
    },
    photo: {
        width: 135,
        height: 135,
        borderRadius: 68,
        objectFit: 'cover',
    },
    photoPlaceholder: {
        width: 135,
        height: 135,
        borderRadius: 68,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e2e8f0',
        color: '#64748b',
        fontSize: 9,
    },
    contactList: {
        gap: 12,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
    },
    contactIcon: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
        fontSize: 7,
        fontWeight: 700,
    },
    contactText: {
        flex: 1,
        fontSize: 8.5,
        lineHeight: 1.3,
        color: '#475569',
        overflow: 'hidden',
    },
    sideSection: {
        marginBottom: 2,
    },
    sideSectionTitle: {
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: '#1e293b',
        borderBottomWidth: 1.5,
        borderBottomColor: '#cbd5e1',
        paddingBottom: 6,
        marginBottom: 12,
    },
    educationItem: {
        marginBottom: 11,
    },
    school: {
        fontSize: 9.5,
        fontWeight: 700,
        color: '#564234',
        lineHeight: 1.25,
        marginBottom: 3,
    },
    degree: {
        fontSize: 8.75,
        fontWeight: 700,
        color: '#334155',
        marginBottom: 3,
    },
    muted: {
        fontSize: 8,
        color: '#64748b',
        marginBottom: 3,
    },
    sideItem: {
        marginBottom: 10,
    },
    itemTitle: {
        fontSize: 9.25,
        fontWeight: 700,
        color: '#564234',
        lineHeight: 1.25,
        marginBottom: 3,
    },
    itemBody: {
        fontSize: 8.5,
        fontWeight: 700,
        color: '#334155',
        lineHeight: 1.3,
        marginBottom: 3,
    },
    languageRow: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 5,
        fontSize: 8.5,
    },
    languageName: {
        fontWeight: 700,
        color: '#564234',
    },
    languageLevel: {
        color: '#64748b',
    },
});

function textValue(value) {
    return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function categoryLabel(category) {
    const key = textValue(category).toLowerCase().replace(/[\s_-]/g, '');
    return CATEGORY_LABELS[key] || textValue(category) || 'Other skills';
}

function groupSkills(cvData) {
    const languageNames = new Set((cvData.languages || []).map(language => textValue(language?.name).toLowerCase()));
    const groups = new Map();

    (cvData.skills || []).forEach(skill => {
        const name = textValue(skill?.name);
        if (!name || languageNames.has(name.toLowerCase())) return;

        const category = textValue(skill?.category) || 'Other';
        const key = category.toLowerCase();
        if (!groups.has(key)) groups.set(key, { category, items: [] });
        groups.get(key).items.push(name);
    });

    return [...groups.values()];
}

function hasText(...values) {
    return values.some(value => textValue(value));
}

function SectionHeading({ children }) {
    return <Text style={styles.sectionTitle}>{children}</Text>;
}

function SideHeading({ children }) {
    return <Text style={styles.sideSectionTitle}>{children}</Text>;
}

function StandardPage({ data }) {
    const personalInfo = data.personalInfo || {};
    const { experiences, projects, education, certificates, languages, awards } = getVisibleCvPdfSections(data);
    const skills = groupSkills(data);

    const contacts = [
        ['PHONE', personalInfo.phone],
        ['EMAIL', personalInfo.email],
        ['DATE', personalInfo.dob],
        ['AREA', personalInfo.address],
        ['LINK', personalInfo.linkedin],
    ].filter(([, value]) => textValue(value));

    return (
        <Page size="A4" style={styles.page} wrap>
            <View style={styles.columns}>
                <View style={styles.mainColumn}>
                    <View style={styles.header}>
                        <Text style={styles.name}>{textValue(personalInfo.name) || ' '}</Text>
                        {textValue(data.professionalTitle) && <Text style={styles.title}>{textValue(data.professionalTitle)}</Text>}
                        {textValue(data.summary) && <Text style={styles.summary}>{textValue(data.summary)}</Text>}
                    </View>

                    <View style={styles.mainContent}>
                        {skills.length > 0 && <View style={styles.section}>
                            <SectionHeading>Skill</SectionHeading>
                            {skills.map(group => (
                                <View key={group.category} style={styles.skillGroup}>
                                    <Text style={styles.skillCategory}>{categoryLabel(group.category)}</Text>
                                    <View style={styles.skillList}>
                                        {group.items.map((skill, index) => (
                                            <Text key={`${group.category}-${skill}-${index}`} style={styles.skill}>{skill}</Text>
                                        ))}
                                    </View>
                                </View>
                            ))}
                        </View>}

                        {experiences.length > 0 && <View>
                            <SectionHeading>Work Experience</SectionHeading>
                            <View style={styles.experienceList}>
                                {experiences.map((experience, index) => {
                                    const details = Array.isArray(experience.details) ? experience.details : [];
                                    return (
                                        <View key={experience.id || `${experience.role}-${index}`} style={styles.experience}>
                                            <View style={styles.timelineDot} />
                                            {textValue(experience.period) && <Text style={styles.period}>{textValue(experience.period)}</Text>}
                                            {textValue(experience.role) && <Text style={styles.role}>{textValue(experience.role)}</Text>}
                                            {textValue(experience.company) && <Text style={styles.company}>at {textValue(experience.company)}</Text>}
                                            {details.filter(textValue).map((detail, detailIndex) => (
                                                <Text key={`${index}-detail-${detailIndex}`} style={styles.bullet}>•  {textValue(detail)}</Text>
                                            ))}
                                        </View>
                                    );
                                })}
                            </View>
                        </View>}

                        {projects.length > 0 && <View style={styles.section}>
                            <SectionHeading>Projects</SectionHeading>
                            <View style={styles.experienceList}>
                                {projects.map((project, index) => (
                                    <View key={`${project.name || 'project'}-${index}`} style={styles.experience}>
                                        <View style={styles.timelineDot} />
                                        {textValue(project.period) && <Text style={styles.period}>{textValue(project.period)}</Text>}
                                        {hasText(project.name) && <Text style={styles.role}>{textValue(project.name)}</Text>}
                                        {(Array.isArray(project.details) ? project.details : []).filter(textValue).map((detail, detailIndex) => (
                                            <Text key={`${index}-project-${detailIndex}`} style={styles.projectDetail}>•  {textValue(detail)}</Text>
                                        ))}
                                        {textValue(project.techStack) && <Text style={styles.projectDetail}>Tech stack: {textValue(project.techStack)}</Text>}
                                        {textValue(project.teamSize) && <Text style={styles.projectDetail}>Team size: {textValue(project.teamSize)}</Text>}
                                        {textValue(project.url) && <Text style={styles.projectDetail}>{textValue(project.url)}</Text>}
                                    </View>
                                ))}
                            </View>
                        </View>}
                    </View>
                </View>

                <View style={styles.sideColumn}>
                    {data.profilePhoto && <View style={styles.photoWrap}>
                        <Image src={data.profilePhoto} style={styles.photo} />
                    </View>}

                    <View style={styles.contactList}>
                        {contacts.map(([label, value]) => (
                            <View key={label} style={styles.contactRow}>
                                <View style={styles.contactIcon}><Text>{label.slice(0, 1)}</Text></View>
                                <Text style={styles.contactText}>{textValue(value)}</Text>
                            </View>
                        ))}
                    </View>

                    {education.length > 0 && <View style={styles.sideSection}>
                        <SideHeading>Education</SideHeading>
                        {education.map((item, index) => (
                            <View key={`${item.school}-${index}`} style={styles.educationItem}>
                                {textValue(item.school) && <Text style={styles.school}>{textValue(item.school)}</Text>}
                                {textValue(item.degree) && <Text style={styles.degree}>{textValue(item.degree)}</Text>}
                                {textValue(item.year || item.period) && <Text style={styles.muted}>{textValue(item.year || item.period)}</Text>}
                                {textValue(item.gpa) && <Text style={styles.muted}>{textValue(item.gpa)}</Text>}
                            </View>
                        ))}
                    </View>}

                    {certificates.length > 0 && <View style={styles.sideSection}>
                        <SideHeading>Certificate</SideHeading>
                        {certificates.map((item, index) => (
                            <View key={`${item.name}-${index}`} style={styles.sideItem}>
                                {textValue(item.name) && <Text style={styles.itemTitle}>{textValue(item.name)}</Text>}
                                {textValue(item.issuer) && <Text style={styles.itemBody}>{textValue(item.issuer)}</Text>}
                                {textValue(item.date) && <Text style={styles.muted}>{textValue(item.date)}</Text>}
                                {textValue(item.url) && <Text style={styles.muted}>{textValue(item.url)}</Text>}
                            </View>
                        ))}
                    </View>}

                    {languages.length > 0 && <View style={styles.sideSection}>
                        <SideHeading>Foreign Language</SideHeading>
                        {languages.map((item, index) => (
                            <View key={`${item.name}-${index}`} style={styles.languageRow}>
                                <Text style={styles.languageName}>{textValue(item.name)}</Text>
                                {textValue(item.level) && <Text style={styles.languageLevel}>({textValue(item.level)})</Text>}
                            </View>
                        ))}
                    </View>}

                    {awards.length > 0 && <View style={styles.sideSection}>
                        <SideHeading>Award</SideHeading>
                        {awards.map((item, index) => (
                            <View key={`${item.name}-${index}`} style={styles.sideItem}>
                                {textValue(item.name) && <Text style={styles.itemTitle}>{textValue(item.name)}</Text>}
                                {textValue(item.issuer) && <Text style={styles.itemBody}>{textValue(item.issuer)}</Text>}
                                {textValue(item.date) && <Text style={styles.muted}>{textValue(item.date)}</Text>}
                            </View>
                        ))}
                    </View>}
                </View>
            </View>
        </Page>
    );
}

export default function TheStandardPdfTemplate({ data }) {
    return (
        <Document title={`CV ${textValue(data?.personalInfo?.name)}`.trim()} language="vi">
            <StandardPage data={data || {}} />
        </Document>
    );
}
