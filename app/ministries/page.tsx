import { pageMetadata } from "@/lib/meta";
import OpenOnHash from "@/components/OpenOnHash";
import SectionList from "@/components/SectionList";
import { Band, PageHero } from "@/components/ui";
import { MINISTRIES } from "@/lib/content";
import photo from "@/public/img/monstrance.jpg";

export const metadata = pageMetadata({
  title: "Councils and Ministries",
  description: "Music ministry, Knights of Columbus Council 5999, Women's Ministry, the Parish and Finance Councils, the guilds, and the ministries that welcome, visit, garden, clean and feed at St. Mary Parish, Marshall.",
  path: "/ministries",
});

export default function Ministries() {
  return (
    <>
      <PageHero title="Councils and Ministries" lede="The people who sing, serve, visit, garden, cook and keep the parish running. Every one of them would welcome you." photo={photo} priority />
      <Band tone="paper">
        <OpenOnHash />
        <SectionList sections={MINISTRIES} label="Councils and ministries" />
      </Band>
    </>
  );
}
