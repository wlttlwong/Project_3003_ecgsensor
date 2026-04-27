"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { getToken } from "../lib/auth";
import Chatbot from "./Chatbot";

const HIDDEN_ROUTES = new Set(["/login", "/register"]);

export default function GlobalChatbot() {
  const pathname = usePathname();
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    const hasToken = !!getToken();
    const shouldHide = pathname ? HIDDEN_ROUTES.has(pathname) : false;
    setShowChatbot(hasToken && !shouldHide);
  }, [pathname]);

  if (!showChatbot) return null;
  return <Chatbot />;
}
