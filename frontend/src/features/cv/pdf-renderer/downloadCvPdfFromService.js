import {cvPipelineService} from '../services/cvPipelineService.js';
import {buildEditableCvHtml} from './editableCvHtmlRenderer.js';

function safePdfName(name) {
    return String(name || 'CV').replace(/[^\p{L}\p{N}._ -]/gu, '_').trim().slice(0, 110) || 'CV';
}

export async function downloadCvPdfFromService(cvData, cvName, templateId = 'the-standard') {
    const filename = safePdfName(cvName) + '.pdf';
    const blob = await cvPipelineService.renderPdf({
        html: await buildEditableCvHtml(cvData, templateId),
        filename,
        options: {
            format: 'A4',
            landscape: false,
            printBackground: true,
            preferCssPageSize: true,
            marginTop: '0mm',
            marginRight: '0mm',
            marginBottom: '0mm',
            marginLeft: '0mm',
        },
    });
    if (!(blob instanceof Blob) || blob.size === 0) throw new Error('PDF service không trả về file PDF hợp lệ.');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return blob.size;
}
