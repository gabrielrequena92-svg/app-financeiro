import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            backdropFilter: 'blur(4px)'
        }} onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                className="glass animate-fade-in"
                style={{
                    borderRadius: 'var(--radius)',
                    width: '100%',
                    maxWidth: '500px',
                    padding: '2rem',
                    margin: '1rem',
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
                    position: 'relative'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    {title && <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</h2>}
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'hsl(var(--muted-foreground))',
                            cursor: 'pointer',
                            fontSize: '1.5rem',
                            lineHeight: 1
                        }}
                    >
                        &times;
                    </button>
                </div>
                <div>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};
