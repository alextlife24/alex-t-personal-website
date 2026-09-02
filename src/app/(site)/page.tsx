import Hero from '@/components/sections/Hero';
import AboutSection from '@/components/sections/AboutSection';
import CoffeeSection from '@/components/sections/CoffeeSection';
import PlacesSection from '@/components/sections/PlacesSection';
import PhotographySection from '@/components/sections/PhotographySection';
import TechSection from '@/components/sections/TechSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import ContactSection from '@/components/sections/ContactSection';
import {
  getAboutContent,
  getCoffeeContent,
  getHeroContent,
  getPhotographyContent,
  getPlacesContent,
  getProjectsContent,
  getSocialContent,
  getTechContent,
} from '@/lib/content';

/**
 * 首頁只負責取得內容並組裝區塊順序。
 *
 * 內容來源：Supabase 有資料就用 Supabase，否則自動退回 src/data。
 * 要調整區塊順序或暫時隱藏某一區，在這裡增減即可。
 */
export const revalidate = 60;

export default async function HomePage() {
  const [hero, about, coffee, places, photography, tech, projects, social] =
    await Promise.all([
      getHeroContent(),
      getAboutContent(),
      getCoffeeContent(),
      getPlacesContent(),
      getPhotographyContent(),
      getTechContent(),
      getProjectsContent(),
      getSocialContent(),
    ]);

  return (
    <>
      <Hero hero={hero} />
      <AboutSection about={about} />
      <CoffeeSection coffee={coffee} />
      <PlacesSection places={places} />
      <PhotographySection photography={photography} />
      <TechSection tech={tech} />
      <ProjectsSection projects={projects} />
      <ContactSection contact={social.contact} socials={social.socials} />
    </>
  );
}
