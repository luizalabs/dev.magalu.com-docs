import React, { useState } from "react";
import "./Accordion.css";

const Accordion = ({ data }) => {
  const [active, setActive] = useState(0);

  const eventHandler = (e, index) => {
    e.preventDefault();
    setActive(index);
  };

  const totalItens = (packages) => {
    var count = 0;
    packages.forEach((pack) => {
      count++;
    });
    return count;
  };

  const sumItens = (packages) => {
    var summedItens = 0;
    packages.forEach((pack) => {
      summedItens = summedItens + pack.amount;
    });
    return summedItens;
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString('pt-BR', options)
  }
 
  return (
    <div>
      <form>
        {data.map((tab, index) => (
          <div key={index}>
            <h3>
              <button
                onClick={(e) => eventHandler(e, index)}
                className={active === index ? "active" : "inactive"}
                aria-expanded={active === index ? "true" : "false"}
                aria-disabled={active === index ? "true" : "false"}
              >
                <span className="title-wrapper">{formatDate(tab.created_at)}</span>
              </button>
            </h3>
            <div className={active === index ? "panel-open" : "panel-close"}>
              <div className="order-info">
                <p>Pedido: {tab.number}</p>
                <p>Nº de itens: {totalItens(tab.packages)}</p>
                <p>Valor do Pedido: R$ {sumItens(tab.packages)}</p>
                <p>Status: {tab.payment.status.code}</p>
              </div>
            </div>
          </div>
        ))}
      </form>
    </div>
  );
};

export default Accordion;