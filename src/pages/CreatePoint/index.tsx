import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory, } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LatLngExpression, LeafletMouseEvent } from 'leaflet';
import axios from 'axios';

import api from '../../services/api';
import './styles.css';
import logo from '../../assets/logo.svg';


interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface DatosGobProvinciaResponse {
    provincias: [{
        centroide: {
            lat: number;
            lon: number;
        };
        id: string;
        nombre: string;
    }]
} 

interface DatosGobMunicipioResponse {
    municipios: [{
        centroide: {
            lat: number;
            lon: number;
        };
        id: string;
        nombre: string;
        provincias: {
            id: string;
            nombre: string;
        }
    }]
}

interface Province {
    id: string;
    name: string;
}

interface City {
    id: string;
    name: string;
    position: LatLngExpression;
}


const CreatePoint = () => {

    const [items, setItems] = useState<Item[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<Province>({id: '0', name: '0'});
    const [selectedCity, setSelectedCity] = useState('0');
    const [focusMapPosition, setFocusMapPosition] = useState<LatLngExpression>([23.1247713,-82.3856771]);
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([23.1247713,-82.3856771]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    });


    const history = useHistory();
    
    
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude, longitude} = position.coords;
            setFocusMapPosition([latitude, longitude]);
            setSelectedPosition([latitude, longitude]);
        })
    }, []);
    
    useEffect(() => {
        //carrega items
        api.get('items')
            .then(response => {
                setItems(response.data)
            })
            .catch(err => {
                console.error("It was not possible to get the items from the api");
            })
    }, []);

    useEffect(() => {
        //carrega provincias
        axios.get<DatosGobProvinciaResponse>('https://apis.datos.gob.ar/georef/api/provincias')
            .then(response => {
                const provincesInfo = response.data.provincias.map<Province>(province => {
                    return({
                        id: province.id,
                        name: province.nombre
                    });
                });
                setProvinces(provincesInfo);
            })
            .catch(err => {
                console.error('It was not posible to get the provincias from the api', err);
            })
    },[]);

    useEffect(() => {
        //carrega as cidades
        if (selectedProvince.id === '0') {
            return;
        }

        axios
            .get<DatosGobMunicipioResponse>(`https://apis.datos.gob.ar/georef/api/municipios?provincia=${selectedProvince.id}&max=5000`)
            .then(response => {
                
                const citiesInfo = response.data.municipios.map<City>(city => {
                    return({
                        id: city.id,
                        name: city.nombre,
                        position: [
                            city.centroide.lat,
                            city.centroide.lon
                        ]
                    });
                });
                setCities(citiesInfo);

            })
            .catch(err => {
                console.error('It was not posible to get the provincias from the api', err);
            })
        
    },[selectedProvince]);
    
    function handleSelectedProvince(event: ChangeEvent<HTMLSelectElement>) {
        const nameSelectedProvince = event.target.value;

        const provinceIndex = provinces.findIndex((province) => province.name === nameSelectedProvince);
        const selectedProvince = provinces[provinceIndex];
        setSelectedProvince(selectedProvince);
    }

    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
        const citySelected = event.target.value;
        setSelectedCity(citySelected);
        const city = cities.find(city => (city.name === citySelected))
        setFocusMapPosition(city?city.position:focusMapPosition);
    }
    
    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([event.latlng.lat, event.latlng.lng]);
    }
    
    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        
        setFormData({
            ...formData, [name]: value
        });
    }

    function handleSelectItem(id: number) {
        const alreadySelected = selectedItems.findIndex(item => item === id)

        if(alreadySelected >=  0) {
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const province = selectedProvince.name;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;
        
        const data = {
            name,
            email,
            whatsapp,
            province,
            city,
            latitude,
            longitude,
            items
        };

        // await api.post('points', data);

        history.push('/success');
    }

    
    
    return (
        <div id="page-create-point">
            <header>
                <Link to="/">
                    <FiArrowLeft />
                    <p>Volver para home</p>
                </Link>

                <img src={logo} alt="EcoLeta"/>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Registro de <br/>punto de recogida</h1>
                <fieldset>
                    <legend>
                        <h2>Datos</h2>
                    </legend>
                    
                        
                    <div className="field">
                        <label htmlFor="name">Nombre de la entidad</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                        
                    </div>
                </fieldset>
                
                <fieldset>
                    <legend>
                        <h2>Ubicación</h2>
                        <span>Elege la ubicación en el mapa</span>
                    </legend>

                    <Map 
                        center={focusMapPosition} 
                        zoom={13} 
                        onClick={handleMapClick}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                        />
                    <Marker  position={selectedPosition}/>
                    </Map>
        
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Provincia</label>
                            <select  
                                name="uf"
                                id="uf"
                                value={selectedProvince.name} 
                                onChange={handleSelectedProvince}
                            >
                                <option value="0">Elege una provincia</option>
                                {
                                    provinces.map(province => (
                                    <option key={province.id} value={province.name} >{province.name}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Ciudad</label>
                            <select 
                                name="city"
                                id="city"
                                value={selectedCity}
                                onChange={handleSelectedCity}
                            >
                                <option value="0">Elege una ciudad</option>
                                {
                                    cities.map(city => (
                                    <option key={city.id} value={city.name}>{city.name}</option>
                                    ))
                                }
 
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Tipos de colección</h2>
                        <span>Seleccione uno o más elementos a continuación</span>
                    </legend>
                    <ul className="items-grid">
                        
                        {items.map(item => (
                            <li 
                                key={item.id}
                                onClick={() => handleSelectItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected': ''}
                            >
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>    
                            </li>
                        ))}
                        
                    </ul>
                </fieldset>
                <div id="buttonLink">
                    <button type="submit" >
                        <Link to='/success'>
                            Registrar punto de recogida
                        </Link>
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreatePoint;
