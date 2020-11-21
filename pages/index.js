import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import axios from 'axios'
import useSWR, { mutate } from 'swr'
import { useRouter } from 'next/router'
import cookie from 'js-cookie';
import { Button, Modal, Form, Col, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { useState } from "react";


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

  const [filterButton, setFilterButton] = useState([]);
  const handleChangeFilterButton = (val) => {
    console.log("filtro", val);
    setFilterButton(val);
  }

  let results = !searchTerm
    ? data
    : data.filter(x =>
        x.gameIgdb.name.toLowerCase().includes(searchTerm.toLocaleLowerCase())
      );
  
  let tempResults = [];
  console.log(filterButton)
  if(filterButton && filterButton.length > 0) {
    if(filterButton.includes(1)) {
      tempResults = tempResults.concat(results.filter(item => item.usersVideogame.platinum == true));
    }
    if(filterButton.includes(2)) {
      tempResults = tempResults.concat(results.filter(item => item.usersVideogame.finish == true && item.usersVideogame.platinum == false));
    }
    if(filterButton.includes(3)) {
      tempResults = tempResults.concat(results.filter(item => item.usersVideogame.orderToPlay !== 0));
    }
    if(filterButton.includes(4)) {
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
          <input
          type="text"
          placeholder="filter gamelist"
          value={searchTerm}
          onChange={handleChange}
          className={utilStyles.list_games_filter}
          />
          <div className={utilStyles.games_filter_type}>
          <ToggleButtonGroup type="checkbox" value={filterButton} onChange={handleChangeFilterButton}>
            <ToggleButton variant="light" value={1}><i class="fas fa-trophy"></i></ToggleButton>
            <ToggleButton variant="light" value={2}><i class="fas fa-award"></i></ToggleButton>
            <ToggleButton variant="light" value={3}><i class="fas fa-gamepad"></i></ToggleButton>
            <ToggleButton variant="light" value={4}><i class="fas fa-shopping-basket"></i></ToggleButton>
          </ToggleButtonGroup>
          </div>
        </>
      }
     {data.length == 0 && <h3 style={{padding: '50px', color: '#afafaf'}}>Seems you haven't games yet. Use the research to add once.</h3>}
      {results.map((x, index) => (
         <li className={`${utilStyles.listItem} ${utilStyles.list_games_item}`} key={x.usersVideogame.id}>
          <div className={utilStyles.list_games_item_header}>
            <div style={{width: '100%', height: '200px', 
            backgroundImage: 'url(https:' + x.gameIgdb.cover.url.replace('t_thumb', 't_1080p') + ')', 
            backgroundSize: 'cover', backgroundPosition: 'center'}} />
              <div className={utilStyles.list_games_item_body}>
                <Link href={`/game/${x.gameIgdb.id}`}>
                  <a>{x.gameIgdb.name}</a>
                </Link>
                {x.usersVideogame.platinum == 1 && 
                  <div className={`${utilStyles.badge} ${utilStyles.badge_platinato}`}>
                    <div className={utilStyles.badge_icon}>
                      <i class="fas fa-trophy"></i>
                    </div>
                    <div className={utilStyles.badge_text}>
                      <p>Platinum</p>
                    </div>
                  </div>
                }
                {x.usersVideogame.finish && !x.usersVideogame.platinum &&
                   <div className={`${utilStyles.badge} ${utilStyles.badge_completato}`}>
                    <div className={utilStyles.badge_icon}>
                    <i class="fas fa-award"></i>
                    </div>
                    <div className={utilStyles.badge_text}>
                      <p>Finish</p>
                    </div>
                  </div>
                }
                {x.usersVideogame.orderToPlay != 0 && 
                  <div className={`${utilStyles.badge} ${utilStyles.badge_normale}`}>
                    <div className={utilStyles.badge_icon}>
                    <i class="fas fa-gamepad"></i>
                    </div>
                    <div className={utilStyles.badge_text}>
                      <p>Priority {x.usersVideogame.orderToPlay}</p>
                    </div>
                  </div>
                }
                {x.usersVideogame.wishlist && 
                  <div className={`${utilStyles.badge} ${utilStyles.badge_normale}`}>
                  <div className={utilStyles.badge_icon}>
                  <i class="fas fa-shopping-basket"></i>
                  </div>
                  <div className={utilStyles.badge_text}>
                    <p>In Wishlist</p>
                  </div>
                </div>
                }
                {x.userVideogameLabel.map((y) => (
                  <p id={y.id}>{y.label}</p> 
                ))}
                { x.userVideogameLabel.length == 0 && <p className={utilStyles.placeholder_label}>
                    Add a label to mark, highlight or remind you of game information
                  </p> }
                <div className={utilStyles.game_button}>
                <Button variant="primary" type="submit" 
                  className={`${utilStyles.btn_primary} ${utilStyles.mt_auto}`} 
                  onClick={() => handleShowModal(x)}>
                  Update
                </Button>
                <Button type="submit" 
                  className={utilStyles.btn_danger}
                  onClick={() => handleShowModalDelete(x, index)}>
                    Delete
                </Button>
                </div>
              </div>
            </div>
          </li>
       ))}

        <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Updating {modalObject.gameIgdb.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body className={utilStyles.body_modal}>
            <Form.Group controlId="formUpdateModal">
              <Form.Check type="checkbox" label="Platinum" 
                defaultChecked={modalObject.usersVideogame.platinum} 
                id={'checkPlatinum_' + modalObject.usersVideogame.id}
              />
              <Form.Check type="checkbox" label="Finish" 
                defaultChecked={modalObject.usersVideogame.finish} 
                id={'checkFinish_' + modalObject.usersVideogame.id}
              />
              <Form.Check type="checkbox" label="In Wishlist" 
                defaultChecked={modalObject.usersVideogame.wishlist} 
                id={'checkWishlist_' + modalObject.usersVideogame.id}
              />
              <Form.Label>
                Priority
              </Form.Label>
              <Form.Control type="number" 
                defaultValue={modalObject.usersVideogame.orderToPlay} 
                id={'numberOrderToPlay_' + modalObject.usersVideogame.id}
              />
              {modalObject.userVideogameLabel.map((label) => (
                <div>
                  <Form.Label>Label</Form.Label>
                  <Form.Control type="text" 
                  defaultValue={label.label} 
                  id={'label_' + label.id} />
                </div>
              ))}
              <Form.Label> New Label </Form.Label>
              <Form.Control type="text" 
              id={'labelnew'} />
              </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Close
                </Button>
                <Button variant="primary" onClick={() => {
                  let gameToSave = {
                    usersVideogame: {
                      Id: modalObject.usersVideogame.id,
                      Platinum: document.getElementById('checkPlatinum_' + modalObject.usersVideogame.id).checked,
                      Finish: document.getElementById('checkFinish_' + modalObject.usersVideogame.id).checked,
                      Wishlist: document.getElementById('checkWishlist_' + modalObject.usersVideogame.id).checked,
                      OrderToPlay: parseInt(document.getElementById('numberOrderToPlay_' + modalObject.usersVideogame.id).value)
                    },
                    userVideogameLabel: [],
                    newLabel: {}
                  }

                  modalObject.userVideogameLabel.forEach(element => {
                    gameToSave.userVideogameLabel.push({
                      Id: element.id,
                      Label: document.getElementById('label_' + element.id).value,
                      UserVideogameId: element.userVideogameId
                    })
                  });

                  const newLabel = document.getElementById('labelnew').value
                  if(newLabel) {
                    gameToSave.newLabel = {
                      Label: newLabel,
                      UserVideogameId: gameToSave.userVideogameLabel[0].userVideoGameId
                    }
                  }

                  handleSaveModal(gameToSave);
                }}>
                  Save Changes
                </Button>
              </Modal.Footer>
            </Modal>   


        <Modal show={showModalDelete} onHide={handleCloseModalDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Remove {modalObjectDelete.gameIgdb.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Do you want to remove this game from your list?</p>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModalDelete}>
              No
            </Button>
            <Button variant="primary" onClick={() => {
              deleteGame(modalObjectDelete, indexObjectDelete)
            }}>
              Yes
            </Button>
          </Modal.Footer>
        </Modal>       

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

export default function Home() {
    const tokenJwt = cookie.get('jwt');
    console.log(tokenJwt);
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
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
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
      </section>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <img src="https://www.gabrielenapoli.com/res/logo_yume_b.png"  style={{width: '60%'}}/>
      </div>
    </Layout>
  )
}

