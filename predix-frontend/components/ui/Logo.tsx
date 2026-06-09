import React from 'react';
import { Globe2 } from 'lucide-react';

export default function Logo({ 
  className = "h-10 w-10", 
  iconSize = "65%",
  icon: Icon = Globe2
}: { 
  className?: string, 
  iconSize?: string | number,
  icon?: React.ElementType
}) {
  return (
    <div className={`relative flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-sm text-white overflow-hidden ${className}`}>
      {/* Decorative reflection */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 blur-sm rounded-b-full translate-y-[-50%]"></div>
      <Icon size={iconSize} strokeWidth={2.5} className="relative z-10" />
    </div>
  );
}
