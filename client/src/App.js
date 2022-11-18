import "./App.css";
import { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import styled, { css } from "styled-components";
import AppContext from "./context/context";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Navbar from "./components/Navbar";
import Discord from "./components/Discord";
import DiscordAuth from "./components/DiscordAuth";
import Twitter from "./components/Twitter";
import TwitterAuth from "./components/TwitterAuth";
import Wallet from "./components/Wallet";
import Complete from "./components/Complete";

const FormDiv = styled.div`
  width: 100%;
  display: flex;
  border: 1px solid #e3e3e3;
  border-radius: 10px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const StepperWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Label = styled.div`
  font-weight: bold;
`;

const BottomBox = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: flex-end;
  margin-top: 100px;
`;
//
const steps = [
  "Connect Discord",
  "Connect Twitter",
  "Connect Wallet",
  "Complete Signup",
];

function App() {
  const { user } = useContext(AppContext);

  return (
    <Router>
      <Navbar />
      <ToastContainer />
      <div className="App">
        <FormDiv>
          <StepperWrapper>
            <Stepper
              sx={{
                display: "flex",
                padding: "50px",
                marginBottom: "30px",
              }}
              activeStep={user.currentStep}
              alternativeLabel
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>
                    <Label>{label}</Label>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </StepperWrapper>

          <BottomBox>
            <Box
              sx={{
                display: "flex",
                marginBottom: "30px",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <Routes>
                <Route path={"/"} element={<Discord />} />
                <Route path={"/discord/auth"} element={<DiscordAuth />} />
                <Route path={"/twitter"} element={<Twitter />} />
                <Route path={"/twitter/auth"} element={<TwitterAuth />} />
                <Route path={"/wallet"} element={<Wallet />} />
                <Route path={"/complete"} element={<Complete />} />
              </Routes>
            </Box>
          </BottomBox>
        </FormDiv>
      </div>
    </Router>
  );
}

export default App;
