export function getAllowedEditorTemplate(templates, id) {
    const template = templates.find(item => item.id === id);
    // Missing or unknown locked flags must not grant paid access.
    if (!template || template.locked !== false) {
        throw new Error('Gói CV hiện tại không cho phép dùng mẫu này. Vui lòng chọn mẫu được mở khóa.');
    }
    return template;
}

export function buildEditorPayload(name, content) {
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 100) throw new Error('Tên CV phải có từ 1 đến 100 ký tự.');
    return { name: trimmedName, content: structuredClone(content), templateId: content.selectedTemplateId };
}

// One writer per editor, including clicks before React rerenders. Retry is allowed after failure.
export function createEditorWriter(service) {
    let busy = false;
    return async ({ id, payload, validate, onSaved }) => {
        if (busy) return null;
        busy = true;
        try {
            await validate(payload.templateId);
            const result = id ? await service.updateCV(id, payload) : await service.createCV(payload);
            if (!result?.id) throw new Error('Máy chủ chưa trả về mã CV đã lưu.');
            onSaved(result);
            return result;
        } finally {
            busy = false;
        }
    };
}
