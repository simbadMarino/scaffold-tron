import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldTronAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({ title: "Scaffold-TRON App", description: "Built with 🏗 Scaffold-ETH 2" });

const ScaffoldTronApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider enableSystem>
          <ScaffoldTronAppWithProviders>{children}</ScaffoldTronAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldTronApp;
