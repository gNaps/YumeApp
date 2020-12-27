import Layout from '../../components/layout'
import Head from 'next/head'
import useSWR, { mutate} from 'swr'
import axios from 'axios'
import https from 'https'
import { useRouter } from "next/router";
import utilStyles from '../../styles/utils.module.css'
import styles from '../../styles/GameDetail.module.css'
import Link from 'next/link'
import cookie from 'js-cookie';
import { Button, Modal, Form, Col, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { bool } from 'prop-types';

export function Game () {
  const r = useRouter();
  const { id } = r.query;

  console.log(id);

  console.log("hello")

  if(!id) {
    return (
      <>
      </>
    )
  } 

  const fetcher = url => axios.get(`${process.env.NEXT_PUBLIC_API_URL}/game/${id.toString()}`, {
  headers: {
    authorization: 'Bearer ' +  cookie.get('jwt'),
  }}).then(res => res.data);

  const { data, error } = useSWR(`/api/game/${id.toString()}`, fetcher);
  console.log("data useSWR", data); 
  

  const saveGame = () => {
    let game = {
      usersVideogame: {
        Id: data.userVideogame.usersVideogame.id,
        Platinum: document.getElementById('checkPlatinum_' + data.userVideogame.usersVideogame.id).checked,
        Finish: document.getElementById('checkFinish_' + data.userVideogame.usersVideogame.id).checked,
        Wishlist: document.getElementById('checkWishlist_' + data.userVideogame.usersVideogame.id).checked,
        OrderToPlay: checkOrderToPlay(document.getElementById('checkOrderToPlay_' + data.userVideogame.usersVideogame.id).checked)
      },
      userVideogameLabel: [],
      newLabel: {}
    }

    data.userVideogame.userVideogameLabel.forEach(element => {
      game.userVideogameLabel.push({
        Id: element.id,
        Label: document.getElementById('label_' + element.id).value,
        UserVideogameId: element.userVideogameId
      })
    });

    const newLabel = document.getElementById('labelnew').value
    if(newLabel) {
      game.newLabel = {
        Label: newLabel,
        UserVideogameId: game.userVideogameLabel[0].userVideoGameId
      }
    }

    console.log("oggetto da salvare", game);

     axios.put(`${process.env.NEXT_PUBLIC_API_URL}/usersvideogame/${game.usersVideogame.Id}`, game.usersVideogame,{
    headers: {
      authorization: 'Bearer ' + cookie.get('jwt'),
    }}).then(res => {
      console.log("risposta di modifica ai check", res);
      game.userVideogameLabel.forEach((element) => {
        axios.put(`${process.env.NEXT_PUBLIC_API_URL}/uservideogamelabel/${element.Id}`, element,{
        headers: {
          authorization: 'Bearer ' + cookie.get('jwt'),
        }}).then(res => {
            console.log("risposta di modifica alle label", res);
        });
      })

      if(game.newLabel.Label){
        axios.post(`${process.env.NEXT_PUBLIC_API_URL}/uservideogamelabel/`, game.newLabel,{
        headers: {
          authorization: 'Bearer ' + cookie.get('jwt'),
        }}).then(res => {
            console.log("risposta di modifica alla nuova label", res);
        });
      }
    }).then(() => {
    }); 
  }

  function getRandomArbitrary(min, max) {
    //Il valore non è minore di (e può essere uguale a) min, nè maggiore (e nè uguale) a max. 
    return parseInt(Math.random() * (max - min) + min);
  }

  const checkOrderToPlay = (value) => {
    if(value) {
      return 1
    } else {
      return 0
    }
  }

  const deleteGame = () => {
    console.log("elimino ", data)
    axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/usersvideogame/${data.userVideogame.usersVideogame.id}`,{
    headers: {
      authorization: 'Bearer ' + cookie.get('jwt'),
    }}).then(res => {
      if(res.status == 200){
        mutate(`/api/game/${id.toString()}`);
      }
    }); 
  }

  const addGame = () => {
    console.log("aggiungo ", data)

    const game = {
      "Videogameid": data.id,
      "Finish": false,
      "Platinum": false,
      "Wishlist": false,
      "OrderToPlay": 0
    }

    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/usersvideogame`, game,{
    headers: {
      authorization: 'Bearer ' + cookie.get('jwt'),
    }}).then(res => {
      if(res.status == 201){
        mutate(`/api/game/${id.toString()}`);
      }
    });
  }

  if(data == undefined || data.id != id) 
    return (
      <div class="lds-ripple"><div></div><div></div></div>
      )
  else 
    return(
        <div className={styles.game_detail_container}>
          <h1 className={styles.head_text}>{data.name}</h1>
          <div style={{margin: '20px 0'}}>
            {data.genres.map((g) => (
              <span className={utilStyles.genres_label}>{g.name}</span>
            ))}
          </div>
          <div id={'screen_' + data.id} 
          style={{backgroundImage: 'url(' + data.screenshots[getRandomArbitrary(0, data.screenshots.length)].url.replace('thumb', '1080p') + ')', 
                  height: '344px',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  border: '10px solid #ECECEC',
                  borderRadius: '10px'}}></div>
          {
            data.userVideogame &&
            <>
              <div className={styles.info_users_game_controller}>
                <button 
                  className={styles.btn_remove}
                  onClick={() => deleteGame()}>
                  <i class="fas fa-times-circle" style={{marginRight: '10px'}}/>
                  Remove from list
                </button>
                <Link href={`trophies/${data.name}`}>
                  <a>
                    <button 
                      className={styles.btn_trophies}
                    >
                      <i class="fab fa-playstation" style={{marginRight: '10px'}}/>
                      Trophies
                    </button>
                  </a>
                </Link>
              </div>
              <div className={styles.info_users_game}>
                <Form.Group controlId="formUpdateModal">
                <div className={styles.row} style={{display: "flex"}}>
                  <div>
                    <input 
                      type="checkbox"
                      defaultChecked={data.userVideogame.usersVideogame.platinum} 
                      id={'checkPlatinum_' + data.userVideogame.usersVideogame.id}
                    />
                    <label>
                      Platinum
                    </label>
                  </div>
                  <div>
                    <input 
                      type="checkbox" 
                      defaultChecked={data.userVideogame.usersVideogame.finish} 
                      id={'checkFinish_' + data.userVideogame.usersVideogame.id}
                    />
                    <label>
                      Finish
                    </label>
                  </div>
                  <div>
                    <input 
                      type="checkbox" 
                      defaultChecked={data.userVideogame.usersVideogame.wishlist} 
                      id={'checkWishlist_' + data.userVideogame.usersVideogame.id}
                    />
                    <label>
                        In Wishlist
                    </label>
                  </div>
                  <div>
                    <input 
                      type="checkbox" 
                      defaultChecked={data.userVideogame.usersVideogame.orderToPlay != 0} 
                      id={'checkOrderToPlay_' + data.userVideogame.usersVideogame.id}
                    />
                    <label>
                        Playing/Backlog
                    </label>
                  </div>
                </div>
                
                {data.userVideogame.userVideogameLabel.map((label) => (
                  <div className={styles.label}>
                    <Form.Label>Label</Form.Label>
                    <Form.Control type="text" 
                    defaultValue={label.label} 
                    id={'label_' + label.id} />
                  </div>
                ))}
                <Form.Label className={styles.label}> New Label </Form.Label>
                <Form.Control type="text" 
                id={'labelnew'} />
                </Form.Group>

                <button 
                  className={styles.btn_save_changes}
                  onClick={() => saveGame()}>
                  <i class="fas fa-check-circle" style={{marginRight: '10px'}}/>
                  Save Changes
                </button>
              </div>
            </>
          }
          {
            !data.userVideogame &&
            <>
              <div className={styles.info_users_game_controller}>
                <button 
                  className={styles.btn_add}
                  onClick={() => addGame()}
                >
                  <i class="fas fa-check-circle" style={{marginRight: '10px'}}/>
                  Add to list
                </button>
                <button 
                  className={styles.btn_trophies}
                >
                  <i class="fab fa-playstation" style={{marginRight: '10px'}}/>
                  Trophies
                </button>
              </div>
            </>
          }
          <p className={styles.summary}>{data.summary}</p>
          <h3>Develop by</h3>
          {data.involved_companies.map((c) => (
            <p>{c.company.name}</p>
          ))}
          <h3>Story line</h3>
          {data.storyline && <p>{data.storyline}</p>}
          {!data.storyline && <p>Storyline of this game is not available.</p>}
          <h3>Similar games</h3>
          <div className={utilStyles.container_similar}>
            {data.similar_games.map(similar => (
              <Link href={`/game/${similar.id}`}>
              <div
                key={similar.id}
                className={utilStyles.card_similar}
                style={{
                  backgroundImage: `linear-gradient(rgb(121 121 121 / 45%), rgb(0 0 0 / 45%)),
                  url(https:${similar.cover.url.replace('thumb', '1080p')})`
                }}
              >
                <h4 style={{color: '#FFF', padding: '20px'}}>{similar.name}</h4>
              </div>
              </Link>
            ))}
          </div>
        </div>
    );
};

export default function Post() {
    return (
        <Layout post>
        <Head>
          {/* <title>{postData.title}</title> */}
        </Head>
        <Game></Game>
      </Layout>
    )
  }