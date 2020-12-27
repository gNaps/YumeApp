import Head from 'next/head'
import styles from '../styles/layout.module.css'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import cookie from 'js-cookie';
import ImageUploader from './imageUploader'
import NavBar from '../components/NavBar'

const name = cookie.get("username");
console.log("setto il name", cookie.get("username"))
export const siteTitle = 'Yume'

export default function Layout({ children, home, post, numberGamesPlatinum, numberGamesFinish, numberGamesToPlay, numberGamesToBuy }) {
  
  const [image, setImage] = React.useState('');
    if(typeof window !== 'undefined') {
        React.useEffect(() => {
        setImage(localStorage.getItem('imageProfile'))
        }, [])
    }

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="An application for videogamers"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css"
          integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk"
          crossorigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css"
        />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;500;700;800&display=swap" />
        <title>{siteTitle}</title>
      </Head>
      <NavBar />
      {<header className={styles.header}>
        {home ? (
          <div className={styles.header_item}>
            <div className={styles.header_image}>
              <ImageUploader />
            </div>
            <div className={styles.header_stats}>
              <h1 className={styles.heading2Xl}>{name}</h1>
              {
                numberGamesPlatinum ? (
                  <span>
                    <i class="fas fa-trophy"></i>
                    {numberGamesPlatinum}
                  </span> 
                ) : (
                  <span>
                    <i class="fas fa-trophy"></i>0
                  </span>
                )
              }
              {
                numberGamesFinish ? (
                  <span>
                    <i class="fas fa-award"></i>
                    {numberGamesFinish}
                  </span> 
                ) : (
                  <span>
                    <i class="fas fa-award"></i>0
                  </span>
                )
              }
              {
                numberGamesToPlay ? (
                  <span>
                    <i class="fas fa-gamepad"></i>
                    {numberGamesToPlay}
                  </span> 
                ) : (
                  <span>
                    <i class="fas fa-gamepad"></i>0
                  </span>
                )
              }
              {
                numberGamesToBuy ? (
                  <span>
                    <i class="fas fa-shopping-cart"></i>
                    {numberGamesToBuy}
                  </span> 
                ) : (
                  <span>
                    <i class="fas fa-shopping-cart"></i>0
                  </span>
                )
              }
            </div>
          </div>
        ) : (
          <>
            {post &&
              <div className={utilStyles.headerPost}>
                  <img
                    src={image}
                    className={`${styles.headerImage} ${utilStyles.borderCircle}`}
                    alt={name}
                  />
              </div>
            }
          </>
        )}
      </header>}
      <div className={styles.container}>
      <main>{children}</main>
      {!home && (
        <div className={styles.backToHome}>
          <Link href="/">
            <a>← Back to home</a>
          </Link>
        </div>
      )} 
    </div>
    </>
  )
}