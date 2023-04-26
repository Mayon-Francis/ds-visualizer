import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

import BasicTree from "../components/Sidebar/Sidebar";
function Home() {
  function showNotification() {
    console.log("showNotification", Notification);
    // console.log("readFileSync", readFileSync);
    // console.log("CWD", process.cwd());
    // return;
    // const notification = new Notification({
    //   title: "Nextron",
    //   body: "Notification from main process",
    // });
    // notification.show();
  }

  return (
    <React.Fragment>
      <Head>
        <title>Home - Nextron (with-typescript)</title>
      </Head>
      <BasicTree />
      <div>
        <Link href="/next">
          <a>Adutta page il poda</a>
        </Link>
        <button onClick={showNotification}>Show Notification</button>
        <img src="/images/logo.png" />
      </div>
    </React.Fragment>
  );
}

export default Home;
