function cleanFilename(value) {
    return (value || 'buoi-phong-van')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'buoi-phong-van';
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadInterviewTranscript(data, feedback = null) {
    const answers = new Map((data.answers || []).map((answer) => [
        String(answer.qid ?? answer.questionId ?? answer.id ?? ''),
        answer,
    ]));
    const reviewedEntries = feedback?.transcript || [];
    const reviewed = new Map(reviewedEntries.map((entry) => [String(entry.qid ?? entry.questionId ?? ''), entry]));
    const userTranscript = (data.transcriptLog || []).filter((entry) => entry.role === 'user');
    const lines = [
        'BẢN GHI CUỘC PHỎNG VẤN',
        `Vị trí: ${data.job?.title || data.job?.name || 'Chưa xác định'}`,
        `Loại phỏng vấn: ${data.interviewConfig?.type || 'Chưa xác định'}`,
        `Ngày: ${new Date(data.startedAt || Date.now()).toLocaleString('vi-VN')}`,
        '',
    ];

    (data.questions || []).forEach((question, index) => {
        const questionId = String(question.id ?? question.questionId ?? '');
        const answer = answers.get(questionId) || (data.answers || [])[index];
        const assessment = reviewed.get(questionId) || reviewedEntries[index];
        const transcriptAnswer = userTranscript[index]?.text || '';
        const answerText = answer?.text || answer?.answerText || answer?.answer || assessment?.answer || transcriptAnswer;
        const skipped = Boolean(answer?.skipped ?? answer?.isSkipped)
            || answerText === '(bỏ qua)'
            || assessment?.status === 'skipped';
        lines.push(`NHÀ TUYỂN DỤNG — Câu ${index + 1}`, question.text || '', '');
        lines.push('ỨNG VIÊN', skipped ? '(Đã bỏ qua câu hỏi này)' : (answerText || '(Chưa có câu trả lời)'), '');
        if (assessment?.assessment) lines.push('ĐÁNH GIÁ', assessment.assessment, '');
        for (const suggestion of assessment?.suggestions || []) {
            if (suggestion?.text) lines.push('GỢI Ý', suggestion.text, '');
        }
        lines.push('');
    });

    if (feedback) {
        lines.push('TỔNG KẾT ĐÁNH GIÁ', `Điểm: ${feedback.overallScore ?? '—'}/100`, feedback.summary || '', '');
        if (feedback.strengths?.length) lines.push('Điểm mạnh', ...feedback.strengths.map((item) => `- ${item}`), '');
        if (feedback.improvementAreas?.length) lines.push('Điểm cần cải thiện', ...feedback.improvementAreas.map((item) => `- ${item}`), '');
        if (feedback.recommendations?.length) lines.push('Đề xuất luyện tập', ...feedback.recommendations.map((item) => `- ${item}`), '');
    }

    const content = `\uFEFF${lines.join('\n')}`;
    downloadBlob(new Blob([content], {type: 'text/plain;charset=utf-8'}), `${cleanFilename(data.job?.title || data.job?.name)}-hoi-thoai.txt`);
}

export function downloadLocalInterviewAudio(blob, sessionId, language = 'vi') {
    const extension = blob.type.includes('mp4') ? 'mp4' : 'webm';
    downloadBlob(blob, `phong-van-${language}-${String(sessionId).slice(0, 8)}.${extension}`);
}
