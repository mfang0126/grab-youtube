import type { FC } from "react";

const Heading: FC<{ children: React.ReactNode }> = ({ children }) => (
  <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-white">
    {children}
  </h1>
);

export default Heading;
