import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      <Footer />
    </div>
  );
}
