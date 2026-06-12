"use client";

import { useSettings } from "@/game/state/settingsStore";
import { useGame } from "@/game/state/gameStore";
import { useUI } from "@/game/state/uiStore";
import { Button, Panel } from "@/components/common/ui";
import { AudioManager } from "@/game/systems/AudioManager";

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="tabular-nums text-slate-400">{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-indigo-500"
      />
    </div>
  );
}

function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { v: T; l: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex gap-1">
        {options.map((o) => (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={`rounded-lg px-3 py-1 text-xs font-semibold ${value === o.v ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SettingsScreen() {
  const settings = useSettings();
  const save = useGame((s) => s.save);
  const quitToMenu = useGame((s) => s.quitToMenu);
  const closeOverlay = useUI((s) => s.closeOverlay);
  const setScreen = useUI((s) => s.setScreen);

  return (
    <div className="flex h-dvh w-full items-center justify-center bg-slate-950 p-4">
      <Panel className="w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black text-amber-300">Settings</h2>
          <Button variant="ghost" onClick={() => (save ? closeOverlay() : setScreen("menu"))}>✕</Button>
        </div>

        <div className="space-y-5">
          <Slider label="Music Volume" value={settings.musicVolume} onChange={(v) => settings.update({ musicVolume: v })} />
          <Slider label="Sound Effects" value={settings.sfxVolume} onChange={(v) => { settings.update({ sfxVolume: v }); AudioManager.playSfx("click"); }} />
          <Choice
            label="Text Speed"
            value={settings.textSpeed}
            options={[{ v: "slow", l: "Slow" }, { v: "normal", l: "Normal" }, { v: "fast", l: "Fast" }]}
            onChange={(v) => settings.update({ textSpeed: v })}
          />
          <Choice
            label="Theme"
            value={settings.darkMode ? "dark" : "light"}
            options={[{ v: "dark", l: "🌙 Dark" }, { v: "light", l: "☀️ Light" }]}
            onChange={(v) => settings.update({ darkMode: v === "dark" })}
          />
          <Choice
            label="Reduced Motion"
            value={settings.reducedMotion ? "on" : "off"}
            options={[{ v: "off", l: "Off" }, { v: "on", l: "On" }]}
            onChange={(v) => settings.update({ reducedMotion: v === "on" })}
          />
          <Choice
            label="Touch Controls"
            value={settings.touchControls}
            options={[{ v: "auto", l: "Auto" }, { v: "on", l: "On" }, { v: "off", l: "Off" }]}
            onChange={(v) => settings.update({ touchControls: v })}
          />
        </div>

        {save && (
          <div className="mt-6 border-t border-slate-800 pt-4">
            <Button
              variant="danger"
              className="w-full"
              onClick={() => {
                quitToMenu();
                setScreen("menu");
              }}
            >
              Save & Quit to Title
            </Button>
          </div>
        )}
      </Panel>
    </div>
  );
}
