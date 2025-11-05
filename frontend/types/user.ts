export interface UserProfile {
  height_feet: number;
  height_inches: number;
  weight: number;
  activity_level: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  profile?: UserProfile;
}

export interface BasePageProps {
  isLoggedIn: boolean;
  userData: User | null;
}