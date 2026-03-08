import { useState } from "react";
import { Plus, Minus, Trash2, Loader2, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCapitalTransactions } from "@/hooks/useCapitalTransactions";
import { useUserSettings } from "@/hooks/useUserSettings";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function CapitalManagementCard() {
  const { transactions, totalDeposited, totalWithdrawn, addTransaction, deleteTransaction } = useCapitalTransactions();
  const { settings } = useUserSettings();
  const startingCapital = (settings as any)?.starting_capital ?? 500000;
  const netCapital = startingCapital + totalDeposited - totalWithdrawn;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [txType, setTxType] = useState<"DEPOSIT" | "WITHDRAWAL">("DEPOSIT");
  const [amount, setAmount] = useState("");
  const [txDate, setTxDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");

  const openDialog = (type: "DEPOSIT" | "WITHDRAWAL") => {
    setTxType(type);
    setAmount("");
    setTxDate(format(new Date(), "yyyy-MM-dd"));
    setNotes("");
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    addTransaction.mutate(
      { type: txType, amount: numAmount, transaction_date: new Date(txDate).toISOString(), notes: notes || undefined },
      { onSuccess: () => setDialogOpen(false) }
    );
  };

  return (
    <div className="premium-card-hover p-5 space-y-4">
      <h2 className="text-[15px] font-semibold">Capital Management</h2>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="inner-panel !p-2.5">
          <p className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-wider">Starting</p>
          <p className="text-base font-bold font-mono mt-0.5">₹{startingCapital.toLocaleString("en-IN")}</p>
        </div>
        <div className="inner-panel !p-2.5 !border-profit/10">
          <p className="text-[10px] text-muted-foreground/50 font-medium flex items-center gap-1 uppercase tracking-wider"><ArrowDownToLine className="w-2.5 h-2.5 text-profit" /> Deposited</p>
          <p className="text-base font-bold font-mono text-profit mt-0.5">₹{totalDeposited.toLocaleString("en-IN")}</p>
        </div>
        <div className="inner-panel !p-2.5 !border-loss/10">
          <p className="text-[10px] text-muted-foreground/50 font-medium flex items-center gap-1 uppercase tracking-wider"><ArrowUpFromLine className="w-2.5 h-2.5 text-loss" /> Withdrawn</p>
          <p className="text-base font-bold font-mono text-loss mt-0.5">₹{totalWithdrawn.toLocaleString("en-IN")}</p>
        </div>
        <div className="inner-panel !p-2.5">
          <p className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-wider">Net Capital</p>
          <p className="text-base font-bold font-mono mt-0.5">₹{netCapital.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2.5">
        <Button variant="outline" size="sm" onClick={() => openDialog("DEPOSIT")} className="h-8 text-[11px] rounded-lg text-profit border-profit/20 hover:bg-profit/5">
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Funds
        </Button>
        <Button variant="outline" size="sm" onClick={() => openDialog("WITHDRAWAL")} className="h-8 text-[11px] rounded-lg text-loss border-loss/20 hover:bg-loss/5">
          <Minus className="w-3.5 h-3.5 mr-1" /> Withdraw Funds
        </Button>
      </div>

      {/* Transaction history */}
      {transactions.length > 0 && (
        <div className="border border-border/15 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/15">
                <TableHead className="text-[10px] py-2 px-3">Date</TableHead>
                <TableHead className="text-[10px] py-2 px-3">Type</TableHead>
                <TableHead className="text-[10px] py-2 px-3 text-right">Amount</TableHead>
                <TableHead className="text-[10px] py-2 px-3">Notes</TableHead>
                <TableHead className="w-8 py-2 px-2" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...transactions].reverse().map((tx) => (
                <TableRow key={tx.id} className="border-b border-border/10">
                  <TableCell className="text-[11px] font-mono py-2 px-3">{format(new Date(tx.transaction_date), "dd MMM yyyy")}</TableCell>
                  <TableCell className="py-2 px-3">
                    <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-md", tx.type === "DEPOSIT" ? "bg-profit/8 text-profit" : "bg-loss/8 text-loss")}>
                      {tx.type}
                    </span>
                  </TableCell>
                  <TableCell className={cn("text-right font-mono text-[12px] py-2 px-3", tx.type === "DEPOSIT" ? "text-profit" : "text-loss")}>
                    {tx.type === "DEPOSIT" ? "+" : "−"}₹{Number(tx.amount).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground/40 max-w-[150px] truncate py-2 px-3">{tx.notes || "—"}</TableCell>
                  <TableCell className="py-2 px-2">
                    <button onClick={() => deleteTransaction.mutate(tx.id)} className="text-muted-foreground/30 hover:text-loss transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {transactions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 rounded-lg border border-dashed border-border/20 bg-muted/[0.03]">
          <p className="text-[11px] text-muted-foreground/30">No capital transactions recorded yet</p>
        </div>
      )}

      {/* Add/Withdraw Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{txType === "DEPOSIT" ? "Add Funds" : "Withdraw Funds"}</DialogTitle>
            <p className="text-[12px] text-muted-foreground/50">
              {txType === "DEPOSIT" ? "Record a capital deposit to your trading account." : "Record a capital withdrawal from your trading account."}
            </p>
          </DialogHeader>
          <div className="space-y-3.5 pt-1">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-wider">Amount (₹)</Label>
              <Input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50000" className="bg-muted/20 border-border/20 h-9 text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-wider">Date</Label>
              <Input type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} className="bg-muted/20 border-border/20 h-9 text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-wider">Notes (optional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Monthly SIP deposit" className="bg-muted/20 border-border/20 text-[13px]" rows={2} />
            </div>
            <Button onClick={handleSubmit} disabled={addTransaction.isPending || !amount} className="w-full bg-gradient-primary h-9 text-[13px] rounded-lg">
              {addTransaction.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
              {txType === "DEPOSIT" ? "Add Funds" : "Withdraw Funds"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
