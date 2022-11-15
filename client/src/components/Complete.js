import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import AppContext from "../context/context";
import axios from "axios";

import ReCAPTCHA from "react-google-recaptcha";

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

const InviteText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  font-size: large;
  color: #a3a3a3;
  width: 50%;
  gap: 10px;

  @media (max-width: 768px) {
    width: 75%;
    font-size: medium;
  }
`;

const InviteLink = styled.div`
  display: flex;
  background-color: #e3e3e3;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
`;

const Button = styled.button`
  display: flex;
  width: fit-content;
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

  /* Disabled attribute to mute submit button */
  ${(props) =>
    props.disabled &&
    css`
      background-color: #a3a3a3;
      color: black;

      &:hover {
        background-color: #a3a3a3;
        color: black;
        cursor: not-allowed;
      }
    `}
`;

export default function Complete() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AppContext);
  const [captchaSolved, setCaptchaSolved] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [invite, setInvite] = useState("");

  // Check if user has already started signup
  useEffect(() => {
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
  }, []);

  const handleCaptcha = (value) => {
    if (!value) return;

    setCaptcha(value);
    setCaptchaSolved(true);
  };

  const handleSubmit = () => {
    if (!captcha) return;

    setCaptchaSolved(false);

    axios
      .post(
        `${process.env.REACT_APP_SERVER_URL}/api/connect/submit`,
        { captcha },
        { withCredentials: true }
      )
      .then((res) => {
        setInvite(res.data.message);
        setUser(res.data.user);
      })
      .catch((e) => {
        console.log(e.message);
      });
  };

  const handleInviteClick = () => {
    window.location.replace(invite);
  };

  return (
    <>
      <Box>
        {invite ? (
          <>
            <InviteText>
              Congrats you're invited!
              <InviteLink onClick={handleInviteClick}>{invite}</InviteLink>
            </InviteText>
          </>
        ) : (
          <>
            <ReCAPTCHA
              sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
              onChange={handleCaptcha}
            />

            <Button disabled={!captchaSolved} onClick={() => handleSubmit()}>
              Submit
            </Button>

            <InfoText>
              Complete the captcha and press the submit button to receive your
              one time discord invite link.
            </InfoText>
          </>
        )}
      </Box>
    </>
  );
}
