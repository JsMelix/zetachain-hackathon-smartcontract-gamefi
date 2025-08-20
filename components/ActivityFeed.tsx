
import React, { useRef, useEffect } from 'react';
import type { ActivityLog } from '../types';
import { Card } from './Card';

interface ActivityFeedProps {
  logs: ActivityLog[];
}

const getStatusStyles = (status: 'success' | 'pending' | 'error') => {
    switch(status) {
        case 'success': return 'border-green-500/50 text-green-300';
        case 'pending': return 'border-yellow-500/50 text-yellow-300';
        case 'error': return 'border-red-500/50 text-red-300';
    }
}

const LogIcon = ({ status }: { status: 'success' | 'pending' | 'error' }) => {
    switch(status) {
        case 'success': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'pending': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8v0a8 8 0 018 8v0a8 8 0 01-8 8v0a8 8 0 01-8-8v0z" /></svg>;
        case 'error': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
}


export const ActivityFeed: React.FC<ActivityFeedProps> = ({ logs }) => {
    const feedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <Card title="Activity Feed" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>}>
            <div ref={feedRef} className="h-[calc(100vh-250px)] overflow-y-auto pr-2 -mr-4 space-y-3">
                {logs.length === 0 && (
                    <p className="text-slate-500 text-center pt-10">No recent activity.</p>
                )}
                {logs.map((log) => (
                    <div 
                        key={log.id} 
                        className={`
                            p-3 rounded-md bg-slate-800/50 
                            border-l-4
                            transition-all duration-300
                            ${getStatusStyles(log.status)}
                        `}
                    >
                        <div className="flex items-start space-x-3">
                           <div className="flex-shrink-0 pt-1">
                                <LogIcon status={log.status} />
                           </div>
                           <div>
                                <p className="text-sm text-slate-300">{log.message}</p>
                                <p className="text-xs text-slate-500 font-mono">{log.timestamp}</p>
                           </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};
