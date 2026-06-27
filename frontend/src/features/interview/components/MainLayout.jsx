import React from 'react';
import {Header} from '../../../components/layout/PublicHeader.jsx';
import {Footer} from '../../../components/layout/Footer.jsx';
import {useAuth} from "../../auth/contexts/AuthContext.jsx";
import GuestHeader from "../../../components/layout/GuestHeader.jsx";


export function MainLayout({children, bgClass = "bg-surface-dim"}) {
    const {isLoggedIn} = useAuth();
    return (
        <div className={`min-h-screen flex flex-col ${bgClass} font-sans selection:bg-accent-light`}>
            {isLoggedIn ? <Header/> : <GuestHeader/>}
            <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto p-6 md:p-8">
                {children}
            </main>
            <Footer/>
        </div>
    );
}
