"use client";

import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";

type GiftAnimationProps = {
  type: "rose" | "car" | "dragon";
  className?: string;
};

const sources: Record<GiftAnimationProps["type"], string> = {
  rose: "/lottie/rose.json",
  car: "/lottie/car.json",
  dragon: "/lottie/dragon.json",
};

const GiftAnimation: React.FC<GiftAnimationProps> = ({ type, className }) => {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    setData(null);
    fetch(sources[type])
      .then((res) => res.json())
      .then((json) => setData(json));
  }, [type]);

  return (
    <div className={className}>
      {data && (
        <Lottie
          animationData={data}
          loop={false}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
};

export default GiftAnimation;