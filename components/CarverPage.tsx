"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import heroicons from "@iconify-json/heroicons/icons.json";
import type { IconifyIcon } from "@iconify/types";
import GameCanvas from "./GameCanvas";

const languageIcon = {
  ...heroicons.icons.language,
  width: heroicons.width,
  height: heroicons.height,
} as IconifyIcon;

const helpIcon = {
  ...heroicons.icons["question-mark-circle"],
  width: heroicons.width,
  height: heroicons.height,
} as IconifyIcon;

type Locale = "en" | "zh";

type Copy = {
  intro: string;
  goalLine: string;
  controls: {
    move: string;
    restart: string;
  };
  howToPlay: string;
  ruleCards: Array<{ color: string; label: string; text: string }>;
  routeNotes: string;
  notes: string[];
  tipLabel: string;
  tip: string;
};

const copy: Record<Locale, Copy> = {
  en: {
    intro:
      "Carver is a free browser puzzle game about irreversible movement. Move with WASD, arrow keys, swipe, or the touch buttons. Each step off dirt turns that tile into ice, but old damage can become infrastructure: void scars can brace a slide and give you footing again.",
    goalLine: "Reach the green goal. Use dirt to stop, and use void scars as deliberate slide braces. Press R to restart.",
    controls: {
      move: "Move",
      restart: "Restart",
    },
    howToPlay: "How to Play",
    ruleCards: [
      { color: "text-[#bb9af7]", label: "Reach the green goal.", text: "Move with WASD, arrow keys, swipe, or touch controls. Press R to restart." },
      { color: "text-[#f7768e]", label: "Dirt provides traction.", text: "You must push off from it to initiate movement." },
      { color: "text-[#7aa2f7]", label: "Frictionless descent.", text: "Stepping off a Dirt tile converts it to Ice. On Ice, you slide continuously." },
      { color: "text-[#f7768e]", label: "Void is a brace, not just a pit.", text: "Slide into a red scar to stop before it and regain footing on the tile under you." },
      { color: "text-[#9ece6a]", label: "Damage becomes structure.", text: "The route is not only preserved or spent. You can use old scars to create future control." },
    ],
    routeNotes: "Route Notes",
    notes: [
      "Every move still spends footing, but a void brace can turn a slide into a new decision point.",
      "The best route may deliberately crash into a scar so the old damage becomes your next launch point.",
    ],
    tipLabel: "Tip",
    tip: "Do not only preserve clean ground. Sometimes the right move is to aim at the wound and make it hold you.",
  },
  zh: {
    intro:
      "Carver 是一款关于不可逆移动的免费浏览器解谜游戏。用 WASD、方向键、滑动或触控按钮移动。每次离开泥地，它都会变成冰面；但旧损伤也能变成结构：Void 伤痕可以挡住滑行，并让你重新获得落脚点。",
    goalLine: "到达绿色终点。用泥地刹车，也要把 Void 伤痕当成可设计的滑行支点。按 R 重新开始。",
    controls: {
      move: "移动",
      restart: "重开",
    },
    howToPlay: "玩法",
    ruleCards: [
      { color: "text-[#bb9af7]", label: "到达绿色终点。", text: "用 WASD、方向键、滑动或触控按钮移动。按 R 重新开始。" },
      { color: "text-[#f7768e]", label: "泥地提供摩擦。", text: "你必须从泥地发力，才能开始移动。" },
      { color: "text-[#7aa2f7]", label: "无摩擦下滑。", text: "离开 Dirt 地块会把它变成 Ice。在 Ice 上，你会持续滑行。" },
      { color: "text-[#f7768e]", label: "Void 不只是坑。", text: "滑向红色伤痕会在它前方停下，并把脚下地块变回可发力的落脚点。" },
      { color: "text-[#9ece6a]", label: "损耗变成结构。", text: "路线不只是被保留或消耗。你可以利用旧伤痕创造未来控制。" },
    ],
    routeNotes: "路线笔记",
    notes: [
      "每次移动仍然会消耗落脚点，但 Void 支点可以把一次滑行变成新的决策点。",
      "更好的路线可能不是避开伤痕，而是故意撞向伤痕，让它托住你。",
    ],
    tipLabel: "提示",
    tip: "不要只保护干净地面。有时正确解法是瞄准伤口，让它反过来支撑你。",
  },
};

export default function CarverPage() {
  const [locale, setLocale] = useState<Locale>("en");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isHelpPreviewVisible, setIsHelpPreviewVisible] = useState(true);
  const hasManuallyToggledHelpRef = useRef(false);
  const text = copy[locale];

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!hasManuallyToggledHelpRef.current) setIsHelpPreviewVisible(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, []);

  const bodyTextClass =
    locale === "zh"
      ? "font-sans text-[13px] leading-7 font-medium"
      : "text-sm leading-6";

  const goalClass =
    locale === "zh"
      ? "font-sans text-xs font-semibold"
      : "text-[11px]";

  const sidebarTextClass =
    locale === "zh"
      ? "font-sans text-[12px] leading-relaxed font-medium"
      : "text-[11px] leading-relaxed";

  const sidebarLabelClass =
    locale === "zh"
      ? "font-sans font-bold"
      : "";

  return (
    <main className="h-[100dvh] w-full flex flex-col bg-[#05070a] text-[#c0caf5] font-mono overflow-hidden">
      <header className="h-16 border-b border-[#24283b] flex items-center justify-between px-4 sm:px-6 bg-[#16161e] shrink-0">
        <div className="flex items-center gap-3">
          <Image
            src="/icon.png"
            alt="Carver icon"
            width={40}
            height={40}
            priority
            unoptimized
            className="h-10 w-10 rounded-lg border border-[#414868] bg-[#0a0c10] shadow-[0_0_18px_rgba(122,162,247,0.22)]"
          />
          <span className="text-2xl font-black tracking-tight text-[#c0caf5]">carver</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              hasManuallyToggledHelpRef.current = true;
              setIsHelpPreviewVisible(false);
              setIsHelpOpen(true);
            }}
            className="inline-flex h-9 w-9 items-center justify-center border border-[#414868] bg-[#1a1b26] font-mono text-sm font-black text-[#c0caf5] transition hover:border-[#7aa2f7] hover:text-[#7aa2f7]"
            aria-label={locale === "en" ? "Open how to play" : "打开玩法说明"}
          >
            <Icon icon={helpIcon} className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setLocale(locale === "en" ? "zh" : "en")}
            className="inline-flex items-center justify-center border border-[#414868] bg-[#1a1b26] w-9 h-9 transition hover:border-[#7aa2f7] hover:text-[#c0caf5]"
            aria-label={locale === "en" ? "Switch to Chinese" : "切换到英文"}
          >
            <Icon icon={languageIcon} className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <section className="flex-1 overflow-y-auto bg-[#0a0c10] relative overscroll-contain">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(#414868 1px, transparent 1px)", backgroundSize: "32px 32px" }}
          />

          <div className="relative z-10 mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-center gap-6 px-4 py-6 md:py-8">
            <div className="w-full">
              <p className={`max-w-[34rem] text-[#9aa5ce] ${bodyTextClass}`}>{text.intro}</p>
              <p className={`mt-2 max-w-[34rem] uppercase tracking-widest text-[#7aa2f7] ${goalClass}`}>{text.goalLine}</p>
            </div>

            <div className="w-full bg-[#1a1b26] border-2 border-[#414868] relative shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center p-2 lg:p-4">
              <div className="relative h-[min(72dvh,620px)] min-h-[430px] w-full sm:h-auto sm:aspect-video sm:min-h-0">
                <GameCanvas />
              </div>
            </div>

            <div className="w-full flex justify-between items-center bg-[#1a1b26] border border-[#24283b] p-4 text-[10px]">
              <div className="flex flex-wrap items-center gap-6 text-[#9aa5ce]">
                <div className="flex items-center gap-2">
                  <kbd className="bg-[#24283b] px-2 py-1 text-[#c0caf5] border border-[#414868]">W A S D</kbd>
                  <span>/</span>
                  <kbd className="bg-[#24283b] px-2 py-1 text-[#c0caf5] border border-[#414868]">ARROWS</kbd>
                  <span className="ml-2 uppercase tracking-wider text-[#565f89]">{text.controls.move}</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="bg-[#24283b] px-2 py-1 text-[#c0caf5] border border-[#414868]">R</kbd>
                  <span className="ml-2 uppercase tracking-wider text-[#565f89]">{text.controls.restart}</span>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>

      {isHelpPreviewVisible && !isHelpOpen ? (
        <div className="pointer-events-none fixed right-4 top-20 z-40 w-[min(22rem,calc(100vw-2rem))] border border-[#414868] bg-[#16161e]/95 p-4 shadow-[0_0_40px_rgba(0,0,0,0.55)] backdrop-blur-sm">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#7aa2f7]">
            <Icon icon={helpIcon} className="h-4 w-4" aria-hidden="true" />
            {text.howToPlay}
          </div>
          <p className={`mt-2 text-[#9aa5ce] ${sidebarTextClass}`}>
            {text.ruleCards[0].label} {text.ruleCards[2].text}
          </p>
          <p className={`mt-1 text-[#717cb4] ${sidebarTextClass}`}>
            {locale === "zh" ? "点右上角问号可再次查看完整规则。" : "Tap the question icon for the full rules."}
          </p>
        </div>
      ) : null}

      {isHelpOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070a]/80 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="how-to-play-modal-title">
          <div className="max-h-[82dvh] w-full max-w-lg overflow-y-auto border border-[#414868] bg-[#16161e] p-5 shadow-[0_0_60px_rgba(0,0,0,0.65)]">
            <div className="flex items-start justify-between gap-4">
              <h2 id="how-to-play-modal-title" className="text-xs font-black uppercase tracking-widest text-[#7aa2f7]">{text.howToPlay}</h2>
              <button
                type="button"
                onClick={() => {
                  hasManuallyToggledHelpRef.current = true;
                  setIsHelpPreviewVisible(false);
                  setIsHelpOpen(false);
                }}
                className="inline-flex h-8 w-8 items-center justify-center border border-[#414868] bg-[#1a1b26] font-mono text-sm font-black text-[#c0caf5] transition hover:border-[#f7768e] hover:text-[#f7768e]"
                aria-label={locale === "en" ? "Close help" : "关闭玩法说明"}
              >
                ×
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="space-y-3 border border-[#24283b] bg-[#1a1b26] p-4">
                {text.ruleCards.map((rule) => (
                  <div className="flex gap-3" key={rule.label}>
                    <span className={`${rule.color} mt-1 text-[10px]`}>■</span>
                    <div className={`text-[#9aa5ce] ${sidebarTextClass}`}>
                      <strong className={`text-[#c0caf5] ${sidebarLabelClass}`}>{rule.label}</strong> {rule.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#bb9af7]">{text.routeNotes}</h3>
                <div className={`space-y-2 text-[#9aa5ce] ${sidebarTextClass}`}>
                  {text.notes.map((note) => (
                    <p key={note}>{note}</p>
                  ))}
                </div>
              </div>

              <div className="border border-dashed border-[#414868] bg-[#1a1b26] p-4">
                <div className="mb-2 text-[9px] uppercase tracking-widest text-[#565f89]">{text.tipLabel}</div>
                <p className={`text-[#717cb4] ${locale === "zh" ? "font-sans text-[11px] leading-relaxed font-medium" : "text-[10px] leading-relaxed"}`}>{text.tip}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <footer className="h-10 bg-[#1a1b26] border-t border-[#24283b] flex items-center px-6 shrink-0">
        <div className="ml-auto text-[9px] text-[#414868]">© 2026 CARVER</div>
      </footer>
    </main>
  );
}
