import React, { useState, useEffect } from "react";
import "./index.css";
import Button from "@material-ui/core/Button";
import { getJWT } from "../../../services/post.jwt";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useHistory } from "react-router-dom";
import isAuthenticated from "../../../utils/auth";

function Login() {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [jwtReady, setJwtReady] = useState(null);

  //  Pega o code dado pela tela de login do header
  const url_string = window.location.href;
  var url = new URL(url_string);
  var codeResponse = url.searchParams.get("code");

  useEffect(() => {
    const findJWT = async () => {
      try {
        setLoading(false);
        await getJWT(codeResponse).catch(error => {
          console.log(error);
          history.push("/error");
        });
        setJwtReady("Done"); 
        setLoading(true);
      } catch (err) {
        console.log(err);
      }
    };

    //  Checa se o code ja foi fornecido, pede o JWT, confere a auth transfere para a página correta
    if (codeResponse !== null && loading) {
      if (jwtReady !== "Done") {
        findJWT();
      }
      // Redireciona para a página correta de acordo com a auth
      if (jwtReady === "Done") {
        var auth = isAuthenticated();
        if (auth === true && loading) {
          history.push("/client");
        } else if (auth === false && loading) {
          history.push("/");
        }
      }
    }
  });

  if (!loading) {
    return (
      <>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <CircularProgress size={80} />
        </div>
      </>
    );
  } else {
    return (
      <div className="login">
        <h1 className="title">AppDemo</h1>
        <div className="button">
          <br />
          <Button
            variant="contained"
            onClick={(event) =>
              (window.location.href = `${process.env.REACT_APP_API_ENDPOINT_KEYCLOACK_AUTH}${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_API_ENDPOINT_HOME}&response_type=code&scope=customer_access openid`)
            }
          >
            Login
          </Button>
        </div>
      </div>
    );
  }
}

export default Login;
