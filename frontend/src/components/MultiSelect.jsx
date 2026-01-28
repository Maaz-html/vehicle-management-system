import { useState, useEffect, useRef } from 'react';

const MultiSelect = ({ options, selected, onChange, placeholder = 'Select options' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (option) => {
        let newSelected;
        if (selected.includes(option)) {
            newSelected = selected.filter(item => item !== option);
        } else {
            newSelected = [...selected, option];
        }
        onChange(newSelected);
    };

    return (
        <div className="relative" ref={containerRef}>
            <div
                className="input cursor-pointer flex justify-between items-center bg-zinc-900/50 min-h-[46px] border border-zinc-800 transition-all hover:border-zinc-700"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-wrap gap-2">
                    {selected.length === 0 ? (
                        <span className="text-zinc-500 text-sm">{placeholder}</span>
                    ) : (
                        selected.map(item => (
                            <span key={item} className="bg-blue-600/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border border-blue-500/20 flex items-center">
                                {item}
                                <span className="ml-1.5 hover:text-white transition-colors cursor-pointer" onClick={(e) => {
                                    e.stopPropagation();
                                    toggleOption(item);
                                }}>&times;</span>
                            </span>
                        ))
                    )}
                </div>
                <div className="text-zinc-600">
                    <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-[100] w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-h-64 overflow-y-auto backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                    {options.map(option => (
                        <div
                            key={option}
                            className={`px-4 py-3 cursor-pointer hover:bg-zinc-800 flex items-center transition-colors ${selected.includes(option) ? 'bg-blue-600/5 text-blue-400' : 'text-zinc-400'}`}
                            onClick={() => toggleOption(option)}
                        >
                            <div className={`mr-3 w-4 h-4 rounded border flex items-center justify-center transition-all ${selected.includes(option) ? 'bg-blue-600 border-blue-600' : 'border-zinc-700 bg-zinc-800'}`}>
                                {selected.includes(option) && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-sm font-medium">{option}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultiSelect;
