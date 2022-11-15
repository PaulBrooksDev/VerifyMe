import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AppContext from "../context/context";
import axios from "axios";

export default function DiscordAuth() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AppContext);
  const [code, setCode] = useState(null);

  useEffect(() => {
    setCode(window.location.href.split("code=")[1]);
  }, []);

  useEffect(() => {
    if (!code) return;

    axios
      .post(
        `${process.env.REACT_APP_SERVER_URL}/api/connect/discord`,
        { code },
        { withCredentials: true }
      )
      .then((res) => {
        console.log(res.data.message);
        setUser(res.data.message);
        localStorage.setItem("isAuth", true);
        navigate("/twitter");
      })
      .catch((e) => {
        return console.log(e);
      });
  }, [code]);

  return <></>;
}
