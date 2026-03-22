import "@/app/[locale]/globals.css";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen w-full">
      {/* Space background */}
      <Image
        src="/images/space-bg.jpg"
        alt=""
        fill
        className="object-cover"
        priority
        quality={90}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen w-full">
        <div className="flex justify-end items-center w-full p-5">
          <ThemeToggle />
        </div>
        <div className="flex flex-col items-center grow h-full overflow-hidden justify-center">
          <div className="flex flex-col items-center gap-3 mb-10">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/25 flex items-center justify-center">
              <span className="text-2xl font-bold text-white leading-none tracking-tight">M</span>
            </div>
            <div className="text-center">
              <h1 className="font-display text-xl font-semibold tracking-tight text-white">Mars Shot</h1>
              <p className="text-[10px] text-white/70 tracking-widest uppercase">Venture Capital</p>
            </div>
          </div>
          {children}
        </div>
        <footer className="flex h-8 justify-center items-center w-full text-[11px] text-white/40 p-5">
          Mars Shot VC
        </footer>
      </div>
    </div>
  );
};

export default AuthLayout;
