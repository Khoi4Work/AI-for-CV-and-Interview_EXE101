import { useEffect, useState } from 'react';
import { cvPipelineService } from '../../cv/services/cvPipelineService.js';
import { getApiErrorMessage } from '../../../service/apiClient.js';

export function useAnalysisHistory() {
    const [page, setPage] = useState(0);
    const [revision, setRevision] = useState(0);
    const [state, setState] = useState({ items: [], loading: true, error: '', hasNext: false });
    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        cvPipelineService.getAnalysisHistory(page, controller.signal).then(result => {
            if (!active) return;
            setState(previous => ({
                items: [...new Map([...(page === 0 ? [] : previous.items), ...(result?.items || [])]
                    .map(item => [item.analysisId, item])).values()],
                loading: false, error: '', hasNext: Boolean(result?.hasNext),
            }));
        }).catch(error => {
            if (active) setState(previous => ({ ...previous, loading: false, error: getApiErrorMessage(error) }));
        });
        return () => { active = false; controller.abort(); };
    }, [page, revision]);
    const loadMore = () => {
        if (state.loading || !state.hasNext || state.error) return;
        setState(previous => ({ ...previous, loading: true }));
        setPage(previous => previous + 1);
    };
    const retry = () => {
        setState(previous => ({ ...previous, loading: true, error: '' }));
        setRevision(previous => previous + 1);
    };
    return { ...state, loadMore, retry };
}
