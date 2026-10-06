type IconName =
  | "home" | "file" | "check-circle" | "swap" | "bank" | "list"
  | "chart" | "users" | "settings" | "search" | "bell" | "sun"
  | "moon" | "logout" | "chevron-left" | "chevron-right" | "chevron-down"
  | "plus" | "x" | "check" | "activity" | "alert" | "wallet"
  | "sidebar-collapse" | "sidebar-expand";

interface IconProps {
  name: IconName;
  size?: number;
}

const PATHS: Record<IconName, string> = {
  home: "M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z",
  file: "M7 3.5h7l5 5V20a1.5 1.5 0 0 1-1.5 1.5h-10.5A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5zm7 0V9h5.2",
  "check-circle": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm-3.2-9.2 2.4 2.4 5-5",
  swap: "M7 8h11M15 5l3 3-3 3M17 16H6M9 13l-3 3 3 3",
  bank: "M4 10h16v9H4zM3 10l9-6 9 6M8 14v5M12 14v5M16 14v5M4 19h16",
  list: "M8 7h12M8 12h12M8 17h12M5 7h.01M5 12h.01M5 17h.01",
  chart: "M5 19h14M7 16V9M12 16V5M17 16v-7",
  users: "M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1M12 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm10 11v-1a3.5 3.5 0 0 0-2.5-3.35M16.5 7.2a2.5 2.5 0 1 1 0 4.8",
  settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.4 15a7.7 7.7 0 0 0 .1-1.5 7.7 7.7 0 0 0-.1-1.5l2-1.5-2-3.5-2.4.8a7.4 7.4 0 0 0-2.6-1.5L14 3h-4l-.4 2.8a7.4 7.4 0 0 0-2.6 1.5L4.6 6.5l-2 3.5 2 1.5a7.7 7.7 0 0 0-.1 1.5 7.7 7.7 0 0 0 .1 1.5l-2 1.5 2 3.5 2.4-.8a7.4 7.4 0 0 0 2.6 1.5L10 21h4l.4-2.8a7.4 7.4 0 0 0 2.6-1.5l2.4.8 2-3.5z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm10 3-4.3-4.3",
  bell: "M6 9a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8zm4.2 11a2 2 0 0 0 3.6 0",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  moon: "M20 14.5A8.5 8.5 0 1 1 9.5 4 7 7 0 0 0 20 14.5z",
  logout: "M10 7V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-2M4 12h11M12 9l3 3-3 3",
  "chevron-left": "M15 6l-6 6 6 6",
  "chevron-right": "M9 6l6 6-6 6",
  "chevron-down": "M6 9l6 6 6-6",
  plus: "M12 5v14M5 12h14",
  x: "M6 6l12 12M18 6 6 18",
  check: "M5 12.5 9.5 17 19 7.5",
  activity: "M4 12h4l2-7 4 14 2-7h4",
  alert: "M12 9v4M12 17h.01M10.3 4.7 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.7a2 2 0 0 0-3.4 0z",
  wallet: "M4 7.5A1.5 1.5 0 0 1 5.5 6H18a2 2 0 0 1 2 2v10.5A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5zM18 10.5h2.5v4H18a2 2 0 0 1 0-4z",
  "sidebar-collapse": "M5 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM9.5 5v14M15.2 9.2 12.5 12l2.7 2.8",
  "sidebar-expand": "M5 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM9.5 5v14M12.8 9.2 15.5 12l-2.7 2.8",
};

export function Icon({ name, size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

export type { IconName };
