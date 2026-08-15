import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (p: P): P => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  ...p,
});

export const CrateIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 8.5 12 4l9 4.5v7L12 20l-9-4.5v-7Z" />
    <path d="M3 8.5 12 13l9-4.5M12 13v7M7.5 6.25l9 4.5" />
  </svg>
);

export const PulseIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 12h4l2.5-7 4.5 14 2.5-7H21" />
  </svg>
);

export const BoxesIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="13" width="8" height="8" rx="1" />
    <rect x="13" y="13" width="8" height="8" rx="1" />
    <rect x="8" y="3" width="8" height="8" rx="1" />
  </svg>
);

export const SwapIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M17 4l3 3-3 3M20 7H8M7 14l-3 3 3 3M4 17h12" />
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
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const PencilIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1Z" />
    <path d="m14.5 6.5 3 3" />
  </svg>
);

export const TrashIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13M10 11v6M14 11v6" />
  </svg>
);

export const ArrowInIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
  </svg>
);

export const ArrowOutIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21V9M7 14l5-5 5 5M4 3h16" />
  </svg>
);

export const AlertIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3 2.5 20h19L12 3ZM12 10v4M12 17.2v.3" />
  </svg>
);

export const CheckIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m4.5 12.5 5 5L19.5 7" />
  </svg>
);

export const CloseIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const PinIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const CoinIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5v9M9.2 9.8c.5-1 1.6-1.6 2.8-1.6 1.7 0 3 .9 3 2.1 0 2.8-6 1.5-6 4.3 0 1.2 1.3 2.1 3 2.1 1.2 0 2.3-.6 2.8-1.6" />
  </svg>
);

export const EmptyIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 9h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9Z" />
    <path d="M2.5 9 5 4h14l2.5 5M9.5 13h5" />
  </svg>
);

export const ResetIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 8A9 9 0 1 1 3 13.5M3.5 3v5h5" />
  </svg>
);

export const FilterIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 5h16l-6.2 7.4v5.1L10.2 20v-7.6L4 5Z" />
  </svg>
);

/* ---------- أيقونات جديدة ---------- */

export const DownloadIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4v11M7.5 11l4.5 4.5L16.5 11M4 20h16" />
  </svg>
);

export const UploadIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 15V4M7.5 8 12 3.5 16.5 8M4 20h16" />
  </svg>
);

export const BuildingIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M2.5 21h19" />
    <path d="M7.5 8h2M7.5 12h2M7.5 16h2M11.5 8h0M11.5 12h0M11.5 16h0" />
  </svg>
);

export const ReceiptIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 3h12v18l-2.4-1.6L13.2 21l-2.4-1.6L8.4 21 6 19.4V3Z" />
    <path d="M9 8h6M9 12h6M9 16h3.5" />
  </svg>
);

export const ChevronDownIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 9.5 6 6 6-6" />
  </svg>
);

export const CalendarIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="5" width="17" height="16" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
);

export const FileTextIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 3h8l4 4v14H6V3Z" />
    <path d="M14 3v4h4M9 12h6M9 16h6" />
  </svg>
);

export const UsersIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8.5" r="3.5" />
    <path d="M2.5 20c.7-3.2 3.3-5 6.5-5s5.8 1.8 6.5 5M16 5.5a3.5 3.5 0 0 1 0 6.6M17.5 15.4c2 .7 3.5 2.2 4 4.6" />
  </svg>
);

export const GridIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </svg>
);
