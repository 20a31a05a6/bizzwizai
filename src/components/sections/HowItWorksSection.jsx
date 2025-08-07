"use client";
import React, { memo, useCallback, useEffect, useRef } from "react";
import { Lightbulb, FileText, Phone, LayoutDashboard } from "lucide-react";
import { animate, motion, useScroll, useTransform } from "framer-motion";

// Simple cn utility function
const cn = (...classes) => classes.filter(Boolean).join(" ");

const GlowingEffect = memo(
  ({
    blur = 0,
    inactiveZone = 0.7,
    proximity = 0,
    spread = 20,
    variant = "default",
    glow = false,
    className,
    movementDuration = 2,
    borderWidth = 1,
    disabled = true,
  }) => {
    const containerRef = useRef(null);
    const lastPosition = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef(0);

    const handleMove = useCallback(
      (e) => {
        if (!containerRef.current) return;
        if (animationFrameRef.current)
          cancelAnimationFrame(animationFrameRef.current);

        animationFrameRef.current = requestAnimationFrame(() => {
          const element = containerRef.current;
          const { left, top, width, height } = element.getBoundingClientRect();
          const mouseX = e?.x ?? lastPosition.current.x;
          const mouseY = e?.y ?? lastPosition.current.y;

          if (e) lastPosition.current = { x: mouseX, y: mouseY };

          const center = [left + width / 2, top + height / 2];
          const distanceFromCenter = Math.hypot(
            mouseX - center[0],
            mouseY - center[1]
          );
          const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

          if (distanceFromCenter < inactiveRadius) {
            element.style.setProperty("--active", "0");
            return;
          }

          const isActive =
            mouseX > left - proximity &&
            mouseX < left + width + proximity &&
            mouseY > top - proximity &&
            mouseY < top + height + proximity;

          element.style.setProperty("--active", isActive ? "1" : "0");
          if (!isActive) return;

          const currentAngle =
            parseFloat(element.style.getPropertyValue("--start")) || 0;
          let targetAngle =
            (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) /
              Math.PI +
            90;
          const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
          const newAngle = currentAngle + angleDiff;

          animate(currentAngle, newAngle, {
            duration: movementDuration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (value) => {
              element.style.setProperty("--start", String(value));
            },
          });
        });
      },
      [inactiveZone, proximity, movementDuration]
    );

    useEffect(() => {
      if (disabled) return;

      const handleScroll = () => handleMove();
      const handlePointerMove = (e) => handleMove(e);

      window.addEventListener("scroll", handleScroll, { passive: true });
      document.body.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });

      return () => {
        if (animationFrameRef.current)
          cancelAnimationFrame(animationFrameRef.current);
        window.removeEventListener("scroll", handleScroll);
        document.body.removeEventListener("pointermove", handlePointerMove);
      };
    }, [handleMove, disabled]);

    return (
      <>
        <div
          className={cn(
            "pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity",
            glow && "opacity-100",
            variant === "white" && "border-white",
            disabled && "!block"
          )}
        />
        <div
          ref={containerRef}
          style={{
            "--blur": `${blur}px`,
            "--spread": spread,
            "--start": "0",
            "--active": "0",
            "--glowingeffect-border-width": `${borderWidth}px`,
            "--repeating-conic-gradient-times": "5",
            "--gradient":
              variant === "white"
                ? `repeating-conic-gradient(
                from 236.84deg at 50% 50%,
                var(--black),
                var(--black) calc(25% / var(--repeating-conic-gradient-times))
              )`
                : `radial-gradient(circle, #dd7bbb 10%, #dd7bbb00 20%),
              radial-gradient(circle at 40% 40%, #d79f1e 5%, #d79f1e00 15%),
              radial-gradient(circle at 60% 60%, #5a922c 10%, #5a922c00 20%), 
              radial-gradient(circle at 40% 60%, #4c7894 10%, #4c789400 20%),
              repeating-conic-gradient(
                from 236.84deg at 50% 50%,
                #dd7bbb 0%,
                #d79f1e calc(25% / var(--repeating-conic-gradient-times)),
                #5a922c calc(50% / var(--repeating-conic-gradient-times)), 
                #4c7894 calc(75% / var(--repeating-conic-gradient-times)),
                #dd7bbb calc(100% / var(--repeating-conic-gradient-times))
              )`,
          }}
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity",
            glow && "opacity-100",
            blur > 0 && "blur-[var(--blur)]",
            className,
            disabled && "!hidden"
          )}
        >
          <div
            className={cn(
              "glow",
              "rounded-[inherit]",
              'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
              "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
              "after:[background:var(--gradient)] after:[background-attachment:fixed]",
              "after:opacity-[var(--active)] after:transition-opacity after:duration-300",
              "after:[mask-clip:padding-box,border-box]",
              "after:[mask-composite:intersect]",
              "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]"
            )}
          />
        </div>
      </>
    );
  }
);

GlowingEffect.displayName = "GlowingEffect";

const GridItem = ({ icon, title, description, step }) => (
  <div className="min-h-[14rem] sm:min-h-[16rem] font-montserrat">
    <div className="relative h-full rounded-lg sm:rounded-[1.25rem] md:rounded-[1.5rem] border-[0.75px] border-white/10 p-1.5 sm:p-2 md:p-3">
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={3}
      />
      <div className="relative flex h-full flex-col justify-between gap-4 sm:gap-6 overflow-hidden rounded-lg sm:rounded-xl border-[0.75px] bg-gray-900/50 backdrop-blur-sm p-4 sm:p-6 shadow-sm">
        <div className="relative flex flex-1 flex-col gap-3 sm:gap-4">
          <span className="w-fit text-xs font-semibold bg-white/10 text-white px-2 sm:px-3 py-1 rounded-full">
            {step}
          </span>
          <div className="w-fit rounded-lg border-[0.75px] border-white/20 bg-white/5 p-2 sm:p-3">
            {icon}
          </div>
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-[-0.04em] bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent drop-shadow-[0_0_32px_rgba(255,255,255,0.3)]">
              {title}
            </h3>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export function HowItWorksSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <section
      id="how-it-works"
      ref={sectionRef} // Attach the ref here
      className="w-full h-full flex flex-col items-center justify-center bg-black text-white font-montserrat p-4"
    >
      <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12 bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent drop-shadow-[0_0_32px_rgba(255,255,255,0.3)]">
        How it works
      </h2>

      <motion.div
        className="relative max-w-6xl w-full mx-auto"
        style={{ y }} // Apply the scroll-based transform
      >
        <div className="relative p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(128,90,213,0.3)]">
          <div className="absolute inset-0 rounded-xl sm:rounded-[2rem] bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none"></div>
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <GridItem
                step="Step 1"
                icon={<Lightbulb className="h-4 w-4" />}
                title="Démarrez votre projet"
                description="Remplissez un formulaire simple en plusieurs étapes pour partager votre idée et les informations de votre entreprise. Aucun jargon technique n'est requis."
              />
              <GridItem
                step="Step 2"
                icon={<FileText className="h-4 w-4" />}
                title="Obtenez votre plan et votre logo"
                description="Recevez un plan d'affaires personnalisé et créez instantanément votre logo de marque généré par l'IA."
              />
              <GridItem
                step="Step 3"
                icon={<Phone className="h-4 w-4" />}
                title="Appel de validation"
                description="Un de nos consultants vous contactera sous 24 heures pour comprendre et valider votre projet."
              />
              <GridItem
                step="Step 4"
                icon={<LayoutDashboard className="h-4 w-4" />}
                title="Accès au tableau de bord"
                description="Une fois votre projet approuvé et payé, accédez à l'intégralité de votre tableau de bord avec maquettes, échéances, fichiers et mises à jour en temps réel."
              />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default HowItWorksSection;