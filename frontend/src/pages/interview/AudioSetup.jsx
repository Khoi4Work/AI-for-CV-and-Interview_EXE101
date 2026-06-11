import React from 'react';
import { Play, Mic, AudioLines } from 'lucide-react';
import { MainLayout } from '../../components/interview/MainLayout.jsx';
import {useNavigation} from "react-router-dom";

export function AudioSetup() {
    const { navigate } = useNavigation();

    return (
        <MainLayout>
            <div className="flex-1 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 w-full max-w-xl p-8">

                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="h-1.5 w-24 bg-[#1a56db] rounded-full"></div>
                        <div className="h-1.5 w-24 bg-gray-200 rounded-full"></div>
                        <div className="h-1.5 w-24 bg-gray-200 rounded-full border border-gray-300"></div>
                    </div>

                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-display font-semibold mb-2">Kiểm tra âm thanh trước khi bắt đầu</h1>
                        <p className="text-gray-500 text-sm">
                            Hãy đảm bảo microphone của bạn hoạt động ổn định để có trải nghiệm phỏng vấn tốt nhất.
                        </p>
                    </div>

                    <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#1a56db] rounded-full text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-[#1a56db]"></span>
              Microphone detected
            </span>
                    </div>

                    {/* Visualizer Mock */}
                    <div className="bg-gray-100 rounded-lg p-8 py-12 flex items-center justify-center relative overflow-hidden mb-6 h-40">
                        <div className="absolute inset-0 flex items-center justify-center opacity-30 text-gray-400">
                            <AudioLines size={120} strokeWidth={1} />
                        </div>

                        <div className="relative z-10 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <Mic className="text-gray-400" size={32} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button className="flex items-center justify-center gap-2 py-2.5 border border-[#1a56db] text-[#1a56db] rounded-lg font-medium hover:bg-blue-50 transition-colors">
                            <Play size={18} />
                            Test recording
                        </button>
                        <button className="flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed">
                            <Play size={18} />
                            Phát lại
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-500 mb-8 flex items-center justify-center gap-2">
                        <Mic size={14} className="text-gray-400" /> Chúng tôi cam kết không lưu trữ bản ghi âm của bạn.
                    </p>

                    <div className="flex gap-4">
                        <button className="flex-1 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors">
                            Thử lại
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors">
                            Tiếp tục
                        </button>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
}
