import { PDF_TEMPLATE_LOADERS } from './templateRegistry.js';

export async function downloadCvPdf(cvData, cvName, templateId) {
    const loadTemplate = PDF_TEMPLATE_LOADERS[templateId];
    if (!loadTemplate) throw new Error('Mẫu CV này chưa hỗ trợ xuất PDF.');

    const [{ pdf }, rendererModule, { mapCvDataForPdf }, React] = await Promise.all([
        import('@react-pdf/renderer'),
        loadTemplate(),
        import('./mapCvDataForPdf.js'),
        import('react'),
    ]);

    const mappedData = mapCvDataForPdf(cvData);
    const blob = await pdf(React.createElement(rendererModule.default, { data: mappedData })).toBlob();
    if (!(blob instanceof Blob) || blob.size === 0) {
        throw new Error('Không tạo được nội dung PDF. Vui lòng thử lại.');
    }

    const safeName = String(cvName || 'CV').replace(/[\\/:*?"<>|]/g, '_');
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${safeName}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);

    return blob.size;
}
