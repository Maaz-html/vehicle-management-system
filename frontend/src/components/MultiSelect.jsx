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
                className="input cursor-pointer flex justify-between items-center bg-white min-h-[42px]"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-wrap gap-1">
                    {selected.length === 0 ? (
                        <span className="text-gray-400">{placeholder}</span>
                    ) : (
                        selected.map(item => (
                            <span key={item} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {item}
                                <span className="ml-1 font-bold hover:text-blue-900" onClick={(e) => {
                                    e.stopPropagation();
                                    toggleOption(item);
                                }}>&times;</span>
                            </span>
                        ))
                    )}
                </div>
                <div className="text-gray-400">
                    <svg className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {options.map(option => (
                        <div
                            key={option}
                            className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center ${selected.includes(option) ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                            onClick={() => toggleOption(option)}
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(option)}
                                readOnly
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            {option}
                        </div>
                    ))}
                    {/* Add Custom Option */}

                </div>
            )}
        </div>
    );
};

export default MultiSelect;
