import { PdfTemplateLayout } from '../PdfTemplateLayout.jsx';

export default function BoardroomReadyPdfTemplate({ data }) {
    return <PdfTemplateLayout data={data} templateId="boardroom-ready" />;
}
