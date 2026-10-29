import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Experience from '@/components/Experience';
import Projects from '@/components/Projects';
import Skills from '@/components/Skills';
import Certificates from '@/components/Certificates';
import Contact from '@/components/Contact';
import Shell from '@/components/Shell';
import AdminModal from '@/components/AdminModal';

export default function Page() {
  return (
    <>
      <Navbar />
      <Shell>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Certificates />
        <Contact />
      </Shell>
      <AdminModal />
    </>
  );
}
