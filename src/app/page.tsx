import Image from "next/image";
import styles from "./page.module.css";
import ScreenCapture from "@/components/ScreenCaputre";

export default function Home() {


  return (
    <main className={styles.main}>
        <p>
          This example shows you the contents of the selected part of your display.
          Click the Start Capture button to begin.
        </p>

        <ScreenCapture/>

    </main>
  );
}
