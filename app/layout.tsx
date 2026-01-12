import "./globals.css"
import { UserProvider } from "@/app/context/UserContext"
import HeaderWrapper from "./components/HeaderWrapper"
import BackgroundPixelBlast from "@/components/BackgroundPixelBlast";
import ThemeApplier from "@/app/components/theme/ThemeApplier";

export default function RootLayout({ 
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="relative text-white">
     
 <ThemeApplier/>
        <BackgroundPixelBlast />

        {/* everything above bg */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}

