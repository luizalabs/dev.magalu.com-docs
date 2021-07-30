import jwt_decode from "jwt-decode";
import { refreshJWT } from "../services/post.jwt";

const isAuthenticated = () => {
  const jwt = localStorage.getItem("jwt");
  const refreshtoken = localStorage.getItem("refresh_token");
  if (jwt !== null) {
    var decodedJWT = jwt_decode(jwt);
  }
  if (refreshtoken !== null) {
    var decodedRefreshToken = jwt_decode(refreshtoken);
  }
  var currentTime = Date.now() / 1000 - 30;

  if (jwt !== null && currentTime < decodedJWT.exp) {
    return true;
  } else {
    if (jwt !== null && currentTime < decodedRefreshToken.exp) {
      console.log("Sua sessão expirou");
      refreshJWT();
      return true;
    }
    localStorage.clear();
    return false;
  }
};

export default isAuthenticated;
