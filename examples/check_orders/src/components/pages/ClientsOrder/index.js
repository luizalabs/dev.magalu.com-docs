import React from "react";
import Accordion from "../../components/Accordion/Accordion";
import "./index.css";
import { useHistory } from "react-router-dom";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";

function ClientsOrder() {
  const history = useHistory();
  var orders = JSON.parse(localStorage.getItem("order"));
  return (
    <div className="client-order">
      <div className="c-order">
        <div className="back-arrow">
          <ArrowBackIosIcon
            fontSize="large"
            onClick={(e) => history.push("/client")}
          />
        </div>
        <div className="order-title">
          <h1 className="hello-client">Meus Pedidos</h1>
        </div>
      </div>
      <div className="orders">
        {orders !== null && <Accordion data={orders} />}
      </div>
    </div>
  );
}

export default ClientsOrder;
