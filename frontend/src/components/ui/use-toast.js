import * as React from "react";

const ToastContext = React.createContext(null);

export function ToastProvider({ children }) {
    const [toastState, setToastState] = React.useState(null);

    const toast = (payload) => {
        setToastState(payload);
        setTimeout(() => setToastState(null), 2600);
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            {toastState ? (
                <div className="fixed bottom-4 right-4 z-50 w-[340px] rounded-2xl border border-white/10 bg-black/90 p-4 text-white shadow-xl">
                    <div className="text-sm font-semibold">{toastState.title}</div>
                    {toastState.description ? (
                        <div className="mt-1 text-xs text-white/70">{toastState.description}</div>
                    ) : null}
                </div>
            ) : null}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = React.useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider />");
    return ctx;
}
