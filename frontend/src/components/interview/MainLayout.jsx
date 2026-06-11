import React from 'react';
import {Header} from '../layout/PublicHeader.jsx';
import {Footer} from '../layout/Footer.jsx';
import {useAuth} from "../../contexts/AuthContext.jsx";
import GuestHeader from "../layout/GuestHeader.jsx";


export function MainLayout({children}) {
    const {isLoggedIn} = useAuth();
    return (
        <div className="min-h-screen flex flex-col bg-surface-dim font-sans selection:bg-accent-light">
            {isLoggedIn ? <Header/> : <GuestHeader/>}
            <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto p-6 md:p-8">
                {children}
            </main>
            <Footer/>
        </div>
    );
}
