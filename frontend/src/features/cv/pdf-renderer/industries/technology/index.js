export const TECHNOLOGY_TEMPLATE_LOADERS = {
    'the-standard': () => import('./templates/the-standard/PdfTemplate.jsx'),
    'data-scientist': () => import('./templates/data-scientist/PdfTemplate.jsx'),
    'boardroom-ready': () => import('./templates/boardroom-ready/PdfTemplate.jsx'),
    'security-analyst': () => import('./templates/security-analyst/PdfTemplate.jsx'),
    'cloud-expert': () => import('./templates/cloud-expert/PdfTemplate.jsx'),
    'portfolio-hybrid': () => import('./templates/portfolio-hybrid/PdfTemplate.jsx'),
};
