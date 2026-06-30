import { useLocation } from 'react-router-dom';

export default function RouteProgressBar() {
    const { pathname } = useLocation();
    return (
        <div
            key={pathname}
            className="route-progress-bar max-h-0"
            aria-hidden="true"
        />
    );
}

