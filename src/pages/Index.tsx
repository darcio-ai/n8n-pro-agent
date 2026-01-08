import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Specialties from "@/components/landing/Specialties";
import CTASection from "@/components/landing/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <Specialties />
        <CTASection />
      </main>
      
      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground text-sm">
          <p>© 2025 N8N Expert Agent. Especialista em automações n8n.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
