import Layout from '../../../components/layout'
import Head from 'next/head'
import useSWR, { mutate} from 'swr'
import axios from 'axios'
import { useState } from "react";
import utilStyles from '../../../styles/utils.module.css'
import Link from 'next/link'
import cookie from 'js-cookie';
import PSN from 'pxs-psn-api'

  const psn = new PSN({
    lang: "en",  //(default value en)
    region: "us",  // server region(default value us)
    refresh_token: null, //refresh_token(default value null)
    access_token: null  //access_token(default value null)
  });
  
  const npsso = "3JSYEs4lnyJxwsWE3ukJER2NTGuuieUKFexm96bDIrJS71JHqezJhoAVSOfoTQyT";
  
  export async function getStaticProps({params}) {
        const name = params.name;
        let game = [];
        let individual = [];

        try{
          await psn.auth(npsso);
          console.log(psn.access_token, psn.refresh_token);
          //Con questa chiamata recupero i trofei del gioco relativi all'utente
          //const gameCC = await psn.getIndividualGame("NPWR20075_00", "Naps_Zoro");
          let gamee = 'ciao';
    
          //Così recupero la lista dei giochi dell'utente 
          individual = await psn.getSummary(0, "Naps_Zoro");
          if(individual) {
            individual = individual.trophyTitles.filter(item => item.comparedUser && item.trophyTitleDetail.toLowerCase().includes(name.toLowerCase()))

            for(let i = 0; i < individual.length; i++) {
              gamee = await psn.getIndividualGame(individual[i].npCommunicationId, "Naps_Zoro");
              gamee['index'] = i;
              game.push(gamee);
            }
          }
          //const game = await psn.getIndividualGame("NPWR07897_00", "Naps_Zoro");
        } catch (err) {
          console.log('error: ', err);
        }
  
    return {
      props: {individual, game}, // will be passed to the page component as props
    }
  }

  export async function getStaticPaths(context) {
    return {
        paths: [{ params: { name: 'Dark Souls' } }, { params: { name: '2' } }],
        // Enable statically generating additional pages
        // For example: `/posts/3`
        fallback: true,
      }
  }

  export default function Trophies(props) {
    console.log("yo props", props);
    const [trophiesList, setTrophiesList] = useState([]);
    const [seeTrophies, setSeeTrophies] = useState(false);
    const [nameGame, setNameGame] = useState("");
    const [progress, setProgress] = useState(0);
    const [numberTrophies, setNumberTrophies] = useState(0);
    const [numberTrophiesEarned, setnumberTrophiesEarned] = useState(0);
    const [numberPlatinumEarned, setnumberPlatinumEarned] = useState(0);
    const [numberGoldEarned, setnumberGoldEarned] = useState(0);
    const [numberSilverEarned, setnumberSilverEarned] = useState(0);
    const [numberBronzeEarned, setnumberBronzeEarned] = useState(0);
    const [lastModify, setLastModify] = useState('');

    function sum(obj) {
      return Object.keys(obj).reduce((sum,key)=>sum+parseFloat(obj[key]||0),0);
    }

    const handleClick = (game, index) => {
      console.log("trofei da visualizzare", game)
      setTrophiesList(props.game.filter((x) => x.index == index)[0]);
      setNameGame(props.individual[index].trophyTitleName);
      setProgress(props.individual[index].comparedUser.progress);
      setNumberTrophies(sum(props.individual[index].definedTrophies));
      setnumberTrophiesEarned(sum(props.individual[index].comparedUser.earnedTrophies));
      setnumberPlatinumEarned(props.individual[index].comparedUser.earnedTrophies.platinum);
      setnumberGoldEarned(props.individual[index].comparedUser.earnedTrophies.gold);
      setnumberSilverEarned(props.individual[index].comparedUser.earnedTrophies.silver);
      setnumberBronzeEarned(props.individual[index].comparedUser.earnedTrophies.bronze);
      setLastModify(props.individual[index].comparedUser.lastUpdateDate);
      setSeeTrophies(true);
    }

    if(props.individual) {
      return (
        <Layout>
        <Head>
          {/* <title>{postData.title}</title> */}
        </Head>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px'}}>
          {!seeTrophies
            ?
              <>
                <h4 style={{marginBottom: '20px'}}>Has been detected {props.individual.length} possible games on your PSN profile.</h4>
                  {props.individual.map((x, index) => (
                    <div className={utilStyles.games_possible_trophies}
                      onClick={() => handleClick(x, index)}>
                      <div className={utilStyles.games_possible_trophies_img}
                      style={{backgroundImage: `url(${x.trophyTitleIconUrl})`, }}></div>
                      <div className={utilStyles.games_possible_trophies_body}>
                        <h5>{x.trophyTitleName}</h5>
                      </div>
                    </div>
                  ))}
              </>
            :
            <>
              <h3>{nameGame} trophies </h3>
              <p>Progresso: {progress}</p>
              <p>Trofei totali: {numberTrophies}</p>
              <p>Trofei guadagnati: {numberTrophiesEarned}</p>
              <p>Platino: {numberPlatinumEarned}</p>
              <p>Oro: {numberGoldEarned}</p>
              <p>Argento: {numberSilverEarned}</p>
              <p>Bronzo: {numberBronzeEarned}</p>
              <p>Ultima mod: {lastModify}</p>
              {trophiesList.trophies.map((x) => (
                <div className={utilStyles.games_possible_trophies} id={x.trophyId}>
                  <div className={utilStyles.games_possible_trophies_img}
                  style={{backgroundImage: `url(${x.trophyIconUrl})`, }}></div>
                  <div className={`${utilStyles.games_possible_trophies_descr} 
                    ${x.comparedUser.earned ? `${utilStyles.games_possible_trophies_descr_earned}` : ""}`} 
                  >
                    {(!x.trophyHidden || x.comparedUser.earned) && x.trophyName &&
                      <>
                      <h5>{x.trophyName}</h5>
                      <p>{x.trophyDetail}</p>
                      </>
                    }
                    {x.trophyHidden && (!x.comparedUser.earned || !x.trophyName) &&
                      <>
                      <h5>This is a hidden trophy.</h5>
                      <p>Information is not available.</p>
                      </>
                    }
                  </div>
                </div>
              ))}
            </>
          }
        </div>
      </Layout>
    )
    } else {
      return(
        <Layout>
          <Head>
            {/* <title>{postData.title}</title> */}
          </Head>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px'}}>
          <h5>Loading</h5>
          </div>
        </Layout>
      )
    }
  }