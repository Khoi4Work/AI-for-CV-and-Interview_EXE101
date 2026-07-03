export function PaymentNotes() {
    const notes = [
        "Đơn hàng sẽ được xử lý ngay sau khi thanh toán thành công.",
        "Gói dịch vụ sẽ tự động gia hạn vào cuối chu kỳ. Bạn có thể hủy bất kỳ lúc nào.",
        "Nếu thanh toán thất bại, vui lòng thử lại hoặc chọn phương thức khác."
    ];

    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-white text-sm font-medium">3. Lưu ý thanh toán</h2>
            <div className="bg-[#1b2a36] rounded-xl p-5 flex flex-col gap-3.5">
                {notes.map((note, index) => (
                    <div key={index} className="flex gap-3 items-start">
                        <div className="w-[18px] h-[18px] rounded-full bg-[#1c8c54] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                            i
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{note}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
