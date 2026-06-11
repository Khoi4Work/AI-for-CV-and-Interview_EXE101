import React from 'react';
import { Camera, Mic, Info, Lightbulb, Shirt, Image as ImageIcon, CheckCircle2, ChevronDown } from 'lucide-react';
import { MainLayout } from '../../components/interview/MainLayout';
import {useNavigation} from "react-router-dom";

export function VideoSetup() {
    const { navigate } = useNavigation();

    return (
        <MainLayout>
            <div className="w-full max-w-5xl mx-auto">
                <h1 className="text-3xl font-display font-semibold text-center mb-8">Chuẩn bị Phỏng vấn Ghi hình</h1>

                <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 mb-8">

                    {/* Left Column - Video Preview */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-[#111111] rounded-xl aspect-video relative flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
                            <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#d93025] bg-opacity-90 text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wider">
                                <div className="w-2 h-2 rounded-full bg-white opacity-90 animate-pulse"></div>
                                LIVE PREVIEW
                            </div>

                            {/* Overlay Controls Fake */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full">
                                <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"><Camera size={20}/></button>
                                <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"><Mic size={20}/></button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm flex flex-col sm:flex-row gap-4 ring-1 ring-blue-500/20">
                            <div className="flex-1">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <span className="text-sm font-medium text-gray-700">Máy ảnh:</span>
                                    <CheckCircle2 size={16} className="text-green-500" fill="#22c55e" stroke="white" />
                                </div>
                                <div className="relative">
                                    <select className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 px-3 pr-8 rounded-md text-sm outline-none focus:border-[#1a56db]">
                                        <option>FaceTime HD Camera (Built-in)</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <span className="text-sm font-medium text-gray-700">Microphone:</span>
                                    <CheckCircle2 size={16} className="text-green-500" fill="#22c55e" stroke="white" />
                                </div>
                                <div className="relative">
                                    <select className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 px-3 pr-8 rounded-md text-sm outline-none focus:border-[#1a56db]">
                                        <option>MacBook Pro Microphone</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Checklist */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <div className="inline-block px-3 py-1 bg-[#1a56db]/10 text-[#1a56db] rounded-md font-semibold text-sm mb-6 border border-[#1a56db]/20">
                                Lưu ý quan trọng
                            </div>

                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <div className="mt-0.5 text-gray-400"><Lightbulb size={20} /></div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">Ánh sáng đủ:</p>
                                        <p className="text-sm text-gray-500 mt-0.5">Đảm bảo khuôn mặt bạn được chiếu sáng rõ ràng, tránh ngồi ngược sáng.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="mt-0.5 text-gray-400"><Mic size={20} /></div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">Micro hoạt động:</p>
                                        <p className="text-sm text-gray-500 mt-0.5">Nói thử một vài câu để kiểm tra thanh âm lượng trên màn hình.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="mt-0.5 text-gray-400"><Shirt size={20} /></div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">Trang phục chuyên nghiệp:</p>
                                        <p className="text-sm text-gray-500 mt-0.5">Lựa chọn trang phục lịch sự như khi bạn đi phỏng vấn trực tiếp.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="mt-0.5 text-gray-400"><ImageIcon size={20} /></div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">Phông nền sạch sẽ:</p>
                                        <p className="text-sm text-gray-500 mt-0.5">Hạn chế các đồ vật gây xao nhãng hoặc người đi lại phía sau.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-[#e8f0fe] rounded-xl p-4 flex gap-3 text-sm text-[#144296]">
                            <Info size={20} className="shrink-0 text-[#1a56db]" />
                            <p>Buổi phỏng vấn này sẽ kéo dài khoảng 15 phút. Bạn sẽ có 30 giây chuẩn bị cho mỗi câu hỏi.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center max-w-xl mx-auto">
                    <button
                        onClick={() => navigate('/interview/room')}
                        className="w-full bg-[#3478ff] hover:bg-[#2a62d4] text-white py-3.5 rounded-lg font-medium shadow-sm transition-colors text-lg">
                        Bắt đầu phỏng vấn
                    </button>
                    <p className="text-xs text-gray-500 mt-3">
                        Bằng cách nhấn bắt đầu, bạn đồng ý với các <a href="#" className="underline text-gray-600">điều khoản ghi hình</a> của chúng tôi.
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}
