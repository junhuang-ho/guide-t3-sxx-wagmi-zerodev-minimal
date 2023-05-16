import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { createContext, useContext, useState, type ReactNode } from "react";

// import {
//   connectorsForWallets,
//   RainbowKitProvider,
//   type Theme,
//   darkTheme,
//   lightTheme,
// } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet, polygon, polygonMumbai } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { SSXProvider } from "@spruceid/ssx-react";
import { SSXNextAuthRouteConfig } from "@spruceid/ssx-react/next-auth/frontend";
// import {
//   RainbowKitSiweNextAuthProvider,
//   GetSiweMessageOptions,
// } from "@rainbow-me/rainbowkit-siwe-next-auth";
// import {
//   googleWallet,
//   facebookWallet,
//   githubWallet,
//   discordWallet,
//   twitchWallet,
//   twitterWallet,
//   enhanceWalletWithAAConnector,
// } from "@zerodevapp/wagmi/rainbowkit";
import { GoogleSocialWalletConnector } from "@zerodevapp/wagmi";

import { env } from "~/env.mjs";

// eslint-disable-next-line
export interface IWalletContext {
  isEnableServerSIWE: boolean;
  setIsEnableServerSIWE: (v: boolean) => void;
}

export const WalletContext = createContext<IWalletContext>({
  isEnableServerSIWE: false,
  // eslint-disable-next-line
  setIsEnableServerSIWE: (v: boolean) => {},
});

export const useWallet = (): IWalletContext => {
  return useContext(WalletContext);
};

// const ZERODEV_PROJECT_ID = env.NEXT_PUBLIC_ZERODEV_PROJECT_ID;

const { chains, provider, webSocketProvider } = configureChains(
  [
    polygonMumbai,
    // ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [goerli] : []),
  ],
  [
    alchemyProvider({
      // eslint-disable-next-line
      apiKey: env.NEXT_PUBLIC_ALCHEMY_API_KEY_CLIENT,
    }),
    publicProvider(),
  ]
);

// const connectors = connectorsForWallets([
//   {
//     groupName: "Other",
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//     wallets: [
//       //   googleWallet({
//       //     chains: chains,
//       //     options: { projectId: ZERODEV_PROJECT_ID },
//       //   }),
//       //   enhanceWalletWithAAConnector(metaMaskWallet({ chains }), {
//       //     projectId: ZERODEV_PROJECT_ID,
//       //   }),
//       metaMaskWallet({ chains }),
//     ],
//   },
// ]);

const wagmiClient = createClient({
  autoConnect: false,
  connectors: [
    // eslint-disable-next-line
    new GoogleSocialWalletConnector({
      chains,
      options: {
        projectId: env.NEXT_PUBLIC_ZERODEV_PROJECT_ID,
      },
    }),
    // new MetaMaskConnector({ chains }),
    // new CoinbaseWalletConnector({ chains, options: { appName: "test" } }),
  ],
  provider,
  webSocketProvider,
});

// const getSiweMessageOptions: GetSiweMessageOptions = () => ({
//   statement: "Sign in to the RainbowKit + SIWE example app",
// });

const { server } = SSXNextAuthRouteConfig({
  signInOptions: { callbackUrl: "/protected" },
});
const ssxConfig: any = {
  siweConfig: {
    domain: "localhost:3000",
  },
  providers: {
    server,
  },
};

const WalletProvider = ({
  children,
  session,
}: {
  children: ReactNode;
  session: Session | null;
}) => {
  const [isEnableServerSIWE, setIsEnableServerSIWE] = useState<boolean>(false); // deprecated

  const contextProvider = { isEnableServerSIWE, setIsEnableServerSIWE };

  return (
    <WalletContext.Provider value={contextProvider}>
      <WagmiConfig client={wagmiClient}>
        <SSXProvider
          ssxConfig={
            // eslint-disable-next-line
            ssxConfig
          }
        >
          <SessionProvider session={session} refetchInterval={0}>
            {children}
          </SessionProvider>
        </SSXProvider>
      </WagmiConfig>
    </WalletContext.Provider>
  );
};

export default WalletProvider;
