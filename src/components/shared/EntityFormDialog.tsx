import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";

export interface FieldConfig {
  key: string;
  label: string;
  type?: "text" | "number";
  options?: string[];
  placeholder?: string;
  defaultValue?: string;
  optional?: boolean;
}

interface EntityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  fields: FieldConfig[];
  submitLabel?: string;
  onSubmit: (values: Record<string, string>) => void;
}

export function EntityFormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  submitLabel = "Simpan",
  onSubmit,
}: EntityFormDialogProps) {
  const buildInitial = () =>
    Object.fromEntries(fields.map((f) => [f.key, f.defaultValue ?? (f.options ? f.options[0] : "")]));

  const [values, setValues] = useState<Record<string, string>>(buildInitial);

  useEffect(() => {
    if (open) setValues(buildInitial());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = () => {
    const requiredOk = fields.every((f) => (f.options || f.optional ? true : values[f.key]?.toString().trim()));
    if (!requiredOk) return;
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">{f.label}</label>
              {f.options ? (
                <Select
                  value={values[f.key]}
                  onValueChange={(v) => setValues((prev) => ({ ...prev, [f.key]: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder={f.placeholder}
                  inputMode={f.type === "number" ? "numeric" : "text"}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>{submitLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
