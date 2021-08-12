import axios from "axios";
import jwt_decode from "jwt-decode";

const getTenantId = () => {
  const jwt = localStorage.getItem("jwt");
  const decodedJWT = jwt_decode(jwt);
  var tenants = decodedJWT.tenants.filter(t => t.type === process.env.REACT_APP_TENANT_TYPE)
  let tenantId
  if (tenants.length > 0) {
    tenantId = tenants[0].uuid
  }
  return tenantId
}

export const getOrders = () => {
  console.log("getting orders");
  var config = {
    method: "get",
    url: process.env.REACT_APP_OMS_API_URI,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      "x-tenant-id": getTenantId(),
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
  
  var config = {
    method: "get",
    url: `${process.env.REACT_APP_OMS_API_URI}?number=${number}`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      "x-tenant-id": getTenantId(),
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
