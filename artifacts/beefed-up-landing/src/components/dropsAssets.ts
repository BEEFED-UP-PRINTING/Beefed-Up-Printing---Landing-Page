import type { DropProject, DropCategory } from "./dropsAssetsA";
export type { DropProject, DropCategory };
import { DROP_PROJECTS_A } from "./dropsAssetsA";
import { DROP_PROJECTS_B } from "./dropsAssetsB";
export const DROP_PROJECTS: DropProject[] = [...DROP_PROJECTS_A, ...DROP_PROJECTS_B];
