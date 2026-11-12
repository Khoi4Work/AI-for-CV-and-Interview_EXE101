import { TECHNOLOGY_TEMPLATE_LOADERS } from './industries/technology/index.js';

export const PDF_TEMPLATE_LOADERS = {
    ...TECHNOLOGY_TEMPLATE_LOADERS,
};

export const PDF_TEMPLATE_IDS = Object.freeze(Object.keys(PDF_TEMPLATE_LOADERS));
