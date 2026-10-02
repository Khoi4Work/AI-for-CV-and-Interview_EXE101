import {useRef, useState} from 'react';
import {ImagePlus, Trash2, UserRound} from 'lucide-react';
import {useApp} from '../../auth/contexts/AppContext.jsx';
import {useCV} from '../contexts/CVContext.jsx';
import {prepareProfilePhoto} from '../utils/profilePhoto.js';

export default function ProfilePhotoPicker({variant = 'field', className = '', photo: suppliedPhoto}) {
    const inputRef = useRef(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const {showToast} = useApp();
    const {cvData, updateProfilePhoto} = useCV();
    const profilePhoto = suppliedPhoto ?? cvData.profilePhoto ?? '';

    const onFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        try {
            updateProfilePhoto(await prepareProfilePhoto(file));
            showToast('Đã thêm ảnh hồ sơ vào CV.', 'success');
        } catch (error) {
            showToast(error.message || 'Không thể xử lý ảnh hồ sơ.', 'error');
        } finally {
            setIsProcessing(false);
            event.target.value = '';
        }
    };

    const openPicker = () => inputRef.current?.click();
    const input = (
        <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            aria-label="Chọn ảnh hồ sơ"
            onChange={onFileChange}
        />
    );

    if (variant === 'frame') {
        return (
            <>
                <button
                    type="button"
                    onClick={openPicker}
                    disabled={isProcessing}
                    aria-label={profilePhoto ? 'Bấm để thay ảnh hồ sơ' : 'Bấm để thêm ảnh hồ sơ'}
                    className={`cv-profile-photo-frame group relative block cursor-pointer border-0 p-0 text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${className}`}
                >
                    {profilePhoto ? (
                        <img src={profilePhoto} alt="Ảnh hồ sơ" className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                        <span className="cv-profile-photo-empty absolute inset-0 flex flex-col items-center justify-center gap-1 bg-slate-200 text-slate-500">
                            <UserRound className="h-7 w-7" aria-hidden="true" />
                            <span className="cv-profile-photo-hint text-[10px] font-semibold">Thêm ảnh</span>
                        </span>
                    )}
                    <span className="cv-profile-photo-action absolute inset-0 flex items-center justify-center bg-black/55 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        {profilePhoto ? 'Thay ảnh' : 'Thêm ảnh'}
                    </span>
                </button>
                {input}
            </>
        );
    }

    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={openPicker}
                    disabled={isProcessing}
                    className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm font-medium text-on-surface hover:bg-surface-container disabled:opacity-60"
                >
                    <ImagePlus className="h-4 w-4" />
                    <span>{isProcessing ? 'Đang xử lý' : profilePhoto ? 'Thay ảnh' : 'Ảnh hồ sơ'}</span>
                </button>
                {profilePhoto && (
                    <button
                        type="button"
                        onClick={() => updateProfilePhoto('')}
                        aria-label="Xóa ảnh hồ sơ"
                        title="Xóa ảnh hồ sơ"
                        className="rounded-lg p-2 text-on-surface-variant hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
                {input}
            </div>
        );
    }

    return (
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-label="Ảnh hồ sơ">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                    type="button"
                    onClick={openPicker}
                    disabled={isProcessing}
                    aria-label={profilePhoto ? 'Bấm để thay ảnh hồ sơ' : 'Bấm để chọn ảnh hồ sơ'}
                    className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-400 hover:border-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
                >
                    {profilePhoto ? (
                        <img src={profilePhoto} alt="Xem trước ảnh hồ sơ" className="h-full w-full object-cover" />
                    ) : (
                        <span className="flex h-full flex-col items-center justify-center gap-1">
                            <UserRound className="h-8 w-8" />
                            <span className="text-[10px] font-medium">Chưa có ảnh</span>
                        </span>
                    )}
                </button>
                <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700">Ảnh hồ sơ (không bắt buộc)</h3>
                    <p className="text-xs leading-relaxed text-slate-500">Ảnh vuông sẽ được tự căn giữa. Hỗ trợ JPG, PNG, WebP, tối đa 5 MB.</p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={openPicker}
                            disabled={isProcessing}
                            className="rounded-lg bg-green-700 px-3 py-2 text-xs font-bold text-white hover:bg-green-800 disabled:opacity-60"
                        >
                            {isProcessing ? 'Đang xử lý ảnh...' : profilePhoto ? 'Thay ảnh' : 'Chọn ảnh'}
                        </button>
                        {profilePhoto && (
                            <button
                                type="button"
                                onClick={() => updateProfilePhoto('')}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                            >
                                Xóa ảnh
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {input}
        </section>
    );
}
