import React from 'react';
import { Card, Badge, Button } from '../components/ui/core';
import { Plus, CheckCircle2, AlertCircle } from 'lucide-react';

export const MyCVsPage = () => {
    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-[#10B981]">Danh sách CV của tôi</h1>
                <Button variant="primary" className="flex items-center gap-2 rounded-full px-6">
                    <Plus size={18} />
                    Tạo CV mới
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                {/* Create New Card Placeholder */}
                <div className="h-[400px] rounded-xl border-2 border-dashed border-[#1E2E42] hover:border-[#10B981] bg-[#0A1118] flex flex-col items-center justify-center text-center p-6 cursor-pointer transition-colors group">
                    <div className="w-14 h-14 rounded-full bg-[#1E2E42] group-hover:bg-[#10B981]/20 flex items-center justify-center mb-4 transition-colors">
                        <Plus size={24} className="text-[#94A3B8] group-hover:text-[#10B981]" />
                    </div>
                    <h3 className="text-white font-bold mb-2">Tạo CV mới</h3>
                    <p className="text-[#64748B] text-sm">Sử dụng AI để khởi tạo nội dung chuyên nghiệp</p>
                </div>

                {/* CV Card 1 */}
                <Card className="h-[400px] flex flex-col relative overflow-hidden group border-none bg-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-1 bg-white m-3 rounded-lg flex items-start justify-between p-3 border border-slate-200">
                        <Badge variant="success" className="bg-emerald-500/20 text-emerald-600 text-[10px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Hoàn thành
                        </Badge>
                    </div>
                    <div className="p-5 pt-2">
                        <h3 className="text-lg font-bold text-[#0F172A] mb-1">Software Engineer 2024</h3>
                        <p className="text-[#475569] text-xs mb-3">Cập nhật: 2 giờ trước</p>
                        <div className="flex items-center gap-2 text-sm">
                            <SparkleIcon />
                            <span className="text-[#475569]">Độ tối ưu:</span>
                            <span className="text-[#10B981] font-bold">92%</span>
                        </div>
                    </div>
                </Card>

                {/* CV Card 2 */}
                <Card className="h-[400px] flex flex-col relative overflow-hidden group border-none bg-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-1 bg-white m-3 rounded-lg flex justify-end p-3 border border-slate-200">
                        <Badge variant="success" className="bg-emerald-500/20 text-emerald-600 text-[10px]">
                            AI Optimized
                        </Badge>
                    </div>
                    <div className="p-5 pt-2">
                        <h3 className="text-lg font-bold text-[#0F172A] mb-1">Product Manager Senior</h3>
                        <p className="text-[#475569] text-xs mb-3">Cập nhật: Hôm qua</p>
                        <div className="flex items-start gap-2 text-sm text-[#475569]">
                            <CheckCircle2 size={16} className="text-[#10B981] shrink-0 mt-0.5" />
                            <p>Phù hợp: 85% với mô tả công việc</p>
                        </div>
                    </div>
                </Card>

                {/* CV Card 3 */}
                <Card className="h-[400px] flex flex-col relative overflow-hidden group border-none bg-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-1 bg-white m-3 rounded-lg flex items-start justify-between p-3 border border-slate-200">
                        <Badge variant="success" className="bg-emerald-500/20 text-emerald-600 text-[10px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Hoàn thành
                        </Badge>
                    </div>
                    <div className="p-5 pt-2">
                        <h3 className="text-lg font-bold text-[#0F172A] mb-1">Marketing Specialist</h3>
                        <p className="text-[#475569] text-xs mb-3">Cập nhật: 3 ngày trước</p>
                        <div className="space-y-2 mb-3">
                            <div className="flex items-start gap-2 text-xs text-[#475569]">
                                <CheckCircle2 size={14} className="text-[#10B981] shrink-0 mt-0.5" />
                                <p>Phù hợp: 85% với mô tả công việc</p>
                            </div>
                            <div className="flex items-start gap-2 text-xs text-[#475569]">
                                <CheckCircle2 size={14} className="text-[#10B981] shrink-0 mt-0.5" />
                                <p>Phù hợp: 85% với mô tả công việc</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <SparkleIcon />
                            <span className="text-[#475569]">Độ tối ưu:</span>
                            <span className="text-[#10B981] font-bold">92%</span>
                        </div>
                    </div>
                </Card>

                {/* CV Card 4 */}
                <Card className="h-[400px] flex flex-col relative overflow-hidden group border-none bg-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-1 bg-white m-3 rounded-lg flex justify-end p-3 border border-slate-200">
                        <Badge variant="success" className="bg-emerald-500/20 text-emerald-600 text-[10px]">
                            AI Optimized
                        </Badge>
                    </div>
                    <div className="p-5 pt-2">
                        <h3 className="text-lg font-bold text-[#0F172A] mb-1">Product Manager Senior</h3>
                        <p className="text-[#475569] text-xs mb-3">Cập nhật: Hôm qua</p>
                        <div className="flex items-start gap-2 text-sm text-[#475569]">
                            <CheckCircle2 size={16} className="text-[#10B981] shrink-0 mt-0.5" />
                            <p>Phù hợp: 85% với mô tả công việc</p>
                        </div>
                    </div>
                </Card>

                {/* CV Card 5 */}
                <Card className="h-[400px] flex flex-col relative overflow-hidden group border-none bg-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-1 bg-slate-200 m-3 rounded-lg flex items-start justify-between p-3 border border-slate-300">
                        <Badge variant="default" className="bg-slate-300 text-slate-700 text-[10px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                            Bản nháp
                        </Badge>
                    </div>
                    <div className="p-5 pt-2">
                        <h3 className="text-lg font-bold text-slate-500 mb-1">Data Analyst Resume</h3>
                        <p className="text-[#475569] text-xs">Cập nhật: 1 tuần trước</p>
                    </div>
                </Card>

                {/* CV Card 6 */}
                <Card className="h-[400px] flex flex-col relative overflow-hidden group border-none bg-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-1 bg-slate-200 m-3 rounded-lg flex items-start justify-between p-3 border border-slate-300">
                        <Badge variant="default" className="bg-slate-300 text-slate-700 text-[10px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                            Bản nháp
                        </Badge>
                    </div>
                    <div className="p-5 pt-2">
                        <h3 className="text-lg font-bold text-[#0F172A] mb-1">Data Analyst Resume</h3>
                        <p className="text-[#475569] text-xs mb-3">Cập nhật: 1 tuần trước</p>
                        <div className="flex items-center gap-2 text-sm mb-2">
                            <SparkleIcon />
                            <span className="text-[#475569]">Độ tối ưu:</span>
                            <span className="text-[#10B981] font-bold">92%</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-[#475569]">
                            <CheckCircle2 size={14} className="text-[#10B981] shrink-0 mt-0.5" />
                            <p>Phù hợp: 85% với mô tả công việc</p>
                        </div>
                    </div>
                </Card>

            </div>
        </div>
    );
};

// Simple inline SVG icon for sparkle
const SparkleIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.33334 1.33334L8.71801 5.94868L13.3333 7.33334L8.71801 8.71801L7.33334 13.3333L5.94868 8.71801L1.33334 7.33334L5.94868 5.94868L7.33334 1.33334Z" fill="#10B981"/>
    </svg>
);
