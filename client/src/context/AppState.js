import React, { useState, useEffect } from "react";
import AppContext from "./context";

export default function AppState(props) {
  const [user, setUser] = useState({
    discordId: "",
    discordUsername: "",
    twitterId: "",
    twitterUsername: "",
    walletAddress: "",
    currentStep: 0,
    isSignupComplete: false,
    isAuth: localStorage.getItem("isAuth"),
  });

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}
