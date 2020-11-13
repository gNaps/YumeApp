import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import axios from 'axios'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import cookie from 'js-cookie';
import { Button, Modal, Form, Col } from 'react-bootstrap';
import { useState } from "react";


export function ListGames(){
  //CHIAMATA API PER LETTURA DELLA LISTA
  const fetcher = url => axios.get('https://localhost:5001/api/usersvideogame/', {
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

  const results = !searchTerm
    ? data
    : data.filter(x =>
        x.gameIgdb.name.toLowerCase().includes(searchTerm.toLocaleLowerCase())
      );

  //GESTIONE MODALE PER MODIFICA LISTA
  const [showModal, setShowModal] = useState(false);
  const [modalObject, setModalObject] = React.useState({userVideogameLabel: [], usersVideogame:[], gameIgdb: {}});

  const handleCloseModal = () => setShowModal(false);
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

    axios.put(`https://localhost:5001/api/usersvideogame/${gameToSave.usersVideogame.Id}`, gameToSave.usersVideogame,{
    headers: {
      authorization: 'Bearer ' + cookie.get('jwt'),
    }}).then(res => {
      console.log("risposta di modifica ai check", res);
      gameToSave.userVideogameLabel.forEach((element) => {
        axios.put(`https://localhost:5001/api/uservideogamelabel/${element.Id}`, element,{
        headers: {
          authorization: 'Bearer ' + cookie.get('jwt'),
        }}).then(res => {
            console.log("risposta di modifica alle label", res);
        });
      })

      if(gameToSave.newLabel.label){
        axios.post(`https://localhost:5001/api/uservideogamelabel/`, gameToSave.newLabel,{
        headers: {
          authorization: 'Bearer ' + cookie.get('jwt'),
        }}).then(res => {
            console.log("risposta di modifica alle label", res);
        });
      }
    }).then(() => {
      setShowModal(false);    
    });
  }

  const handleDeleteGame = (gameToDelete) => {
    console.log("gioco da eliminare", gameToDelete);
  }
  
  if(data == undefined) 
    return (
      <div>loading...</div>
      )
  else {
    return(
      <div> 
      <input
       type="text"
       placeholder="filter gamelist"
       value={searchTerm}
       onChange={handleChange}
       className={utilStyles.list_games_filter}
     />
      {results.map((x) => (
         <li className={`${utilStyles.listItem} ${utilStyles.list_games_item}`} key={x.usersVideogame.id}>
          <div className={utilStyles.list_games_item_header}>
              <img src={'https:' + x.gameIgdb.cover.url.replace('t_thumb', 't_cover_big')}></img> 
              <div className={utilStyles.list_games_item_body}>
                <Link href={`/game/${x.gameIgdb.id}`}>
                  <a>{x.gameIgdb.name}</a>
                </Link>
                {x.usersVideogame.platinum == 1 && <small className={utilStyles.game_platinato}>Platinum</small>}
                {x.usersVideogame.finish && <small className={utilStyles.game_completato}>Finish</small>}
                {x.usersVideogame.orderToPlay != 0 && <small className={utilStyles.game_normale}>Priority {x.usersVideogame.orderToPlay}</small>}
                {x.usersVideogame.wishlist && <small className={utilStyles.game_normale}>In wishlist</small>}
                {x.userVideogameLabel.map((y) => (
                  <p id={y.id}>{y.label}</p>
                ))}
                <Button variant="primary" type="submit" 
                  className={`${utilStyles.btn_primary} ${utilStyles.mt_auto}`} 
                  onClick={() => handleShowModal(x)}>
                  Update
                </Button>
                <Button variant="danger" type="submit" 
                  className={utilStyles.btn_danger}
                  onClick={() => handleDeleteGame(x)}>
                    Delete
                </Button>
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

     </div>
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
    }, [])
  
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>This is your gamelist</p>
      <AddGames></AddGames>
      <ListGames></ListGames>
      </section>
      {/* <section className={utilStyles.headingMd}>…</section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
        </ul>
      </section> 
      https://images.igdb.com/igdb/image/upload/t_cover_big/co1x78.jpg*/}
    </Layout>
  )
}

