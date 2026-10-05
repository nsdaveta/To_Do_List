import React, { createContext, useState, useContext, useCallback } from 'react';

const DialogContext = createContext();

export const DialogProvider = ({ children }) => {
    const [dialogConfig, setDialogConfig] = useState(null);

    const ask = useCallback((message, options = {}) => {
        return new Promise((resolve) => {
            setDialogConfig({
                message,
                title: options.title || 'Confirmation',
                kind: options.kind || 'info',
                onConfirm: () => {
                    setDialogConfig(null);
                    resolve(true);
                },
                onCancel: () => {
                    setDialogConfig(null);
                    resolve(false);
                }
            });
        });
    }, []);

    return (
        <DialogContext.Provider value={{ ask, dialogConfig }}>
            {children}
        </DialogContext.Provider>
    );
};

export const useDialog = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialog must be used within a DialogProvider');
    }
    return context;
};
