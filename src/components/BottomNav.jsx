import { NavLink } from 'react-router-dom'
import './BottomNav.css'

const NAV_ITEMS = [
    {
        path: '/',
        label: '분석',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
            </svg>
        )
    },
    {
        path: '/calculator',
        label: '계산',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="8" y1="6" x2="16" y2="6" />
                <line x1="8" y1="10" x2="8" y2="10.01" />
                <line x1="12" y1="10" x2="12" y2="10.01" />
                <line x1="16" y1="10" x2="16" y2="10.01" />
                <line x1="8" y1="14" x2="8" y2="14.01" />
                <line x1="12" y1="14" x2="12" y2="14.01" />
                <line x1="16" y1="14" x2="16" y2="14.01" />
                <line x1="8" y1="18" x2="8" y2="18.01" />
                <line x1="12" y1="18" x2="16" y2="18" />
            </svg>
        )
    },
    {
        path: '/checklist',
        label: '체크',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
        )
    }
]

function BottomNav() {
    return (
        <nav className="bottom-nav">
            {NAV_ITEMS.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <span className="nav-icon">{item.icon}</span>
                </NavLink>
            ))}
        </nav>
    )
}

export default BottomNav
