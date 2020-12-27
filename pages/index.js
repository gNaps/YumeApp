import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import CardGame from '../components/CardGame'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import axios from 'axios'
import useSWR, { mutate } from 'swr'
import { useRouter } from 'next/router'
import cookie from 'js-cookie';
import { Button, Modal, Form, Col, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { useState } from "react";

/* export async function getStaticProps(context) {
  
      await psn.auth(npsso);
      console.log(psn.access_token, psn.refresh_token);

      const profile = await psn.getProfile("Naps_Zoro");
      console.log(profile);

      //Con questa chiamata recupero i trofei del gioco relativi all'utente
      const game = await psn.getIndividualGame("NPWR20075_00", "Naps_Zoro");

      //Così recupero la lista dei giochi dell'utente 
      let individual = await psn.getSummary(0, "Eras963");
      individual = individual.trophyTitles.filter(item => item.comparedUser)

  

  return {
    props: {game}, // will be passed to the page component as props
  }
} */


export function ListGames({findNumberGames}){

  //CHIAMATA API PER LETTURA DELLA LISTA
  console.log("yoyo", process.env.NEXT_PUBLIC_API_URL)
  const fetcher = url => axios.get(`${process.env.NEXT_PUBLIC_API_URL}/usersvideogame/`, {
  headers: {
    authorization: 'Bearer ' + cookie.get('jwt'),
  }}).then(res => res.data);

  const { data, error } = useSWR('/api/listUserGame', fetcher);
  console.log("data", data);

  //GESTIONE FILTRO DELLA LISTA
  const [searchTerm, setSearchTerm] = React.useState("");
  const handleChange = event => {
    setSearchTerm(event.target.value);
  };

  const [filterButton, setFilterButton] = useState(['All']);
  const [filterAll, setFilterAll] = useState(true);
  const [filterPlatinum, setFilterPlatinum] = useState(false);
  const [filterEnd, setFilterEnd] = useState(false);
  const [filterPlaying, setFilterPlaying] = useState(false);
  const [filterWishlist, setFilterWishlist] = useState(false);

  const handleChangeFilterButton = (val) => {
    console.log("filtro", val);
    let newFilter = [...filterButton]; // Copia
    const found = newFilter.find(element => {return element === val})

    switch(val) {
      case 'All': 
        newFilter = ['All']
        setFilterAll(true)
        setFilterPlatinum(false)
        setFilterEnd(false)
        setFilterPlaying(false)
        setFilterWishlist(false)
        break;
      case 'Platinum': 
        if(found) {
          newFilter = newFilter.filter((element) => element !== val);
          setFilterPlatinum(false)
        } else {
          newFilter.push(val)
          setFilterPlatinum(true)
          newFilter = newFilter.filter((element) => element !== 'All');
          setFilterAll(false)
        }
        break;
      case 'End': 
        if(found) {
          newFilter = newFilter.filter((element) => element !== val);
          setFilterEnd(false)
        } else {
          newFilter.push(val)
          setFilterEnd(true)
          newFilter = newFilter.filter((element) => element !== 'All');
          setFilterAll(false)
        }
        break;
      case 'Playing': 
        if(found) {
          newFilter = newFilter.filter((element) => element !== val);
          setFilterPlaying(false)
        } else {
          newFilter.push(val)
          setFilterPlaying(true)
          newFilter = newFilter.filter((element) => element !== 'All');
          setFilterAll(false)
        }
        break;
      case 'Wishlist': 
        if(found) {
          newFilter = newFilter.filter((element) => element !== val);
          setFilterWishlist(false)
        } else {
          newFilter.push(val)
          setFilterWishlist(true)
          newFilter = newFilter.filter((element) => element !== 'All');
          setFilterAll(false)
        }
        break;
    }

    if(newFilter.length == 0) {
      newFilter = ['All']
      setFilterAll(true)
    }

    setFilterButton(newFilter);
  }

  let results = !searchTerm
    ? data
    : data.filter(x =>
        x.gameIgdb.name.toLowerCase().includes(searchTerm.toLocaleLowerCase())
      );
  
  let tempResults = [];
  console.log(filterButton)
  if(filterButton && filterButton.length > 0) {
    if(filterButton.includes('All')) {
      tempResults = results;
    }
    if(filterButton.includes('Platinum')) {
      tempResults = tempResults.concat(results.filter(item => item.usersVideogame.platinum == true));
    }
    if(filterButton.includes('End')) {
      tempResults = tempResults.concat(results.filter(item => item.usersVideogame.finish == true && item.usersVideogame.platinum == false));
    }
    if(filterButton.includes('Playing')) {
      tempResults = tempResults.concat(results.filter(item => item.usersVideogame.orderToPlay !== 0));
    }
    if(filterButton.includes('Wishlist')) {
      tempResults = tempResults.concat(results.filter(item => item.usersVideogame.wishlist == true));
    }
    results = tempResults;
  }


  //GESTIONE MODALE PER MODIFICA LISTA
  const [showModal, setShowModal] = useState(false);
  const [modalObject, setModalObject] = React.useState({userVideogameLabel: [], usersVideogame:[], gameIgdb: {}});
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [indexObjectDelete, setIndexObjectDelete] = useState(0);
  const [modalObjectDelete, setModalObjectDelete] = React.useState({userVideogameLabel: [], usersVideogame:[], gameIgdb: {}});

  const handleCloseModal = () => setShowModal(false);
  const handleCloseModalDelete = () => setShowModalDelete(false);
  const handleChangePlatinum = (game, event) => {
    console.log("yoyo", game.usersVideogame.platinum);
    //game.usersVideogame.platinum  = !game.usersVideogame.platinum;
    //setModalObject(game);
    console.log("yoyo event", event);
  }

  const handleShowModal = (x) => {
    setModalObject(x);
    console.log("oggetto del modale", modalObject);
    setShowModal(true);
  }

  const handleSaveModal = (gameToSave) => {
    console.log("oggetto da salvare", gameToSave);

    axios.put(`${process.env.NEXT_PUBLIC_API_URL}/usersvideogame/${gameToSave.usersVideogame.Id}`, gameToSave.usersVideogame,{
    headers: {
      authorization: 'Bearer ' + cookie.get('jwt'),
    }}).then(res => {
      console.log("risposta di modifica ai check", res);
      gameToSave.userVideogameLabel.forEach((element) => {
        axios.put(`${process.env.NEXT_PUBLIC_API_URL}/uservideogamelabel/${element.Id}`, element,{
        headers: {
          authorization: 'Bearer ' + cookie.get('jwt'),
        }}).then(res => {
            console.log("risposta di modifica alle label", res);
        });
      })

      if(gameToSave.newLabel.label){
        axios.post(`${process.env.NEXT_PUBLIC_API_URL}/uservideogamelabel/`, gameToSave.newLabel,{
        headers: {
          authorization: 'Bearer ' + cookie.get('jwt'),
        }}).then(res => {
            console.log("risposta di modifica alle label", res);
        });
      }
    }).then(() => {
      mutate('/api/listUserGame');
      setShowModal(false);    
    });
  }

  const handleShowModalDelete = (gameToDelete, index) => {
    console.log("gioco da eliminare", gameToDelete);
    setModalObjectDelete(gameToDelete);
    setIndexObjectDelete(index);
    setShowModalDelete(true);
  }

  const deleteGame = (game, index) => {
    console.log("elimino", game.usersVideogame.id)
    console.log("index", index)
    axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/usersvideogame/${game.usersVideogame.id}`,{
    headers: {
      authorization: 'Bearer ' + cookie.get('jwt'),
    }}).then(res => {
      console.log("risposta di modifica ai check", res);
      if(res.status == 200){
        setShowModalDelete(false);  
        //mutate('/api/listUserGame', data => ({ ...data, items: [ ...data.slice(0, index), index < data.length - 1 && data.slice(index + 1) ] }), false)
        mutate('/api/listUserGame');
      }
    });
  }
  
  if(data == undefined) 
    return (
      <div class="lds-ripple" style={{marginTop: '50px'}}><div></div><div></div></div>
      )
  else {
    const numberGames = {
      numberPlatinum: data.filter((item) => { return item.usersVideogame.platinum === true}).length,
      numberFinish: data.filter((item) => { return item.usersVideogame.finish === true}).length,
      numberToPlay: data.filter((item) => { return item.usersVideogame.orderToPlay !== 0}).length,
      numberToBuy: data.filter((item) => { return item.usersVideogame.wishlist === true}).length,
      numberTotal: data.length
    }
    findNumberGames(numberGames)
    return(
      <> 
      {data.length != 0 && 
        <>
          <div className={utilStyles.games_filter_type}>
            { filterAll 
              ? <div className={utilStyles.games_filter_type_item_active} onClick={() => handleChangeFilterButton('All')}>All</div>
              : <div className={utilStyles.games_filter_type_item} onClick={() => handleChangeFilterButton('All')}>All</div>
            }
            { filterPlatinum 
              ? <div className={utilStyles.games_filter_type_item_active} onClick={() => handleChangeFilterButton('Platinum')}>Platinum</div>
              : <div className={utilStyles.games_filter_type_item} onClick={() => handleChangeFilterButton('Platinum')}>Platinum</div>
            }
            { filterEnd 
              ? <div className={utilStyles.games_filter_type_item_active} onClick={() => handleChangeFilterButton('End')}>End</div>
              : <div className={utilStyles.games_filter_type_item} onClick={() => handleChangeFilterButton('End')}>End</div>
            }
            { filterPlaying 
              ? <div className={utilStyles.games_filter_type_item_active} onClick={() => handleChangeFilterButton('Playing')}>Playing/Backlog</div>
              : <div className={utilStyles.games_filter_type_item} onClick={() => handleChangeFilterButton('Playing')}>Playing/Backlog</div>
            }
            { filterWishlist 
                ? <div className={utilStyles.games_filter_type_item_active} onClick={() => handleChangeFilterButton('Wishlist')}>Wishlist</div>
                : <div className={utilStyles.games_filter_type_item} onClick={() => handleChangeFilterButton('Wishlist')}>Wishlist</div>
            }   
          </div>
          <input
          type="text"
          placeholder="search a game..."
          value={searchTerm}
          onChange={handleChange}
          className={utilStyles.list_games_filter}
          />
        </>
      }
     {data.length == 0 && <h3 style={{padding: '50px', color: '#afafaf'}}>Seems you haven't games yet. Use the research to add once.</h3>}
      {results.map((game) => (
        <>
          <CardGame game={game} key={game.usersVideogame.id}></CardGame>
        </>
       ))}
     </>
   )
  }
}

export function AddGames() {
  const [addTerm, setAddTerm] = React.useState("");
  const router = useRouter()
  const handleClick = event => {
    if(addTerm) {
      router.push('/game/listGames?search=' + addTerm);
    }
  };

  const handleChange = event => {
    console.log(event);
    setAddTerm(event.target.value);
  };

  const handleKeyUp = event => {
    console.log(event.keyCode);
    if(event.keyCode == 13) {
      if(addTerm) {
        router.push('/game/listGames?search=' + addTerm);
      }
    }
  };

  return (
    <div className={utilStyles.add_games_container}>
      <input
        type="text"
        placeholder="search a game to add"
        value={addTerm}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
        className={utilStyles.list_games_search}
      />
      <Button variant="primary" type="submit" onClick={handleClick} className={`${utilStyles.btn_primary} ${utilStyles.mt_auto}`}>
        Search game
      </Button>
    </div>
  )
}

export default function Home(props) {
    const tokenJwt = cookie.get('jwt');
    console.log(tokenJwt);
    console.log("props", props);
    const r = useRouter()

    React.useEffect(() => {
      if(!tokenJwt) {
        r.push('/login');
      }
    }, []);

    const [numberGamesPlatinum, setNumberGamesPlatinum] = useState();
    const [numberGamesFinish, setNumberGamesFinish] = useState();
    const [numberGamesToPlay, setNumberGamesToPlay] = useState();
    const [numberGamesToBuy, setNumberGamesToBuy] = useState();
    const [numberGamesTotal, setNumberGamesTotal] = useState();

    const handleCallback = (childData) =>{
      console.log("childData", childData)
      setNumberGamesPlatinum(childData.numberPlatinum);
      setNumberGamesFinish(childData.numberFinish);
      setNumberGamesToPlay(childData.numberToPlay);
      setNumberGamesToBuy(childData.numberToBuy);
      setNumberGamesTotal(childData.numberTotal);
    }
  
  return (
    <Layout 
      home 
      numberGamesPlatinum={numberGamesPlatinum}
      numberGamesFinish={numberGamesFinish}
      numberGamesToPlay={numberGamesToPlay}
      numberGamesToBuy={numberGamesToBuy}
    >
    <section className={utilStyles.headingMd}>
      {/* 
      {numberGamesTotal && <h5 style={{fontWeight: '200'}}>you have {numberGamesTotal} games in your list.</h5>}
      <div style={{padding: '10px'}}>
        {numberGamesPlatinum ? <span style={{margin: '5px'}}><i class="fas fa-trophy"></i>{numberGamesPlatinum}</span> 
          : <span style={{margin: '5px'}}><i class="fas fa-trophy"></i>0</span>}
        {numberGamesFinish ? <span style={{margin: '5px'}}><i class="fas fa-award"></i>{numberGamesFinish}</span>
          : <span style={{margin: '5px'}}><i class="fas fa-award"></i>0</span> }
        {numberGamesToPlay ? <span style={{margin: '5px'}}><i class="fas fa-gamepad"></i>{numberGamesToPlay}</span>
          : <span style={{margin: '5px'}}><i class="fas fa-gamepad"></i>0</span> }
        {numberGamesToBuy ? <span style={{margin: '5px'}}><i class="fas fa-shopping-basket"></i>{numberGamesToBuy}</span>
          : <span style={{margin: '5px'}}><i class="fas fa-shopping-basket"></i>0</span> }
      </div>
      <AddGames></AddGames>
      <ListGames findNumberGames={(numberGames) => handleCallback(numberGames)}></ListGames>
      */}

      <ListGames findNumberGames={(numberGames) => handleCallback(numberGames)}></ListGames>
      </section> 
      {/* <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <img src="/logo_yume_w.png"  style={{width: '60%'}}/>
      </div> */}
    </Layout>
  )
}

