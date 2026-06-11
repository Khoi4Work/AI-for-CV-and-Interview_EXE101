import React from 'react';
import { Play, Download, Settings, Maximize } from 'lucide-react';
import { MainLayout } from '../../components/interview/MainLayout';
import {useNavigation} from "react-router-dom";

export function VideoReviewPage() {
    const { navigate } = useNavigation();

    return (
        <MainLayout>
            <div className="w-full max-w-5xl mx-auto flex flex-col pt-4">

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
                    <span className="hover:text-gray-900 cursor-pointer" onClick={() => navigate('audio')}>Phỏng vấn thử</span>
                    <span>›</span>
                    <span className="text-gray-900">Xem lại bản ghi</span>
                </div>

                <h1 className="text-3xl font-display font-semibold mb-2">Hoàn tất phỏng vấn</h1>
                <p className="text-gray-500 mb-8">
                    Vui lòng kiểm tra lại video trước khi gửi cho nhà tuyển dụng hoặc lưu vào hồ sơ.
                </p>

                {/* Video Player Mockup */}
                <div className="bg-[#111111] w-full aspect-video rounded-xl relative overflow-hidden mb-6 flex flex-col group shadow-md">

                    <div className="flex-1 flex items-center justify-center">
                        <button className="w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-transform hover:scale-105">
                            <Play size={28} fill="currentColor" className="ml-1" />
                        </button>
                    </div>

                    {/* Video Controls Bar */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-2">
                        {/* Scrubber */}
                        <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden flex items-center group-hover:h-1.5 transition-all cursor-pointer relative">
                            <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-white rounded-full"></div>
                            <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-sm scale-0 group-hover:scale-100 transition-transform"></div>
                        </div>

                        <div className="flex items-center justify-between text-white text-xs font-medium mt-1">
                            <div className="flex items-center gap-3">
                                <button><Play size={16} fill="currentColor" /></button>
                                <span className="font-mono pt-0.5">02:45 / 08:12</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <button><Settings size={16} /></button>
                                <button><Maximize size={16} /></button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('video')}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg font-medium transition-colors">
                            Ghi hình lại
                        </button>
                        <button
                            onClick={() => navigate('results')}
                            className="px-6 py-2.5 bg-[#1a56db] hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm">
                            Gửi phản hồi
                        </button>
                    </div>

                    <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium">
                        <Download size={18} />
                        Tải video về máy
                    </button>
                </div>

            </div>
        </MainLayout>
    );
}
