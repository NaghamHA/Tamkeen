import React from 'react';

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact';
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showSubtitle = true,
  size = 'md',
  variant = 'full',
  light = false,
}) => {
  const sizeMap = {
    sm: { h: 'h-10', icon: 36, title: 'text-sm', sub: 'text-[10px]' },
    md: { h: 'h-14', icon: 52, title: 'text-base', sub: 'text-xs' },
    lg: { h: 'h-20', icon: 72, title: 'text-xl', sub: 'text-sm' },
    xl: { h: 'h-28', icon: 96, title: 'text-2xl', sub: 'text-base' },
  };

  const currentSize = sizeMap[size];

  const primaryColor = light ? '#5EEAD4' : '#13706A';
  const secondaryColor = light ? '#7DD3FC' : '#1E759A';
  const taglineColor = light ? '#99F6E4' : '#13706A';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Visual Logo SVG Element replicating the exact emblem */}
      <div className={`relative flex items-center justify-center shrink-0`}>
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          {/* Outer circular wheat ear arc */}
          <path
            d="M 40,110 C 20,70 50,30 90,25 C 110,22 135,30 155,50"
            stroke={primaryColor}
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Wheat grains */}
          {[
            { cx: 35, cy: 100, r: 6 },
            { cx: 30, cy: 85, r: 7 },
            { cx: 32, cy: 70, r: 8 },
            { cx: 40, cy: 55, r: 8 },
            { cx: 52, cy: 42, r: 8 },
            { cx: 68, cy: 32, r: 8 },
            { cx: 86, cy: 26, r: 8 },
            { cx: 105, cy: 25, r: 8 },
          ].map((grain, idx) => (
            <ellipse
              key={idx}
              cx={grain.cx}
              cy={grain.cy}
              rx={grain.r}
              ry={grain.r * 1.6}
              transform={`rotate(${-30 + idx * 12} ${grain.cx} ${grain.cy})`}
              fill={primaryColor}
            />
          ))}

          {/* Lower Arc */}
          <path
            d="M 35,120 C 50,175 120,185 160,140 C 170,125 175,100 170,80"
            stroke={primaryColor}
            strokeWidth="4"
            fill="none"
          />

          {/* Supporting Hand & Growing Plant */}
          <g transform="translate(60, 85) scale(0.45)">
            {/* Hand Contour */}
            <path
              d="M 10 110 C 30 110 50 120 70 120 C 90 120 110 105 130 90 C 135 86 142 90 140 96 C 132 110 110 130 85 130 C 55 130 35 118 10 118 Z"
              fill={primaryColor}
            />
            {/* Plant Sprout */}
            <path
              d="M 75 110 C 75 80 75 60 75 40 M 75 65 C 60 50 35 55 35 70 C 55 70 70 68 75 65 Z M 75 55 C 90 40 115 45 115 60 C 95 60 80 58 75 55 Z"
              fill={primaryColor}
              stroke={primaryColor}
              strokeWidth="3"
            />
          </g>

          {/* Inner Text "الزكاة والصدقات" styling */}
          <text
            x="110"
            y="75"
            textAnchor="middle"
            fill={secondaryColor}
            fontSize="26"
            fontWeight="600"
            fontFamily="Tajawal, sans-serif"
          >
            الـزّكاة
          </text>
          <text
            x="105"
            y="98"
            textAnchor="middle"
            fill={secondaryColor}
            fontSize="14"
            fontWeight="500"
            fontFamily="Tajawal, sans-serif"
          >
            والصَّدَقات
          </text>

          {/* Lower Arc Tagline "تنمية وتمكين" */}
          <text
            x="105"
            y="170"
            textAnchor="middle"
            fill={taglineColor}
            fontSize="15"
            fontWeight="600"
            fontFamily="Tajawal, sans-serif"
          >
            تـنـمـيـة و تـمـكـيـن
          </text>
        </svg>
      </div>

      {variant === 'full' && (
        <div className="flex flex-col text-right">
          <span className={`font-bold tracking-tight leading-tight ${light ? 'text-white drop-shadow-xs' : 'text-[#13706A]'} ${currentSize.title}`}>
            مؤسسة الزكاة والصدقات القطرية
          </span>
        </div>
      )}
    </div>
  );
};
