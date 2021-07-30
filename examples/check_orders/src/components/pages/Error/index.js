import React from "react";
import "./index.css";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import ErrorIcon from '@material-ui/icons/Error';
import { useHistory } from "react-router-dom";

function ErrorPage({ error }) {
    const history = useHistory();

    const handleClick = () => {
        history.push("/client");
    }

    const logout = () => {
        localStorage.clear();
        history.push("/");
    };

    return (
        <div className="client">
            <div className="c-hello">
                <div className="title-client">
                    <h1 className="hello-client">
                        <div className="error">
                            <ErrorIcon fontSize="large" />
                        </div>
                        Erro! {error}
                    </h1>
                </div>
                <div className="c-h-logout-icon">
                    <ExitToAppIcon fontSize="large" onClick={(e) => logout()} />
                </div>
            </div>
            <p className="error-message">Algo de errado, não está certo!</p>
            <div className="c-allOrders">
                <button className="button-pos-error" onClick={(e) => handleClick()}>
                    Voltar
                </button>
            </div>

        </div>
    );
}


export default ErrorPage;
