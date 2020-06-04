import React from 'react';
import { Link } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';

import './styles.css'
import logo from '../../assets/logo.svg';

const Home = () => {
    return(
        <div id="page-home">
            <div className="content">
                <header>
                    <img src={logo} alt="EcoLeta" />
                </header>
                <main>
                    <h1>
                    Su mercado de recolección de residuos.
                    </h1>
                    <p>
                        Ayudamos a las personas a encontrar puntos de recogida de manera eficiente.
                    </p>
                    <Link to="/create-point">
                        <span>
                            <FiLogIn />
                        </span>
                        <strong>
                            Registrar un punto de recogida
                        </strong>
                    </Link>
                </main>
            </div>
        </div>
    )
}

export default Home;