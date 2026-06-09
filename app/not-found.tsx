export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#05070a] text-[#c0caf5] font-mono flex items-center justify-center p-6">
      <div className="border border-[#24283b] bg-[#16161e] p-8 max-w-md text-center">
        <p className="text-[#7aa2f7] text-xs font-bold tracking-widest mb-4">CARVER // 404</p>
        <h1 className="text-3xl font-bold mb-3">Out of Bounds</h1>
        <p className="text-sm text-[#9aa5ce]">This tile does not exist.</p>
      </div>
    </main>
  );
}
