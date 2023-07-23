import type { FC } from "react";

const Wrapper: FC<{ children: React.ReactNode }> = ({ children }) => (
  <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
    <div className="container flex max-w-max flex-col justify-center gap-12 px-4 py-16">
      {children}
    </div>
  </main>
);
export default Wrapper;
