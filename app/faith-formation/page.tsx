import { pageMetadata } from "@/lib/meta";
import OpenOnHash from "@/components/OpenOnHash";
import SectionList from "@/components/SectionList";
import { Band, PageHero } from "@/components/ui";
import { FORMATION } from "@/lib/content";
import photo from "@/public/img/chapel-renovation.jpg";

export const metadata = pageMetadata({
  title: "Faith Formation",
  description: "Religious Education for age 4 through 8th grade, OCIA for adults, Tuesday and men's Bible studies, Life Teen and Catholic schools at St. Mary Parish, Marshall, Michigan.",
  path: "/faith-formation",
});

export default function FaithFormation() {
  return (
    <>
      <PageHero title="Faith Formation" lede="Religious education for children, OCIA for adults, and two weekly Bible studies." photo={photo} priority />
      <Band tone="paper">
        <OpenOnHash />
        <SectionList sections={FORMATION} label="Faith formation programs" />
      </Band>
    </>
  );
}
