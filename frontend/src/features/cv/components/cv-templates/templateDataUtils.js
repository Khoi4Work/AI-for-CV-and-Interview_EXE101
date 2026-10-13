export const hasText = (value) => value !== null && value !== undefined && String(value).trim().length > 0;

export const hasDetails = (details) => Array.isArray(details) && details.some(hasText);

export const hasAnyField = (item, fields) => Boolean(item) && fields.some((field) => {
    const value = item[field];
    return Array.isArray(value) ? hasDetails(value) : hasText(value);
});

export const hasSkills = (skills) => Object.values(skills || {}).some((items) =>
    Array.isArray(items) && items.some(hasText)
);
