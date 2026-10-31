export type DropCategory = "Tees" | "Hoodies" | "Caps" | "Stickers" | "Posters";
export interface DropProject {
  id: number;
  category: DropCategory;
  title: string;
  tag: string;
  image: string;
}

// Images are in public/ root (not public/drops/)
export const DROP_PROJECTS: DropProject[] = [
  { id: 1, category: "Hoodies", title: "Act Like a Queen", tag: "Custom hoodie", image: "/queen-boss-hoodie.jpg" },
  { id: 2, category: "Hoodies", title: "King & Queen", tag: "Custom hoodie", image: "/king-queen-hoodie.jpg" },
  { id: 3, category: "Hoodies", title: "Bare Bears Crew", tag: "Full colour print", image: "/bare-bears-hoodie.jpg" },
  { id: 4, category: "Hoodies", title: "Gemini Sleeve", tag: "Hoodie + sleeve print", image: "/gemini-hoodie.jpg" },
  { id: 5, category: "Hoodies", title: "Jesus Saves", tag: "Back print hoodie", image: "/jesus-saves-hoodie.jpg" },
  { id: 6, category: "Tees", title: "Orange Poster Tee", tag: "Full colour tee", image: "/orange-poster-tee.jpg" },
  { id: 7, category: "Tees", title: "Pisces Only", tag: "Custom tee", image: "/pisces-tee.jpg" },
  { id: 8, category: "Tees", title: "Moon Session", tag: "Full colour tee", image: "/astronaut-moon-tee.jpg" },
  { id: 9, category: "Tees", title: "Free Fall Tee", tag: "Full colour tee", image: "/astronaut-fall-tee.jpg" },
  { id: 10, category: "Hoodies", title: "Free Fall Hoodie", tag: "Full colour hoodie", image: "/astronaut-fall-hoodie.jpg" },
];
