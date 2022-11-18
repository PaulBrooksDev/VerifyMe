import { Link } from "react-router-dom";
import AppContext from "../context/context";
import styled, { css } from "styled-components";
import { useContext } from "react";
import { SocialIcon } from "react-social-icons";

const Container = styled.div`
  display: flex;
  height: fit-content;
`;

const Nav = styled.div`
  display: flex;
  width: 100%;
  height: 5vh;
  padding: 10px;
  margin-bottom: 30px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  background-color: #222529;
  justify-content: space-between;
  align-items: center;
`;

const NavLeft = styled.div`
  display: flex;
  flex: 50%;
`;

const NavRight = styled.div`
  display: flex;
  flex: 50%;
  justify-content: flex-end;
  color: white;
  font-weight: bold;
  gap: 10px;
`;

const Brand = styled.div`
  display: flex;
  font-weight: bolder;
  font-size: larger;
  cursor: pointer;
  color: white;
  font-family: "Acme", sans-serif;
`;

export default function Navbar() {
  const { user } = useContext(AppContext);
  return (
    <Container>
      <Nav>
        <NavLeft>
          <Link to={"/"}>
            <Brand>Verify Me</Brand>
          </Link>
        </NavLeft>

        <NavRight>
          {user.discordUsername ? (
            <>
              <SocialIcon style={{ height: 25, width: 25 }} network="discord" />
              {user.discordUsername}
            </>
          ) : (
            <></>
          )}
        </NavRight>
      </Nav>
    </Container>
  );
}
