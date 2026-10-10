export function normalizeInterviewType(value) {
    const type=String(value || '').trim().toUpperCase();
    if(type==='STAR' || type==='BEHAVIORAL') return 'BEHAVIORAL';
    if(type==='HR' || type==='TECHNICAL') return type;
    throw new Error('Loại phỏng vấn không hợp lệ.');
}
export function interviewPayload(data) {
    const config=data.interviewConfig || {};
    const payload={interviewType:normalizeInterviewType(config.type),durationMinutes:Number(config.duration),
        experienceLevel:String(data.experienceLevel || '').toUpperCase(),language:config.language || 'vi',
        cvId:data.cvId || undefined,adaptiveMode:false};
    if(config.jdId) payload.jdId=config.jdId;
    else if(config.jd?.trim()) payload.jdText=config.jd.trim();
    return payload;
}
export function interviewFingerprint(data) {return JSON.stringify(interviewPayload(data));}
