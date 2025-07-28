import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            {/* Background leaf shape */}
            <path
                d="M8 4C8 4 4 8 4 16C4 24 8 32 16 36C20 34 24 30 28 24C32 18 36 12 36 8C36 4 32 2 28 4C24 6 20 10 16 12C12 8 8 4 8 4Z"
                fill="#B4F069"
                fillOpacity="0.3"
            />
            
            {/* Main note/document shape */}
            <rect
                x="10"
                y="8"
                width="20"
                height="24"
                rx="2"
                fill="#F0FFE6"
                stroke="#145A2D"
                strokeWidth="1.5"
            />
            
            {/* Folded corner */}
            <path
                d="M26 8L30 12L26 12V8Z"
                fill="#145A2D"
            />
            
            {/* Note lines */}
            <line
                x1="13"
                y1="14"
                x2="24"
                y2="14"
                stroke="#64CD32"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <line
                x1="13"
                y1="17"
                x2="27"
                y2="17"
                stroke="#64CD32"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <line
                x1="13"
                y1="20"
                x2="22"
                y2="20"
                stroke="#64CD32"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <line
                x1="13"
                y1="23"
                x2="25"
                y2="23"
                stroke="#64CD32"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <line
                x1="13"
                y1="26"
                x2="21"
                y2="26"
                stroke="#64CD32"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            
            {/* Offline indicator - small circle */}
            <circle
                cx="32"
                cy="28"
                r="4"
                fill="#145A2D"
            />
            
            {/* Offline symbol - stylized connection bars */}
            <rect
                x="30"
                y="30"
                width="1"
                height="2"
                fill="#F0FFE6"
                rx="0.5"
            />
            <rect
                x="31.5"
                y="29"
                width="1"
                height="3"
                fill="#F0FFE6"
                rx="0.5"
            />
            <rect
                x="33"
                y="28"
                width="1"
                height="4"
                fill="#F0FFE6"
                rx="0.5"
            />
            
            {/* Small decorative elements - dots representing connection/sync */}
            <circle cx="16" cy="30" r="1" fill="#64CD32" opacity="0.6" />
            <circle cx="20" cy="29" r="1" fill="#64CD32" opacity="0.4" />
            <circle cx="24" cy="30" r="1" fill="#64CD32" opacity="0.6" />
        </svg>
    );
}