import React from 'react';
import { TEMPLATE_COMPONENTS } from '../../mapper/TemplateMap.js';

export default function TemplateRenderer({ templateId, userData }) {
    const Component = TEMPLATE_COMPONENTS[templateId];

    if (!Component) {
        return (
            <div className="flex items-center justify-center w-full h-full bg-slate-100 text-slate-500 p-4 text-center">
                <p>Template "{templateId}" not found in the system.</p>
            </div>
        );
    }

    return <Component data={userData} />;
}
