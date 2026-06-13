// import Image from "next/image";
import { HeroIntro } from "@/components/HeroIntro";
import { Weather } from "@/components/weather/Weather";

export default function StartPage() {
  return (
    <>
      <HeroIntro />
      <Weather />
    </>
  );
}
