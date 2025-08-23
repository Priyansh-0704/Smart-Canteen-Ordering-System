export default function Home() {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center text-center px-6"
      style={{ backgroundImage: "url('/images/background.jpg')" }} // keep your image in public/images
    >
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl text-white">
        <h1 className="text-6xl font-extrabold mb-6 drop-shadow-lg tracking-wide">
          <span className="text-amber-400">HostelEats</span>
        </h1>
        <p className="text-lg md:text-xl font-light leading-relaxed">
          Your smart canteen companion  
          Skip the queues, preorder your meals, and enjoy fresh food hassle-free.  
          <br />
        </p>
      </div>
    </div>
  );
}
