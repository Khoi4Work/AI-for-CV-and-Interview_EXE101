import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

export default function TemplateFeedbackModal({ templateId, isOpen, onClose, onSubmit }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(templateId, { rating, comment });
            onClose();
        } catch (error) {
            console.error('Failed to submit feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-3xl rounded-3x  shadow-2xl overflow-hidden animate-scale-in">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Đánh giá mẫu CV</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">Điểm đánh giá</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">Nhận xét (tùy chọn)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:outline-none text-sm min-h-[100px] transition-all"
                            placeholder="Chia sẻ trải nghiệm của bạn về mẫu này..."
                        ></textarea>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 rounded-xl font-semibold text-white bg-green-700 hover:bg-green-800 transition-all disabled:opacity-50 text-sm shadow-md"
                        >
                            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
