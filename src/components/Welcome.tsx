import gsap from "gsap";
import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";

type FontWeightType = "subtitle" | "title";

type FontWeightConfig = {
    min: number;
    max: number;
    default: number;
};

const FONT_WEIGHTS: Record<FontWeightType, FontWeightConfig> = {
    subtitle: { min: 100, max: 400, default: 100 },
    title: { min: 400, max: 900, default: 400 },
};

const renderText = (
    text: string,
    className: string,
    baseWeight = 400
): JSX.Element[] => {
    return [...text].map((char, i) => (
        <span
            key={i}
            className={className}
            style={{ fontVariationSettings: `'wght' ${baseWeight}` }}
        >
            {char == " " ? "\u00A0" : char}
        </span>
    ));
};

const setupTextHover = (
    container: HTMLElement | null,
    type: FontWeightType
): (() => void) | undefined => {
    if (!container) return;

    const letters = container.querySelectorAll<HTMLSpanElement>("span");
    const { min, max, default: base } = FONT_WEIGHTS[type];

    const animateLetter = (
        letter: HTMLElement,
        weight: number,
        duration = 0.25
    ) => {
        return gsap.to(letter, {
            duration,
            ease: "power2.out",
            fontVariationSettings: `'wght' ${weight}`,
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
        const { left: containerLeft } = container.getBoundingClientRect();
        const mouseX = e.clientX - containerLeft;

        letters.forEach((letter) => {
            const { left, width } = letter.getBoundingClientRect();
            const distance = Math.abs(
                mouseX - (left - containerLeft + width / 2)
            );
            const intensity = Math.exp(-(distance ** 2) / 2000);
            animateLetter(letter, min + (max - min) * intensity);
        });
    };

    const handleMouseLeave = () =>
        letters.forEach((letter) => animateLetter(letter, base, 0.3));

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mousemove", handleMouseLeave);

    return () => {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mousemove", handleMouseLeave);
        letters.forEach((letter) => animateLetter(letter, base, 0.15));
    };
};

const Welcome = () => {
    const titleRef = useRef<HTMLHeadingElement | null>(null);
    const subtitleRef = useRef<HTMLParagraphElement | null>(null);

    useGSAP(() => {
        const cleanups = [
            setupTextHover(titleRef.current, "title"),
            setupTextHover(subtitleRef.current, "subtitle"),
        ];

        return () => {
            cleanups.forEach((cleanup) => cleanup?.());
        };
    }, []);

    return (
        <section id="welcome">
            <p ref={subtitleRef}>
                {renderText(
                    "Hey, I'm Leontii! Welcome to my",
                    "text-3xl font-georama",
                    100
                )}
            </p>
            <h1 className="mt-7" ref={titleRef}>
                {renderText("portfolio", "text-9xl italic font-georama")}
            </h1>

            <div className="small-screen">
                <p>
                    This Portfolio is designed for desktop/tabled screens only.
                </p>
            </div>
        </section>
    );
};

export default Welcome;
