import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
    className = '',
    variant = 'primary',
    size = 'md',
    style,
    ...props
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'secondary':
                return { backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' };
            case 'outline':
                return { backgroundColor: 'transparent', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' };
            case 'ghost':
                return { backgroundColor: 'transparent', color: 'hsl(var(--muted-foreground))' };
            default:
                return {
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    boxShadow: '0 4px 14px 0 hsla(263, 70%, 50%, 0.39)'
                };
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return { padding: '0.25rem 0.5rem', fontSize: '0.875rem' };
            case 'lg':
                return { padding: '0.75rem 1.5rem', fontSize: '1.125rem' };
            default:
                return { padding: '0.5rem 1rem', fontSize: '1rem' };
        }
    };

    return (
        <button
            className={`btn transition-all ${className}`}
            style={{
                ...getVariantStyles(),
                ...getSizeStyles(),
                ...style
            }}
            {...props}
        />
    );
};
