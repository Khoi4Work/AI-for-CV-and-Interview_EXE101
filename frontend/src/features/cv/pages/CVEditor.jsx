import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import TopNagivationToolBar from '../components/TopNagivationToolBar.jsx';
import { useCV } from '../contexts/CVContext.jsx';
import CvPdfPreview from '../components/CvPdfPreview.jsx';
import CVContentEditor from '../components/CVContentEditor.jsx';
import { PDF_TEMPLATE_LOADERS } from '../pdf-renderer/templateRegistry.js';
import galleryService from '../../../service/galleryService.js';
import { getApiErrorMessage } from '../../../service/apiClient.js';
import { cvPipelineService } from '../services/cvPipelineService.js';
import { buildEditorPayload, createEditorWriter, getAllowedEditorTemplate } from '../services/editorSave.js';
import { validateCVData } from '../../../utils/inputValidation.js';
import {getCvTemplateLayout, updateCvTemplateLayout} from '../pdf-renderer/templateSectionLayout.js';
import {trackEvent} from '../../analytics/analyticsClient.js';
import {categorizeAnalyticsError} from '../../analytics/sanitizeAnalytics.js';
import ConfirmationDialog from '../../../components/ui/ConfirmationDialog.jsx';
import {useConfirmation} from '../../../components/ui/useConfirmation.js';

function updateValueAtPath(source, path, value) {
    const [key, ...remaining] = path.split('.');
    const updated = Array.isArray(source) ? [...source] : {...(source || {})};
    if (remaining.length === 0) updated[key] = value;
    else updated[key] = updateValueAtPath(source?.[key], remaining.join('.'), value);
    return updated;
}

export default function CVEditor() {
    const { cvData, setTemplate, setFullCVData, currentCvId, setCurrentCvId, setHasCV } = useCV();
    const navigate = useNavigate();
    const {confirm, confirmation} = useConfirmation();
    const location = useLocation();
    const returnToEvaluation = location.state?.returnToCVEvaluation;
    const [zoom, setZoom] = useState(100);
    const [showContentPanel, setShowContentPanel] = useState(() => cvData.selectedTemplateId !== 'the-standard');
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
    const validateContent = () => {
        const errors = validateCVData(cvData);
        if (errors.length) {
            setSaveError(errors.slice(0, 4).join(' '));
            return false;
        }
        return true;
    };
    const validateAccess = async id => {
        const catalog = await galleryService.getTemplates();
        const templatesFromApi = Array.isArray(catalog) ? catalog : [];
        setTemplateCatalogCount(templatesFromApi.length);
        setTemplates(templatesFromApi.filter(item => PDF_TEMPLATE_LOADERS[item.id]));
        getAllowedEditorTemplate(catalog, id);
    };
    const handleSave = async () => {
        if (saving || exporting || !allowed) return;
        if (!validateContent()) return;
        setSaving(true); setSaveError(''); setMessage('');
        const saveMode = currentCvId ? 'update' : 'create';
        try {
            const payload = buildEditorPayload(cvName, cvData);
            await writeCV({ id: currentCvId, payload, validate: validateAccess, onSaved: result => {
                setCurrentCvId(result.id); setHasCV(true);
                setLastSaved(JSON.stringify({ name: payload.name, content: payload.content }));
                setMessage('Đã lưu CV vào tài khoản của bạn.');
                trackEvent('cv_saved', {save_mode: saveMode});
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
            trackEvent('feature_error', {feature: 'cv_save', error_category: categorizeAnalyticsError(error)});
            setSaveError(getApiErrorMessage(error, 'Không thể lưu CV. Vui lòng thử lại.'));
        } finally { setSaving(false); }
    };
    const handleExport = async () => {
        if (!allowed || saving || exporting) return;
        if (!validateContent()) return;
        setExporting(true); setSaveError(''); setMessage('');
        let exportStage = 'check-template-access';
        try {
            await validateAccess(selectedTemplate);
            const safeTitle = cvName.trim() || 'CV';
            exportStage = 'load-pdf-module';
            const {downloadCvPdfFromService} = await import('../pdf-renderer/downloadCvPdfFromService.js');
            exportStage = 'build-html-and-call-pdf-service';
            await downloadCvPdfFromService(cvData, safeTitle, selectedTemplate);
            trackEvent('cv_download_requested', {template_id: selectedTemplate});
            setMessage('Đã xuất CV thành PDF.');
        } catch (error) {
            trackEvent('feature_error', {feature: 'cv_download', error_category: categorizeAnalyticsError(error)});
            console.error('[CV PDF Export] Export failed', {
                stage: error?.cvPdfExportStage || exportStage,
                message: error?.message,
                code: error?.code,
                status: error?.response?.status,
            });
            setSaveError(getApiErrorMessage(error, 'Không thể tải CV thành PDF. Vui lòng thử lại.'));
        } finally { setExporting(false); }
    };
    const handleInlineEdit = (path, value) => {
        setFullCVData(updateValueAtPath(cvData, path, value));
    };
    const handleInlineClear = path => {
        if (path === 'summary') {
            const hiddenSections = new Set(cvData.editorLayout?.hiddenSections || []);
            hiddenSections.add('summary');
            setFullCVData({...cvData, editorLayout: {...cvData.editorLayout, hiddenSections: [...hiddenSections]}});
            return;
        }
        setFullCVData(updateValueAtPath(cvData, path, ''));
    };
    const handleInlineAdd = (path, value) => {
        const current = path.split('.').reduce((result, key) => result?.[key], cvData);
        setFullCVData(updateValueAtPath(cvData, path, [...(Array.isArray(current) ? current : []), value]));
    };
    const handleInlineRemove = (path, index) => {
        const current = path.split('.').reduce((result, key) => result?.[key], cvData);
        if (!Array.isArray(current)) return;
        setFullCVData(updateValueAtPath(cvData, path, current.filter((_, itemIndex) => itemIndex !== index)));
    };
    const handleInlineMove = (path, index, direction) => {
        if (path === 'personalInfo.contacts') {
            const defaults = ['phone', 'email', 'address'];
            const contactOrder = [...new Set([...(cvData.editorLayout?.personalInfoOrder || []), ...defaults])]
                .filter(field => defaults.includes(field));
            const target = index + direction;
            if (index < 0 || index >= contactOrder.length || target < 0 || target >= contactOrder.length) return;
            [contactOrder[index], contactOrder[target]] = [contactOrder[target], contactOrder[index]];
            setFullCVData({...cvData, editorLayout: {...cvData.editorLayout, personalInfoOrder: contactOrder}});
            return;
        }
        const current = path.split('.').reduce((result, key) => result?.[key], cvData);
        const target = index + direction;
        if (!Array.isArray(current) || target < 0 || target >= current.length) return;
        const reordered = [...current];
        [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
        setFullCVData(updateValueAtPath(cvData, path, reordered));
    };
    const sectionLabels = {
        name: 'Tên',
        profilePhoto: 'Ảnh hồ sơ',
        skills: 'Kỹ năng', experiences: 'Kinh nghiệm làm việc', projects: 'Dự án',
        personalInfo: 'Thông tin cá nhân', education: 'Học vấn', certificates: 'Chứng chỉ',
        languages: 'Ngoại ngữ', awards: 'Giải thưởng',
        summary: 'Giới thiệu',
    };
    const handleInlineSectionRemove = sectionKey => {
        if (sectionKey === 'personalInfo' || sectionKey === 'name') return;
        const hiddenSections = new Set(cvData.editorLayout?.hiddenSections || []);
        hiddenSections.add(sectionKey);
        setFullCVData({...cvData, editorLayout: {...cvData.editorLayout, hiddenSections: [...hiddenSections]}});
    };
    const handleInlineSectionRestore = sectionKey => {
        const hiddenSections = (cvData.editorLayout?.hiddenSections || []).filter(key => key !== sectionKey);
        setFullCVData({...cvData, editorLayout: {...cvData.editorLayout, hiddenSections}});
    };
    const handleInlineSectionMove = (sectionKey, column, direction) => {
        const hidden = new Set((cvData.editorLayout?.hiddenSections || []).filter(item => item !== 'personalInfo' && item !== 'name'));
        const orders = getCvTemplateLayout(cvData.editorLayout, selectedTemplate);
        const orderKey = column === 'main' ? 'mainOrder' : 'sidebarOrder';
        const active = orders[orderKey].filter(item => !hidden.has(item));
        const index = active.indexOf(sectionKey);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= active.length) return;
        [active[index], active[target]] = [active[target], active[index]];
        const nextMain = orderKey === 'mainOrder' ? [...active, ...orders.mainOrder.filter(item => hidden.has(item))] : orders.mainOrder;
        const nextSidebar = orderKey === 'sidebarOrder' ? [...active, ...orders.sidebarOrder.filter(item => hidden.has(item))] : orders.sidebarOrder;
        const editorLayout = updateCvTemplateLayout(cvData.editorLayout, selectedTemplate, nextMain, nextSidebar);
        editorLayout.hiddenSections = [...hidden];
        setFullCVData({...cvData, editorLayout});
    };
    const handleInlineSectionReorder = (sourceKey, sourceColumn, targetKey, targetColumn) => {
        const hidden = new Set((cvData.editorLayout?.hiddenSections || []).filter(item => item !== 'personalInfo' && item !== 'name'));
        if (!['main', 'sidebar'].includes(sourceColumn) || !['main', 'sidebar'].includes(targetColumn)) return;
        const orders = getCvTemplateLayout(cvData.editorLayout, selectedTemplate);
        const sourceOrder = orders[sourceColumn === 'main' ? 'mainOrder' : 'sidebarOrder'].filter(item => !hidden.has(item));
        const targetOrder = sourceColumn === targetColumn ? sourceOrder
            : orders[targetColumn === 'main' ? 'mainOrder' : 'sidebarOrder'].filter(item => !hidden.has(item));
        const sourceIndex = sourceOrder.indexOf(sourceKey);
        if (sourceIndex < 0 || (targetKey && !targetOrder.includes(targetKey)) || sourceKey === targetKey) return;
        const [moved] = sourceOrder.splice(sourceIndex, 1);
        if (targetKey) targetOrder.splice(targetOrder.indexOf(targetKey), 0, moved);
        else targetOrder.push(moved);
        const nextMain = sourceColumn === 'main' ? sourceOrder : targetColumn === 'main' ? targetOrder : orders.mainOrder.filter(item => !hidden.has(item));
        const nextSidebar = sourceColumn === 'sidebar' ? sourceOrder : targetColumn === 'sidebar' ? targetOrder : orders.sidebarOrder.filter(item => !hidden.has(item));
        const editorLayout = updateCvTemplateLayout(cvData.editorLayout, selectedTemplate,
            [...nextMain, ...orders.mainOrder.filter(item => hidden.has(item))],
            [...nextSidebar, ...orders.sidebarOrder.filter(item => hidden.has(item))]);
        editorLayout.hiddenSections = [...hidden];
        setFullCVData({...cvData, editorLayout});
    };
    const skillCategory = skill => String(skill?.category || '').trim() || 'Other';
    const handleInlineSkillGroupRemove = category => {
        setFullCVData({...cvData, skills: (cvData.skills || []).filter(skill => skillCategory(skill) !== category)});
    };
    const handleInlineSkillGroupMove = (category, direction) => {
        const skills = cvData.skills || [];
        const categories = [...new Set(skills.map(skillCategory))];
        const index = categories.indexOf(category);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= categories.length) return;
        [categories[index], categories[target]] = [categories[target], categories[index]];
        const buckets = new Map(categories.map(name => [name, []]));
        skills.forEach(skill => buckets.get(skillCategory(skill)).push(skill));
        setFullCVData({...cvData, skills: categories.flatMap(name => buckets.get(name))});
    };
    const handleInlineSkillRename = (oldCategory, nextCategory) => {
        const category = String(nextCategory || '').trim() || oldCategory;
        setFullCVData({...cvData, skills: (cvData.skills || []).map(skill => skillCategory(skill) === oldCategory
            ? {...skill, category} : skill)});
    };

    return (
        <div className="cv-editor-shell flex flex-col h-screen overflow-hidden" style={{ background: 'radial-gradient(circle at center, var(--color-bg-radial-start) 0%, var(--color-bg-radial-end) 100%)' }}>
            <ConfirmationDialog {...confirmation}/>
            <TopNagivationToolBar
                onExport={handleExport}
                onSave={handleSave}
                saving={saving}
                exporting={exporting}
                actionsDisabled={!allowed || exporting}
                templatesLoading={templatesLoading || exporting}
                cvName={cvName}
                onNameChange={setCvName}
                onClose={async () => {
                    if (dirty && !await confirm({title: 'Rời trình chỉnh sửa?', message: 'CV có thay đổi chưa lưu. Nếu rời trang, các thay đổi chưa lưu sẽ không được lưu vào tài khoản.', confirmLabel: 'Rời trang'})) return;
                    if (returnToEvaluation?.analysisId) navigate(`/optimizer?analysisId=${returnToEvaluation.analysisId}`);
                    else navigate('/home');
                }}
                templateName={templateName}
                zoom={zoom}
                onZoomIn={() => setZoom(prev => Math.min(prev + 10, 200))}
                onZoomOut={() => setZoom(prev => Math.max(prev - 10, 50))}
                templateOptions={templates}
                onTemplateChange={id => {
                    try {
                        getAllowedEditorTemplate(templates, id);
                        setTemplate(id);
                        if (id !== 'the-standard') setShowContentPanel(true);
                        setSaveError('');
                    }
                    catch (error) { setSaveError(getApiErrorMessage(error, 'Không thể chọn mẫu CV này.')); }
                }}
                selectedTemplateId={selectedTemplate}
                exportLabel="Tải PDF"
            />
            <div className="cv-editor-toolbar relative px-6 py-2 text-sm text-on-surface-variant" aria-live="polite">
                <button type="button" onClick={() => setShowContentPanel(value => !value)}
                    className="mb-2 inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface px-3 py-1.5 text-xs font-semibold text-on-surface hover:bg-surface-container">
                    {showContentPanel ? <PanelLeftClose size={15}/> : <PanelLeftOpen size={15}/>}
                    {showContentPanel ? 'Ẩn bảng nhập liệu' : 'Hiện bảng nhập liệu'}
                </button>
                {(cvData.editorLayout?.hiddenSections || []).some(sectionKey => sectionKey !== 'personalInfo' && sectionKey !== 'name') && <details className="ml-2 inline-block align-middle">
                    <summary className="inline-flex cursor-pointer list-none items-center rounded-lg border border-outline-variant bg-surface px-3 py-1.5 text-xs font-semibold text-on-surface hover:bg-surface-container">
                        + Thêm lại mục
                    </summary>
                    <div className="absolute z-20 mt-1 flex min-w-44 flex-col rounded-lg border border-outline-variant bg-surface p-1 shadow-lg">
                        {cvData.editorLayout.hiddenSections.filter(sectionKey => sectionKey !== 'personalInfo' && sectionKey !== 'name').map(sectionKey => <button key={sectionKey} type="button"
                            className="rounded px-3 py-2 text-left text-xs hover:bg-surface-container"
                            onClick={() => handleInlineSectionRestore(sectionKey)}>
                            + {sectionLabels[sectionKey] || sectionKey}
                        </button>)}
                    </div>
                </details>}
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
                {allowed && <span className="ml-3 text-xs">Bấm vào nội dung trên CV để chỉnh sửa trực tiếp.</span>}
            </div>
            <main className={`cv-editor-workspace grid min-h-0 flex-1 grid-cols-1 overflow-hidden ${showContentPanel
                ? 'grid-rows-[minmax(0,38%)_minmax(0,62%)] xl:grid-cols-[300px_minmax(0,1fr)] xl:grid-rows-1'
                : 'grid-rows-1 xl:grid-cols-1 xl:grid-rows-1'}`}>
                {showContentPanel && <aside className="min-h-0 overflow-y-auto border-b border-outline-variant bg-surface px-5 py-4 xl:border-b-0 xl:border-r">
                    <CVContentEditor />
                </aside>}
                <section aria-label="Bản xem trước CV PDF" className={`cv-editor-preview min-h-0 min-w-0 overflow-auto bg-slate-200/70 p-3 sm:p-5 ${showContentPanel ? '' : 'xl:col-span-1'}`}>
                    {allowed ? <div className="h-full min-h-[55vh] w-full origin-top transition-transform duration-200" style={{ transform: `scale(${zoom / 100})` }}>
                        <CvPdfPreview cvData={cvData} templateId={selectedTemplate} showPageMarkers onInlineEdit={handleInlineEdit}
                            onInlineAdd={handleInlineAdd} onInlineMove={handleInlineMove} onInlineRemove={handleInlineRemove}
                            onInlineSectionMove={handleInlineSectionMove} onInlineSectionReorder={handleInlineSectionReorder}
                            onInlineSectionRemove={handleInlineSectionRemove}
                            onInlineSkillGroupMove={handleInlineSkillGroupMove} onInlineSkillGroupRemove={handleInlineSkillGroupRemove}
                            onInlineSkillRename={handleInlineSkillRename} onInlineClear={handleInlineClear}
                            className="h-full min-h-[55vh] w-full bg-white shadow-xl" />
                    </div> : <div className="rounded-2xl bg-surface p-8 text-on-surface">Chọn một mẫu được mở khóa để xem trước CV.</div>}
                </section>
            </main>
        </div>
    );
}
