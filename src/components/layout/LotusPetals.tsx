"use client";

export default function LotusPetals() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Large petal - top right */}
      <svg
        className="lotus-petal lotus-petal-1 absolute -top-20 -right-20"
        width="300"
        height="300"
        viewBox="0 0 300 300"
        fill="none"
      >
        <path
          d="M150 20C180 80 260 120 280 180C260 220 200 260 150 280C100 260 40 220 20 180C40 120 120 80 150 20Z"
          fill="url(#petal-gradient-1)"
        />
        <defs>
          <linearGradient id="petal-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#E8734A" stopOpacity="0.08" />
          </linearGradient>
        </defs>
      </svg>

      {/* Medium petal - left center */}
      <svg
        className="lotus-petal lotus-petal-2 absolute top-1/3 -left-16"
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
        style={{ transform: "rotate(45deg)" }}
      >
        <path
          d="M100 10C120 50 170 80 185 120C170 150 130 175 100 190C70 175 30 150 15 120C30 80 80 50 100 10Z"
          fill="url(#petal-gradient-2)"
        />
        <defs>
          <linearGradient id="petal-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#E8734A" stopOpacity="0.06" />
          </linearGradient>
        </defs>
      </svg>

      {/* Small petal - bottom right */}
      <svg
        className="lotus-petal lotus-petal-3 absolute bottom-20 right-1/4"
        width="140"
        height="140"
        viewBox="0 0 140 140"
        fill="none"
        style={{ transform: "rotate(-30deg)" }}
      >
        <path
          d="M70 8C84 36 118 56 130 84C118 104 92 122 70 132C48 122 22 104 10 84C22 56 56 36 70 8Z"
          fill="url(#petal-gradient-3)"
        />
        <defs>
          <linearGradient id="petal-gradient-3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#E8734A" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      {/* Tiny petal - top left */}
      <svg
        className="lotus-petal lotus-petal-2 absolute top-1/4 left-1/3"
        width="100"
        height="100"
        viewBox="0 0 100 100"
        fill="none"
        style={{ transform: "rotate(15deg)" }}
      >
        <path
          d="M50 5C60 25 85 40 93 60C85 75 65 87 50 95C35 87 15 75 7 60C15 40 40 25 50 5Z"
          fill="url(#petal-gradient-4)"
        />
        <defs>
          <linearGradient id="petal-gradient-4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#E8734A" stopOpacity="0.07" />
          </linearGradient>
        </defs>
      </svg>

      {/* Medium petal - bottom left */}
      <svg
        className="lotus-petal lotus-petal-1 absolute bottom-1/4 left-10"
        width="180"
        height="180"
        viewBox="0 0 180 180"
        fill="none"
        style={{ transform: "rotate(-60deg)" }}
      >
        <path
          d="M90 10C108 45 153 72 167 108C153 135 117 157 90 170C63 157 27 135 13 108C27 72 72 45 90 10Z"
          fill="url(#petal-gradient-5)"
        />
        <defs>
          <linearGradient id="petal-gradient-5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#E8734A" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>

      {/* Small petal - center right */}
      <svg
        className="lotus-petal lotus-petal-3 absolute top-2/3 right-10"
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        style={{ transform: "rotate(75deg)" }}
      >
        <path
          d="M60 6C72 30 102 48 112 72C102 90 78 105 60 114C42 105 18 90 8 72C18 48 48 30 60 6Z"
          fill="url(#petal-gradient-6)"
        />
        <defs>
          <linearGradient id="petal-gradient-6" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#E8734A" stopOpacity="0.08" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
