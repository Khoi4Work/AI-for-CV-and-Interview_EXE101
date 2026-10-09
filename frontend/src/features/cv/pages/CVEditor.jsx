import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopNagivationToolBar from '../components/TopNagivationToolBar.jsx';
import { useCV } from '../contexts/CVContext.jsx';
import TemplateRenderer from '../components/TemplateRenderer.jsx';
import { mapCVDataToTemplate } from '../mapper/cv-data-mapper.js';
import { TEMPLATE_COMPONENTS } from '../mapper/TemplateMap.js';
import galleryService from '../../../service/galleryService.js';
import { getApiErrorMessage } from '../../../service/apiClient.js';
import { cvPipelineService } from '../services/cvPipelineService.js';
import { buildEditorPayload, createEditorWriter, getAllowedEditorTemplate } from '../services/editorSave.js';

export default function CVEditor() {
    const { cvData, setTemplate, currentCvId, setCurrentCvId, setHasCV } = useCV();
    const navigate = useNavigate();
    const location = useLocation();
    const [zoom, setZoom] = useState(100);
    const [cvName, setCvName] = useState(() => `CV ${cvData.personalInfo?.name || 'của tôi'}`.slice(0, 100));
    const [templates, setTemplates] = useState([]);
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
            if (active) { setTemplates(data.filter(item => TEMPLATE_COMPONENTS[item.id])); setCatalogError(''); }
        }).catch(error => {
            if (active) setCatalogError(getApiErrorMessage(error, 'Không tải được quyền sử dụng mẫu CV.'));
        }).finally(() => { if (active) setTemplatesLoading(false); });
        return () => { active = false; };
    }, [retry]);
    useEffect(() => {
        const warn = event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [dirty]);
    const selectedTemplate = cvData.selectedTemplateId;
    const selectedOption = templates.find(template => template.id === selectedTemplate);
    const allowed = !templatesLoading && !catalogError && selectedOption?.locked === false;
    const templateName = selectedOption?.name || 'CV';
    const templateData = mapCVDataToTemplate(cvData);
    const validateAccess = async id => {
        const catalog = await galleryService.getTemplates();
        setTemplates(catalog.filter(item => TEMPLATE_COMPONENTS[item.id]));
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
                if (location.state?.returnToCVEvaluation) {
                    navigate('/cv-evaluation', {
                        replace: true,
                        state: {createdCV: {cvId: result.id, cvName: payload.name, extractedData: payload.content}},
                    });
                }
            } });
        } catch (error) {
            setSaveError(getApiErrorMessage(error, error.message || 'Không thể lưu CV. Vui lòng thử lại.'));
        } finally { setSaving(false); }
    };
    const handleExport = async () => {
        if (!allowed || saving || exporting) return;
        setExporting(true); setSaveError('');
        try {
            await validateAccess(selectedTemplate);
            const images = Array.from(document.querySelectorAll('.cv-page-container img'));
            await Promise.all(images.map(image => (
                typeof image.decode === 'function'
                    ? image.decode().catch(() => {})
                    : image.complete
                        ? Promise.resolve()
                        : new Promise(resolve => {
                            image.addEventListener('load', resolve, {once: true});
                            image.addEventListener('error', resolve, {once: true});
                        })
            )));
            window.print();
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
                onClose={() => { if (!dirty || window.confirm('CV có thay đổi chưa lưu. Bạn vẫn muốn rời trang?')) navigate('/home'); }}
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
            />
            <div className="cv-editor-toolbar px-6 py-2 text-sm text-on-surface-variant" aria-live="polite">
                {templatesLoading ? 'Đang tải quyền sử dụng mẫu CV…' : catalogError ? <>
                    {catalogError} <button className="underline" onClick={() => { setTemplatesLoading(true); setRetry(value => value + 1); }}>Thử lại</button>
                </> : !allowed ? 'Mẫu đang chọn chưa được mở khóa. Hãy chọn mẫu phù hợp với gói CV của bạn.' : dirty ? 'Có thay đổi chưa lưu' : message || 'Đã lưu'}
                {saveError && <p role="alert" className="text-red-500">{saveError}</p>}
            </div>
            <main className="cv-editor-preview flex-1 overflow-y-auto flex justify-center p-12 relative">
                <div
                    className="cv-page-container flex shrink-0 transition-transform duration-200 ease-in-out relative z-10"
                    style={{
                        width: selectedTemplate === 'the-standard' ? 1000 : 850,
                        maxWidth: '100%',
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'top center',
                    }}
                >
                    {allowed ? <TemplateRenderer templateId={selectedTemplate} userData={templateData} /> : <div className="rounded-2xl bg-surface p-8 text-on-surface">Chọn một mẫu được mở khóa để chỉnh sửa CV.</div>}
                </div>
            </main>
        </div>
    );
}
