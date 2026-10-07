const TEMPLATES_WITHOUT_PHOTO = new Set([
    'data-scientist',
    'boardroom-ready',
]);

export const supportsProfilePhoto = (templateId) =>
    !TEMPLATES_WITHOUT_PHOTO.has(templateId);
