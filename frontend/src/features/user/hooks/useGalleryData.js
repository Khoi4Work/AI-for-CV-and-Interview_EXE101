import { useEffect, useState } from 'react';
import galleryService from '../../../service/galleryService';
import { getApiErrorMessage } from '../../../service/apiClient';

export function useGalleryData(includeInterviews = false) {
    const [data, setData] = useState({ cvs: [], jds: [], sessions: [], errors: [], loading: true });
    const [revision, setRevision] = useState(0);
    useEffect(() => {
        let active = true;
        const requests = [galleryService.getGalleryAssets()];
        if (includeInterviews) requests.push(galleryService.getInterviewHistory());
        Promise.allSettled(requests).then(results => {
            if (!active) return;
            const [assets, interviews] = results;
            const errors = results.flatMap((result, index) => result.status === 'rejected'
                ? [`${index === 0 ? 'CV/JD' : 'Phỏng vấn'}: ${getApiErrorMessage(result.reason)}`] : []);
            setData({
                cvs: assets.status === 'fulfilled' && Array.isArray(assets.value?.cvs) ? assets.value.cvs : [],
                jds: assets.status === 'fulfilled' && Array.isArray(assets.value?.jds) ? assets.value.jds : [],
                sessions: interviews?.status === 'fulfilled' && Array.isArray(interviews.value) ? interviews.value : [],
                errors, loading: false,
            });
        });
        return () => { active = false; };
    }, [includeInterviews, revision]);
    const reload = () => {
        setData(previous => ({ ...previous, loading: true, errors: [] }));
        setRevision(previous => previous + 1);
    };
    const removeCV = id => setData(previous => ({ ...previous, cvs: previous.cvs.filter(cv => cv.id !== id) }));
    const removeJD = id => setData(previous => ({ ...previous, jds: previous.jds.filter(jd => jd.id !== id) }));
    const updateJD = updatedJD => setData(previous => ({
        ...previous,
        jds: previous.jds.map(jd => jd.id === updatedJD.id ? updatedJD : jd),
    }));
    return { ...data, reload, removeCV, removeJD, updateJD };
}
