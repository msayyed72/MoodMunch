import { createContext, ReactNode, useContext, useState } from "react";
import { Mood, Food } from "@shared/schema";

interface MoodContextType {
  selectedMood: Mood | null;
  setSelectedMood: (mood: Mood) => void;
  recommendedFoods: Food[];
  setRecommendedFoods: (foods: Food[]) => void;
  selectedFood: Food | null;
  setSelectedFood: (food: Food | null) => void;
}

export const MoodContext = createContext<MoodContextType | null>(null);

export function MoodProvider({ children }: { children: ReactNode }) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [recommendedFoods, setRecommendedFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  return (
    <MoodContext.Provider
      value={{
        selectedMood,
        setSelectedMood,
        recommendedFoods,
        setRecommendedFoods,
        selectedFood,
        setSelectedFood,
      }}
    >
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error("useMood must be used within a MoodProvider");
  }
  return context;
}
