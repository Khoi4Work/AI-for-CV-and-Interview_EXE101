import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopNagivationToolBar from '../components/TopNagivationToolBar.jsx';
import { useCV } from '../contexts/CVContext.jsx';
import CvPdfPreview from '../components/CvPdfPreview.jsx';
import CVContentEditor from '../components/CVContentEditor.jsx';
import { PDF_TEMPLATE_LOADERS } from '../pdf-renderer/templateRegistry.js';
import galleryService from '../../../service/galleryService.js';
import { getApiErrorMessage } from '../../../service/apiClient.js';
import { cvPipelineService } from '../services/cvPipelineService.js';
import { buildEditorPayload, createEditorWriter, getAllowedEditorTemplate } from '../services/editorSave.js';

export default function CVEditor() {
    const { cvData, setTemplate, currentCvId, setCurrentCvId, setHasCV } = useCV();
    const navigate = useNavigate();
    const location = useLocation();
    const returnToEvaluation = location.state?.returnToCVEvaluation;
    const [zoom, setZoom] = useState(100);
    const [cvName, setCvName] = useState(() => `CV ${cvData.personalInfo?.name || 'của tôi'}`.slice(0, 100));
    const [templates, setTemplates] = useState([]);
    const [templateCatalogCount, setTemplateCatalogCount] = useState(0);
    const [templatesLoading, setTemplatesLoading] = useState(true);
    const [catalogError, setCatalogError] = useState('');
    const [retry, setRetry] = useState(0);
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [message, setMessage] = useState('');
    const [saveError, setSaveError] = useState('');
    const [lastSaved, setLastSaved] = useState(null);
    const [writeCV] = useState(() => createEditorWriter(cvPipelineService));
    const fingerprint = JSON.stringify({ name: cvName.trim(), content: cvData });
    const dirty = fingerprint !== lastSaved;
    useEffect(() => {
        let active = true;
        galleryService.getTemplates().then(data => {
            if (active) {
                const catalog = Array.isArray(data) ? data : [];
                const availableTemplates = catalog.filter(item => PDF_TEMPLATE_LOADERS[item.id]);
                setTemplateCatalogCount(catalog.length);
                setTemplates(availableTemplates);
                setCatalogError('');

                if (returnToEvaluation) {
                    const selectedTemplate = availableTemplates.find(item => item.id === cvData.selectedTemplateId);
                    if (selectedTemplate?.locked !== false) {
                        const usableTemplate = availableTemplates.find(item => item.id === 'the-standard' && item.locked === false)
                            || availableTemplates.find(item => item.locked === false);
                        if (usableTemplate) setTemplate(usableTemplate.id);
                    }
                }
            }
        }).catch(error => {
            if (active) {
                console.error('[CVEditor] Failed to load template catalog.', error);
                setCatalogError('Chưa tải được danh sách mẫu CV.');
            }
        }).finally(() => { if (active) setTemplatesLoading(false); });
        return () => { active = false; };
    }, [retry, returnToEvaluation, cvData.selectedTemplateId, setTemplate]);
    useEffect(() => {
        const warn = event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [dirty]);
    const selectedTemplate = cvData.selectedTemplateId;
    const selectedOption = templates.find(template => template.id === selectedTemplate);
    const allowed = !templatesLoading && !catalogError && selectedOption?.locked === false;
    const retryTemplateCatalog = () => {
        setTemplatesLoading(true);
        setCatalogError('');
        setRetry(value => value + 1);
    };
    const templateName = selectedOption?.name || 'CV';
    const validateAccess = async id => {
        const catalog = await galleryService.getTemplates();
        const templatesFromApi = Array.isArray(catalog) ? catalog : [];
        setTemplateCatalogCount(templatesFromApi.length);
        setTemplates(templatesFromApi.filter(item => PDF_TEMPLATE_LOADERS[item.id]));
        getAllowedEditorTemplate(catalog, id);
    };
    const handleSave = async () => {
        if (saving || exporting || !allowed) return;
        setSaving(true); setSaveError(''); setMessage('');
        try {
            const payload = buildEditorPayload(cvName, cvData);
            await writeCV({ id: currentCvId, payload, validate: validateAccess, onSaved: result => {
                setCurrentCvId(result.id); setHasCV(true);
                setLastSaved(JSON.stringify({ name: payload.name, content: payload.content }));
                setMessage('Đã lưu CV vào tài khoản của bạn.');
                if (returnToEvaluation) {
                    navigate('/cv-evaluation', {
                        replace: true,
                        state: {continueEvaluation: {
                            cv: {cvId: result.id, cvName: payload.name, extractedData: payload.content},
                            jdId: returnToEvaluation.jdId,
                            jdTitle: returnToEvaluation.jdTitle,
                            jdText: returnToEvaluation.jdText,
                            jdSource: returnToEvaluation.jdSource,
                        }},
                    });
                }
            } });
        } catch (error) {
            setSaveError(getApiErrorMessage(error, error.message || 'Không thể lưu CV. Vui lòng thử lại.'));
        } finally { setSaving(false); }
    };
    const handleExport = async () => {
        if (!allowed || saving || exporting) return;
        setExporting(true); setSaveError(''); setMessage('');
        try {
            await validateAccess(selectedTemplate);
            const safeTitle = cvName.trim() || 'CV';
            const { downloadCvPdf } = await import('../pdf-renderer/exportCvPdf.js');
            await downloadCvPdf(cvData, safeTitle, selectedTemplate);
            setMessage('Đã xuất CV thành PDF.');
        } catch (error) {
            setSaveError(getApiErrorMessage(error, error.message));
        } finally { setExporting(false); }
    };

    return (
        <div className="cv-editor-shell flex flex-col h-screen overflow-hidden" style={{ background: 'radial-gradient(circle at center, var(--color-bg-radial-start) 0%, var(--color-bg-radial-end) 100%)' }}>
            <TopNagivationToolBar
                onExport={handleExport}
                onSave={handleSave}
                saving={saving}
                actionsDisabled={!allowed || exporting}
                templatesLoading={templatesLoading || exporting}
                cvName={cvName}
                onNameChange={setCvName}
                onClose={() => {
                    if (dirty && !window.confirm('CV có thay đổi chưa lưu. Bạn vẫn muốn rời trang?')) return;
                    if (returnToEvaluation?.analysisId) navigate(`/optimizer?analysisId=${returnToEvaluation.analysisId}`);
                    else navigate('/home');
                }}
                templateName={templateName}
                zoom={zoom}
                onZoomIn={() => setZoom(prev => Math.min(prev + 10, 200))}
                onZoomOut={() => setZoom(prev => Math.max(prev - 10, 50))}
                templateOptions={templates}
                onTemplateChange={id => {
                    try { getAllowedEditorTemplate(templates, id); setTemplate(id); setSaveError(''); }
                    catch (error) { setSaveError(error.message); }
                }}
                selectedTemplateId={selectedTemplate}
                exportLabel="Tải PDF"
            />
            <div className="cv-editor-toolbar px-6 py-2 text-sm text-on-surface-variant" aria-live="polite">
                {templatesLoading ? 'Đang tải quyền sử dụng mẫu CV…' : catalogError ? <>
                    {catalogError} <button className="ml-2 font-semibold text-primary underline" onClick={retryTemplateCatalog}>Tải lại</button>
                </> : !allowed && templates.length === 0 && templateCatalogCount > 0
                    ? <>Hiện chưa thể mở trình chỉnh sửa CV. Vui lòng thử tải lại danh sách mẫu. <button className="ml-2 font-semibold text-primary underline" onClick={retryTemplateCatalog}>Tải lại</button></>
                    : !allowed && templateCatalogCount === 0
                        ? <>Chưa có mẫu CV để chỉnh sửa lúc này. Vui lòng thử tải lại danh sách mẫu. <button className="ml-2 font-semibold text-primary underline" onClick={retryTemplateCatalog}>Tải lại</button></>
                        : !allowed && !templates.some(item => item.locked === false)
                            ? <>Hiện chưa có mẫu CV khả dụng cho tài khoản của bạn. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.</>
                    : !allowed ? 'Mẫu CV đang chọn chưa khả dụng với gói hiện tại. Hãy chọn mẫu khác để tiếp tục.'
                        : dirty ? 'Có thay đổi chưa lưu' : message || 'Đã lưu'}
                {saveError && <p role="alert" className="text-red-500">{saveError}</p>}
            </div>
            <main className="cv-editor-workspace grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,42%)_minmax(0,58%)] overflow-hidden xl:grid-cols-[360px_minmax(0,1fr)] xl:grid-rows-1">
                <aside className="min-h-0 overflow-y-auto border-b border-outline-variant bg-surface px-5 py-4 xl:border-b-0 xl:border-r">
                    <CVContentEditor />
                </aside>
                <section aria-label="Bản xem trước CV PDF" className="cv-editor-preview min-h-0 min-w-0 overflow-auto bg-slate-200/70 p-4 sm:p-6">
                    {allowed ? <div className="h-full min-h-[55vh] w-full origin-top transition-transform duration-200" style={{ transform: `scale(${zoom / 100})` }}>
                        <CvPdfPreview cvData={cvData} templateId={selectedTemplate} className="h-full min-h-[55vh] w-full bg-white shadow-xl" />
                    </div> : <div className="rounded-2xl bg-surface p-8 text-on-surface">Chọn một mẫu được mở khóa để xem trước CV.</div>}
                </section>
            </main>
        </div>
    );
}
