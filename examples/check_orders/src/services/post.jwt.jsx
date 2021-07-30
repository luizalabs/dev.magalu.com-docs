import axios from "axios";
var qs = require("qs");

export const getJWT = (codeResponse) => {
  console.log("making jwt request");
  var data = qs.stringify({
    grant_type: "authorization_code",
    code: `${codeResponse}`,
    client_id: `${process.env.REACT_APP_CLIENT_ID}`,
    client_secret: `${process.env.REACT_APP_CLIENT_SECRET}`,
    redirect_uri: `${process.env.REACT_APP_API_ENDPOINT_HOME}`,
  });
  var config = {
    method: "post",
    url: `${process.env.REACT_APP_API_ENDPOINT_JWT}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  };
  return axios(config)
    .then((response) => {
      localStorage.setItem("jwt", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);
    })
    .catch((error) => {
      console.log(error);
    });
};

export const refreshJWT = () => {
  console.log("making refresh request");
  var data = qs.stringify({
    client_id: `${process.env.REACT_APP_CLIENT_ID}`,
    grant_type: "refresh_token",
    refresh_token: `${localStorage.getItem("refresh_token")}`,
    client_secret: `${process.env.REACT_APP_CLIENT_SECRET}`,
  });
  var config = {
    method: "post",
    url: `${process.env.REACT_APP_API_ENDPOINT_JWT}`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  };

  return axios(config)
    .then(response => {
      localStorage.setItem("jwt", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);
    })
    .catch(error => {
      console.log(error);
    });
};
