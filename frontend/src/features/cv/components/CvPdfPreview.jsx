import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import { FileText, LoaderCircle } from 'lucide-react';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { PDF_TEMPLATE_LOADERS } from '../pdf-renderer/templateRegistry.js';
import { mapCvDataForPdf } from '../pdf-renderer/mapCvDataForPdf.js';
import TheStandardHtmlTemplate from '../pdf-renderer/templates/TheStandardHtmlTemplate.jsx';

const PREVIEW_UPDATE_DELAY_MS = 1200;
const PREVIEW_SCALE = 1.35;

function getScrollAnchor(container) {
    if (!container) return null;

    const containerTop = container.getBoundingClientRect().top;
    const page = [...container.querySelectorAll('[data-pdf-page]')]
        .find(element => element.getBoundingClientRect().bottom > containerTop);

    if (!page) return { pageNumber: 1, offset: 0, scrollLeft: container.scrollLeft };

    return {
        pageNumber: Number(page.dataset.pdfPage),
        offset: Math.max(0, containerTop - page.getBoundingClientRect().top),
        scrollLeft: container.scrollLeft,
    };
}

function restoreScrollAnchor(container, anchor) {
    if (!container || !anchor) return;

    const page = container.querySelector(`[data-pdf-page="${anchor.pageNumber}"]`)
        || container.querySelector('[data-pdf-page]:last-of-type');
    if (!page) return;

    const pageTop = page.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    container.scrollTop = pageTop + Math.min(anchor.offset, page.clientHeight);
    container.scrollLeft = anchor.scrollLeft;
}

export default function CvPdfPreview(props) {
    if (props.templateId === 'the-standard') return <StandardHtmlPreview {...props}/>;
    return <LegacyPdfPreview {...props}/>;
}

function StandardHtmlPreview({cvData, className = '', onInlineEdit, onInlineAdd, onInlineMove, onInlineRemove,
    onInlineSectionMove, onInlineSectionReorder, onInlineSectionRemove, onInlineSkillGroupMove, onInlineSkillGroupRemove,
    onInlineSkillRename, onInlineClear}) {
    return <div className={`h-full w-full overflow-auto bg-white ${className}`}>
        <TheStandardHtmlTemplate data={cvData} onEdit={onInlineEdit} onAdd={onInlineAdd} onMove={onInlineMove}
            onRemove={onInlineRemove} onSectionMove={onInlineSectionMove} onSectionReorder={onInlineSectionReorder} onSectionRemove={onInlineSectionRemove}
            onSkillGroupMove={onInlineSkillGroupMove} onSkillGroupRemove={onInlineSkillGroupRemove}
            onSkillRename={onInlineSkillRename} onClear={onInlineClear}/>
    </div>;
}

function LegacyPdfPreview({ cvData, templateId, className = '' }) {
    const [loaded, setLoaded] = useState(null);
    const [pages, setPages] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [renderError, setRenderError] = useState('');
    const viewerRef = useRef(null);
    const mappedData = useMemo(() => mapCvDataForPdf(cvData), [cvData]);
    const [previewData, setPreviewData] = useState(mappedData);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => setPreviewData(mappedData), PREVIEW_UPDATE_DELAY_MS);
        return () => window.clearTimeout(timeoutId);
    }, [mappedData]);

    useEffect(() => {
        let active = true;
        const loadTemplate = PDF_TEMPLATE_LOADERS[templateId];
        if (!loadTemplate) return () => { active = false; };

        Promise.all([import('@react-pdf/renderer'), loadTemplate(), import('pdfjs-dist')])
            .then(([renderer, templateModule, pdfjs]) => {
                if (!active) return;
                pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
                setLoaded({
                    templateId,
                    createPdf: renderer.pdf,
                    template: templateModule.default,
                    getDocument: pdfjs.getDocument,
                });
            })
            .catch(() => {
                if (active) setLoaded({ templateId, error: 'Không tải được bản xem trước PDF. Vui lòng thử lại.' });
            });

        return () => { active = false; };
    }, [templateId]);

    const currentLoad = loaded?.templateId === templateId ? loaded : null;
    const PdfTemplate = currentLoad?.template;
    const pdfDocument = useMemo(() => PdfTemplate ? createElement(PdfTemplate, { data: previewData }) : null, [PdfTemplate, previewData]);

    useEffect(() => {
        if (!currentLoad?.createPdf || !currentLoad.getDocument || !pdfDocument) return undefined;

        let active = true;
        let pdfProxy;

        const renderPreview = async () => {
            try {
                const blob = await currentLoad.createPdf(pdfDocument).toBlob();
                if (!active) return;

                pdfProxy = await currentLoad.getDocument({ data: await blob.arrayBuffer() }).promise;
                const containerWidth = Math.max(280, (viewerRef.current?.clientWidth || 800) - 48);
                const renderedPages = [];

                for (let pageNumber = 1; pageNumber <= pdfProxy.numPages; pageNumber += 1) {
                    if (!active) return;

                    const page = await pdfProxy.getPage(pageNumber);
                    const baseViewport = page.getViewport({ scale: 1 });
                    const scale = Math.min(PREVIEW_SCALE, containerWidth / baseViewport.width);
                    const viewport = page.getViewport({ scale });
                    const canvas = window.document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = Math.ceil(viewport.width);
                    canvas.height = Math.ceil(viewport.height);
                    await page.render({ canvasContext: context, viewport }).promise;

                    renderedPages.push({
                        pageNumber,
                        image: canvas.toDataURL('image/png'),
                        width: viewport.width,
                        height: viewport.height,
                    });
                    page.cleanup();
                }

                if (!active) return;
                const anchor = getScrollAnchor(viewerRef.current);
                setPages(renderedPages);
                requestAnimationFrame(() => restoreScrollAnchor(viewerRef.current, anchor));
            } catch (error) {
                console.error('[CvPdfPreview] Failed to render PDF preview.', error);
                if (active) setRenderError('Không dựng được bản xem trước PDF. Vui lòng thử lại.');
            } finally {
                pdfProxy?.destroy();
                if (active) setIsUpdating(false);
            }
        };

        const startId = window.setTimeout(() => {
            if (!active) return;
            setIsUpdating(true);
            setRenderError('');
            renderPreview();
        }, 0);
        return () => {
            active = false;
            window.clearTimeout(startId);
        };
    }, [currentLoad, pdfDocument]);

    if (!PDF_TEMPLATE_LOADERS[templateId]) return <div role="alert" className={`flex h-full min-h-60 flex-col items-center justify-center gap-3 p-6 text-center text-on-surface-variant ${className}`}>
        <FileText size={36} />
        <p>Mẫu CV này chưa hỗ trợ xem trước PDF.</p>
    </div>;
    if (currentLoad?.error) return <div role="alert" className={`flex h-full min-h-60 flex-col items-center justify-center gap-3 p-6 text-center text-on-surface-variant ${className}`}>
        <FileText size={36} />
        <p>{currentLoad.error}</p>
    </div>;

    return <div ref={viewerRef} className={`relative h-full min-h-60 w-full overflow-auto ${className}`}>
        {pages.length === 0 && <div className="flex min-h-60 items-center justify-center gap-2 text-on-surface-variant">
            <LoaderCircle size={18} className="animate-spin" />
            <span>Đang tạo bản xem trước PDF…</span>
        </div>}
        {pages.map(page => <div key={page.pageNumber} data-pdf-page={page.pageNumber} className="mx-auto mb-4 w-fit bg-white shadow-xl last:mb-0">
            <img src={page.image} alt={`Trang ${page.pageNumber} của CV`} style={{ width: page.width, maxWidth: '100%', height: 'auto' }} className="block" />
        </div>)}
        {isUpdating && pages.length > 0 && <span role="status" className="sr-only">Đang cập nhật bản xem trước…</span>}
        {renderError && <div role="alert" className="sticky bottom-2 mx-auto w-fit rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{renderError}</div>}
    </div>;
}
