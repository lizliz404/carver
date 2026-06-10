"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import heroicons from "@iconify-json/heroicons/icons.json";
import type { IconifyIcon } from "@iconify/types";
import GameCanvas from "./GameCanvas";

const languageIcon = {
  ...heroicons.icons.language,
  width: heroicons.width,
  height: heroicons.height,
} as IconifyIcon;

type Locale = "en" | "zh";

type Copy = {
  eyebrow: string;
  noSignup: string;
  title: string;
  intro: string;
  goalLine: string;
  mode: string;
  controls: {
    move: string;
    restart: string;
  };
  mobileHelpTitle: string;
  mobileRules: Array<{ label: string; text: string }>;
  howToPlay: string;
  ruleCards: Array<{ color: string; label: string; text: string }>;
  routeNotes: string;
  notes: string[];
  tipLabel: string;
  tip: string;
  ready: string;
  engine: string;
};

const copy: Record<Locale, Copy> = {
  en: {
    eyebrow: "FREE BROWSER PUZZLE",
    noSignup: "NO SIGNUP",
    title: "CARVER",
    intro:
      "Carver is a free browser puzzle game about irreversible movement. Move with WASD, arrow keys, swipe, or the touch buttons. Each step off dirt turns that tile into ice, so every route you carve changes how the next move behaves.",
    goalLine: "Reach the green goal. Use untouched dirt to stop. Press R to restart.",
    mode: "Puzzle Mode",
    controls: {
      move: "Move",
      restart: "Restart",
    },
    mobileHelpTitle: "How to play Carver",
    mobileRules: [
      { label: "Move", text: "tap the arrows, swipe on the board, or use WASD / arrow keys." },
      { label: "Rule", text: "leaving dirt converts it into ice; ice keeps you sliding." },
      { label: "Goal", text: "plan your route, preserve stopping points, and reach the green tile." },
    ],
    howToPlay: "How to Play",
    ruleCards: [
      { color: "text-[#bb9af7]", label: "Reach the green goal.", text: "Move with WASD, arrow keys, swipe, or touch controls. Press R to restart." },
      { color: "text-[#f7768e]", label: "Dirt provides traction.", text: "You must push off from it to initiate movement." },
      { color: "text-[#7aa2f7]", label: "Frictionless descent.", text: "Stepping off a Dirt tile converts it to Ice. On Ice, you slide continuously." },
      { color: "text-[#9ece6a]", label: "Emergent design.", text: "Your path history dictates physics. Use untouched dirt to halt." },
    ],
    routeNotes: "Route Notes",
    notes: [
      "Every move spends one stopping point. If a direction is blocked, choose another route or restart.",
      "Good routes keep enough dirt ahead to slow down before the board turns into ice.",
    ],
    tipLabel: "Tip",
    tip: "The shortest-looking path is often a trap. Leave yourself one clean stop before the goal.",
    ready: "READY",
    engine: "VANILLA ENGINE",
  },
  zh: {
    eyebrow: "免费浏览器谜题",
    noSignup: "无需注册",
    title: "CARVER",
    intro:
      "Carver 是一款关于不可逆移动的免费浏览器解谜游戏。用 WASD、方向键、滑动或触控按钮移动。每次离开泥土地块，它都会变成冰面，所以你凿出的每条路线都会改变下一步的移动方式。",
    goalLine: "到达绿色终点。用未踩过的泥地刹车。按 R 重新开始。",
    mode: "解谜模式",
    controls: {
      move: "移动",
      restart: "重开",
    },
    mobileHelpTitle: "Carver 玩法",
    mobileRules: [
      { label: "移动", text: "点击箭头、在棋盘上滑动，或使用 WASD / 方向键。" },
      { label: "规则", text: "离开泥地会把它变成冰；冰面会让你继续滑行。" },
      { label: "目标", text: "规划路线，保留刹车点，到达绿色终点。" },
    ],
    howToPlay: "玩法",
    ruleCards: [
      { color: "text-[#bb9af7]", label: "到达绿色终点。", text: "用 WASD、方向键、滑动或触控按钮移动。按 R 重新开始。" },
      { color: "text-[#f7768e]", label: "泥地提供摩擦。", text: "你必须从泥地发力，才能开始移动。" },
      { color: "text-[#7aa2f7]", label: "无摩擦下滑。", text: "离开 Dirt 地块会把它变成 Ice。在 Ice 上，你会持续滑行。" },
      { color: "text-[#9ece6a]", label: "路径会改变规则。", text: "你的移动历史决定物理状态。用未踩过的泥地停下来。" },
    ],
    routeNotes: "路线笔记",
    notes: [
      "每次移动都会消耗一个刹车点。如果某个方向被堵住，就换路线或重开。",
      "好的路线会在前方留下足够泥地，让你在棋盘全变冰之前慢下来。",
    ],
    tipLabel: "提示",
    tip: "看起来最短的路经常是陷阱。到终点前，给自己留一个干净的刹车点。",
    ready: "就绪",
    engine: "原生引擎",
  },
};

export default function CarverPage() {
  const [locale, setLocale] = useState<Locale>("en");
  const text = copy[locale];

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

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
            className="h-10 w-10 rounded-lg border border-[#414868] bg-[#0a0c10] shadow-[0_0_18px_rgba(122,162,247,0.22)]"
          />
          <span className="text-2xl font-black tracking-tight text-[#c0caf5]">carver</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden sm:flex space-x-8 text-[10px] text-[#565f89]">
            <span>{text.eyebrow}</span>
            <span>{text.noSignup}</span>
          </div>
          <button
            type="button"
            onClick={() => setLocale(locale === "en" ? "zh" : "en")}
            className="inline-flex items-center gap-2 border border-[#414868] bg-[#1a1b26] px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-[#9aa5ce] transition hover:border-[#7aa2f7] hover:text-[#c0caf5]"
            aria-label={locale === "en" ? "Switch to Chinese" : "切换到英文"}
          >
            <Icon icon={languageIcon} className="h-4 w-4" aria-hidden="true" />
            {locale === "en" ? "中" : "EN"}
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
            <div className="w-full flex items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-mono font-bold tracking-tighter text-[#c0caf5]">{text.title}</h1>
                <p className="mt-2 max-w-[34rem] text-sm leading-6 text-[#9aa5ce]">{text.intro}</p>
                <p className="mt-2 max-w-[34rem] text-[11px] uppercase tracking-widest text-[#7aa2f7]">{text.goalLine}</p>
              </div>
              <div className="text-[#565f89] flex shrink-0 items-center gap-2 text-xs uppercase tracking-widest bg-[#1a1b26] px-3 py-1 border border-[#24283b]">
                {text.mode}
              </div>
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

            <section aria-labelledby="how-to-play" className="w-full rounded border border-[#24283b] bg-[#16161e]/95 p-4 text-[#9aa5ce] md:hidden">
              <h2 id="how-to-play" className="text-xs font-black uppercase tracking-widest text-[#c0caf5]">{text.mobileHelpTitle}</h2>
              <ul className="mt-3 space-y-2 text-xs leading-5">
                {text.mobileRules.map((rule) => (
                  <li key={rule.label}>
                    <strong className="text-[#c0caf5]">{rule.label}:</strong> {rule.text}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </section>

        <aside className="h-full w-80 lg:w-[400px] border-l border-[#24283b] bg-[#16161e] p-6 space-y-8 overflow-y-auto overscroll-contain shrink-0 hidden md:flex md:flex-col">
          <div className="space-y-4">
            <h2 className="text-[#7aa2f7] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">{text.howToPlay}</h2>
            <div className="p-4 bg-[#1a1b26] border border-[#24283b] space-y-4">
              {text.ruleCards.map((rule) => (
                <div className="flex gap-3" key={rule.label}>
                  <span className={`${rule.color} mt-1 text-[10px]`}>■</span>
                  <div className="text-[11px] leading-relaxed text-[#9aa5ce]">
                    <strong className="text-[#c0caf5]">{rule.label}</strong> {rule.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-[#bb9af7] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">{text.routeNotes}</h2>
            <div className="space-y-3 text-[11px] leading-relaxed text-[#9aa5ce]">
              {text.notes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          </div>

          <div className="p-4 border border-dashed border-[#414868] bg-[#1a1b26] mt-auto">
            <div className="text-[9px] text-[#565f89] mb-2 uppercase tracking-widest">{text.tipLabel}</div>
            <p className="text-[10px] leading-relaxed text-[#717cb4]">{text.tip}</p>
          </div>
        </aside>
      </div>

      <footer className="h-10 bg-[#1a1b26] border-t border-[#24283b] flex items-center px-6 shrink-0">
        <div className="flex space-x-6 text-[9px] tracking-widest text-[#565f89] font-bold">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-[#9ece6a] mr-2" /> {text.ready}
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-[#24283b] mr-2 border border-[#414868]" /> {text.engine}
          </div>
        </div>
        <div className="ml-auto text-[9px] text-[#414868]">© 2026 CARVER</div>
      </footer>
    </main>
  );
}
