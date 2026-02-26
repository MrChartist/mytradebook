import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Shortcut {
    keys: string[];
    description: string;
}

const shortcuts: { section: string; items: Shortcut[] }[] = [
    {
        section: "General",
        items: [
            { keys: ["Ctrl", "K"], description: "Open command palette" },
            { keys: ["?"], description: "Show keyboard shortcuts" },
            { keys: ["Esc"], description: "Close dialog / modal" },
        ],
    },
    {
        section: "Navigation",
        items: [
            { keys: ["G", "D"], description: "Go to Dashboard" },
            { keys: ["G", "T"], description: "Go to Trades" },
            { keys: ["G", "J"], description: "Go to Journal" },
            { keys: ["G", "S"], description: "Go to Settings" },
        ],
    },
    {
        section: "Trades",
        items: [
            { keys: ["N"], description: "Create new trade" },
            { keys: ["B"], description: "Toggle bulk mode" },
        ],
    },
];

interface KeyboardShortcutsDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({ open: externalOpen, onOpenChange: externalOnOpenChange }: KeyboardShortcutsDialogProps = {}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = (val: boolean) => {
        setInternalOpen(val);
        externalOnOpenChange?.(val);
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (
                e.key === "?" &&
                !e.ctrlKey &&
                !e.metaKey &&
                !(e.target instanceof HTMLInputElement) &&
                !(e.target instanceof HTMLTextAreaElement)
            ) {
                e.preventDefault();
                // Toggle internal; if externally controlled, notify parent
                const next = !internalOpen;
                setInternalOpen(next);
                externalOnOpenChange?.(next);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Keyboard Shortcuts</DialogTitle>
                </DialogHeader>
                <div className="space-y-5 mt-2">
                    {shortcuts.map((group) => (
                        <div key={group.section}>
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                {group.section}
                            </h3>
                            <div className="space-y-1.5">
                                {group.items.map((s) => (
                                    <div
                                        key={s.description}
                                        className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <span className="text-sm text-foreground">{s.description}</span>
                                        <div className="flex items-center gap-1">
                                            {s.keys.map((key, i) => (
                                                <span key={i}>
                                                    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 bg-muted border border-border rounded text-xs font-mono font-medium text-muted-foreground">
                                                        {key}
                                                    </kbd>
                                                    {i < s.keys.length - 1 && (
                                                        <span className="text-muted-foreground mx-0.5 text-xs">+</span>
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                    Press <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-xs font-mono">?</kbd> to toggle this dialog
                </p>
            </DialogContent>
        </Dialog>
    );
}
