import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

/* شعار المستودع: صندوق مُكدّس فوق رف */
export const CrateIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 20.5h17" />
    <path d="M5 20.5v-6h6v6M13 20.5v-6h6v6" />
    <path d="M7.5 14.5v-5l4.5-2 4.5 2v5" />
    <path d="M12 7.5v3" />
    <path d="M9.5 9h5" />
  </svg>
);

export const PulseIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 12h4l2.5-6.5L14 18l2.5-6H21" />
  </svg>
);

export const BoxesIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 8.5 8.5 6l4.5 2.5v5L8.5 16l-4.5-2.5z" />
    <path d="M11 13.5 15.5 11l4.5 2.5v5l-4.5 2.5-4.5-2.5z" opacity={0.55} />
    <path d="M8.5 11v5" />
  </svg>
);

export const SwapIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 4v13" />
    <path d="m3.5 13.5 3.5 3.5 3.5-3.5" />
    <path d="M17 20V7" />
    <path d="m13.5 10.5 3.5-3.5 3.5 3.5" />
  </svg>
);

export const PlusIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const MinusIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
  </svg>
);

export const SearchIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-3.8-3.8" />
  </svg>
);

export const PencilIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m4 20 .8-3.2L16.6 5a1.9 1.9 0 0 1 2.7 0l-.3-.3a1.9 1.9 0 0 1 0 2.7L7.2 19.2z" />
    <path d="m14.5 6.5 3 3" />
  </svg>
);

export const TrashIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 6.5h15" />
    <path d="M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5" />
    <path d="M6.5 6.5 7.4 19a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5l.9-12.5" />
    <path d="M10 10.5v6M14 10.5v6" />
  </svg>
);

export const ArrowInIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4v11" />
    <path d="m7 10.5 5 5 5-5" />
    <path d="M5 20h14" />
  </svg>
);

export const ArrowOutIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 20V9" />
    <path d="m7 13.5 5-5 5 5" />
    <path d="M5 4h14" />
  </svg>
);

export const AlertIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4 2.8 19.5h18.4z" />
    <path d="M12 10v4.2" />
    <circle cx="12" cy="16.8" r="0.4" fill="currentColor" stroke="none" />
  </svg>
);

export const CheckIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const CloseIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const PinIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s-6.5-5.6-6.5-10.4A6.5 6.5 0 0 1 12 4a6.5 6.5 0 0 1 6.5 6.6C18.5 15.4 12 21 12 21z" />
    <circle cx="12" cy="10.5" r="2.2" />
  </svg>
);

export const CoinIcon = (p: P) => (
  <svg {...base(p)}>
    <ellipse cx="12" cy="7" rx="7" ry="3.2" />
    <path d="M5 7v5c0 1.8 3.1 3.2 7 3.2s7-1.4 7-3.2V7" />
    <path d="M5 12v5c0 1.8 3.1 3.2 7 3.2s7-1.4 7-3.2v-5" />
  </svg>
);

export const EmptyIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 9.5 12 5l8 4.5v9L12 23l-8-4.5z" opacity={0.4} />
    <path d="M4 9.5 12 14l8-4.5M12 14v9" />
    <path d="M8 7.2l8 4.6" />
  </svg>
);

export const ResetIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 5v5h5" />
    <path d="M5.2 13.5a7 7 0 1 0 1.3-6L4.5 10" />
  </svg>
);

export const FilterIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
);
