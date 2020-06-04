import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import './styles.css';

const Success = () => {
    return (
        <div className="wrap">
            <div className="content">
            
            <FiCheckCircle size={150}/>
            <Link id="button" to="/">
                <FiArrowLeft size={55}/>  
                <h1>Registrado con éxito!</h1>    
            </Link>
            
            </div>
        </div>
    );
}

export default Success;
