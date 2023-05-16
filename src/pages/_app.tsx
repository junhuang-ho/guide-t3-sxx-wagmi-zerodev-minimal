import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";

import WalletProvider from "~/contexts/Wallet";
import Hydration from "~/components/Hydration";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <Hydration>
      <WalletProvider session={session}>
        <Component {...pageProps} />
      </WalletProvider>
    </Hydration>
  );
};

export default api.withTRPC(MyApp);
