import { useMutation, useQuery } from "convex/react";
import {
  Camera,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  PenLine,
  Plus,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { DemoBanner } from "../components/propedge";

type Tab = "manual" | "csv" | "screenshot";

interface ManualPick {
  playerName: string;
  statType: string;
  line: string;
  overUnder: string;
  platform: string;
  sport: string;
}

const EMPTY_PICK: ManualPick = {
  playerName: "",
  statType: "",
  line: "",
  overUnder: "over",
  platform: "PrizePicks",
  sport: "NBA",
};

export default function ImportPage() {
  const [tab, setTab] = useState<Tab>("manual");
  const [picks, setPicks] = useState<ManualPick[]>([{ ...EMPTY_PICK }]);
  const [csvText, setCsvText] = useState("");
  const [csvPlatform, setCsvPlatform] = useState("PrizePicks");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  const myImports = useQuery(api.importData.myImports);
  const manualSlipEntry = useMutation(api.importData.manualSlipEntry);
  const csvImport = useMutation(api.importData.csvImport);

  const addPick = () => setPicks([...picks, { ...EMPTY_PICK }]);
  const removePick = (i: number) =>
    setPicks(picks.filter((_, idx) => idx !== i));
  const updatePick = (i: number, field: keyof ManualPick, value: string) => {
    const updated = [...picks];
    updated[i] = { ...updated[i], [field]: value };
    setPicks(updated);
  };

  const handleManualSubmit = async () => {
    const valid = picks.filter(p => p.playerName && p.statType && p.line);
    if (valid.length === 0) return;
    setSubmitting(true);
    try {
      const res = await manualSlipEntry({
        picks: valid.map(p => ({
          ...p,
          line: parseFloat(p.line),
        })),
        importSource: "manual",
      });
      setResult({
        ok: true,
        message: `✅ Imported ${res.picksCreated}/${res.picksAttempted} picks`,
      });
      setPicks([{ ...EMPTY_PICK }]);
    } catch (e: any) {
      setResult({ ok: false, message: `❌ ${e.message}` });
    }
    setSubmitting(false);
  };

  const handleCsvSubmit = async () => {
    if (!csvText.trim()) return;
    setSubmitting(true);
    try {
      const res = await csvImport({
        csvContent: csvText,
        platform: csvPlatform,
      });
      setResult({
        ok: res.errors.length === 0,
        message: `Parsed ${res.parsed} picks. ${res.errors.length} errors.`,
      });
      setCsvText("");
    } catch (e: any) {
      setResult({ ok: false, message: `❌ ${e.message}` });
    }
    setSubmitting(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <DemoBanner />

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Upload className="size-6 text-[#00D4FF]" />
          Import Picks
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manual entry, CSV upload, or screenshot import
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: "manual" as Tab, label: "Manual Entry", icon: PenLine },
          { id: "csv" as Tab, label: "CSV Upload", icon: FileSpreadsheet },
          { id: "screenshot" as Tab, label: "Screenshot", icon: Camera },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setTab(id);
              setResult(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === id
                ? "bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20"
                : "bg-white/5 text-muted-foreground hover:text-white"
            }`}
          >
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>

      {/* Result banner */}
      {result && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
            result.ok
              ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
              : "bg-red-400/10 text-red-400 border border-red-400/20"
          }`}
        >
          {result.ok ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <XCircle className="size-4" />
          )}
          {result.message}
        </div>
      )}

      {/* Manual Entry */}
      {tab === "manual" && (
        <div className="space-y-4">
          {picks.map((pick, i) => (
            <div
              key={i}
              className="bg-[#0D1117] rounded-xl border border-white/5 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-bold">
                  Pick #{i + 1}
                </span>
                {picks.length > 1 && (
                  <button
                    onClick={() => removePick(i)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <input
                  value={pick.playerName}
                  onChange={e => updatePick(i, "playerName", e.target.value)}
                  placeholder="Player Name"
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  value={pick.statType}
                  onChange={e => updatePick(i, "statType", e.target.value)}
                  placeholder="Stat Type (Points, Rebounds...)"
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  value={pick.line}
                  onChange={e => updatePick(i, "line", e.target.value)}
                  placeholder="Line (e.g. 24.5)"
                  type="number"
                  step="0.5"
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                />
                <select
                  value={pick.overUnder}
                  onChange={e => updatePick(i, "overUnder", e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="over">Over</option>
                  <option value="under">Under</option>
                </select>
                <select
                  value={pick.platform}
                  onChange={e => updatePick(i, "platform", e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                >
                  {[
                    "PrizePicks",
                    "Underdog",
                    "DraftKings",
                    "FanDuel",
                    "Kalshi",
                    "Other",
                  ].map(p => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <select
                  value={pick.sport}
                  onChange={e => updatePick(i, "sport", e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                >
                  {["NBA", "NFL", "MLB", "NHL"].map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          <div className="flex gap-3">
            <button
              onClick={addPick}
              className="flex items-center gap-1 text-sm text-[#00D4FF] hover:text-[#00D4FF]/80"
            >
              <Plus className="size-4" /> Add Pick
            </button>
            <button
              onClick={handleManualSubmit}
              disabled={submitting}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#00D4FF] text-black rounded-lg font-bold text-sm hover:bg-[#00D4FF]/90 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Import {picks.filter(p => p.playerName).length} Picks
            </button>
          </div>
        </div>
      )}

      {/* CSV */}
      {tab === "csv" && (
        <div className="space-y-4">
          <div className="bg-[#0D1117] rounded-xl border border-white/5 p-4 space-y-3">
            <div className="text-xs text-muted-foreground">
              Format:{" "}
              <code className="bg-white/10 px-1 rounded">
                PlayerName, StatType, Line, OverUnder, Sport
              </code>
            </div>
            <textarea
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder={
                "LeBron James, Points, 25.5, over, NBA\nStephen Curry, 3-Pointers, 4.5, over, NBA"
              }
              className="w-full h-40 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono resize-none"
            />
            <div className="flex items-center justify-between">
              <select
                value={csvPlatform}
                onChange={e => setCsvPlatform(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
              >
                {[
                  "PrizePicks",
                  "Underdog",
                  "DraftKings",
                  "FanDuel",
                  "Kalshi",
                ].map(p => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <button
                onClick={handleCsvSubmit}
                disabled={submitting || !csvText.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[#00D4FF] text-black rounded-lg font-bold text-sm disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="size-4" />
                )}
                Parse & Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot */}
      {tab === "screenshot" && (
        <div className="bg-[#0D1117] rounded-xl border border-dashed border-white/10 p-10 text-center space-y-3">
          <Camera className="size-12 text-muted-foreground mx-auto" />
          <div className="text-lg font-bold text-muted-foreground">
            Screenshot Import — Coming Soon
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Upload a screenshot of your betting slip and our OCR engine will
            extract picks automatically. You'll be able to review and correct
            detections before saving.
          </p>
          <div className="text-[10px] text-muted-foreground italic">
            No credential-based sportsbook syncing — screenshot import only.
          </div>
        </div>
      )}

      {/* Import history */}
      {myImports && myImports.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold">Recent Imports</h2>
          <div className="space-y-2">
            {myImports
              .slice(-10)
              .reverse()
              .map((job: any) => (
                <div
                  key={job._id}
                  className="bg-[#0D1117] rounded-lg border border-white/5 p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        job.status === "completed"
                          ? "bg-emerald-400/10 text-emerald-400"
                          : "bg-red-400/10 text-red-400"
                      }`}
                    >
                      {job.status}
                    </span>
                    <span className="text-sm">{job.importSource}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {job.successfulPicks}/{job.totalPicks} picks •{" "}
                    {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
