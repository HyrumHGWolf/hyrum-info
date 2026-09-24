import NebulaField from "@/components/NebulaField";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import SkyLoader from "@/components/SkyLoader";

/** Static chrome paints first; the interactive sky hydrates as a client island. */
export default function Page() {
  return (
    <>
      <NebulaField />
      <SiteHeader />
      <SkyLoader />
      <Footer />
    </>
  );
}
