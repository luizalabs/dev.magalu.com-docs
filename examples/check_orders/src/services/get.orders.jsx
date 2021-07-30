import axios from "axios";
import jwt_decode from "jwt-decode";

export const getOrders = () => {
  console.log("getting orders");
  const jwt = localStorage.getItem("jwt");
  const decodedJWT = jwt_decode(jwt);
  var config = {
    method: "get",
    url: process.env.REACT_APP_API_ENDPOINT_GET_ORDERS,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      "x-tenant-id": decodedJWT.customer.uuid,
    },
  };
  return axios(config)
    .then((response) => {
      localStorage.setItem("order", JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
};

export const getOrderByNumber = (number) => {
  console.log("getting order by number");
  const jwt = localStorage.getItem("jwt");
  const decodedJWT = jwt_decode(jwt);
  var config = {
    method: "get",
    url: `${process.env.REACT_APP_API_ENDPOINT_GET_SPECIFIC_ORDER}${number}`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      "x-tenant-id": decodedJWT.customer.uuid,
    },
  };
  return axios(config)
    .then((response) => {
      localStorage.setItem("order", JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
};
