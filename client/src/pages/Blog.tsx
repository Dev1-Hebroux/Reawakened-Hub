import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BlogGrid } from "@/components/sections/BlogGrid";

export default function Blog() {
  return (
    <div className="min-h-screen bg-white text-foreground overflow-x-hidden">
      <Navbar />
      <main className="pt-20">
        <BlogGrid />
      </main>
      <Footer />
    </div>
  );
}
