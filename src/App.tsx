import Spotlight from './components/Spotlight';
import SmoothScroll from './components/SmoothScroll';
import ScrollProgress from './components/ScrollProgress';
import SectionDots from './components/SectionDots';
import MobileDock from './components/MobileDock';
import PageLoader from './components/PageLoader';
import HeroSection from './sections/HeroSection';
import MarqueeSection from './sections/MarqueeSection';
import AboutSection from './sections/AboutSection';
import ServicesSection from './sections/ServicesSection';
import EducationSection from './sections/EducationSection';
import ProjectsSection from './sections/ProjectsSection';
import Footer from './sections/Footer';

export default function App() {
  return (
    <>
      <PageLoader />
      <SmoothScroll />
      <ScrollProgress />
      <SectionDots />
      <MobileDock />
      <main
        style={{ overflowX: 'clip', background: '#0C0C0C' }}
        className="font-kanit"
      >
        <Spotlight />
        <div id="hero">
          <HeroSection />
        </div>
        <MarqueeSection />
        <AboutSection />
        <ServicesSection />
        <EducationSection />
        <ProjectsSection />
        <Footer />
      </main>
    </>
  );
}
