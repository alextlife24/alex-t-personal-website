import Hero from '@/components/sections/Hero';
import AboutSection from '@/components/sections/AboutSection';
import CoffeeSection from '@/components/sections/CoffeeSection';
import PlacesSection from '@/components/sections/PlacesSection';
import PhotographySection from '@/components/sections/PhotographySection';
import TechSection from '@/components/sections/TechSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import ContactSection from '@/components/sections/ContactSection';

/**
 * 首頁只負責組裝區塊順序。
 * 要調整區塊順序或暫時隱藏某一區，在這裡增減即可。
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <CoffeeSection />
      <PlacesSection />
      <PhotographySection />
      <TechSection />
      <ProjectsSection />
      <ContactSection />
    </>
  );
}
