import '../styles/global.css'
import cookie from 'js-cookie';
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }) {  
    return <Component {...pageProps} />
  }