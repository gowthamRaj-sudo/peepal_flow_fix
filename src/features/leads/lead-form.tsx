"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { uploadFile } from "./upload-client";

export interface LeadFormService {
  slug: string;
  name: string;
}
export interface LeadFormArea {
  slug: string;
  name: string;
}

interface UploadItem {
  id: string | null;
  previewUrl?: string;
  filename: string;
  sizeBytes: number;
  error?: string;
  uploading: boolean;
  isVideo: boolean;
}

const TIME_SLOTS = [
  { value: "MORNING", label: "Morning (8 AM – 12 PM)" },
  { value: "AFTERNOON", label: "Afternoon (12 – 4 PM)" },
  { value: "EVENING", label: "Evening (4 – 8 PM)" },
  { value: "FLEXIBLE", label: "Flexible — any time" },
] as const;

const STEPS = ["Service", "Problem", "Location", "Time", "Photos", "Contact"] as const;

const initialState = {
  serviceSlug: "",
  description: "",
  areaSlug: "",
  pincode: "",
  address: "",
  preferredTime: "FLEXIBLE",
  customerName: "",
  phone: "",
  whatsapp: "",
  email: "",
  consent: false,
};

type FormState = typeof initialState;

export function LeadForm({
  services,
  areas,
  presetServiceSlug,
  presetUtm,
}: {
  services: LeadFormService[];
  areas: LeadFormArea[];
  presetServiceSlug?: string;
  presetUtm?: Record<string, string>;
}) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<FormState>({
    ...initialState,
    serviceSlug: presetServiceSlug && services.some((s) => s.slug === presetServiceSlug)
      ? presetServiceSlug
      : "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [leadCode, setLeadCode] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const selectedService = useMemo(
    () => services.find((s) => s.slug === state.serviceSlug),
    [services, state.serviceSlug],
  );

  function validateStep(current: number): boolean {
    const e: Record<string, string> = {};
    if (current === 0 && !state.serviceSlug) e.serviceSlug = "Please choose a service";
    if (current === 1 && state.description.trim().length < 10)
      e.description = "Tell us a little more (at least 10 characters)";
    if (current === 2) {
      if (!state.address.trim()) e.address = "Enter your locality / address";
      if (!/^\d{6}$/.test(state.pincode.trim())) e.pincode = "Enter a valid 6-digit pincode";
    }
    if (current === 5) {
      if (state.customerName.trim().length < 2) e.customerName = "Please enter your name";
      const digits = state.phone.replace(/\D/g, "").slice(-10);
      if (!/^[6-9]\d{9}$/.test(digits)) e.phone = "Enter a valid 10-digit mobile number";
      if (!state.consent) e.consent = "We need your permission to contact you";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const incoming = Array.from(files).slice(0, 8 - uploads.length);
    for (const file of incoming) {
      const isVideo = file.type.startsWith("video/");
      if (file.size > 60 * 1024 * 1024) {
        setUploads((u) => [
          ...u,
          { id: null, filename: file.name, sizeBytes: file.size, error: "Too large (max 60MB)", uploading: false, isVideo },
        ]);
        continue;
      }
      const placeholderIndex = uploads.length;
      setUploads((u) => [
        ...u,
        {
          id: null,
          previewUrl: isVideo ? undefined : URL.createObjectURL(file),
          filename: file.name,
          sizeBytes: file.size,
          uploading: true,
          isVideo,
        },
      ]);
      const result = await uploadFile(file);
      setUploads((u) => {
        const copy = [...u];
        const item = copy[placeholderIndex];
        if (item) {
          copy[placeholderIndex] = {
            ...item,
            uploading: false,
            id: result.id ?? null,
            error: result.error,
          };
        }
        return copy;
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function submit() {
    if (!validateStep(5)) return;
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...state,
          whatsapp: state.whatsapp || undefined,
          email: state.email || undefined,
          areaSlug: state.areaSlug || undefined,
          uploadIds: uploads.map((u) => u.id).filter((id): id is string => Boolean(id)),
          utmSource: presetUtm?.utm_source,
          utmMedium: presetUtm?.utm_medium,
          utmCampaign: presetUtm?.utm_campaign,
          landingPage: presetUtm?.landing_page ?? (typeof window !== "undefined" ? window.location.pathname : undefined),
        }),
      });
      const data = (await res.json()) as { code?: string; error?: string };
      if (!res.ok || !data.code) {
        setServerError(data.error ?? "Something went wrong. Please call us directly.");
        return;
      }
      setLeadCode(data.code);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setServerError("Network problem. Please call us directly — we're available.");
    } finally {
      setSubmitting(false);
    }
  }

  if (leadCode) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" aria-hidden />
        <h2 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">
          Thanks! We&apos;ve received your request.
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
          Peepal Flow Fix Solutions will contact you shortly. Keep this reference for your records:
        </p>
        <p className="mt-4 inline-block rounded-lg bg-white px-5 py-2.5 font-mono text-lg font-bold tracking-wider text-brand-700 shadow-card">
          {leadCode}
        </p>
        <p className="mt-6 text-xs text-slate-500">
          Urgent? Don&apos;t wait for our call — phone us and mention your reference number.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7">
      {/* Progress */}
      <ol className="mb-7 flex items-center gap-1.5" aria-label={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}>
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 flex-col gap-1.5">
            <span
              aria-hidden
              className={`h-1.5 rounded-full transition-colors ${
                i <= step ? "bg-brand-600" : "bg-slate-200"
              }`}
            />
            <span
              className={`hidden text-[11px] font-medium sm:block ${
                i === step ? "text-brand-700" : "text-slate-400"
              }`}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <fieldset>
          <legend className="text-lg font-bold text-slate-900">What do you need help with?</legend>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {services.map((service) => (
              <button
                key={service.slug}
                type="button"
                onClick={() => set("serviceSlug", service.slug)}
                aria-pressed={state.serviceSlug === service.slug}
                className={`min-h-[56px] rounded-xl border px-3 py-3 text-left text-sm font-semibold transition ${
                  state.serviceSlug === service.slug
                    ? "border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-100"
                    : "border-slate-200 bg-white text-slate-700 hover:border-brand-300"
                }`}
              >
                {service.name.replace(" Services", "").replace("General Home Maintenance", "Home Maintenance")}
              </button>
            ))}
          </div>
          {errors.serviceSlug && <p role="alert" className="mt-2 text-sm text-red-600">{errors.serviceSlug}</p>}
        </fieldset>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Field
            label={`Describe the problem${selectedService ? ` (${selectedService.name})` : ""}`}
            hint="In your own words — what's wrong, since when, anything you already tried."
            error={errors.description}
            htmlFor="description"
          >
            <Textarea
              id="description"
              value={state.description}
              onChange={(e) => set("description", e.target.value)}
              maxLength={2000}
              rows={5}
              autoFocus
              placeholder="e.g. Water leaking through the ceiling below the bathroom, worse in the mornings, for the past 2 weeks…"
            />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Field label="Your area" htmlFor="areaSlug" hint="Pick the nearest listed area — helps us assign the right team.">
            <Select
              id="areaSlug"
              value={state.areaSlug}
              onChange={(e) => set("areaSlug", e.target.value)}
            >
              <option value="">Select area (optional)</option>
              {areas.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Pincode" required error={errors.pincode} htmlFor="pincode">
            <Input
              id="pincode"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              value={state.pincode}
              onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))}
              placeholder="600130"
            />
          </Field>
          <Field label="Address / locality" required error={errors.address} htmlFor="address">
            <Textarea
              id="address"
              value={state.address}
              onChange={(e) => set("address", e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Flat / house no., street, landmark…"
            />
          </Field>
        </div>
      )}

      {step === 3 && (
        <fieldset>
          <legend className="text-lg font-bold text-slate-900">
            When should we visit?
          </legend>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot.value}
                type="button"
                onClick={() => set("preferredTime", slot.value)}
                aria-pressed={state.preferredTime === slot.value}
                className={`min-h-[56px] rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                  state.preferredTime === slot.value
                    ? "border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-100"
                    : "border-slate-200 bg-white text-slate-700 hover:border-brand-300"
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {step === 4 && (
        <div>
          <p className="text-lg font-bold text-slate-900">Photos or videos (optional)</p>
          <p className="mt-1.5 text-sm text-slate-500">
            A clear photo helps us arrive with the right tools and materials. Up to 8 files.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,video/mp4,video/webm"
            multiple
            className="sr-only"
            id="lead-files"
            aria-label="Choose photos or videos of the problem"
            onChange={(e) => void handleFiles(e.target.files)}
          />

          {uploads.length === 0 ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-5 flex min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 transition hover:border-brand-400 hover:bg-brand-50/40"
            >
              <ImagePlus className="h-8 w-8" aria-hidden />
              <span className="text-sm font-semibold">Tap to add photos</span>
              <span className="text-xs">JPG, PNG, HEIC or MP4 · max 60MB each</span>
            </button>
          ) : (
            <>
              <ul className="mt-5 grid grid-cols-3 gap-2.5" role="list">
                {uploads.map((item, idx) => (
                  <li key={`${item.filename}-${idx}`} className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    {item.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.previewUrl} alt="" className="h-20 w-full object-cover" />
                    ) : (
                      <div className="flex h-20 items-center justify-center text-xs font-medium text-slate-400">
                        {item.isVideo ? "VIDEO" : "FILE"}
                      </div>
                    )}
                    <div className="flex items-center justify-between px-2 py-1">
                      <span className="max-w-[70%] truncate text-[10px] text-slate-500">{item.filename}</span>
                      {item.uploading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-500" aria-label="Uploading" />
                      ) : item.error ? (
                        <Trash2
                          role="button"
                          aria-label="Remove file"
                          className="h-3.5 w-3.5 cursor-pointer text-red-500"
                          onClick={() => setUploads((u) => u.filter((_, i) => i !== idx))}
                        />
                      ) : (
                        <Check className="h-3.5 w-3.5 text-emerald-500" aria-label="Uploaded" />
                      )}
                    </div>
                  </li>
                ))}
                {uploads.length < 8 && (
                  <li>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-full min-h-[96px] w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-brand-400"
                    >
                      <ImagePlus className="h-5 w-5" aria-hidden />
                      <span className="text-[10px] font-semibold">Add more</span>
                    </button>
                  </li>
                )}
              </ul>
              {uploads.some((u) => u.error) && (
                <p role="alert" className="mt-2 text-xs text-red-600">
                  Some files couldn&apos;t upload — remove them to continue.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <Field label="Your name" required error={errors.customerName} htmlFor="customerName">
            <Input
              id="customerName"
              value={state.customerName}
              onChange={(e) => set("customerName", e.target.value)}
              autoComplete="name"
              maxLength={80}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mobile number" required error={errors.phone} htmlFor="phone">
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={state.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="98XXXXXX21"
              />
            </Field>
            <Field label="WhatsApp number" hint="Only if different from above" htmlFor="whatsapp">
              <Input
                id="whatsapp"
                type="tel"
                inputMode="tel"
                value={state.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
                placeholder="Same as mobile"
              />
            </Field>
          </div>
          <Field label="Email (optional)" htmlFor="email">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={state.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>

          <div>
            <label className="flex items-start gap-2.5 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={state.consent}
                onChange={(e) => set("consent", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>
                I agree to be contacted by Peepal Flow Fix Solutions about this request via
                phone/WhatsApp.
              </span>
            </label>
            {errors.consent && <p role="alert" className="mt-1 text-xs text-red-600">{errors.consent}</p>}
          </div>
        </div>
      )}

      {serverError && (
        <p role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {serverError}
        </p>
      )}

      {/* Navigation */}
      <div className="mt-7 flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button variant="ghost" onClick={back} disabled={submitting}>
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back
          </Button>
        ) : (
          <span />
        )}

        {step < STEPS.length - 1 ? (
          <Button onClick={next} size="lg" className="min-w-[120px]">
            Continue <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        ) : (
          <Button onClick={() => void submit()} size="lg" disabled={submitting} className="min-w-[160px]">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Sending…
              </>
            ) : (
              <>
                Submit Request <Check className="h-4 w-4" aria-hidden />
              </>
            )}
          </Button>
        )}
      </div>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400">
        Your details are used only to respond to this request. We never share them with third
        parties. See our Privacy Policy.
      </p>
    </div>
  );
}
