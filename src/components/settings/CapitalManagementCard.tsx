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
  DialogTrigger,
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
    <div className="glass-card p-6 space-y-5">
      <h2 className="text-lg font-semibold">Capital Management</h2>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-accent/50">
          <p className="text-xs text-muted-foreground">Starting Capital</p>
          <p className="text-lg font-bold font-mono">₹{startingCapital.toLocaleString("en-IN")}</p>
        </div>
        <div className="p-3 rounded-lg bg-profit/5 border border-profit/10">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><ArrowDownToLine className="w-3 h-3 text-profit" /> Total Deposited</p>
          <p className="text-lg font-bold font-mono text-profit">₹{totalDeposited.toLocaleString("en-IN")}</p>
        </div>
        <div className="p-3 rounded-lg bg-loss/5 border border-loss/10">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><ArrowUpFromLine className="w-3 h-3 text-loss" /> Total Withdrawn</p>
          <p className="text-lg font-bold font-mono text-loss">₹{totalWithdrawn.toLocaleString("en-IN")}</p>
        </div>
        <div className="p-3 rounded-lg bg-accent/50">
          <p className="text-xs text-muted-foreground">Net Capital</p>
          <p className="text-lg font-bold font-mono">₹{netCapital.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={() => openDialog("DEPOSIT")} className="text-profit border-profit/30 hover:bg-profit/10">
          <Plus className="w-4 h-4 mr-1" /> Add Funds
        </Button>
        <Button variant="outline" size="sm" onClick={() => openDialog("WITHDRAWAL")} className="text-loss border-loss/30 hover:bg-loss/10">
          <Minus className="w-4 h-4 mr-1" /> Withdraw Funds
        </Button>
      </div>

      {/* Transaction history */}
      {transactions.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...transactions].reverse().map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-xs font-mono">{format(new Date(tx.transaction_date), "dd MMM yyyy")}</TableCell>
                  <TableCell>
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", tx.type === "DEPOSIT" ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss")}>
                      {tx.type}
                    </span>
                  </TableCell>
                  <TableCell className={cn("text-right font-mono text-sm", tx.type === "DEPOSIT" ? "text-profit" : "text-loss")}>
                    {tx.type === "DEPOSIT" ? "+" : "−"}₹{Number(tx.amount).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{tx.notes || "—"}</TableCell>
                  <TableCell>
                    <button onClick={() => deleteTransaction.mutate(tx.id)} className="text-muted-foreground hover:text-loss transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {transactions.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">No capital transactions recorded yet.</p>
      )}

      {/* Add/Withdraw Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{txType === "DEPOSIT" ? "Add Funds" : "Withdraw Funds"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50000" className="bg-accent border-border" />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} className="bg-accent border-border" />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Monthly SIP deposit" className="bg-accent border-border" rows={2} />
            </div>
            <Button onClick={handleSubmit} disabled={addTransaction.isPending || !amount} className="w-full bg-gradient-primary">
              {addTransaction.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {txType === "DEPOSIT" ? "Add Funds" : "Withdraw Funds"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
