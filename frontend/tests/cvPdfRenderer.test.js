import test from 'node:test';
import assert from 'node:assert/strict';
import { getVisibleCvPdfSections } from '../src/features/cv/pdf-renderer/sectionVisibility.js';
import { mapCvDataForPdf } from '../src/features/cv/pdf-renderer/mapCvDataForPdf.js';
import { PDF_TEMPLATE_IDS } from '../src/features/cv/pdf-renderer/templateRegistry.js';
import { mapImportedCVData } from '../src/features/cv/mapper/cv-data-mapper.js';
import { getCvTemplateLayout } from '../src/features/cv/pdf-renderer/templateSectionLayout.js';

test('hides CV sections when their canonical data arrays are empty or blank', () => {
    const sections = getVisibleCvPdfSections({
        experiences: [{ role: '  ', details: [] }],
        projects: [],
        education: [{ school: '', degree: '' }],
        certificates: [],
        languages: [{ name: '', level: '' }],
        awards: [],
    });

    assert.deepEqual(sections, {
        experiences: [],
        projects: [],
        education: [],
        certificates: [],
        languages: [],
        awards: [],
    });
});

test('keeps populated sections and every project record', () => {
    const firstProject = { name: 'Project A', details: ['Built an API'] };
    const secondProject = { name: 'Project B', details: ['Created a dashboard'] };
    const sections = getVisibleCvPdfSections({
        experiences: [{ role: 'Intern', company: 'FPT', details: [] }],
        projects: [firstProject, secondProject],
        education: [{ school: 'FPT University', degree: 'IT' }],
        certificates: [{ name: 'AWS Cloud Practitioner' }],
        languages: [{ name: 'English', level: 'B2' }],
        awards: [{ name: 'Excellent Student' }],
    });

    assert.equal(sections.experiences.length, 1);
    assert.deepEqual(sections.projects, [firstProject, secondProject]);
    assert.equal(sections.education.length, 1);
    assert.equal(sections.certificates.length, 1);
    assert.equal(sections.languages.length, 1);
    assert.equal(sections.awards.length, 1);
});

test('does not infer project-experience relationships from matching titles or repeated details', () => {
    const experience = {
        role: 'Leader of Project Car Sharing Management System',
        details: ['Applied requirements techniques.'],
    };
    const project = {
        name: 'Car Sharing Management System',
        details: ['Applied requirements techniques.'],
    };

    const sections = getVisibleCvPdfSections({ experiences: [experience], projects: [project] });

    assert.deepEqual(sections.experiences, [experience]);
    assert.deepEqual(sections.projects, [project]);
});

test('maps canonical imported CV arrays to the fields read by the PDF renderer', () => {
    const imported = {
        education: [{
            degree: 'IT', school: 'FPT University', year: 'Expected 2024-2027', gpa: '3.4',
            details: ['Excellent student title throughout high school'],
        }],
        projects: [{ name: 'Car Sharing', period: '2025', details: ['Built features'], url: '' }],
        certificates: [{ name: 'Cloud Basics', issuer: 'Provider', date: '2025', url: '' }],
        languages: [{ name: 'English', level: 'B2' }],
        awards: [{ name: 'Student Award', issuer: 'University', date: '2025' }],
    };

    const mapped = mapImportedCVData(imported);

    assert.deepEqual(mapped.education, imported.education);
    assert.deepEqual(mapped.projects, imported.projects);
    assert.deepEqual(mapped.certificates, imported.certificates);
    assert.deepEqual(mapped.languages, imported.languages);
    assert.deepEqual(mapped.awards, imported.awards);
});

test('normalizes nullable fields for every renderer while preserving arbitrary data and independent projects', () => {
    const source = {
        personalInfo: { name: '  Lan Nguyen  ', email: null },
        professionalTitle: '  Backend Developer  ',
        experiences: [{ role: ' Backend Intern ', details: [' API development ', '  '] }],
        projects: [
            { name: ' Project One ', details: [' Build service '], customField: 'keep me' },
            { name: 'Project Two', details: [] },
        ],
        skills: [{ name: ' Java ', category: 'Programming' }, { name: 'English', category: 'Language' }],
        languages: [{ name: ' English ', level: ' B2 ' }],
        education: null,
        certificates: [],
        awards: undefined,
    };

    const mapped = mapCvDataForPdf(source);

    assert.equal(mapped.personalInfo.name, 'Lan Nguyen');
    assert.equal(mapped.personalInfo.email, '');
    assert.equal(mapped.professionalTitle, 'Backend Developer');
    assert.deepEqual(mapped.education, []);
    assert.deepEqual(mapped.certificates, []);
    assert.deepEqual(mapped.awards, []);
    assert.equal(mapped.experiences[0].role, 'Backend Intern');
    assert.deepEqual(mapped.experiences[0].details, ['API development', '']);
    assert.equal(mapped.projects.length, 2);
    assert.equal(mapped.projects[0].customField, 'keep me');
    assert.deepEqual(mapped.skills.map(skill => skill.category), ['Programming', 'Language']);
    assert.deepEqual(mapped.languages, [{ name: 'English', level: 'B2' }]);
});

test('registers a dedicated PDF template module for all six editor template IDs', () => {
    assert.deepEqual(PDF_TEMPLATE_IDS, [
        'the-standard',
        'data-scientist',
        'boardroom-ready',
        'security-analyst',
        'cloud-expert',
        'portfolio-hybrid',
    ]);
});

test('old Security Analyst sidebar sections remain visible after switching to the single-column layout', () => {
    const layout = getCvTemplateLayout({templateLayouts: {'security-analyst': {
        mainOrder: ['summary', 'experiences', 'projects', 'awards'],
        sidebarOrder: ['name', 'profilePhoto', 'personalInfo', 'education', 'skills', 'certificates', 'languages'],
    }}}, 'security-analyst');
    assert.equal(layout.columns, 1);
    assert.deepEqual(layout.sidebarOrder, []);
    for (const section of ['name', 'personalInfo', 'education', 'skills', 'certificates', 'languages']) {
        assert.ok(layout.mainOrder.includes(section), section);
    }
    assert.equal(new Set(layout.mainOrder).size, layout.mainOrder.length);
    assert.ok(!layout.mainOrder.includes('profilePhoto'));
});
