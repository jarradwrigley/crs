"use client";
import { useState, useEffect } from "react";
import { OnFive, OnOne, OnSeven, OnSix } from "./Svg";


export default function Carousel() {
  const [current, setCurrent] = useState(0);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  // Replace these with your actual SVG components
  const slides: any[] = [
    {
      id: 1,
      component: OnOne,
      title: "CRS Portal",
      description:
        "Effortlessly manage your digital resources and physical assets through an intuitive, centralized interface designed for efficiency.",
    },
    {
      id: 2,
      component: OnFive,
      title: "CRS Portal",
      description:
        "Securely organize and manage sensitive data with robust access controls and compliance-ready protection mechanisms.",
    },
    {
      id: 3,
      component: OnSix,
      title: "CRS Portal",
      description:
        "Gain real-time visibility and oversight of all your resources with streamlined monitoring tools and intelligent insights.",
    },
    {
      id: 4,
      component: OnSeven,
      title: "CRS Portal",
      description:
        "Experience seamless access and control over your assets, anytime and anywhere, with a portal optimized for user convenience.",
    },
  ];
  

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrent((prev) => (prev + 1) % slides.length);
//     }, 4000);
//     return () => clearInterval(timer);
//   }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number): void => {
    setCurrentSlide(index);
  };

  const toggleAutoPlay = (): void => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  return (
    // <div className="relative h-80 overflow-hidden rounded-lg">
    //   {slides.map((slide, index) => (
    //     <div
    //       key={index}
    //       className={`absolute inset-0 transition-transform duration-500 ${
    //         index === current ? "translate-x-0" : "translate-x-full"
    //       }`}
    //     >
    //       <img
    //         src={slide.image}
    //         alt={slide.title}
    //         className="w-full h-full object-cover"
    //       />
    //       <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-6">
    //         <h3 className="text-white text-xl font-bold mb-2">{slide.title}</h3>
    //         <p className="text-white text-sm">{slide.text}</p>
    //       </div>
    //     </div>
    //   ))}

    //   <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
    //     {slides.map((_, index) => (
    //       <button
    //         key={index}
    //         className={`w-2 h-2 rounded-full ${
    //           index === current ? "bg-white" : "bg-white bg-opacity-50"
    //         }`}
    //         onClick={() => setCurrent(index)}
    //       />
    //     ))}
    //   </div>
    // </div>
    <>
      <div className="relative translate-y-[10%]">
        <div className="relative overflow-hidden rounded-3xl p-8 ">
          <div className="aspect-square w-full max-w-lg mx-auto relative overflow-hidden bg-white/5 rounded-2xl">
            {slides.map((slide: any, index: number) => {
              const SvgComponent = slide.component;
              let position: string = "";
              let shouldRender: boolean = false;

              if (index === currentSlide) {
                position = "translate-x-0"; // Current slide in center
                shouldRender = true;
              } else if (index === (currentSlide + 1) % slides.length) {
                position = "translate-x-full"; // Next slide off-screen right
                shouldRender = true;
              } else if (
                index ===
                (currentSlide - 1 + slides.length) % slides.length
              ) {
                position = "-translate-x-full"; // Previous slide off-screen left
                shouldRender = true;
              }

              // Only render slides that are part of the transition
              if (!shouldRender) return null;

              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-transform duration-700 ease-in-out ${position}`}
                >
                  <SvgComponent className="w-full h-full object-contain" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-5 translate-y-[5%]">
        <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold leading-tight">
          <span className="bg-gradient-to-r from-blue-400 via-[#87ceeb] to-[#87ceeb] bg-clip-text text-transparent">
            {slides[currentSlide].title}
          </span>
        </h1>
        <p className="text-md md:text-2xl text-slate-300 leading-relaxed max-w-2xl">
          {slides[currentSlide].description}
        </p>
      </div>
    </>
  );
}
