import React, { useState } from "react";
import SearchIcon from "@material-ui/icons/Search";
import { TextField, Toolbar } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { getOrderByNumber } from "../../../services/get.orders";
import { useHistory } from "react-router-dom";
import "./index.css";

function SearchOrder() {
  const history = useHistory();
  const [number, setIdPedido] = useState("");
  const [loading, setLoading] = useState(true);

  let textInput = React.createRef();

  const handleClickSearch = async () => {
    if (number !== "") {
      setLoading(false);
      localStorage.removeItem("order");
      await getOrderByNumber(number).catch((error) => {
        console.log(error);
        history.push("/error");
      });
      setLoading(true);
      history.push("/client-order");
    }
  };

  const handleChange = () => {
    setIdPedido(textInput.current.value);
  };

  if (!loading) {
    return (
      <>
        <Toolbar>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <CircularProgress size={25} />
          </div>
        </Toolbar>
      </>
    );
  } else {
    return (
      <div className="search-orders">
        <div className="Container">
          <Toolbar>
            <div className="searchContainer">
              <TextField
                inputRef={textInput}
                className="searchInput"
                label="Digite o número do seu pedido"
                style={{ width: 250 }}
                onChange={(event) => handleChange()}
              />
              <SearchIcon
                className="searchIcon"
                onClick={(event) => handleClickSearch()}
              />
            </div>
          </Toolbar>
        </div>
      </div>
    );
  }
}

export default SearchOrder;
