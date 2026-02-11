import { DesignRecord as Design } from '@/types/design';

export const seedDesigns: Design[] = [
  {
    id: "design-1",
    name: "Dashboard Layout",
    description: "Responsive dashboard layout with a sidebar navigation and a main content area.",
    image_url: "https://example.com/dashboard-layout.png",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "design-2",
    name: "User Profile Page",
    description: "Clean and modern user profile page displaying user information, settings, and activity feed.",
    image_url: "https://example.com/user-profile.png",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];