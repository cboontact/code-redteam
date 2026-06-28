import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faCircleCheck,
  faFaceMeh,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { CleanStatus } from "./types";

export const CLEAN_STATUS_CONFIG: Record<
  CleanStatus,
  {
    label: string;
    icon: IconDefinition;
    badge: string;
    option: string;
    optionActive: string;
    iconColor: string;
  }
> = {
  clean: {
    label: "สะอาดดี",
    icon: faCircleCheck,
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    option:
      "border-emerald-200 bg-emerald-50/60 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50",
    optionActive:
      "border-emerald-500 bg-emerald-100 text-emerald-800 ring-2 ring-emerald-200/80",
    iconColor: "text-emerald-500",
  },
  partially_clean: {
    label: "สะอาดพอใช้",
    icon: faFaceMeh,
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    option:
      "border-amber-200 bg-amber-50/60 text-amber-700 hover:border-amber-300 hover:bg-amber-50",
    optionActive:
      "border-amber-500 bg-amber-100 text-amber-800 ring-2 ring-amber-200/80",
    iconColor: "text-amber-500",
  },
  needs_attention: {
    label: "ต้องปรับปรุง",
    icon: faTriangleExclamation,
    badge: "bg-red-100 text-red-800 border-red-200",
    option:
      "border-red-200 bg-red-50/60 text-red-700 hover:border-red-300 hover:bg-red-50",
    optionActive:
      "border-red-500 bg-red-100 text-red-800 ring-2 ring-red-200/80",
    iconColor: "text-red-500",
  },
};

export const CLEAN_STATUS_ORDER: CleanStatus[] = [
  "clean",
  "partially_clean",
  "needs_attention",
];