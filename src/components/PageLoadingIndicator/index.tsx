import { useRouter } from "next/dist/client/router";
import { FC, useEffect, useState } from "react";

const PageLoadingIndicator: FC<any> = ({ children }) => {
  const { events } = useRouter();
  const [isLoading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    events.on("routeChangeStart", () => setLoading(true));
    events.on("routeChangeComplete", () => setLoading(false));
  }, []);

  if (!isLoading) {
    return children;
  }

  return (
    <div className="fixed top-0 w-full">
      <div className="absolute h-[5px] w-full overflow-x-hidden">
        <div className="absolute h-[5px] w-[150%] bg-[rgb(68,_86,_241)] opacity-40"></div>
        <div className="absolute h-[5px] animate-[increase_2s_infinite] bg-[#1856ff]"></div>
        <div className="absolute h-[5px] animate-[decrease_2s_0.5s_infinite] bg-[rgb(52,_118,_240)]"></div>
      </div>
    </div>
  );
};

export default PageLoadingIndicator;
