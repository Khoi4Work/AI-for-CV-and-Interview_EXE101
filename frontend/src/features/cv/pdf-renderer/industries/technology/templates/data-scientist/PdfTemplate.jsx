import { PdfTemplateLayout } from '../../../../shared/PdfTemplateLayout.jsx';

export default function DataScientistPdfTemplate({ data }) {
    return <PdfTemplateLayout data={data} templateId="data-scientist" />;
}
