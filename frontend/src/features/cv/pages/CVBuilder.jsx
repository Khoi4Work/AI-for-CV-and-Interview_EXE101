import {useState, useEffect, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Sparkles,
    Trash2,
    Plus,
    Download,
    LayoutTemplate,
    ChevronRight,
    ChevronLeft,
    CheckCircle2
} from 'lucide-react';
import {Header} from "../../../components/layout/PublicHeader.jsx";
import {useApp} from '../../auth/contexts/AppContext.jsx';
import {useCV} from '../contexts/CVContext.jsx';
import {mapImportedCVData} from '../mapper/cv-data-mapper.js';
import {Footer} from "../../../components/layout/Footer.jsx";
import {extractCV} from '../services/cvImportService.js';
import {getApiErrorMessage} from '../../../service/apiClient.js';
import ProfilePhotoPicker from '../components/ProfilePhotoPicker.jsx';
import {paymentService} from '../../payment/services/paymentService.js';
import {checkBuilderQuota} from '../services/builderQuota.js';
import {validateCVDataFields} from '../../../utils/inputValidation.js';
import galleryService from '../../../service/galleryService.js';
import {trackEvent} from '../../analytics/analyticsClient.js';
import {categorizeAnalyticsError, safeFileType} from '../../analytics/sanitizeAnalytics.js';

export default function CVBuilder() {
    const {showToast} = useApp();
    const navigate = useNavigate();
    const {
        cvData,
        setCurrentCvId,
        setHasCV,
        updatePersonalInfo,
        updateProfessionalTitle,
        updateSummary,
        addExperience,
        updateExperience,
        updateExperienceDetail,
        removeExperience,
        updateEducation,
        addEducation,
        removeEducation,
        updateSkills,
        updateProjects,
        updateCertificates,
        updateLanguages,
        updateAwards,
        setFullCVData,
        resetCV
    } = useCV();

    useEffect(() => {
        resetCV();
        setCurrentCvId(null);
    }, [resetCV, setCurrentCvId]);

    const [step, setStep] = useState(1);
    const [isImporting, setIsImporting] = useState(false);
    const [savedCVs, setSavedCVs] = useState([]);
    const [showSavedCVPicker, setShowSavedCVPicker] = useState(false);
    const [isLoadingSavedCVs, setIsLoadingSavedCVs] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [quotaState, setQuotaState] = useState({ loading: false, error: '', exhausted: false });
    const [validationError, setValidationError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const pendingFocusField = useRef('');
    const builderRef = useRef(null);
    const totalSteps = 5;
    const stepForField = field => field.startsWith('personalInfo.') || field === 'summary' || field === 'professionalTitle' ? 1
        : field.startsWith('experiences.') ? 2
            : field.startsWith('education.') ? 3 : 4;
    const revealValidationErrors = errors => {
        const byField = errors.reduce((result, error) => ({...result, [error.field]: error.message}), {});
        setFieldErrors(byField);
        const firstError = errors[0];
        if (!firstError) return;
        const [section, index, ...fieldParts] = firstError.field.split('.');
        const sectionLabels = {personalInfo: 'Thông tin cá nhân', experiences: 'Kinh nghiệm', education: 'Học vấn', projects: 'Dự án', certificates: 'Chứng chỉ', languages: 'Ngoại ngữ', awards: 'Giải thưởng', skills: 'Kỹ năng'};
        const fieldLabels = {name: 'Họ và tên / tên mục', email: 'Email', phone: 'Số điện thoại', dob: 'Ngày sinh', address: 'Địa chỉ', linkedin: 'LinkedIn', url: 'Liên kết', details: 'Mô tả', period: 'Thời gian', role: 'Vị trí', company: 'Công ty', degree: 'Bằng cấp', school: 'Trường học', year: 'Thời gian', gpa: 'GPA', issuer: 'Đơn vị cấp', date: 'Ngày'};
        const location = section === 'personalInfo' || section === 'summary' || section === 'professionalTitle'
            ? (fieldLabels[index] || (section === 'summary' ? 'Mục tiêu nghề nghiệp' : 'Chức danh'))
            : `${sectionLabels[section] || section} ${Number(index) + 1} · ${fieldLabels[fieldParts[0]] || fieldParts[0] || 'Nội dung'}`;
        setValidationError(`${location}: ${firstError.message} (Bước ${stepForField(firstError.field)}).`);
        pendingFocusField.current = firstError.field;
        setStep(stepForField(firstError.field));
        showToast(`${location}: ${firstError.message}`, 'error');
    };
    const clearFieldError = field => {
        setValidationError('');
        setFieldErrors(current => {
            if (!current[field]) return current;
            const next = {...current};
            delete next[field];
            return next;
        });
    };

    useEffect(() => {
        if (!pendingFocusField.current) return;
        const target = builderRef.current?.querySelector(`[data-validation-field="${pendingFocusField.current}"]`);
        if (!target) return;
        pendingFocusField.current = '';
        target.scrollIntoView({behavior: 'smooth', block: 'center'});
        target.focus({preventScroll: true});
    }, [step, fieldErrors]);
    const skillCategoryOptions = [
        {value: 'frontend', label: 'Front-end'},
        {value: 'backend', label: 'Back-end'},
        {value: 'soft', label: 'Soft Skill'},
        ...[...new Set((cvData.skills || []).map(skill => String(skill.category || '').trim()).filter(Boolean))]
            .filter(category => !['frontend', 'backend', 'soft'].includes(category))
            .map(category => ({value: category, label: category})),
    ];

    const handleRetryQuota = async () => {
        setQuotaState({ loading: true, error: '', exhausted: false });
        try {
            await checkBuilderQuota(() => paymentService.getCurrentQuota());
            setQuotaState({ loading: false, error: '', exhausted: false });
        } catch (error) {
            setQuotaState({ loading: false,
                error: getApiErrorMessage(error, 'Không kiểm tra được lượt tạo CV. Vui lòng thử lại.'),
                exhausted: error.code === 'CV_CREATION_QUOTA_EXCEEDED' });
        }
    };

    const handleFileUpload = () => {
        document.getElementById('cv-upload-input').click();
    };

    const handleShowSavedCVs = async () => {
        setShowSavedCVPicker(true);
        if (savedCVs.length > 0) return;

        setIsLoadingSavedCVs(true);
        try {
            const assets = await galleryService.getGalleryAssets();
            setSavedCVs(assets?.cvs || []);
        } catch (error) {
            showToast(getApiErrorMessage(error, 'Không thể tải danh sách CV đã lưu.'), 'error');
        } finally {
            setIsLoadingSavedCVs(false);
        }
    };

    const handleSelectSavedCV = (cvId) => {
        const selectedCV = savedCVs.find((cv) => cv.id === cvId);
        if (!selectedCV?.content) return;

        setFullCVData(mapImportedCVData(selectedCV.content));
        setStep(1);
        setValidationError('');
        showToast(`Đã điền thông tin từ CV "${selectedCV.name || 'CV đã lưu'}".`, 'success');
    };

    const handleSaveAndEdit = async () => {
        if (isSaving || quotaState.loading || quotaState.error) return;
        const errors = validateCVDataFields(cvData, { requireBuilderContacts: true });
        if (errors.length) {
            revealValidationErrors(errors);
            return;
        }
        setValidationError('');
        setFieldErrors({});
        setIsSaving(true);
        try {
            // Check only when the user continues to the editor.
            await checkBuilderQuota(() => paymentService.getCurrentQuota());
            setHasCV(true);
            showToast('Thông tin CV đã sẵn sàng. Bạn có thể chỉnh sửa và tải file ở bước tiếp theo.', 'success');
            navigate('/editor');
        } catch (error) {
            const message = getApiErrorMessage(error, 'Không thể mở trình chỉnh sửa CV.');
            setQuotaState({ loading: false, error: message, exhausted: error.code === 'CV_CREATION_QUOTA_EXCEEDED' });
            showToast(message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const onFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const extension = file.name.split('.').pop()?.toLowerCase();
        if (!['pdf', 'doc', 'docx'].includes(extension)) {
            showToast('Vui lòng chọn tệp PDF, DOC hoặc DOCX.', 'error');
            e.target.value = '';
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast('Kích thước tệp tối đa là 5 MB.', 'error');
            e.target.value = '';
            return;
        }

        setIsImporting(true);
        try {
            const extractedData = await extractCV(file);
            setFullCVData(mapImportedCVData(extractedData));
            setStep(1);
            setValidationError('');
            trackEvent('cv_import_succeeded', {file_type: safeFileType(file), result_origin: 'new'});
            showToast(`Đã đọc thông tin từ ${file.name}. Vui lòng kiểm tra lại nội dung.`, 'success');
        } catch (error) {
            trackEvent('feature_error', {feature: 'cv_import', error_category: categorizeAnalyticsError(error)});
            const message = getApiErrorMessage(error, 'Không thể nhập CV. Vui lòng thử lại.');
            showToast(message, 'error');
        } finally {
            setIsImporting(false);
            e.target.value = '';
        }
    };

    const nextStep = () => {
        const stepFields = validateCVDataFields(cvData, {requireBuilderContacts: step === 1});
        const errors = stepFields.filter(error => stepForField(error.field) === step);
        if (errors.length) {
            revealValidationErrors(errors);
            return;
        }
        setValidationError('');
        setFieldErrors({});
        setStep(prev => Math.min(prev + 1, totalSteps));
    };
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const updateStepFourRecord = (section, index, patch) => {
        const current = Array.isArray(cvData[section.field]) ? cvData[section.field] : [];
        section.updater(current.map((record, recordIndex) => recordIndex === index ? {...record, ...patch} : record));
    };

    const addStepFourRecord = section => {
        section.updater([...(cvData[section.field] || []), {...section.emptyRecord}]);
    };

    const removeStepFourRecord = (section, index) => {
        section.updater((cvData[section.field] || []).filter((_, recordIndex) => recordIndex !== index));
    };

    return (
        <>
            <Header/>
            <main ref={builderRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">

                    {/* CV creation wizard */}
                    <section
                        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[700px]">

                        {/* Stepper Header */}
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
                                        <LayoutTemplate className="h-4 w-4"/>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800">Tạo CV của bạn</h2>
                                        <p className="mt-1 text-sm text-slate-500">Nhập thông tin theo từng bước. Bạn có thể bỏ qua các mục không phù hợp.</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={handleShowSavedCVs}
                                        disabled={isLoadingSavedCVs}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-green-600 hover:text-green-700 transition-colors disabled:opacity-50">
                                        <LayoutTemplate className="h-4 w-4"/>
                                        {isLoadingSavedCVs ? 'Đang tải CV đã lưu...' : 'Dùng CV đã lưu'}
                                    </button>
                                    <button
                                        onClick={handleFileUpload}
                                        disabled={isImporting}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-green-600 hover:text-green-700 transition-colors disabled:opacity-50">
                                        <Download className="h-4 w-4"/>
                                        {isImporting ? 'Đang đọc CV...' : 'Nhập CV từ tệp'}
                                    </button>
                                    <input id="cv-upload-input" type="file" className="hidden" accept=".pdf,.doc,.docx"
                                        onChange={onFileChange}
                                    />
                                </div>
                            </div>

                            {showSavedCVPicker && (
                                <div className="px-6 pb-5 bg-slate-50/50">
                                    <label htmlFor="saved-cv-picker" className="block text-xs font-semibold text-slate-600 mb-2">
                                        Chọn CV trong gallery để điền thông tin
                                    </label>
                                    <select
                                        id="saved-cv-picker"
                                        defaultValue=""
                                        disabled={isLoadingSavedCVs || savedCVs.length === 0}
                                        onChange={(event) => handleSelectSavedCV(event.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:bg-slate-100">
                                        <option value="" disabled>
                                            {isLoadingSavedCVs ? 'Đang tải...' : savedCVs.length ? 'Chọn CV đã lưu' : 'Chưa có CV nào trong gallery'}
                                        </option>
                                        {savedCVs.map((cv) => (
                                            <option key={cv.id} value={cv.id}>{cv.name || 'CV không có tên'}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Stepper Visual */}
                            <div role="group" aria-label={`Bước ${step} trên ${totalSteps}`} className="flex items-start gap-2 sm:gap-4">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <div key={s} className="flex items-center gap-2 flex-1">
                                        <button type="button" onClick={() => s < step && setStep(s)} disabled={s >= step} aria-current={step === s ? 'step' : undefined}
                                            aria-label={`Bước ${s}: ${s === 1 ? 'Thông tin' : s === 2 ? 'Kinh nghiệm' : s === 3 ? 'Học vấn' : s === 4 ? 'Kỹ năng' : 'Hoàn tất'}`}
                                            className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                step === s ? 'bg-green-700 text-white shadow-md scale-110' :
                                                    step > s ? 'bg-green-500 text-white cursor-pointer hover:bg-green-700' : 'bg-slate-200 text-slate-500'
                                            }`}>
                                            {step > s ? <CheckCircle2 className="w-5 h-5"/> : s}
                                        </button>
                                        <span
                                            className={`hidden sm:block text-xs font-bold transition-colors ${step === s ? 'text-green-700' : 'text-slate-400'}`}>
                                            {s === 1 ? 'Thông tin' : s === 2 ? 'Kinh nghiệm' : s === 3 ? 'Học vấn' : s === 4 ? 'Kỹ năng' : 'Hoàn tất'}
                                        </span>
                                        {s < totalSteps && <div
                                            className={`h-px flex-1 transition-colors ${step > s ? 'bg-green-500' : 'bg-slate-200'}`}></div>}
                                    </div>
                                ))}
                            </div>
                            <p className="mt-4 text-sm font-medium text-slate-600 sm:hidden">Bước {step} trên {totalSteps}: {['Thông tin cá nhân', 'Kinh nghiệm', 'Học vấn', 'Kỹ năng', 'Hoàn tất CV'][step - 1]}</p>
                        </div>

                        <div className="p-8 flex-grow">
                            {(quotaState.loading || quotaState.error) && (
                                <div role={quotaState.error ? 'alert' : 'status'} className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                                    <p>{quotaState.loading ? 'Đang kiểm tra lượt tạo CV còn lại…' : quotaState.error}</p>
                                    {!quotaState.loading && quotaState.error && (
                                        <div className="mt-3 flex flex-wrap gap-4">
                                            {quotaState.exhausted && <button onClick={() => navigate('/pricing')} className="font-semibold underline">Nâng cấp gói CV</button>}
                                            <button onClick={handleRetryQuota} className="font-semibold underline">Kiểm tra lại</button>
                                        </div>
                                    )}
                                </div>
                            )}
                            {validationError && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{validationError}</p>}
                            {step === 1 && (
                                <div className="space-y-8 animate-fade-in">
                                    <p className="text-sm text-slate-500">Bắt đầu với thông tin liên hệ và phần giới thiệu ngắn. Họ tên và email là bắt buộc; các trường khác có thể bổ sung sau.</p>
                                    <div className="space-y-6">
                                        <div className="group space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-slate-400 group-focus-within:text-green-700 transition-colors">Chức danh</label>
                                            <input type="text" data-validation-field="professionalTitle" className="w-full input-underlined text-black placeholder:text-slate-300" placeholder="Ví dụ: Software Developer" value={cvData.professionalTitle || ''} maxLength={255} aria-invalid={Boolean(fieldErrors.professionalTitle)} onChange={event => { clearFieldError('professionalTitle'); updateProfessionalTitle(event.target.value); }} />
                                            {fieldErrors.professionalTitle && <p className="text-xs text-red-600" role="alert">{fieldErrors.professionalTitle}</p>}
                                        </div>
                                        <div className="group space-y-1">
                                            <label
                                                className="text-[10px] uppercase font-bold text-slate-400 group-focus-within:text-green-700 transition-colors">Tên
                                                đầy đủ <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                data-validation-field="personalInfo.name"
                                                className="w-full input-underlined text-lg font-bold text-black placeholder:text-slate-300"
                                                placeholder="Nguyễn Văn A..."
                                                value={cvData.personalInfo.name}
                                                maxLength={255}
                                                aria-invalid={Boolean(fieldErrors['personalInfo.name']) || !cvData.personalInfo.name.trim()}
                                                onChange={(e) => { clearFieldError('personalInfo.name'); updatePersonalInfo({name: e.target.value}); }}
                                            />
                                            {fieldErrors['personalInfo.name'] && <p className="text-xs text-red-600" role="alert">{fieldErrors['personalInfo.name']}</p>}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="group space-y-1">
                                                    <label
                                                        className="text-[10px] uppercase font-bold text-slate-400 group-focus-within:text-green-700 transition-colors">Email <span className="text-red-500">*</span></label>
                                                <input
                                                    type="email"
                                                    data-validation-field="personalInfo.email"
                                                    className="w-full input-underlined text-black placeholder:text-slate-300"
                                                    placeholder="example@gmail.com"
                                                    value={cvData.personalInfo.email}
                                                    maxLength={254}
                                                    aria-invalid={Boolean(fieldErrors['personalInfo.email'])}
                                                    onChange={(e) => { clearFieldError('personalInfo.email'); updatePersonalInfo({email: e.target.value}); }}
                                                />
                                                {fieldErrors['personalInfo.email'] && <p className="text-xs text-red-600" role="alert">{fieldErrors['personalInfo.email']}</p>}
                                            </div>
                                            <div className="group space-y-1">
                                                    <label
                                                        className="text-[10px] uppercase font-bold text-slate-400 group-focus-within:text-green-700 transition-colors">Số
                                                        điện thoại</label>
                                                <input
                                                    type="text"
                                                    data-validation-field="personalInfo.phone"
                                                    className="w-full input-underlined text-black placeholder:text-slate-300"
                                                    placeholder="090..."
                                                    value={cvData.personalInfo.phone}
                                                    maxLength={24}
                                                    aria-invalid={Boolean(fieldErrors['personalInfo.phone'])}
                                                    onChange={(e) => { clearFieldError('personalInfo.phone'); updatePersonalInfo({phone: e.target.value}); }}
                                                />
                                                {fieldErrors['personalInfo.phone'] && <p className="text-xs text-red-600" role="alert">{fieldErrors['personalInfo.phone']}</p>}
                                            </div>
                                        </div>
                                        <div className="group space-y-1">
                                            <label
                                                className="text-[10px] uppercase font-bold text-slate-400 group-focus-within:text-green-700 transition-colors">LinkedIn</label>
                                            <input
                                                type="text"
                                                data-validation-field="personalInfo.linkedin"
                                                className="w-full input-underlined text-black placeholder:text-slate-300"
                                                placeholder="linkedin.com/in/yourprofile"
                                                value={cvData.personalInfo.linkedin}
                                                maxLength={2048}
                                                aria-invalid={Boolean(fieldErrors['personalInfo.linkedin'])}
                                                onChange={(e) => { clearFieldError('personalInfo.linkedin'); updatePersonalInfo({linkedin: e.target.value}); }}
                                            />
                                            {fieldErrors['personalInfo.linkedin'] && <p className="text-xs text-red-600" role="alert">{fieldErrors['personalInfo.linkedin']}</p>}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="group space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-slate-400 group-focus-within:text-green-700 transition-colors">Ngày sinh</label>
                                                <input type="text" data-validation-field="personalInfo.dob" className="w-full input-underlined text-black placeholder:text-slate-300" placeholder="DD/MM/YYYY" value={cvData.personalInfo.dob || ''} maxLength={32} aria-invalid={Boolean(fieldErrors['personalInfo.dob'])} onChange={event => { clearFieldError('personalInfo.dob'); updatePersonalInfo({dob: event.target.value}); }} />
                                                {fieldErrors['personalInfo.dob'] && <p className="text-xs text-red-600" role="alert">{fieldErrors['personalInfo.dob']}</p>}
                                            </div>
                                            <div className="group space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-slate-400 group-focus-within:text-green-700 transition-colors">Địa chỉ</label>
                                                <input type="text" data-validation-field="personalInfo.address" className="w-full input-underlined text-black placeholder:text-slate-300" placeholder="Thành phố, quốc gia" value={cvData.personalInfo.address || ''} maxLength={500} aria-invalid={Boolean(fieldErrors['personalInfo.address'])} onChange={event => { clearFieldError('personalInfo.address'); updatePersonalInfo({address: event.target.value}); }} />
                                                {fieldErrors['personalInfo.address'] && <p className="text-xs text-red-600" role="alert">{fieldErrors['personalInfo.address']}</p>}
                                            </div>
                                        </div>
                                        <ProfilePhotoPicker />
                                    </div>

                                    <div className="pt-6">
                                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-green-600"/>
                                            Mục tiêu nghề nghiệp
                                        </h3>
                                        <textarea
                                            data-validation-field="summary"
                                            className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-black focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                                            placeholder="Mô tả ngắn gọn về mục tiêu và giá trị bạn mang lại..."
                                            value={cvData.summary}
                                            maxLength={5000}
                                            aria-invalid={Boolean(fieldErrors.summary)}
                                            onChange={(e) => { clearFieldError('summary'); updateSummary(e.target.value); }}
                                        ></textarea>
                                        {fieldErrors.summary && <p className="text-xs text-red-600" role="alert">{fieldErrors.summary}</p>}
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8 animate-fade-in">
                                    <p className="text-sm text-slate-500">Thêm công việc chính thức, thực tập, việc làm thêm, tình nguyện hoặc dự án thực tế. Kinh nghiệm không nhất thiết phải ở công ty; có thể ghi tên cửa hàng, tổ chức, nhóm hoặc để trống nếu không có.</p>
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Kinh
                                            nghiệm làm việc</h3>
                                        <button
                                            onClick={addExperience}
                                            className="text-xs font-bold text-green-600 hover:text-green-800 flex items-center gap-1 transition-colors">
                                            <Plus className="w-3 h-3"/> Thêm mục
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                    {cvData.experiences.length === 0 && (
                                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                                            <p className="font-semibold text-slate-700">Chưa thêm kinh nghiệm làm việc</p>
                                            <p className="mt-1 text-sm text-slate-500">Có thể thêm việc làm, thực tập, hoạt động tình nguyện hoặc dự án thực tế.</p>
                                            <button onClick={addExperience} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"><Plus className="h-4 w-4"/>Thêm kinh nghiệm</button>
                                        </div>
                                    )}
                                    {cvData.experiences.map((exp) => (
                                            <div key={exp.id}
                                                 className="relative group bg-slate-50 border border-slate-200 rounded-2xl p-6 transition-all hover:shadow-md focus-within:border-green-500">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div className="space-y-1">
                                                        <label
                                                            className="text-[10px] font-bold text-slate-400 uppercase">Nơi làm việc / tổ chức (không bắt buộc)</label>
                                                        <input
                                                            type="text"
                                                            data-validation-field={`experiences.${cvData.experiences.findIndex(item => item.id === exp.id)}.company`}
                                                            className="w-full bg-transparent border-b border-slate-200 focus:border-green-500 outline-none text-sm font-bold py-1 text-black"
                                                            value={exp.company}
                                                            placeholder="Công ty, cửa hàng, CLB hoặc dự án"
                                                            onChange={(e) => { clearFieldError(`experiences.${cvData.experiences.findIndex(item => item.id === exp.id)}.company`); updateExperience(exp.id, 'company', e.target.value); }}
                                                        />
                                                        {fieldErrors[`experiences.${cvData.experiences.findIndex(item => item.id === exp.id)}.company`] && <p className="text-xs text-red-600" role="alert">{fieldErrors[`experiences.${cvData.experiences.findIndex(item => item.id === exp.id)}.company`]}</p>}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label
                                                            className="text-[10px] font-bold text-slate-400 uppercase">Thời
                                                            gian</label>
                                                        <input
                                                            type="text"
                                                            data-validation-field={`experiences.${cvData.experiences.findIndex(item => item.id === exp.id)}.period`}
                                                            className="w-full bg-transparent border-b border-slate-200 focus:border-green-500 outline-none text-sm py-1 text-black"
                                                            value={exp.period}
                                                            placeholder="Ví dụ: 06/2025 – Hiện tại"
                                                            onChange={(e) => { clearFieldError(`experiences.${cvData.experiences.findIndex(item => item.id === exp.id)}.period`); updateExperience(exp.id, 'period', e.target.value); }}
                                                        />
                                                        {fieldErrors[`experiences.${cvData.experiences.findIndex(item => item.id === exp.id)}.period`] && <p className="text-xs text-red-600" role="alert">{fieldErrors[`experiences.${cvData.experiences.findIndex(item => item.id === exp.id)}.period`]}</p>}
                                                    </div>
                                                </div>
                                                <div className="space-y-1 mb-4">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Vị
                                                        trí</label>
                                                    <input
                                                        type="text"
                                                        data-validation-field={`experiences.${cvData.experiences.findIndex(item => item.id === exp.id)}.role`}
                                                        className="w-full bg-transparent border-b border-slate-200 focus:border-green-500 outline-none text-sm py-1 text-black"
                                                        value={exp.role}
                                                        onChange={(e) => { clearFieldError(`experiences.${cvData.experiences.findIndex(item => item.id === exp.id)}.role`); updateExperience(exp.id, 'role', e.target.value); }}
                                                    />
                                                    {fieldErrors[`experiences.${cvData.experiences.findIndex(item => item.id === exp.id)}.role`] && <p className="text-xs text-red-600" role="alert">{fieldErrors[`experiences.${cvData.experiences.findIndex(item => item.id === exp.id)}.role`]}</p>}
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Chi
                                                        tiết công việc</label>
                                                    {exp.details.map((detail, dIdx) => (
                                                        <div key={dIdx} className="flex gap-2">
                                                            <div
                                                                className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0"></div>
                                                            <textarea
                                                                data-validation-field={`experiences.${cvData.experiences.findIndex(item => item.id === exp.id)}.details`}
                                                                className="w-full bg-transparent border-none resize-none focus:ring-0 text-sm py-1 placeholder:text-slate-300 outline-none text-black"
                                                                placeholder="Ví dụ: Tăng doanh thu 20% trong 6 tháng..."
                                                                value={detail}
                                                                onChange={(e) => { clearFieldError(`experiences.${cvData.experiences.findIndex(item => item.id === exp.id)}.details`); updateExperienceDetail(exp.id, dIdx, e.target.value); }}
                                                            ></textarea>
                                                            {dIdx === 0 && fieldErrors[`experiences.${cvData.experiences.findIndex(item => item.id === exp.id)}.details`] && <p className="text-xs text-red-600" role="alert">{fieldErrors[`experiences.${cvData.experiences.findIndex(item => item.id === exp.id)}.details`]}</p>}
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => {
                                                            const newDetails = [...cvData.experiences.find(e => e.id === exp.id).details, ''];
                                                            updateExperience(exp.id, 'details', newDetails);
                                                        }}
                                                        className="text-xs text-slate-400 hover:text-green-600 flex items-center gap-1 transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3"/> Thêm gạch đầu dòng
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeExperience(exp.id)}
                                                    className="absolute -top-3 -right-3 bg-white border border-slate-200 text-red-500 p-2 rounded-full hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Xóa">
                                                    <Trash2 className="h-4 w-4"/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-8 animate-fade-in">
                                    <p className="text-sm text-slate-500">Thêm trường học hoặc chương trình đào tạo liên quan. GPA là thông tin tùy chọn.</p>
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Học
                                            vấn</h3>
                                        <button
                                            onClick={addEducation}
                                            className="text-xs font-bold text-green-600 hover:text-green-800 flex items-center gap-1 transition-colors">
                                            <Plus className="w-3 h-3"/> Thêm mục
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {cvData.education.length === 0 && (
                                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                                                <p className="font-semibold text-slate-700">Chưa thêm học vấn</p>
                                                <p className="mt-1 text-sm text-slate-500">Bạn có thể bỏ qua nếu không muốn đưa học vấn vào CV.</p>
                                                <button onClick={addEducation} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"><Plus className="h-4 w-4"/>Thêm học vấn</button>
                                            </div>
                                        )}
                                        {cvData.education.map((edu, index) => (
                                            <div key={index}
                                                 className="relative group bg-slate-50 border border-slate-200 rounded-2xl p-6 transition-all hover:shadow-md focus-within:border-green-500">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div className="space-y-1">
                                                        <label
                                                            className="text-[10px] font-bold text-slate-400 uppercase">Bằng
                                                            cấp / Chứng chỉ</label>
                                                        <input
                                                            type="text"
                                                            data-validation-field={`education.${index}.degree`}
                                                            className="w-full bg-transparent border-b border-slate-200 focus:border-green-500 outline-none text-sm font-bold py-1 text-black"
                                                            value={edu.degree}
                                                            onChange={(e) => { clearFieldError(`education.${index}.degree`); updateEducation(index, 'degree', e.target.value); }}
                                                        />
                                                        {fieldErrors[`education.${index}.degree`] && <p className="text-xs text-red-600" role="alert">{fieldErrors[`education.${index}.degree`]}</p>}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label
                                                            className="text-[10px] font-bold text-slate-400 uppercase">Trường
                                                            học / Tổ chức</label>
                                                        <input
                                                            type="text"
                                                            data-validation-field={`education.${index}.school`}
                                                            className="w-full bg-transparent border-b border-slate-200 focus:border-green-500 outline-none text-sm py-1 text-black"
                                                            value={edu.school}
                                                            onChange={(e) => { clearFieldError(`education.${index}.school`); updateEducation(index, 'school', e.target.value); }}
                                                        />
                                                        {fieldErrors[`education.${index}.school`] && <p className="text-xs text-red-600" role="alert">{fieldErrors[`education.${index}.school`]}</p>}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label
                                                            className="text-[10px] font-bold text-slate-400 uppercase">Thời
                                                            gian</label>
                                                        <input
                                                            type="text"
                                                            data-validation-field={`education.${index}.year`}
                                                            className="w-full bg-transparent border-b border-slate-200 focus:border-green-500 outline-none text-sm py-1 text-black"
                                                            value={edu.year}
                                                            onChange={(e) => { clearFieldError(`education.${index}.year`); updateEducation(index, 'year', e.target.value); }}
                                                        />
                                                        {fieldErrors[`education.${index}.year`] && <p className="text-xs text-red-600" role="alert">{fieldErrors[`education.${index}.year`]}</p>}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label
                                                            className="text-[10px] font-bold text-slate-400 uppercase">GPA (không bắt buộc)</label>
                                                        <input
                                                            type="text"
                                                            data-validation-field={`education.${index}.gpa`}
                                                            className="w-full bg-transparent border-b border-slate-200 focus:border-green-500 outline-none text-sm py-1 text-black"
                                                            value={edu.gpa}
                                                            onChange={(e) => { clearFieldError(`education.${index}.gpa`); updateEducation(index, 'gpa', e.target.value); }}
                                                        />
                                                        {fieldErrors[`education.${index}.gpa`] && <p className="text-xs text-red-600" role="alert">{fieldErrors[`education.${index}.gpa`]}</p>}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeEducation(index)}
                                                    className="absolute -top-3 -right-3 bg-white border border-slate-200 text-red-500 p-2 rounded-full hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Xóa">
                                                    <Trash2 className="h-4 w-4"/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-8 animate-fade-in">
                                    <p className="text-sm text-slate-500">Chỉ thêm kỹ năng, dự án, chứng chỉ và thành tích bạn muốn xuất hiện trên CV. Các mục này đều có thể bổ sung sau trong trình chỉnh sửa.</p>
                                    <div className="flex items-center gap-2 mb-4">
                                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Kỹ
                                            năng & Thông tin khác</h3>
                                        <Sparkles className="w-4 h-4 text-green-600"/>
                                    </div>

                                    <div className="space-y-8">
                                        {/* Skills Section */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-bold text-slate-600 uppercase">Kỹ năng chuyên môn và kỹ năng mềm</label>
                                                <button
                                                    onClick={() => {
                                                        const newSkills = [...cvData.skills, {
                                                            name: '',
                                                            level: null,
                                                            category: ''
                                                        }];
                                                        updateSkills(newSkills);
                                                    }}
                                                    className="text-xs font-bold text-green-600 hover:text-green-800 flex items-center gap-1"
                                                >
                                                    <Plus className="w-3 h-3"/> Thêm kỹ năng
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {cvData.skills.map((skill, index) => (
                                                    <div key={index}
                                                         className="grid min-w-0 grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 group sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center">
                                                        <input
                                                            type="text"
                                                            data-validation-field={`skills.${index}.name`}
                                                            className="w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-black outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:col-span-3"
                                                            value={skill.name}
                                                            onChange={(e) => {
                                                                const updated = cvData.skills.map((item, itemIndex) => itemIndex === index
                                                                    ? {...item, name: e.target.value} : item);
                                                                updateSkills(updated);
                                                            }}
                                                            placeholder="Tên kỹ năng..."
                                                        />
                                                        {fieldErrors[`skills.${index}.name`] && <p className="text-xs text-red-600 sm:col-span-3" role="alert">{fieldErrors[`skills.${index}.name`]}</p>}
                                                        <div className="relative min-w-0">
                                                            <select
                                                                data-validation-field={`skills.${index}.category`}
                                                                className="w-full min-w-0 appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs text-slate-700 outline-none transition hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                                                value={skill.category || ''}
                                                                onChange={(e) => {
                                                                    const updated = cvData.skills.map((item, itemIndex) => itemIndex === index
                                                                        ? {...item, category: e.target.value} : item);
                                                                    updateSkills(updated);
                                                                }}
                                                            >
                                                                <option value="">Chọn nhóm</option>
                                                                {skillCategoryOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                                            </select>
                                                            <ChevronRight className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-slate-400" />
                                                        </div>
                                                        <div className="relative min-w-0">
                                                            <select
                                                                className="w-full min-w-0 appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs text-slate-700 outline-none transition hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                                                value={skill.level || ''}
                                                                onChange={(e) => {
                                                                    const updated = cvData.skills.map((item, itemIndex) => itemIndex === index
                                                                        ? {...item, level: e.target.value || null} : item);
                                                                    updateSkills(updated);
                                                                }}
                                                            >
                                                                <option value="">Chưa xác định mức</option>
                                                                <option value="BEGINNER">Beginner</option>
                                                                <option value="INTERMEDIATE">Intermediate</option>
                                                                <option value="ADVANCED">Advanced</option>
                                                                <option value="EXPERT">Expert</option>
                                                            </select>
                                                            <ChevronRight className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-slate-400" />
                                                        </div>
                                                        <div className="flex justify-end sm:justify-center">
                                                            <button onClick={() => {
                                                                const updated = cvData.skills.filter((_, i) => i !== index);
                                                                updateSkills(updated);
                                                            }}
                                                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500">
                                                                <Trash2 className="h-4 w-4"/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Structured extra sections use the same canonical fields as the templates. */}
                                        <div className="space-y-8">
                                            {[
                                                {
                                                    label: 'Dự án', field: 'projects', updater: updateProjects,
                                                    emptyRecord: {name: '', period: '', details: [], techStack: '', teamSize: '', url: ''},
                                                    fields: [
                                                        {key: 'name', label: 'Tên dự án', placeholder: 'Ví dụ: Nền tảng thương mại điện tử'},
                                                        {key: 'period', label: 'Thời gian', placeholder: 'Ví dụ: 01/2024 – 06/2024'},
                                                        {key: 'details', label: 'Mô tả', type: 'textarea', placeholder: 'Mỗi dòng là một ý mô tả'},
                                                        {key: 'techStack', label: 'Tech stack', placeholder: 'Ví dụ: Java, Spring Boot, MySQL'},
                                                        {key: 'teamSize', label: 'Quy mô nhóm', placeholder: 'Ví dụ: 4 thành viên'},
                                                        {key: 'url', label: 'Liên kết', type: 'url', placeholder: 'https://...'},
                                                    ],
                                                },
                                                {
                                                    label: 'Chứng chỉ', field: 'certificates', updater: updateCertificates,
                                                    emptyRecord: {name: '', issuer: '', date: '', url: ''},
                                                    fields: [
                                                        {key: 'name', label: 'Tên chứng chỉ', placeholder: 'Tên chứng chỉ'},
                                                        {key: 'issuer', label: 'Đơn vị cấp', placeholder: 'Đơn vị cấp'},
                                                        {key: 'date', label: 'Ngày hoặc năm cấp', placeholder: 'Ví dụ: 2023'},
                                                        {key: 'url', label: 'Liên kết', type: 'url', placeholder: 'https://...'},
                                                    ],
                                                },
                                                {
                                                    label: 'Ngôn ngữ', field: 'languages', updater: updateLanguages,
                                                    emptyRecord: {name: '', level: ''},
                                                    fields: [
                                                        {key: 'name', label: 'Ngôn ngữ', placeholder: 'Ví dụ: English'},
                                                        {key: 'level', label: 'Trình độ', placeholder: 'Ví dụ: B2, IELTS 7.0, Native'},
                                                    ],
                                                },
                                                {
                                                    label: 'Giải thưởng', field: 'awards', updater: updateAwards,
                                                    emptyRecord: {name: '', issuer: '', date: ''},
                                                    fields: [
                                                        {key: 'name', label: 'Tên giải thưởng', placeholder: 'Tên giải thưởng'},
                                                        {key: 'issuer', label: 'Đơn vị trao', placeholder: 'Đơn vị trao'},
                                                        {key: 'date', label: 'Ngày hoặc năm nhận', placeholder: 'Ví dụ: 2023'},
                                                    ],
                                                },
                                            ].map(section => (
                                                <section key={section.field} className="space-y-3 rounded-2xl border border-slate-200 p-4 sm:p-5">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <h4 className="text-sm font-bold uppercase tracking-wide text-slate-700">{section.label}</h4>
                                                        <button type="button" onClick={() => addStepFourRecord(section)}
                                                            className="inline-flex items-center gap-1 rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white hover:bg-green-800">
                                                            <Plus className="h-3.5 w-3.5"/> Thêm {section.label.toLowerCase()}
                                                        </button>
                                                    </div>
                                                    {(cvData[section.field] || []).length === 0 && (
                                                        <p className="text-sm text-slate-500">Chưa có {section.label.toLowerCase()}. Các trường đều không bắt buộc.</p>
                                                    )}
                                                    <div className="space-y-4">
                                                        {(cvData[section.field] || []).map((item, index) => (
                                                            <div key={item.id || `${section.field}-${index}`} className="space-y-3 rounded-xl bg-slate-50 p-4">
                                                                <div className="flex items-center justify-between gap-3">
                                                                    <p className="text-xs font-semibold text-slate-500">{section.label} {index + 1}</p>
                                                                    <button type="button" aria-label={`Xóa ${section.label.toLowerCase()} ${index + 1}`}
                                                                        onClick={() => removeStepFourRecord(section, index)}
                                                                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
                                                                        <Trash2 className="h-4 w-4"/>
                                                                    </button>
                                                                </div>
                                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                                    {section.fields.map(field => {
                                                                        const isLegacyProjectDate = section.field === 'projects' && field.key === 'period'
                                                                            && !item.period && Boolean(item.date);
                                                                        const inputValue = field.key === 'period'
                                                                            ? (item.period || '')
                                                                            : field.key === 'details'
                                                                                ? (Array.isArray(item.details) ? item.details.join('\n') : String(item.details || ''))
                                                                                : (item[field.key] || '');
                                                                        const inputId = `${section.field}-${index}-${field.key}`;
                                                                        const inputProps = {
                                                                            id: inputId,
                                                                            'data-validation-field': `${section.field}.${index}.${field.key}`,
                                                                            value: inputValue,
                                                                            placeholder: field.placeholder,
                                                                            onChange: event => updateStepFourRecord(section, index, {
                                                                                [field.key]: field.key === 'details'
                                                                                    ? event.target.value.split(/\r?\n/)
                                                                                    : event.target.value,
                                                                            }) || clearFieldError(`${section.field}.${index}.${field.key}`),
                                                                            'aria-invalid': Boolean(fieldErrors[`${section.field}.${index}.${field.key}`]),
                                                                            className: 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100',
                                                                        };
                                                                        return <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                                                                            <label htmlFor={inputId} className="mb-1 block text-xs font-semibold text-slate-600">{field.label}</label>
                                                                            {field.type === 'textarea'
                                                                                ? <textarea {...inputProps} rows={3}/>
                                                                                : <input {...inputProps} type={field.type === 'url' ? 'url' : 'text'} inputMode={field.type === 'url' ? 'url' : undefined}/>}
                                                                            {fieldErrors[`${section.field}.${index}.${field.key}`] && <p className="mt-1 text-xs text-red-600" role="alert">{fieldErrors[`${section.field}.${index}.${field.key}`]}</p>}
                                                                            {isLegacyProjectDate && <p className="mt-1 text-xs text-amber-700">CV cũ lưu trường date là “{item.date}”. Hãy nhập lại thời gian nếu xác nhận giá trị này đúng.</p>}
                                                                        </div>;
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </section>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 5 && (
                                <div className="text-center py-12 animate-fade-in">
                                    <div
                                        className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                        <CheckCircle2 className="w-10 h-10"/>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Thông tin CV đã sẵn sàng</h3>
                                    <p className="text-slate-500 mb-8 max-w-4xl mx-auto">
                                        Tiếp theo, bạn sẽ chọn mẫu, xem trước CV và chỉnh sửa nội dung trong trình chỉnh sửa.
                                    </p>
                                    <div className="mx-auto mb-8 text-left" style={{width: 'min(100%, 36rem)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 8rem), 1fr))', gap: '0.75rem'}}>
                                        {[
                                            ['Kinh nghiệm', cvData.experiences.length],
                                            ['Học vấn', cvData.education.length],
                                            ['Kỹ năng', cvData.skills.length],
                                            ['Dự án', cvData.projects.length],
                                        ].map(([label, count]) => (
                                            <div key={label} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                                <p className="break-normal text-xs text-slate-500">{label}</p>
                                                <p className="mt-1 break-normal font-semibold text-slate-800">{count} mục</p>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleSaveAndEdit}
                                        disabled={isSaving || quotaState.loading || Boolean(quotaState.error)}
                                        className="mx-auto px-10 py-4 bg-green-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:bg-green-800 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">
                                        {isSaving || quotaState.loading ? 'Đang kiểm tra lượt tạo CV...' : 'Tiếp tục đến trình chỉnh sửa'} <ChevronRight className="w-5 h-5"/>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Bottom Navigation */}
                        <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
                                <button
                                    onClick={prevStep}
                                    disabled={step === 1}
                                    className="px-6 py-2 text-sm font-bold text-green-700 hover:text-green-800 disabled:text-slate-300 disabled:cursor-not-allowed flex items-center gap-1 transition-colors">
                                    <ChevronLeft className="w-4 h-4"/> Quay lại
                                </button>
                                {step < totalSteps && (
                                    <button
                                        onClick={nextStep}
                                        className="px-8 py-2 bg-green-700 text-white text-sm font-bold rounded-xl hover:bg-green-800 shadow-md shadow-green-200 transition-all flex items-center gap-1">
                                        Tiếp tục <ChevronRight className="w-4 h-4"/>
                                    </button>
                                )}
                            </div>
                    </section>

            </main>
            <Footer/>

        </>
    )
}
