import React from 'react';
import './NumericDialer.scss';

interface NumericDialerProps {
    value: string;
    onChange: (value: string) => void;
    maxLength?: number;
    placeholder?: string;
}

const NumericDialer: React.FC<NumericDialerProps> = ({
    value,
    onChange,
    maxLength = 5,
    placeholder = 'Enter zipcode'
}) => {
    const handleNumberClick = (num: string) => {
        if (value.length < maxLength) {
            onChange(value + num);
        }
    };

    const handleBackspace = () => {
        onChange(value.slice(0, -1));
    };

    const handleClear = () => {
        onChange('');
    };

    return (
        <div className="numeric-dialer-container">
            <div className="numeric-dialer-display">
                <input
                    type="text"
                    value={value}
                    readOnly
                    placeholder={placeholder}
                    className="numeric-dialer-input"
                    maxLength={maxLength}
                />
            </div>
            <div className="numeric-dialer-keypad">
                <div className="numeric-dialer-row">
                    <button
                        type="button"
                        className="numeric-dialer-key"
                        onClick={() => handleNumberClick('1')}
                    >
                        1
                    </button>
                    <button
                        type="button"
                        className="numeric-dialer-key"
                        onClick={() => handleNumberClick('2')}
                    >
                        2
                    </button>
                    <button
                        type="button"
                        className="numeric-dialer-key"
                        onClick={() => handleNumberClick('3')}
                    >
                        3
                    </button>
                </div>
                <div className="numeric-dialer-row">
                    <button
                        type="button"
                        className="numeric-dialer-key"
                        onClick={() => handleNumberClick('4')}
                    >
                        4
                    </button>
                    <button
                        type="button"
                        className="numeric-dialer-key"
                        onClick={() => handleNumberClick('5')}
                    >
                        5
                    </button>
                    <button
                        type="button"
                        className="numeric-dialer-key"
                        onClick={() => handleNumberClick('6')}
                    >
                        6
                    </button>
                </div>
                <div className="numeric-dialer-row">
                    <button
                        type="button"
                        className="numeric-dialer-key"
                        onClick={() => handleNumberClick('7')}
                    >
                        7
                    </button>
                    <button
                        type="button"
                        className="numeric-dialer-key"
                        onClick={() => handleNumberClick('8')}
                    >
                        8
                    </button>
                    <button
                        type="button"
                        className="numeric-dialer-key"
                        onClick={() => handleNumberClick('9')}
                    >
                        9
                    </button>
                </div>
                <div className="numeric-dialer-row">
                    <button
                        type="button"
                        className="numeric-dialer-key numeric-dialer-key-clear"
                        onClick={handleClear}
                    >
                        Clear
                    </button>
                    <button
                        type="button"
                        className="numeric-dialer-key"
                        onClick={() => handleNumberClick('0')}
                    >
                        0
                    </button>
                    <button
                        type="button"
                        className="numeric-dialer-key numeric-dialer-key-backspace"
                        onClick={handleBackspace}
                        disabled={value.length === 0}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                            <line x1="18" y1="9" x2="12" y2="15"></line>
                            <line x1="12" y1="9" x2="18" y2="15"></line>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NumericDialer;

