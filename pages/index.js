import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import axios from 'axios'
import useSWR, { mutate } from 'swr'
import { useRouter } from 'next/router'
import cookie from 'js-cookie';
import { Button, Modal, Form, Col } from 'react-bootstrap';
import { useState } from "react";


export function ListGames(){
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

  const results = !searchTerm
    ? data
    : data.filter(x =>
        x.gameIgdb.name.toLowerCase().includes(searchTerm.toLocaleLowerCase())
      );

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
    return(
      <div> 
      <input
       type="text"
       placeholder="filter gamelist"
       value={searchTerm}
       onChange={handleChange}
       className={utilStyles.list_games_filter}
     />
      {results.map((x, index) => (
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
                  onClick={() => handleShowModalDelete(x, index)}>
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
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <svg width="250px" height="150px" viewBox="0 0 500 300" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <g id="Artboard" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <text id="UME" font-family="Futura-Bold, Futura" font-size="97.5" font-weight="bold" fill="#000">
                        <tspan x="178" y="201">UME</tspan>
                    </text>
                    <path d="M172.369841,126.9825 L173.08,126.9825 L172.754997,127.58912 L220,202 L60,202 L106.763844,128.346946 L106,126.9825 L107.630159,126.9825 L140,76 L172.369841,126.9825 Z M172.369841,126.9825 L152.8,126.9825 L139.8325,152.625 L126.475,126.9825 L107.630159,126.9825 L106.763844,128.346946 L130.18,170.175 L113.1175,201.96 L132.91,201.96 L172.754997,127.58912 L172.369841,126.9825 Z" id="Combined-Shape" fill="#000" fill-rule="nonzero"></path>
                </g>
        </svg>
        </div>
    </Layout>
  )
}

