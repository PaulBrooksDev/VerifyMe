import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import AppContext from "../context/context";
import axios from "axios";
import { SocialIcon } from "react-social-icons";
import { toast } from "react-toastify";

const Box = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 30px;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 30px;
`;

const InfoText = styled.div`
  display: flex;
  font-size: small;
  color: #a3a3a3;
  width: 50%;

  @media (max-width: 768px) {
    width: 75%;
    font-size: medium;
  }
`;

const Button = styled.button`
  display: flex;
  width: fit-content;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background-color: #324eed;
  padding: 20px;
  border: none;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  transition: 0.2s ease-in-out;

  &:hover {
    background-color: #0120cf;
  }
`;

export default function Discord() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AppContext);

  // Check if user has already started signup
  useEffect(() => {
    if (localStorage.getItem("isAuth") === "true") {
      axios
        .post(
          `${process.env.REACT_APP_SERVER_URL}/api/connect/user`,
          {},
          { withCredentials: true }
        )
        .then((res) => {
          setUser(res.data.message);

          // Send user to the current step saved in the database if the user has already began signup
          if (res.data.message.currentStep === 1) {
            return navigate("/twitter");
          }
          if (res.data.message.currentStep === 2) {
            return navigate("/wallet");
          }
          if (res.data.message.currentStep >= 3) {
            return navigate("/complete");
          }
        })
        .catch((e) => {
          console.log(e);
          localStorage.setItem("isAuth", false);
          navigate("/");
        });
    }
  }, []);

  const handleDiscord = () => {
    window.location.replace(process.env.REACT_APP_DISCORD_URI);
  };

  return (
    <>
      <Box>
        <Button onClick={() => handleDiscord()}>
          <SocialIcon style={{ height: 25, width: 25 }} network="discord" />
          Connect Discord
        </Button>
        <InfoText>
          Connecting your Discord account allows us to view your Discord
          username and ID for site verification and server role purposes. We can
          NOT view messages nor send messages on your behalf.
        </InfoText>
      </Box>
    </>
  );
}
