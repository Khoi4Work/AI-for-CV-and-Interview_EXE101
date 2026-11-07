import { PdfTemplateLayout } from '../../../../shared/PdfTemplateLayout.jsx';

export default function BoardroomReadyPdfTemplate({ data }) {
    return <PdfTemplateLayout data={data} templateId="boardroom-ready" />;
}
