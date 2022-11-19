import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import AppContext from "../context/context";
import { useMetaMask } from "metamask-react";
import { toast } from "react-toastify";
import axios from "axios";

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

export default function Wallet() {
  const navigate = useNavigate();
  const { connect, account, status } = useMetaMask();
  const { user, setUser } = useContext(AppContext);

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

  const handleWallet = async () => {
    // If the user doesn't have a wallet installed redirect them to download a wallet
    if (!window.ethereum) {
      window.location.replace(
        `https://metamask.app.link/dapp/${process.env.REACT_APP_SERVER_URL}/wallet`
      );

      toast.error(
        "Ethereum wallet not detected. If on a mobile device please use MetaMask browser.",
        {
          position: toast.POSITION.BOTTOM_LEFT,
        }
      );

      return;
    }

    let isMobile = {
      Android: function () {
        return navigator.userAgent.match(/Android/i);
      },
      BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
      },
      iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
      },
      Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
      },
      Windows: function () {
        return (
          navigator.userAgent.match(/IEMobile/i) ||
          navigator.userAgent.match(/WPDesktop/i)
        );
      },
      any: function () {
        return (
          isMobile.Android() ||
          isMobile.BlackBerry() ||
          isMobile.iOS() ||
          isMobile.Opera() ||
          isMobile.Windows()
        );
      },
    };

    // Method for getting address on mobile only
    if (isMobile.any()) {
      await connect()
        .then(async (res) => {
          let address = res[0];

          await axios
            .post(
              `${process.env.REACT_APP_SERVER_URL}/api/connect/wallet`,
              { address },
              { withCredentials: true }
            )
            .then((res) => {
              setUser(res.data.message);
              navigate("/complete");
              toast.success(
                `Wallet: ${address.substring(0, 4)}....${address.substring(
                  address.length - 4,
                  address.length
                )} connected. `,
                {
                  position: toast.POSITION.BOTTOM_LEFT,
                }
              );
            })
            .catch((e) => {
              toast.error(e.message, {
                position: toast.POSITION.BOTTOM_LEFT,
              });
            });
        })
        .catch((e) => {
          console.log(e);
        });

      return;
    }

    // Method for getting addresses on non-mobile device
    await window.ethereum
      .request({
        method: "wallet_requestPermissions",
        params: [
          {
            eth_accounts: {},
          },
        ],
      })
      .then(async (res) => {
        let address = res[0].caveats[0].value[0] || res[0].caveats[1].value[0];

        await axios
          .post(
            `${process.env.REACT_APP_SERVER_URL}/api/connect/wallet`,
            { address },
            { withCredentials: true }
          )
          .then((res) => {
            setUser(res.data.message);
            navigate("/complete");
            toast.success(
              `Wallet: ${address.substring(0, 4)}....${address.substring(
                address.length - 4,
                address.length
              )} connected. `,
              {
                position: toast.POSITION.BOTTOM_LEFT,
              }
            );
          })
          .catch((e) => {
            toast.error(e.message, {
              position: toast.POSITION.BOTTOM_LEFT,
            });
          });
      })
      .catch((e) => {
        toast.error(e.message, {
          position: toast.POSITION.BOTTOM_LEFT,
        });
      });
  };

  return (
    <>
      <Box>
        <Button onClick={() => handleWallet()}>Connect Wallet</Button>
        <InfoText>
          We only ask for a signature for proof of ownership and have no access
          to your wallet. We do not have the ability nor will we ever ask for
          the ability to transfer items out of your wallet.
        </InfoText>
      </Box>
    </>
  );
}
