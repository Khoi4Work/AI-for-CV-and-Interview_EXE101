import {cvPipelineService} from '../services/cvPipelineService.js';
import {buildEditableCvHtml} from './editableCvHtmlRenderer.js';

function safePdfName(name) {
    return String(name || 'CV').replace(/[^\p{L}\p{N}._ -]/gu, '_').trim().slice(0, 110) || 'CV';
}

export async function downloadCvPdfFromService(cvData, cvName, templateId = 'the-standard') {
    const filename = safePdfName(cvName) + '.pdf';
    let html;
    try {
        html = await buildEditableCvHtml(cvData, templateId);
    } catch (error) {
        const stageError = error instanceof Error ? error : new Error(String(error));
        stageError.cvPdfExportStage = 'build-html';
        throw stageError;
    }

    let blob;
    try {
        blob = await cvPipelineService.renderPdf({
            html,
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
    } catch (error) {
        const stageError = error instanceof Error ? error : new Error(String(error));
        stageError.cvPdfExportStage = 'request-pdf-api';
        throw stageError;
    }
    if (!(blob instanceof Blob) || blob.size === 0) {
        const error = new Error('PDF service không trả về file PDF hợp lệ.');
        error.cvPdfExportStage = 'validate-pdf-result';
        throw error;
    }
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
