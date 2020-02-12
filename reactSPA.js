import React, {useState, useEffect} from 'react';
import {Link, NavLink, Switch, Route, BrowserRouter as Router, useHistory, withRouter, Redirect, useLocation} from 'react-router-dom'
import './reactSPA.css'
// tuodaan css-tiedosto 

export default class RouteApp extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            user : null,
            id : null
        }
    }

    loginDone(loggedUser)
    {
        this.setState({user : loggedUser});
    }

    render()
    {
        let x = "";

        if (this.state.user !== null) 
        x = "Käyttäjä on " + this.state.user;

        return(
            <Router>
                
                <NavLink className="Link" to="/">Koti </NavLink>
                <Link className="Link" to="/asiakkaat">Asiakkaat </Link>
                <Link className="Link" to="/autot">Autot </Link>

                <p>{x}</p>

                <Switch>
                    {
                    <Route exact path="/" render={(p) => <Home {...p} />}/>
                    }
                    <Route path="/asiakkaat" render={(renderProps) => <Asiakkaat {...renderProps}/>}/>
                    
                    

                    <Route path="/autot">
                    {   this.state.user ?
                        <Autot />  : <LoginComponent onLogin={(user, id) => this.loginDone(user, id)}/>
                    }
                    </Route>
                    <Route path='*' render={(p) => <My404Component {...p} />}/>

                </Switch>

            </Router>
        )
    }
}


//käyttäjä ei pääse autot-sivulle, jos ei rekisteröidy ensin
const Login = (props) => {

    let h = useHistory();

    // funktion sisäiset muuttujat, jotka saadaan käyttäjän ne syöttäessä
    const [kayttaja, setKayttaja] = useState("");
    const [ID, setID] = useState("");

    const onClick = (event) =>
    {
        if (kayttaja !== "" && ID !== "")
        {
            props.onLogin(kayttaja);
            // saa käyttäjänimen kun käyttäjä kirjautuu sisälle, vie sen riville 28
            h.push("/autot");
            // renderöi autosivun näkyviin kun sekä käyttäjä että henkilönumero syötetty
        }
    }

    console.log("Login:", props);

    return (
        <div>
            Nimi <input type="text" value={kayttaja} onChange={(event) => setKayttaja(event.target.value)}/><br />
            Henkilönumero <input type="text" value={ID} onChange={(event) => setID(event.target.value)}/><br />
            <p><button onClick={(e) => onClick(e)}>Kirjaudu sisään</button></p>
        </div>
    );
}


const LoginComponent = withRouter(Login);

function Home(props)
{
    // etusivu, johon haetaan aika time funktiosta
    return <div>
    <h4>Savonia AMK</h4>
    <p>Käyntiosoite: Microkatu 1, 70210 KUOPIO</p>
    <p>savonia@savonia.fi</p>
    <div>Nyt on <Time /></div>
    </div>
}

const Asiakkaat = props => {

    console.log("NEWS:", props);

    return <div><p>Tämä on asiakkaat (reitti oli {props.location.pathname})</p></div>
}

//autot class, näytetään tiedot autoista, jotka haetaan REST-palvelusta, renderöidään myös kutsu auto-funktiota varten
class Autot extends React.Component {
    constructor(props)
    {
        super(props);

        this.state = {
            cars: []

        }
    }

    async fetchCars()
    {
            
        try{
            
            let response = await fetch(
                'http://localhost:3002/autot',
                {
                    method : "GET",
                    headers : {"Content-type" : "application/json"}
                }
            );
            console.log("response", response);
            let data = await response.json();
            this.setState({cars : data});
        }
        catch(e)
        {
            console.log("Virhe: ", e)
        }
    }
    
    render ()
    {
        const car = this.state.cars.map((c) => <p key={c.id}>{c.Merkki}, {c.Malli}</p>)
        return(
            <div>
                <button onClick={() => this.fetchCars()}>Hae kaikki autot</button>
                {car}
                <Auto />
            </div>
        )
    }
    
    
}

//funktio, joka näyttää yksittäisen auton tiedot
const Auto = () => {
    const [car, setCar] = useState([]);
    const [x, setX] = useState("");

    useEffect(() => {
        async function fetchCar()
        {
            let response = await fetch('http://localhost:3002/autot/1')
            let data = await response.json();
            setCar(data);
        }

        if (x !== "")
        fetchCar();

    }, [x]);

    return (
        <div>
            <p><button onClick={() => setX("x")}>Hae yksi auto</button></p>
            {car.Merkki} {car.Malli}
        </div>
    )
}

// HUOM! Jos on kaarisulut, EI tule return-lausetta

const Info = () => (
    <div><h3>Infoa sovelluksesta</h3></div>
)


//näyttää ajan: kuluva päivä, aamu/iltapäivä
const Time = () =>
{
    let today = new Date(),
        date = today.getDay();
    
    if (date === 1)
    date = "Maanantai"
    if (date === 2)
    date = "Tiistai"
    if (date === 3)
    date = "Keskiviikko"
    if (date === 4)
    date = "Torstai"
    if (date === 5)
    date = "Perjantai"
    if (date === 6)
    date = "Saturday"
    if (date === 7)
    date = "Sunday"

    //hakee oikean kellonajan
    let noon = new Date().getHours();

    if (noon < 14 && noon >= 6)
    noon = "aamupäivä";
    else 
    noon = "iltapäivä";

    //console.log("ilta vai aamu:", noon);


    return <div>{date} {noon}</div>
}

//käyttäjä on navigoinut sivulle, jota ei ole olemassa
const My404Component = () => {
    let location = useLocation();

    return (
    <div><p>Tämä on virhesivu (yritit navigoida tälle sivulle {location.pathname})</p>
   
        <a href="/">Takaisin kotisivulle</a>
    
    </div>
    )
}