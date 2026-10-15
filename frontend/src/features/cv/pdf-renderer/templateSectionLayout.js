import {supportsProfilePhoto} from '../utils/templateCapabilities.js';

export const CV_SECTION_KEYS = Object.freeze([
    'name', 'profilePhoto', 'summary', 'personalInfo', 'education', 'skills', 'experiences', 'projects', 'certificates', 'languages', 'awards',
]);

export const CV_TEMPLATE_LAYOUTS = Object.freeze({
    'the-standard': {
        mainOrder: ['name', 'summary', 'skills', 'experiences', 'projects'],
        sidebarOrder: ['profilePhoto', 'personalInfo', 'education', 'certificates', 'languages', 'awards'],
        columns: 2,
    },
    'data-scientist': {
        mainOrder: ['name', 'summary', 'personalInfo', 'experiences', 'projects', 'education', 'skills', 'certificates', 'languages', 'awards'],
        sidebarOrder: [],
        columns: 1,
    },
    'boardroom-ready': {
        mainOrder: ['name', 'summary', 'personalInfo', 'experiences', 'education', 'skills', 'projects', 'certificates', 'languages', 'awards'],
        sidebarOrder: [],
        columns: 1,
    },
    'security-analyst': {
        mainOrder: ['name', 'summary', 'experiences', 'projects', 'awards'],
        sidebarOrder: ['profilePhoto', 'personalInfo', 'education', 'skills', 'certificates', 'languages'],
        columns: 2,
        sidebarFirst: true,
    },
    'cloud-expert': {
        mainOrder: ['summary', 'experiences', 'projects', 'languages', 'awards'],
        sidebarOrder: ['name', 'profilePhoto', 'personalInfo', 'education', 'skills', 'certificates'],
        columns: 2,
        sidebarFirst: true,
    },
    'portfolio-hybrid': {
        mainOrder: ['name', 'summary', 'experiences', 'projects', 'certificates', 'languages', 'awards'],
        sidebarOrder: ['profilePhoto', 'personalInfo', 'skills', 'education'],
        columns: 2,
        sidebarFirst: true,
    },
});

function mergeDefaultOrder(savedOrder, defaultOrder, occupiedKeys) {
    const result = [...savedOrder];
    defaultOrder.forEach((key, index) => {
        if (occupiedKeys.has(key) || result.includes(key)) return;
        const nextDefault = defaultOrder.slice(index + 1).find(candidate => result.includes(candidate));
        if (nextDefault) {
            result.splice(result.indexOf(nextDefault), 0, key);
            return;
        }
        const previousDefault = defaultOrder.slice(0, index).reverse().find(candidate => result.includes(candidate));
        if (previousDefault) result.splice(result.indexOf(previousDefault) + 1, 0, key);
        else result.push(key);
    });
    return result;
}

export function getCvTemplateLayout(editorLayout = {}, templateId = 'the-standard') {
    const defaults = CV_TEMPLATE_LAYOUTS[templateId] || CV_TEMPLATE_LAYOUTS['the-standard'];
    const saved = editorLayout.templateLayouts?.[templateId]
        || (templateId === 'the-standard' ? editorLayout : {});
    const supportsPhoto = supportsProfilePhoto(templateId);
    const explicitMain = [...new Set(saved.mainOrder || [])].filter(key => CV_SECTION_KEYS.includes(key)
        && (key !== 'profilePhoto' || supportsPhoto));
    const explicitSidebar = [...new Set(saved.sidebarOrder || [])]
        .filter(key => CV_SECTION_KEYS.includes(key) && (key !== 'profilePhoto' || supportsPhoto) && !explicitMain.includes(key));
    const occupiedKeys = new Set([...explicitMain, ...explicitSidebar]);
    const templateMainOrder = defaults.mainOrder.filter(key => key !== 'profilePhoto');
    const templateSidebarOrder = supportsPhoto
        ? defaults.sidebarOrder.includes('profilePhoto') ? defaults.sidebarOrder : ['profilePhoto', ...defaults.sidebarOrder]
        : defaults.sidebarOrder.filter(key => key !== 'profilePhoto');
    const mainOrder = mergeDefaultOrder(explicitMain, templateMainOrder, occupiedKeys);
    const sidebarOrder = mergeDefaultOrder(explicitSidebar, templateSidebarOrder, occupiedKeys);
    return {mainOrder, sidebarOrder, columns: defaults.columns, sidebarFirst: defaults.sidebarFirst === true};
}

export function updateCvTemplateLayout(editorLayout = {}, templateId = 'the-standard', mainOrder, sidebarOrder) {
    const templateLayouts = {
        ...(editorLayout.templateLayouts || {}),
        [templateId]: {mainOrder: [...mainOrder], sidebarOrder: [...sidebarOrder]},
    };
    const next = {...editorLayout, templateLayouts};
    if (templateId === 'the-standard') {
        next.mainOrder = [...mainOrder];
        next.sidebarOrder = [...sidebarOrder];
    }
    return next;
}
