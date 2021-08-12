import React, { useState } from "react";
import "./index.css";
import { useHistory } from "react-router-dom";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import SearchOrder from "../../components/Search/index";
import { getOrders } from "../../../services/get.orders";
import CircularProgress from "@material-ui/core/CircularProgress";

function InitialClient() {
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  const logout = () => {
    localStorage.clear();
    history.push("/");
  };

  const listaTodosPedidos = async () => {
    setLoading(false);
    await getOrders().catch((error) => {
      console.log(error);
      history.push("/error");
    });
    setLoading(true);
    history.push("/client-order");
  };

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
      <div className="client">
        <div className="c-hello">
          <div className="title-client">
            <h1 className="hello-client">Olá, Cliente</h1>
          </div>
          <div className="c-h-logout-icon">
            <ExitToAppIcon fontSize="large" onClick={(e) => logout()} />
          </div>
        </div>
        <div className="c-hello-search">
          <SearchOrder />
        </div>
        <div className="c-allOrders">
          <button className="button-pos" onClick={(e) => listaTodosPedidos()}>
            Todos Pedidos
          </button>
        </div>
      </div>
    );
  }
}

export default InitialClient;
