import { PdfTemplateLayout } from '../../../../shared/PdfTemplateLayout.jsx';

export default function PortfolioHybridPdfTemplate({ data }) {
    return <PdfTemplateLayout data={data} templateId="portfolio-hybrid" />;
}
