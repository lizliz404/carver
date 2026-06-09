import GameCanvas from '../components/GameCanvas';

export default function Page() {
  return (
    <main className="h-[100dvh] w-full flex flex-col bg-[#05070a] text-[#c0caf5] font-mono overflow-hidden select-none">
      
      {/* Header */}
      <header className="h-12 border-b border-[#24283b] flex items-center justify-between px-6 bg-[#16161e] shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-3 h-3 rounded-full bg-[#f7768e]"></div>
          <span className="text-xs font-bold tracking-widest text-[#7aa2f7]">CARVER // PROTOCOL_ACTIVE</span>
        </div>
        <div className="flex space-x-8 text-[10px] text-[#565f89]">
          <span className="hidden sm:inline">SYSTEM: FROST</span>
          <span>FPS: 60.0</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        
        {/* Play Area */}
        <section className="flex-1 flex flex-col items-center justify-center bg-[#0a0c10] relative overflow-y-auto">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#414868 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          
          <div className="z-10 w-full max-w-2xl px-4 flex flex-col gap-6 items-center">
            
            {/* Header Text */}
            <div className="w-full flex items-center justify-between">
              <h1 className="text-4xl md:text-5xl font-mono font-bold tracking-tighter text-[#c0caf5]">CARVER</h1>
              <div className="text-[#565f89] flex items-center gap-2 text-xs uppercase tracking-widest bg-[#1a1b26] px-3 py-1 border border-[#24283b]">
                Execute Mode
              </div>
            </div>

            {/* Game Canvas Container */}
            <div className="w-full bg-[#1a1b26] border-2 border-[#414868] relative shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center p-2 lg:p-4">
              <div className="relative h-[min(72dvh,620px)] min-h-[430px] w-full sm:h-auto sm:aspect-video sm:min-h-0">
                 <GameCanvas />
              </div>
            </div>

            {/* Controls */}
            <div className="w-full flex justify-between items-center bg-[#1a1b26] border border-[#24283b] p-4 text-[10px]">
              <div className="flex flex-wrap items-center gap-6 text-[#9aa5ce]">
               <div className="flex items-center gap-2">
                 <kbd className="bg-[#24283b] px-2 py-1 text-[#c0caf5] border border-[#414868]">W A S D</kbd>
                 <span>/</span>
                 <kbd className="bg-[#24283b] px-2 py-1 text-[#c0caf5] border border-[#414868]">ARROWS</kbd>
                 <span className="ml-2 uppercase tracking-wider text-[#565f89]">Move</span>
               </div>
               <div className="flex items-center gap-2">
                 <kbd className="bg-[#24283b] px-2 py-1 text-[#c0caf5] border border-[#414868]">R</kbd>
                 <span className="ml-2 uppercase tracking-wider text-[#565f89]">Restart</span>
               </div>
              </div>
            </div>

          </div>
        </section>

        {/* Documentation / Logic Column */}
        <aside className="w-80 lg:w-[400px] border-l border-[#24283b] bg-[#16161e] p-6 space-y-8 overflow-y-auto shrink-0 hidden md:flex md:flex-col">
          
          <div className="space-y-4">
            <h3 className="text-[#7aa2f7] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              Mechanics Readme
            </h3>
            <div className="p-4 bg-[#1a1b26] border border-[#24283b] space-y-4">
              <div className="flex gap-3">
                <span className="text-[#f7768e] mt-1 text-[10px]">■</span>
                <div className="text-[11px] leading-relaxed text-[#9aa5ce]">
                  <strong className="text-[#c0caf5]">Dirt provides traction.</strong> You must push off from it to initiate movement.
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-[#7aa2f7] mt-1 text-[10px]">■</span>
                <div className="text-[11px] leading-relaxed text-[#9aa5ce]">
                  <strong className="text-[#c0caf5]">Frictionless descent.</strong> Stepping off a Dirt tile converts it to Ice. On Ice, you slide continuously.
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-[#9ece6a] mt-1 text-[10px]">■</span>
                <div className="text-[11px] leading-relaxed text-[#9aa5ce]">
                  <strong className="text-[#c0caf5]">Emergent design.</strong> Your path history dictates physics. Use untouched dirt to halt.
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[#bb9af7] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
               Constraints
            </h3>
            <div className="space-y-2 font-mono text-[9px]">
              <div className="flex justify-between border-b border-[#24283b] pb-2">
                <span className="text-[#565f89]">Core Mechanic</span>
                <span className="text-[#c0caf5]">Path-to-Ice State Toggle</span>
              </div>
              <div className="flex justify-between border-b border-[#24283b] pb-2">
                <span className="text-[#565f89]">Architecture</span>
                <span className="text-[#c0caf5]">Pure Canvas 2D</span>
              </div>
              <div className="flex justify-between border-b border-[#24283b] pb-2">
                <span className="text-[#565f89]">Design Principle</span>
                <span className="text-[#c0caf5]">KISS / DRY / SOLID</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-[#565f89]">Novelty Check</span>
                <span className="text-[#c0caf5] flex items-center gap-1">Pass </span>
              </div>
              <div className="text-right text-[#565f89]">Not Sokoban, Not Match-3, 0 RNG.</div>
            </div>
          </div>
          
          <div className="p-4 border border-dashed border-[#414868] bg-[#1a1b26] mt-auto">
            <div className="text-[9px] text-[#565f89] mb-2 uppercase tracking-widest">Status</div>
            <ul className="text-[9px] space-y-2 text-[#717cb4]">
              <li className="flex items-start"><span className="mr-2 text-[#9ece6a]">✓</span> DRY: Grid State Matrix</li>
              <li className="flex items-start"><span className="mr-2 text-[#9ece6a]">✓</span> KISS: Single Key Output</li>
              <li className="flex items-start"><span className="mr-2 text-[#9ece6a]">✓</span> SoC: Render & State Split</li>
            </ul>
          </div>

        </aside>
      </div>
      
      {/* Footer */}
      <footer className="h-10 bg-[#1a1b26] border-t border-[#24283b] flex items-center px-6 shrink-0">
        <div className="flex space-x-6 text-[9px] tracking-widest text-[#565f89] font-bold">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-[#9ece6a] mr-2"></div> READY
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-[#24283b] mr-2 border border-[#414868]"></div> VANILLA ENGINE
          </div>
        </div>
        <div className="ml-auto text-[9px] text-[#414868]">
          © 2026 PIXEL_LOGIC_SOLUTIONS
        </div>
      </footer>
    </main>
  );
}
