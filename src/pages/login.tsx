import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import useToast from "~/hooks/useToast";
import { useRouter } from "next/router";

const Login = () => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { toast } = useToast();
  const session = useSession();
  const router = useRouter();

  const handleLoginClick = () => {
    try {
      setLoading(true);

      if (!email || !password) {
        toast({ message: "Please enter your email and password." });
        return;
      }
    } catch (e) {
      console.log((e as Error).message);
      toast({ message: "Error on login." });
    }
    setLoading(false);
  };

  const handleGithubLogin = async () => {
    await signIn("github");
  };

  useEffect(() => {
    setLoading(session.status === "loading");

    if (!isLoading && session.status === "authenticated") {
      void router.push("/");
    }
  }, [isLoading, router, session.status]);

  return (
    <div className="grid h-screen items-center justify-center bg-gray-100">
      <div className="m-auto w-80 rounded-lg bg-white px-6 py-4 text-center shadow-lg dark:bg-gray-800 md:px-10 md:py-8 lg:px-10 lg:py-8">
        <div className="hidden">
          <div className="self-center text-3xl font-bold  text-gray-600 dark:text-white sm:text-2xl">
            Login
          </div>
          <div className="mt-6 flex flex-col gap-4">
            <input
              type="text"
              placeholder="Email"
              className="input-bordered input w-full max-w-xs"
              autoComplete="disabled"
              disabled={isLoading}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Password"
              className="input-bordered input w-full max-w-xs"
              disabled={isLoading}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            className="btn-primary btn w-full"
            disabled
            onClick={() => void handleLoginClick()}
          >
            Login
          </button>
        </div>
        <button
          className="btn-info btn w-full"
          onClick={() => void handleGithubLogin()}
        >
          Login with Github
        </button>
      </div>
    </div>
  );
};

export default Login;
