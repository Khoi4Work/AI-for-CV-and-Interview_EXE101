import { PdfTemplateLayout } from '../../../../shared/PdfTemplateLayout.jsx';

export default function SecurityAnalystPdfTemplate({ data }) {
    return <PdfTemplateLayout data={data} templateId="security-analyst" />;
}
