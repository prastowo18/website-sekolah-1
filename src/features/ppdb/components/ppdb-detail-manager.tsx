"use client";

import {
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  ListChecks,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { startTransition, useActionState, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  createPpdbFeeAction,
  createPpdbFlowStepAction,
  createPpdbRequirementAction,
  createPpdbTimelineAction,
  deletePpdbFeeAction,
  deletePpdbFlowStepAction,
  deletePpdbRequirementAction,
  deletePpdbTimelineAction,
  updatePpdbFeeAction,
  updatePpdbFlowStepAction,
  updatePpdbRequirementAction,
  updatePpdbTimelineAction,
} from "@/features/ppdb/actions";
import {
  ppdbFeeTypeLabels,
  ppdbFeeTypes,
  type PpdbFeeTypeValue,
} from "@/features/ppdb/constants";
import {
  initialPpdbFeeActionState,
  initialPpdbFlowStepActionState,
  initialPpdbRequirementActionState,
  initialPpdbTimelineActionState,
  type PpdbFeeActionState,
  type PpdbFlowStepActionState,
  type PpdbRequirementActionState,
  type PpdbTimelineActionState,
} from "@/features/ppdb/types";
import { useActionToast } from "@/hooks/use-action-toast";

export type EditablePpdbTimeline = {
  id: string;
  ppdbId: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type EditablePpdbRequirement = {
  id: string;
  ppdbId: string;
  title: string;
  description: string | null;
  isRequired: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type EditablePpdbFlowStep = {
  id: string;
  ppdbId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type EditablePpdbFee = {
  id: string;
  ppdbId: string;
  name: string;
  feeType: PpdbFeeTypeValue;
  amount: string | null;
  description: string | null;
  isOptional: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type PpdbDetailManagerProps = {
  ppdbId: string;
  timelineItems: EditablePpdbTimeline[];
  requirements: EditablePpdbRequirement[];
  flowSteps: EditablePpdbFlowStep[];
  fees: EditablePpdbFee[];
  canEdit: boolean;
};

function ErrorText({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

function isoToWibLocal(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const wibDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  return wibDate.toISOString().slice(0, 16);
}

function wibLocalToIso(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}:00+07:00`);

  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Tidak ditentukan";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

function formatAmount(value: string | null) {
  if (!value) {
    return "Belum ditentukan";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return value;
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function TimelineDialog({
  ppdbId,
  item,
}: {
  ppdbId: string;
  item?: EditablePpdbTimeline;
}) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(
    isoToWibLocal(item?.startDate ?? null),
  );
  const [endDate, setEndDate] = useState(isoToWibLocal(item?.endDate ?? null));

  const isEdit = item !== undefined;
  const action = isEdit ? updatePpdbTimelineAction : createPpdbTimelineAction;

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: PpdbTimelineActionState,
      formData: FormData,
    ): Promise<PpdbTimelineActionState> => {
      const nextState = await action(previousState, formData);

      if (nextState.status === "success") {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    initialPpdbTimelineActionState,
  );

  useActionToast(state);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size={isEdit ? "sm" : "default"}
          variant={isEdit ? "outline" : "default"}
        >
          {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}
          {isEdit ? "Edit" : "Tambah jadwal"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit jadwal PPDB" : "Tambah jadwal PPDB"}
          </DialogTitle>
          <DialogDescription>
            Atur periode dan urutan jadwal PPDB. Waktu menggunakan WIB.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-5" noValidate>
          <input type="hidden" name="ppdbId" value={ppdbId} />

          {item ? <input type="hidden" name="id" value={item.id} /> : null}

          {state.status === "error" && state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label>Judul jadwal</Label>
            <Input
              name="title"
              defaultValue={item?.title ?? ""}
              maxLength={160}
              disabled={isPending}
              required
            />
            <ErrorText message={state.fieldErrors?.title?.[0]} />
          </div>

          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <Textarea
              name="description"
              defaultValue={item?.description ?? ""}
              rows={4}
              maxLength={20000}
              disabled={isPending}
            />
            <ErrorText message={state.fieldErrors?.description?.[0]} />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Mulai</Label>

              <input
                type="hidden"
                name="startDate"
                value={wibLocalToIso(startDate)}
              />

              <Input
                type="datetime-local"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                }}
                disabled={isPending}
              />

              <ErrorText message={state.fieldErrors?.startDate?.[0]} />
            </div>

            <div className="space-y-2">
              <Label>Selesai</Label>

              <input
                type="hidden"
                name="endDate"
                value={wibLocalToIso(endDate)}
              />

              <Input
                type="datetime-local"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value);
                }}
                disabled={isPending}
              />

              <ErrorText message={state.fieldErrors?.endDate?.[0]} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Urutan tampil</Label>
            <Input
              name="sortOrder"
              type="number"
              defaultValue={item?.sortOrder ?? 0}
              min={0}
              max={9999}
              step={1}
              disabled={isPending}
              required
            />
            <ErrorText message={state.fieldErrors?.sortOrder?.[0]} />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Batal
              </Button>
            </DialogClose>

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Menyimpan...
                </>
              ) : (
                "Simpan jadwal"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RequirementDialog({
  ppdbId,
  item,
}: {
  ppdbId: string;
  item?: EditablePpdbRequirement;
}) {
  const [open, setOpen] = useState(false);
  const [isRequired, setIsRequired] = useState(item?.isRequired ?? true);

  const isEdit = item !== undefined;
  const action = isEdit
    ? updatePpdbRequirementAction
    : createPpdbRequirementAction;

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: PpdbRequirementActionState,
      formData: FormData,
    ): Promise<PpdbRequirementActionState> => {
      const nextState = await action(previousState, formData);

      if (nextState.status === "success") {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    initialPpdbRequirementActionState,
  );

  useActionToast(state);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size={isEdit ? "sm" : "default"}
          variant={isEdit ? "outline" : "default"}
        >
          {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}
          {isEdit ? "Edit" : "Tambah persyaratan"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit persyaratan" : "Tambah persyaratan"}
          </DialogTitle>
          <DialogDescription>
            Tambahkan dokumen atau ketentuan yang perlu disiapkan calon siswa.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-5" noValidate>
          <input type="hidden" name="ppdbId" value={ppdbId} />

          {item ? <input type="hidden" name="id" value={item.id} /> : null}

          {state.status === "error" && state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label>Judul persyaratan</Label>
            <Input
              name="title"
              defaultValue={item?.title ?? ""}
              maxLength={180}
              disabled={isPending}
              required
            />
            <ErrorText message={state.fieldErrors?.title?.[0]} />
          </div>

          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <Textarea
              name="description"
              defaultValue={item?.description ?? ""}
              rows={4}
              maxLength={20000}
              disabled={isPending}
            />
            <ErrorText message={state.fieldErrors?.description?.[0]} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Urutan tampil</Label>
              <Input
                name="sortOrder"
                type="number"
                defaultValue={item?.sortOrder ?? 0}
                min={0}
                max={9999}
                step={1}
                disabled={isPending}
                required
              />
              <ErrorText message={state.fieldErrors?.sortOrder?.[0]} />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div>
                <Label>Wajib dipenuhi</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tandai sebagai persyaratan wajib.
                </p>
              </div>

              <input
                type="hidden"
                name="isRequired"
                value={isRequired ? "true" : "false"}
              />

              <Switch
                checked={isRequired}
                onCheckedChange={setIsRequired}
                disabled={isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Batal
              </Button>
            </DialogClose>

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Menyimpan...
                </>
              ) : (
                "Simpan persyaratan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FlowStepDialog({
  ppdbId,
  item,
}: {
  ppdbId: string;
  item?: EditablePpdbFlowStep;
}) {
  const [open, setOpen] = useState(false);
  const isEdit = item !== undefined;

  const action = isEdit ? updatePpdbFlowStepAction : createPpdbFlowStepAction;

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: PpdbFlowStepActionState,
      formData: FormData,
    ): Promise<PpdbFlowStepActionState> => {
      const nextState = await action(previousState, formData);

      if (nextState.status === "success") {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    initialPpdbFlowStepActionState,
  );

  useActionToast(state);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size={isEdit ? "sm" : "default"}
          variant={isEdit ? "outline" : "default"}
        >
          {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}
          {isEdit ? "Edit" : "Tambah langkah"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit langkah alur" : "Tambah langkah alur"}
          </DialogTitle>
          <DialogDescription>
            Urutan langkah harus unik dalam satu periode PPDB.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-5" noValidate>
          <input type="hidden" name="ppdbId" value={ppdbId} />

          {item ? <input type="hidden" name="id" value={item.id} /> : null}

          {state.status === "error" && state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label>Judul langkah</Label>
            <Input
              name="title"
              defaultValue={item?.title ?? ""}
              maxLength={180}
              disabled={isPending}
              required
            />
            <ErrorText message={state.fieldErrors?.title?.[0]} />
          </div>

          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <Textarea
              name="description"
              defaultValue={item?.description ?? ""}
              rows={4}
              maxLength={20000}
              disabled={isPending}
            />
            <ErrorText message={state.fieldErrors?.description?.[0]} />
          </div>

          <div className="space-y-2">
            <Label>Nomor langkah</Label>
            <Input
              name="sortOrder"
              type="number"
              defaultValue={item?.sortOrder ?? 1}
              min={1}
              max={9999}
              step={1}
              disabled={isPending}
              required
            />
            <ErrorText message={state.fieldErrors?.sortOrder?.[0]} />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Batal
              </Button>
            </DialogClose>

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Menyimpan...
                </>
              ) : (
                "Simpan langkah"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FeeDialog({
  ppdbId,
  item,
}: {
  ppdbId: string;
  item?: EditablePpdbFee;
}) {
  const [open, setOpen] = useState(false);
  const [feeType, setFeeType] = useState<PpdbFeeTypeValue>(
    item?.feeType ?? "OTHER",
  );
  const [isOptional, setIsOptional] = useState(item?.isOptional ?? false);

  const isEdit = item !== undefined;
  const action = isEdit ? updatePpdbFeeAction : createPpdbFeeAction;

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: PpdbFeeActionState,
      formData: FormData,
    ): Promise<PpdbFeeActionState> => {
      const nextState = await action(previousState, formData);

      if (nextState.status === "success") {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    initialPpdbFeeActionState,
  );

  useActionToast(state);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size={isEdit ? "sm" : "default"}
          variant={isEdit ? "outline" : "default"}
        >
          {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}
          {isEdit ? "Edit" : "Tambah biaya"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit rincian biaya" : "Tambah rincian biaya"}
          </DialogTitle>
          <DialogDescription>
            Biaya hanya ditampilkan apabila pengaturan tampil biaya diaktifkan.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-5" noValidate>
          <input type="hidden" name="ppdbId" value={ppdbId} />

          {item ? <input type="hidden" name="id" value={item.id} /> : null}

          {state.status === "error" && state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label>Nama biaya</Label>
            <Input
              name="name"
              defaultValue={item?.name ?? ""}
              maxLength={180}
              disabled={isPending}
              required
            />
            <ErrorText message={state.fieldErrors?.name?.[0]} />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Jenis biaya</Label>

              <input type="hidden" name="feeType" value={feeType} />

              <Select
                value={feeType}
                onValueChange={(value) => {
                  setFeeType(value as PpdbFeeTypeValue);
                }}
                disabled={isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {ppdbFeeTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {ppdbFeeTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <ErrorText message={state.fieldErrors?.feeType?.[0]} />
            </div>

            <div className="space-y-2">
              <Label>Nominal</Label>
              <Input
                name="amount"
                type="number"
                defaultValue={item?.amount ?? ""}
                placeholder="Kosongkan jika belum ditentukan"
                min={0}
                max={999999999999}
                step="0.01"
                disabled={isPending}
              />
              <ErrorText message={state.fieldErrors?.amount?.[0]} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <Textarea
              name="description"
              defaultValue={item?.description ?? ""}
              rows={4}
              maxLength={20000}
              disabled={isPending}
            />
            <ErrorText message={state.fieldErrors?.description?.[0]} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Urutan tampil</Label>
              <Input
                name="sortOrder"
                type="number"
                defaultValue={item?.sortOrder ?? 0}
                min={0}
                max={9999}
                step={1}
                disabled={isPending}
                required
              />
              <ErrorText message={state.fieldErrors?.sortOrder?.[0]} />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div>
                <Label>Biaya opsional</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tidak wajib dibayarkan semua calon siswa.
                </p>
              </div>

              <input
                type="hidden"
                name="isOptional"
                value={isOptional ? "true" : "false"}
              />

              <Switch
                checked={isOptional}
                onCheckedChange={setIsOptional}
                disabled={isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Batal
              </Button>
            </DialogClose>

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Menyimpan...
                </>
              ) : (
                "Simpan biaya"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type DetailKind = "timeline" | "requirement" | "flow" | "fee";

type DetailDeleteState = {
  status: "idle" | "success" | "error";
  message?: string;
};

function DetailDeleteDialog({
  kind,
  id,
  label,
}: {
  kind: DetailKind;
  id: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: DetailDeleteState,
      formData: FormData,
    ): Promise<DetailDeleteState> => {
      let nextState: DetailDeleteState;

      switch (kind) {
        case "timeline":
          nextState = await deletePpdbTimelineAction(previousState, formData);
          break;

        case "requirement":
          nextState = await deletePpdbRequirementAction(
            previousState,
            formData,
          );
          break;

        case "flow":
          nextState = await deletePpdbFlowStepAction(previousState, formData);
          break;

        case "fee":
          nextState = await deletePpdbFeeAction(previousState, formData);
          break;
      }

      if (nextState.status === "success") {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    {
      status: "idle",
    },
  );

  useActionToast(state);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" size="sm" variant="destructive">
          <Trash2 className="size-4" />
          Hapus
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus rincian PPDB?</AlertDialogTitle>

          <AlertDialogDescription>
            <strong>{label}</strong> akan dihapus secara permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={id} />

          {state.status === "error" && state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isPending}>
              Batal
            </AlertDialogCancel>

            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Menghapus...
                </>
              ) : (
                "Hapus rincian"
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function PpdbDetailManager({
  ppdbId,
  timelineItems,
  requirements,
  flowSteps,
  fees,
  canEdit,
}: PpdbDetailManagerProps) {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarClock className="size-5" />
              Jadwal PPDB
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Periode pendaftaran, seleksi, daftar ulang, dan kegiatan terkait.
            </p>
          </div>

          {canEdit ? <TimelineDialog ppdbId={ppdbId} /> : null}
        </CardHeader>

        <CardContent>
          {timelineItems.length === 0 ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Jadwal PPDB belum tersedia.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jadwal</TableHead>
                    <TableHead>Mulai</TableHead>
                    <TableHead>Selesai</TableHead>
                    <TableHead>Urutan</TableHead>
                    {canEdit ? (
                      <TableHead className="text-right">Tindakan</TableHead>
                    ) : null}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {timelineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-medium">{item.title}</p>
                        {item.description ? (
                          <p className="mt-1 max-w-lg whitespace-pre-wrap text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell>{formatDateTime(item.startDate)}</TableCell>
                      <TableCell>{formatDateTime(item.endDate)}</TableCell>
                      <TableCell>{item.sortOrder}</TableCell>
                      {canEdit ? (
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <TimelineDialog ppdbId={ppdbId} item={item} />
                            <DetailDeleteDialog
                              kind="timeline"
                              id={item.id}
                              label={item.title}
                            />
                          </div>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="size-5" />
              Persyaratan
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Dokumen dan ketentuan yang perlu dipersiapkan.
            </p>
          </div>

          {canEdit ? <RequirementDialog ppdbId={ppdbId} /> : null}
        </CardHeader>

        <CardContent>
          {requirements.length === 0 ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Persyaratan PPDB belum tersedia.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Persyaratan</TableHead>
                    <TableHead>Ketentuan</TableHead>
                    <TableHead>Urutan</TableHead>
                    {canEdit ? (
                      <TableHead className="text-right">Tindakan</TableHead>
                    ) : null}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {requirements.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-medium">{item.title}</p>
                        {item.description ? (
                          <p className="mt-1 max-w-xl whitespace-pre-wrap text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.isRequired ? "default" : "outline"}
                        >
                          {item.isRequired ? "Wajib" : "Opsional"}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.sortOrder}</TableCell>
                      {canEdit ? (
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <RequirementDialog ppdbId={ppdbId} item={item} />
                            <DetailDeleteDialog
                              kind="requirement"
                              id={item.id}
                              label={item.title}
                            />
                          </div>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListChecks className="size-5" />
              Alur PPDB
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Tahapan yang perlu diikuti calon siswa atau orang tua.
            </p>
          </div>

          {canEdit ? <FlowStepDialog ppdbId={ppdbId} /> : null}
        </CardHeader>

        <CardContent>
          {flowSteps.length === 0 ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Alur PPDB belum tersedia.
            </p>
          ) : (
            <div className="grid gap-3">
              {flowSteps.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-start"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                    {item.sortOrder}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.title}</p>

                    {item.description ? (
                      <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </div>

                  {canEdit ? (
                    <div className="flex shrink-0 gap-2">
                      <FlowStepDialog ppdbId={ppdbId} item={item} />
                      <DetailDeleteDialog
                        kind="flow"
                        id={item.id}
                        label={item.title}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CircleDollarSign className="size-5" />
              Rincian Biaya
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Nominal dan jenis biaya hanya berupa informasi, bukan sistem
              pembayaran.
            </p>
          </div>

          {canEdit ? <FeeDialog ppdbId={ppdbId} /> : null}
        </CardHeader>

        <CardContent>
          {fees.length === 0 ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Rincian biaya PPDB belum tersedia.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Biaya</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Nominal</TableHead>
                    <TableHead>Ketentuan</TableHead>
                    <TableHead>Urutan</TableHead>
                    {canEdit ? (
                      <TableHead className="text-right">Tindakan</TableHead>
                    ) : null}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {fees.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-medium">{item.name}</p>
                        {item.description ? (
                          <p className="mt-1 max-w-lg whitespace-pre-wrap text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ppdbFeeTypeLabels[item.feeType]}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatAmount(item.amount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={item.isOptional ? "outline" : "default"}
                        >
                          {item.isOptional ? "Opsional" : "Wajib"}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.sortOrder}</TableCell>
                      {canEdit ? (
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <FeeDialog ppdbId={ppdbId} item={item} />
                            <DetailDeleteDialog
                              kind="fee"
                              id={item.id}
                              label={item.name}
                            />
                          </div>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
