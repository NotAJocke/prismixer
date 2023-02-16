import { getUserPreferences, setUserPreferences } from "./userPreferences";

export function getPackageManager() {

  const userPreferences = getUserPreferences();

  return userPreferences.packageManager;
}

export function getPackageManagerExecuter() {
  
  const userPreferences = getUserPreferences();
  
  switch(userPreferences.packageManager) {
    case "npm":
      return "npx";
    case "pnpm":
      return "pnpm exec";
  }
}

setUserPreferences({ packageManager: "pnpm" });
console.log(getPackageManagerExecuter())