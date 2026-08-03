"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import heroicons from "@iconify-json/heroicons/icons.json";
import type { IconifyIcon } from "@iconify/types";
import { initPremiumOnePager } from "../lib/premium-one-pager";
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
  tagline: string;
  controls: {
    move: string;
    undo: string;
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
    tagline: "A puzzle game about irreversible movement. Just press → to start.",
    controls: {
      move: "Move",
      undo: "Undo",
      restart: "Restart",
    },
    howToPlay: "How to Play",
    ruleCards: [
      {
        color: "text-[#bb9af7]",
        label: "Reach the green goal.",
        text: "Move with WASD, arrow keys, swipe, or touch controls. Press R to restart.",
      },
      {
        color: "text-[#f7768e]",
        label: "Dirt provides traction.",
        text: "You must push off from it to initiate movement.",
      },
      {
        color: "text-[#7aa2f7]",
        label: "Frictionless descent.",
        text: "Stepping off Dirt converts it to Ice. Sliding over old Ice breaks it into Void behind you.",
      },
      {
        color: "text-[#f7768e]",
        label: "Void is a brace, not just a pit.",
        text: "Slide into a red scar to stop before it and regain footing on the tile under you.",
      },
      {
        color: "text-[#9ece6a]",
        label: "Damage becomes structure.",
        text: "The route is not only preserved or spent. You can use old scars to create future control.",
      },
    ],
    routeNotes: "Route Notes",
    notes: [
      "Every move spends footing, and reused ice can collapse into void, but a void brace can turn a slide into a new decision point.",
      "The best route may deliberately crash into a scar so the old damage becomes your next launch point.",
    ],
    tipLabel: "Tip",
    tip: "Do not only preserve clean ground. Sometimes the right move is to aim at the wound and make it hold you.",
  },
  zh: {
    tagline: "一款关于不可逆移动的解谜游戏。按 → 即可开始。",
    controls: {
      move: "移动",
      undo: "撤回",
      restart: "重开",
    },
    howToPlay: "玩法",
    ruleCards: [
      {
        color: "text-[#bb9af7]",
        label: "到达绿色终点。",
        text: "用 WASD、方向键、滑动或触控按钮移动。按 R 重新开始。",
      },
      {
        color: "text-[#f7768e]",
        label: "泥地提供摩擦。",
        text: "你必须从泥地发力，才能开始移动。",
      },
      {
        color: "text-[#7aa2f7]",
        label: "无摩擦下滑。",
        text: "离开 Dirt 会把它变成 Ice。再次滑过旧 Ice，会在身后压出 Void。",
      },
      {
        color: "text-[#f7768e]",
        label: "Void 不只是坑。",
        text: "滑向红色伤痕会在它前方停下，并把脚下地块变回可发力的落脚点。",
      },
      {
        color: "text-[#9ece6a]",
        label: "损耗变成结构。",
        text: "路线不只是被保留或消耗。你可以利用旧伤痕创造未来控制。",
      },
    ],
    routeNotes: "路线笔记",
    notes: [
      "每次移动都会消耗落脚点，旧冰也可能塌成 Void；但 Void 支点可以把一次滑行变成新的决策点。",
      "更好的路线可能不是避开伤痕，而是故意撞向伤痕，让它托住你。",
    ],
    tipLabel: "提示",
    tip: "不要只保护干净地面。有时正确解法是瞄准伤口，让它反过来支撑你。",
  },
};

export default function CarverPage() {
  const [locale, setLocale] = useState<Locale>("en");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);
  const text = copy[locale];

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  // 附 A light: progress + noise + selection/scrollbar/prm. No chapter dots on game shell.
  useEffect(() => {
    return initPremiumOnePager({
      enableChapters: false,
      enableReveal: false,
      enableProgress: true,
      enableNoise: true,
    });
  }, []);

  useEffect(() => {
    if (!isHelpOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!helpRef.current?.contains(event.target as Node)) {
        setIsHelpOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsHelpOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isHelpOpen]);

  const taglineClass =
    locale === "zh"
      ? "font-sans text-[12px] font-semibold"
      : "text-[11px]";

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
          <span className="text-2xl font-black tracking-tight text-[#c0caf5]">
            carver
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            ref={helpRef}
            className="relative"
            onMouseEnter={() => setIsHelpOpen(true)}
            onMouseLeave={() => setIsHelpOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsHelpOpen((open) => !open)}
              onFocus={() => setIsHelpOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center border border-[#414868] bg-[#1a1b26] font-mono text-sm font-black text-[#c0caf5] transition hover:border-[#7aa2f7] hover:text-[#7aa2f7]"
              aria-label={
                locale === "en" ? "Open how to play" : "打开玩法说明"
              }
              aria-expanded={isHelpOpen}
              aria-controls="how-to-play-popover"
            >
              <Icon icon={helpIcon} className="h-5 w-5" aria-hidden="true" />
            </button>

            {isHelpOpen ? (
              <aside
                id="how-to-play-popover"
                className="absolute right-0 top-11 z-50 max-h-[calc(100dvh-6rem)] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto border border-[#414868] bg-[#16161e]/98 p-4 text-left shadow-[0_0_42px_rgba(0,0,0,0.62)] backdrop-blur-sm"
                role="dialog"
                aria-modal="false"
                aria-labelledby="how-to-play-popover-title"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2
                    id="how-to-play-popover-title"
                    className="text-[10px] font-black uppercase tracking-widest text-[#7aa2f7]"
                  >
                    {text.howToPlay}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsHelpOpen(false)}
                    className="inline-flex h-7 w-7 items-center justify-center border border-[#414868] bg-[#1a1b26] font-mono text-sm font-black text-[#c0caf5] transition hover:border-[#f7768e] hover:text-[#f7768e]"
                    aria-label={
                      locale === "en" ? "Close help" : "关闭玩法说明"
                    }
                  >
                    ×
                  </button>
                </div>

                <div className="mt-3 space-y-3 border border-[#24283b] bg-[#1a1b26] p-3">
                  {text.ruleCards.map((rule) => (
                    <div className="flex gap-3" key={rule.label}>
                      <span className={`${rule.color} mt-1 text-[10px]`}>
                        ■
                      </span>
                      <div className="text-[#9aa5ce] text-[11px] leading-relaxed">
                        <strong className="text-[#c0caf5]">
                          {rule.label}
                        </strong>{" "}
                        {rule.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 border border-dashed border-[#414868] bg-[#1a1b26] p-3">
                  <div className="mb-2 text-[9px] uppercase tracking-widest text-[#565f89]">
                    {text.tipLabel}
                  </div>
                  <p className="text-[#717cb4] text-[10px] leading-relaxed">
                    {text.tip}
                  </p>
                </div>
              </aside>
            ) : null}
          </div>
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
            style={{
              backgroundImage:
                "radial-gradient(#414868 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10 mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 py-4 md:py-6">
            {/* One-liner tagline */}
            <p className={`max-w-[34rem] text-center uppercase tracking-[0.15em] text-[#565f89] ${taglineClass}`}>
              {text.tagline}
            </p>

            <div className="w-full bg-[#1a1b26] border-2 border-[#414868] relative shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center p-2 lg:p-4">
              <div className="relative h-[min(72dvh,620px)] min-h-[430px] w-full sm:h-auto sm:aspect-video sm:min-h-0">
                <GameCanvas />
              </div>
            </div>

            <div className="w-full flex justify-between items-center bg-[#1a1b26] border border-[#24283b] p-4 text-[10px]">
              <div className="flex flex-wrap items-center gap-6 text-[#9aa5ce]">
                <div className="flex items-center gap-2">
                  <kbd className="bg-[#24283b] px-2 py-1 text-[#c0caf5] border border-[#414868]">
                    W A S D
                  </kbd>
                  <span>/</span>
                  <kbd className="bg-[#24283b] px-2 py-1 text-[#c0caf5] border border-[#414868]">
                    ARROWS
                  </kbd>
                  <span className="ml-2 uppercase tracking-wider text-[#565f89]">
                    {text.controls.move}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="bg-[#24283b] px-2 py-1 text-[#c0caf5] border border-[#414868]">
                    U / Z
                  </kbd>
                  <span className="ml-2 uppercase tracking-wider text-[#565f89]">
                    {text.controls.undo}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="bg-[#24283b] px-2 py-1 text-[#c0caf5] border border-[#414868]">
                    R
                  </kbd>
                  <span className="ml-2 uppercase tracking-wider text-[#565f89]">
                    {text.controls.restart}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="h-10 bg-[#1a1b26] border-t border-[#24283b] flex items-center px-6 shrink-0">
        <div className="ml-auto text-[9px] text-[#414868]">© 2026 CARVER</div>
      </footer>
    </main>
  );
}
