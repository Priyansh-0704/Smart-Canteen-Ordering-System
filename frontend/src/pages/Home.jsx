export default function Home() {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center text-center px-4 sm:px-6"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl text-white px-2">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 sm:mb-6 drop-shadow-lg tracking-wide">
          <span className="text-amber-400">HostelEats</span>
        </h1>

        <p className="text-sm sm:text-base md:text-xl font-light leading-relaxed px-1 sm:px-3">
          Your smart canteen companion  
          <br className="hidden sm:block" />
          Skip the queues, preorder your meals, and enjoy fresh food hassle-free.
        </p>
      </div>
    </div>
  );
}
