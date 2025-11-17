import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { MdFormatQuote } from "react-icons/md";

interface Quote {
  text: string;
  author?: string;
}

interface MotivationQuoteProps {
  quotes: Quote[];
  interval?: number; // ms between changes
  typewriterCharsPerMs?: number; // speed of typewriter
  maxWidth?: number | string | "full"; // "full" (default) => 100%, or a number/CSS value to constrain
}

const enterAnim = keyframes`
  from { transform: translateY(8px) scale(.995); opacity: 0; filter: blur(6px); }
  to   { transform: translateY(0) scale(1); opacity: 1; filter: blur(0); }
`;

const exitAnim = keyframes`
  from { transform: translateY(0) scale(1); opacity: 1; filter: blur(0); }
  to   { transform: translateY(-8px) scale(.995); opacity: 0; filter: blur(6px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const FrostedCard = styled(Card)`
  border-radius: 14px;
  overflow: visible;
  background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(246,250,255,0.92));
  box-shadow: 0 10px 30px rgba(10, 24, 48, 0.08);
  backdrop-filter: blur(6px) saturate(120%);
  border: 1px solid rgba(200,210,240,0.6);
  position: relative;
`;

const AnimatedWrapper = styled("div")<{ state: "enter" | "idle" | "exit"; reduced: boolean }>`
  will-change: transform, opacity;
  animation: ${({ state, reduced }) =>
      reduced ? (state === "enter" ? fadeIn : state === "exit" ? "none" : "none")
              : (state === "enter" ? enterAnim : state === "exit" ? exitAnim : "none")}
    480ms cubic-bezier(0.2, 0.9, 0.2, 1) forwards;
`;

const SvgBackground = styled("div")`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.08;
  display: block;
`;

const AccentIconWrap = styled("div")`
  position: absolute;
  right: 14px;
  top: 14px;
  z-index: 2;
  opacity: 0.9;
`;

const defaultInterval = 10000;
const defaultCharsPerMs = 0.06;

const MotivationQuote: React.FC<MotivationQuoteProps> = ({
  quotes,
  interval = defaultInterval,
  typewriterCharsPerMs = defaultCharsPerMs,
  maxWidth = "full",
}) => {
  const theme = useTheme();
  const safeQuotes = useMemo(
    () => (quotes && quotes.length > 0 ? quotes : [{ text: "Keep going — one step at a time.", author: "Unknown" }]),
    [quotes]
  );

  const [index, setIndex] = useState(0);
  const [animState, setAnimState] = useState<"enter" | "idle" | "exit">("enter");
  const [paused, setPaused] = useState(false);

  // typewriter state
  const [typed, setTyped] = useState<string>("");
  const typeTimeoutRef = useRef<number | null>(null);

  const prefersReducedMotion = usePrefersReducedMotion();

  const pickNextIndex = (cur: number) => {
    if (safeQuotes.length <= 1) return cur;
    let next = Math.floor(Math.random() * safeQuotes.length);
    if (next === cur) next = (next + 1) % safeQuotes.length;
    return next;
  };

  // schedule the interval-based rotation (no progress bar)
  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(() => {
      setAnimState("exit");
      setTimeout(() => {
        setIndex((prev) => pickNextIndex(prev));
        setAnimState("enter");
      }, prefersReducedMotion ? 120 : 420);
    }, interval);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused, interval, safeQuotes.length, prefersReducedMotion]);

  // Pause on hover
  const onMouseEnter = () => setPaused(true);
  const onMouseLeave = () => setPaused(false);

  // Typewriter: show full text immediately if reduced motion requested
  useEffect(() => {
    const full = safeQuotes[index].text ?? "";
    if (typeTimeoutRef.current) {
      window.clearTimeout(typeTimeoutRef.current);
      typeTimeoutRef.current = null;
    }
    if (prefersReducedMotion) {
      setTyped(full);
      return;
    }

    setTyped("");
    const estTotalMs = Math.max(300, Math.min(2200, Math.round((full.length / typewriterCharsPerMs))));
    const perChar = Math.max(6, Math.round(estTotalMs / Math.max(full.length, 1)));

    let i = 0;
    const tick = () => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i < full.length) {
        typeTimeoutRef.current = window.setTimeout(tick, perChar);
      } else {
        typeTimeoutRef.current = null;
      }
    };

    window.setTimeout(() => tick(), 50);

    return () => {
      if (typeTimeoutRef.current) {
        window.clearTimeout(typeTimeoutRef.current);
        typeTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, typewriterCharsPerMs, safeQuotes, prefersReducedMotion]);

  useEffect(() => {
    if (animState === "enter" && prefersReducedMotion) {
      const t = window.setTimeout(() => setAnimState("idle"), 180);
      return () => clearTimeout(t);
    }
    if (animState === "enter") {
      const t = window.setTimeout(() => setAnimState("idle"), 520);
      return () => clearTimeout(t);
    }
  }, [animState, prefersReducedMotion]);

  const current = safeQuotes[index];

  // compute card sx for full-width behavior
  const cardSx = maxWidth === "full"
    ? { width: "100%", borderRadius: 2 } 
    : { width: "100%", maxWidth, borderRadius: 2 };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      px={{ xs: 0, md: 0 }}
      py={{ xs: 2, md: 4 }}
      role="region"
      aria-label="Motivational quote"
      sx={{ width: "100%" }}
    >
      <FrostedCard sx={cardSx}>
        <SvgBackground aria-hidden>
          <svg width="100%" height="100%" viewBox="0 0 800 240" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0" stopColor={theme.palette.primary.light} stopOpacity="0.14" />
                <stop offset="1" stopColor={theme.palette.secondary.light} stopOpacity="0.06" />
              </linearGradient>
            </defs>

            <rect x="0" y="0" width="800" height="240" fill="url(#g1)" />
            <g transform="translate(20,10)" fill="none" stroke={theme.palette.primary.main} strokeOpacity="0.03" strokeWidth="1">
              <path d="M0 160 C120 100 260 120 400 80 C540 40 680 80 800 60" />
              <path d="M0 200 C140 150 260 170 400 130 C540 90 680 120 800 110" />
            </g>

            <circle cx="720" cy="40" r="32" fill={theme.palette.primary.main} opacity="0.05" />
            <circle cx="64" cy="20" r="16" fill={theme.palette.secondary.main} opacity="0.03" />
          </svg>
        </SvgBackground>

        <AccentIconWrap>
          <Box
            sx={{
              width: 44,
              height: 44,
              bgcolor: "rgba(15, 76, 255, 0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              border: "1px solid rgba(15,76,255,0.08)",
            }}
          >
            <MdFormatQuote size={22} color={theme.palette.primary.main} />
          </Box>
        </AccentIconWrap>

        <CardContent
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          sx={{ position: "relative", overflow: "hidden", p: { xs: 2, md: 4 }, zIndex: 1 }}
        >
          <AnimatedWrapper state={animState} reduced={prefersReducedMotion}>
            <Typography
              variant="h5"
              component="p"
              color="primary"
              sx={{
                fontWeight: 800,
                lineHeight: 1.14,
                fontSize: { xs: "1rem", sm: "1.15rem", md: "1.35rem" },
                letterSpacing: "-0.01em",
                mb: 1.5,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
              role="status"
              aria-live="polite"
            >
              {typed}
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  width: 10,
                  ml: 0.5,
                  height: 18,
                  bgcolor: "primary.main",
                  borderRadius: 0.5,
                  opacity: typed.length < (current.text?.length ?? 0) ? 1 : 0.2,
                  transition: "opacity .25s linear",
                  verticalAlign: "middle",
                }}
                aria-hidden
              />
            </Typography>

            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              {current.author ? (
                <Box
                  sx={{
                    display: "inline-flex",
                    gap: 1,
                    alignItems: "center",
                    px: 1.25,
                    py: 0.5,
                    bgcolor: "rgba(10,20,60,0.04)",
                    borderRadius: 8,
                    fontWeight: 600,
                  }}
                >
                  — {current.author}
                </Box>
              ) : null}
            </Box>
          </AnimatedWrapper>
        </CardContent>
      </FrostedCard>
    </Box>
  );
};

export default MotivationQuote;

/* ---------------- helper hook ---------------- */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    try {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      const onChange = () => setReduced(mq.matches);
      onChange();
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else mq.addListener(onChange);
      return () => {
        if (mq.removeEventListener) mq.removeEventListener("change", onChange);
        else mq.removeListener(onChange);
      };
    } catch {
      setReduced(false);
    }
  }, []);
  return reduced;
}
