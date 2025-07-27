// components/routes/drawerRoutes.tsx
import { DrawerRouteItem } from "@/types/auth";
import { House, User, Settings, FileLock2 } from "lucide-react";
import Image from "next/image";


export const drawerRoutes: DrawerRouteItem[] = [
  {
    label: "Home",
    icon: <House size={20} />,
    path: "/dashboard",
  },
  {
    label: "What my organization can see",
    icon: <FileLock2 size={20} />,
    path: "/share-policy",
  },
//   {
//     label: "Settings",
//     icon: <Settings size={20} />,
//     path: "/settings",
//   },
//   {
//     label: "Custom",
//     icon: (
//       <Image
//         src="/Pixel-60.png"
//         alt="Pixel"
//         width={20}
//         height={20}
//         className="rounded"
//       />
//     ),
//     path: "/custom",
//   },
];
