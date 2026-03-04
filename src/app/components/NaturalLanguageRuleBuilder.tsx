import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Check } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rule: string) => Promise<void>;
}

export function NaturalLanguageRuleBuilder({ isOpen, onClose, onSave }: Props) {
    const [rule, setRule] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AnimatePresence>
                {isOpen && (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                            />
                        </Dialog.Overlay>
                        <Dialog.Content asChild>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="fixed left-[50%] top-[50%] z-50 w-full max-w-[480px] -translate-x-1/2 -translate-y-1/2"
                            >
                                <div
                                    className="overflow-hidden rounded-[20px] flex flex-col bg-background/90 backdrop-blur-[40px] saturate-150 border-[0.5px] border-black/10 dark:border-white/[0.15] shadow-[0_24px_48px_rgba(0,0,0,0.2)] dark:shadow-[0_24px_48px_rgba(0,0,0,0.4)]"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/[0.08]">
                                        <div className="flex items-center gap-2 text-foreground/90 dark:text-white/90">
                                            <Sparkles className="w-4 h-4 text-[#BF5AF2]" />
                                            <span className="text-[13px] font-medium">Advanced Rules</span>
                                        </div>
                                        <Dialog.Close asChild>
                                            <button className="text-foreground/40 hover:text-foreground/80 hover:bg-black/5 dark:text-white/40 dark:hover:text-white/80 transition-colors p-1 rounded-full dark:hover:bg-white/10">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </Dialog.Close>
                                    </div>

                                    {/* Body */}
                                    <div className="p-5 flex flex-col gap-4">
                                        <p className="text-[12px] text-muted-foreground leading-relaxed">
                                            Describe your rule in plain English. For example:
                                            <span className="text-foreground/70 dark:text-white/70 italic"> "Move all PDF invoices from last year to an Archive folder, but only if they are larger than 5MB."</span>
                                        </p>

                                        <div className="relative group">
                                            <textarea
                                                value={rule}
                                                onChange={(e) => setRule(e.target.value)}
                                                placeholder="Type your rule here..."
                                                className="w-full bg-black/5 dark:bg-black/20 text-foreground dark:text-white/90 text-[13px] rounded-xl p-4 min-h-[120px] resize-none focus:outline-none focus:ring-1 focus:ring-[#BF5AF2]/50 placeholder:text-muted-foreground transition-all border border-black/5 dark:border-white/5"
                                                autoFocus
                                            />
                                            {/* Magical glow effect behind textarea when focused */}
                                            <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-[#BF5AF2]/20 to-[#0A84FF]/20 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 blur-xl" />
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-black/5 dark:border-white/[0.08] bg-black/[0.02] dark:bg-black/10">
                                        <button
                                            onClick={onClose}
                                            disabled={isSubmitting}
                                            className="px-4 py-1.5 text-[12px] text-foreground/60 dark:text-white/60 hover:text-foreground/90 hover:bg-black/5 dark:hover:text-white/90 dark:hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={async () => {
                                                setIsSubmitting(true);
                                                try {
                                                    await onSave(rule);
                                                    setRule("");
                                                    onClose();
                                                } catch (e) {
                                                    console.error("Rule submission failed", e);
                                                } finally {
                                                    setIsSubmitting(false);
                                                }
                                            }}
                                            disabled={!rule.trim() || isSubmitting}
                                            className="flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white bg-[#BF5AF2] hover:bg-[#A940D9] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg shadow-[#BF5AF2]/20 transition-all active:scale-95"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Check className="w-3.5 h-3.5" />
                                            )}
                                            {isSubmitting ? "Thinking..." : "Create Rule"}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
}
