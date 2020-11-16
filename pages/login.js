import React, {useState} from 'react';
import Router from 'next/router';
import axios from 'axios';
import cookie from 'js-cookie';
import { Form, Col, Button, Alert } from 'react-bootstrap';
import Head from 'next/head'
import styles from '../components/layout.module.css'
import Link from 'next/link'

export default function Login() {
  const [loginError, setLoginError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("inizio fetch");
    console.log("username", username);
    console.log("password", password);
    //call api
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        Username: username,
        Password: password
        }
    )
    .then((response) => {
        console.log(response.data.image);
        setLoginError("")
        cookie.set("jwt", response.data.jwt);
        cookie.set("username", username);
        cookie.set("user", response.data.id);
        //cookie.set("imageProfile", "data:image/png;base64," + response.data.image);
        if(response.data.image) localStorage.setItem("imageProfile", "data:image/png;base64," + response.data.image);
        else localStorage.removeItem("imageProfile");
        Router.push('/');
      }, (error) => {
        console.log(error);
        setLoginError("Utente non trovato.")
      });
  }
  return (
    <div id="ciao" className={styles.sign_in_container}>
        <div id="ciao2" className={styles.container}>
            <Head>
            <link rel="icon" href="/favicon.ico" />
            <meta
            name="description"
            content="An application for videogamers"
            />
            <title>Yume</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link
            rel="stylesheet"
            href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css"
            integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk"
            crossorigin="anonymous"
            />
        </Head>
            <div>
            <svg width="500px" height="300px" viewBox="0 0 500 300" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <g id="Artboard" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <text id="UME" font-family="Futura-Bold, Futura" font-size="97.5" font-weight="bold" fill="#FFF">
                        <tspan x="178" y="201">UME</tspan>
                    </text>
                    <path d="M172.369841,126.9825 L173.08,126.9825 L172.754997,127.58912 L220,202 L60,202 L106.763844,128.346946 L106,126.9825 L107.630159,126.9825 L140,76 L172.369841,126.9825 Z M172.369841,126.9825 L152.8,126.9825 L139.8325,152.625 L126.475,126.9825 L107.630159,126.9825 L106.763844,128.346946 L130.18,170.175 L113.1175,201.96 L132.91,201.96 L172.754997,127.58912 L172.369841,126.9825 Z" id="Combined-Shape" fill="#FFF" fill-rule="nonzero"></path>
                </g>
            </svg>
            </div>
            <Form onSubmit={handleSubmit} className={styles.sign_in_container_form}>
                <h3>Welcome to Yume, please login</h3>
                <Form.Group controlId="formGridUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control 
                        placeholder="Username" 
                        name="username"
                        type="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formGridPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" type="submit" className={styles.btn_primary}>
                    Login
                </Button>
                <Link href="/signin">
                    <a>Don't have account? Sign in!</a>
                </Link>
            </Form>
        </div>
    </div>
  );
};