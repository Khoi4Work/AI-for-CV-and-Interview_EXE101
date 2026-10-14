export const PDF_TEMPLATE_LOADERS = {
    'the-standard': () => import('./templates/TheStandardPdfTemplate.jsx'),
    'data-scientist': () => import('./templates/DataScientistPdfTemplate.jsx'),
    'boardroom-ready': () => import('./templates/BoardroomReadyPdfTemplate.jsx'),
    'security-analyst': () => import('./templates/SecurityAnalystPdfTemplate.jsx'),
    'cloud-expert': () => import('./templates/CloudExpertPdfTemplate.jsx'),
    'portfolio-hybrid': () => import('./templates/PortfolioHybridPdfTemplate.jsx'),
};

export const PDF_TEMPLATE_IDS = Object.freeze(Object.keys(PDF_TEMPLATE_LOADERS));
