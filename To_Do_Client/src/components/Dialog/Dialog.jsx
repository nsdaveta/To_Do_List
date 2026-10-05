import React, { useEffect, useState } from 'react';
import { useDialog } from './DialogContext';
import './Dialog.css';
import { playDialogAppearSound } from '../../hooks/useSounds';

const Dialog = () => {
    const { dialogConfig } = useDialog();
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (dialogConfig) {
            setIsVisible(true);
            setIsClosing(false);
            playDialogAppearSound();
        } else {
            setIsClosing(true);
            const timer = setTimeout(() => {
                if (!dialogConfig) {
                    setIsVisible(false);
                    setIsClosing(false);
                }
            }, 300); // Match CSS animation duration
            return () => clearTimeout(timer);
        }
    }, [dialogConfig]);

    if (!isVisible && !isClosing) return null;

    const { title, message, kind, onConfirm, onCancel } = dialogConfig || {};

    return (
        <div className={`dialog-overlay ${isClosing ? 'fade-out' : 'fade-in'}`} onClick={onCancel}>
            <div className={`dialog-container ${isClosing ? 'scale-down' : 'scale-up'} kind-${kind}`} onClick={e => e.stopPropagation()}>
                <div className="dialog-header">
                    <h3>{title || 'Confirmation'}</h3>
                </div>
                <div className="dialog-body">
                    <p>{message}</p>
                </div>
                <div className="dialog-footer">
                    <button className="dialog-btn btn-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button 
                        className={`dialog-btn btn-confirm`} 
                        onClick={onConfirm}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dialog;
