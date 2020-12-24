import React, { useEffect, useState } from "react";

import { createApi } from "unsplash-js";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

import Masonry from "react-masonry-css";
import "./App.css";
import errorsvg from "./assets/Error.svg";
import logo from "./assets/logo.svg";
import { WaveLoading } from "react-loadingg";
firebase.initializeApp({
  apiKey: process.env.REACT_APP_APIKEY,
  authDomain: process.env.REACT_APP_AUTHDOMAIN,
  projectId: "q-pixx",
  storageBucket: process.env.REACT_APP_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
  appId: "1:788487567894:web:1860476958d7f409c39337",
  measurementId: process.env.REACT_APP_MEASUREMENTID,
});
const auth = firebase.auth();
const firestore = firebase.firestore();
function App() {
  const [user, checking] = useAuthState(auth);
  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [searchPopup, setsearchPopup] = useState(false);
  const [loginPopup, setLoginPopup] = useState(false);
  const [profilePage, setprofilePage] = useState(false);
  const [all, getAll] = useState(true);
  const [liked, getliked] = useState(false);

  const onTextChange = (e) => {
    setText(e.target.value);
  };
  const searchImage = (e) => {
    e.preventDefault();
    setQuery(text.toLowerCase());
    setText("");
    setLoading(true);
    setsearchPopup(false);
  };
  const unsplash = createApi({
    accessKey: process.env.REACT_APP_UNSPLASH_ACCESS_KEY,
  });
  const pageOne = () => {
    setPage(1);
    setLoading(true);
  };
  const PageTwo = () => {
    setPage(2);
    setLoading(true);
  };
  const PageThree = () => {
    setPage(3);
    setLoading(true);
  };
  const pageFour = () => {
    setPage(4);
    setLoading(true);
  };
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
    setLoginPopup(false);
  };
  const photoRef = firestore.collection("photos");

  const [photos] = useCollectionData(photoRef);

  useEffect(() => {
    unsplash.search
      .getCollections({
        query: query ? query : "random",
        page: page,
        perPage: 30,
      })
      .then((res) => {
        setdata(res.response.results);
        setLoading(false);
      })
      .catch((err) => console.log(err));
  }, [query, page]);

  const breakpointColumnsObj = {
    default: 4,
    1100: 2,
  };

  return (
    <>
      <header>
        <img src={logo} alt="logo" />
        {checking ? (
          <></>
        ) : user ? (
          <>
            <img
              className={`profile ${liked ? "only" : ""}`}
              src={user.photoURL}
              alt="profile"
              onClick={() => setprofilePage(!profilePage)}
            />
          </>
        ) : (
          <button
            className="login-btn"
            onClick={() => setLoginPopup(!loginPopup)}
          >
            {loginPopup ? "cancel" : "login"}
          </button>
        )}
        {all && (
          <button
            className="search-btn"
            onClick={() => {
              setsearchPopup(!searchPopup);
              setLoginPopup(false);
            }}
          >
            <i className="fas fa-search"></i>
          </button>
        )}

        <div className={`${searchPopup ? "search-active" : ""}`}>
          <form onSubmit={searchImage}>
            <input type="text" value={text} onChange={onTextChange} />
            <button disabled={!text}>
              <i className="fas fa-search"></i>
            </button>
          </form>
        </div>
      </header>

      <main>
        <div
          onClick={() => setsearchPopup(false)}
          className={` main ${loginPopup ? "main-blur" : ""} ${
            profilePage ? "main-slide-in" : ""
          }`}
        >
          {!user && (
            <div className={`login-popup ${loginPopup ? "login-active" : ""}`}>
              <h2>Login with Google</h2>
              {/* <p>You can save pics to your account(comming soon)</p> */}
              <div>
                <button className="login" onClick={signInWithGoogle}>
                  login
                </button>
                <button className="cancel" onClick={() => setLoginPopup(false)}>
                  cancel
                </button>
              </div>
            </div>
          )}
          {user && photos && (
            <div className={`profile-page ${profilePage ? "slide-in" : ""}`}>
              <div>
                <img src={user.photoURL} />
                <h3>{user.displayName}</h3>
                <p>{user.email}</p>
                <p>Liked photos : {photos.length}</p>
              </div>
              <button onClick={() => auth.signOut()}>LOGOUT</button>
            </div>
          )}

          {all ? (
            !loading ? (
              <>
                {data.length ? (
                  <div
                    className={`image_container ${loginPopup ? "blur" : ""}`}
                  >
                    {query ? <p>Search Result for "{query}"</p> : ""}
                    <div className="pageBtn">
                      <button
                        className={page === 1 ? "active" : ""}
                        onClick={pageOne}
                      >
                        1
                      </button>
                      <button
                        className={page === 2 ? "active" : ""}
                        onClick={PageTwo}
                      >
                        2
                      </button>
                      <button
                        className={page === 3 ? "active" : ""}
                        onClick={PageThree}
                      >
                        3
                      </button>
                      <button
                        className={page === 4 ? "active" : ""}
                        onClick={pageFour}
                      >
                        4
                      </button>
                    </div>
                    <Masonry
                      breakpointCols={breakpointColumnsObj}
                      className="my-masonry-grid"
                      columnClassName="my-masonry-grid_column"
                    >
                      {data.map((ele) => (
                        <Photos
                          key={ele.id}
                          ele={ele}
                          user={user}
                          photos={photos}
                          photoRef={photoRef}
                        />
                      ))}
                    </Masonry>
                  </div>
                ) : (
                  <div className="search-error">
                    <img src={errorsvg} alt="search error" />
                    <p>Can't find what you're looking for</p>
                  </div>
                )}
              </>
            ) : (
              <WaveLoading color="#0755ff" />
            )
          ) : photos ? (
            <div className="liked">
              <h2>Liked Photos</h2>
              <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
              >
                {photos.map((photo) => (
                  <Photos
                    key={photo.id}
                    ele={photo}
                    user={user}
                    photos={photos}
                    photoRef={photoRef}
                  />
                ))}
              </Masonry>
            </div>
          ) : (
            <WaveLoading color="#0755ff" />
          )}
        </div>
        {user && (
          <div className="tabs">
            <button
              className={`${all ? "btn-active" : ""}`}
              onClick={() => {
                getAll(true);
                getliked(false);
              }}
            >
              All
            </button>
            <button
              className={`${liked ? "btn-active" : ""}`}
              onClick={() => {
                getliked(true);
                getAll(false);
              }}
            >
              Liked
            </button>
          </div>
        )}
      </main>
    </>
  );
}
const Photos = ({ ele, user, photos, photoRef }) => {
  const likePhoto = () => {
    photoRef.add(ele);
  };

  return (
    <div>
      {/* <>{value && value.map((v) => <div>{v}</div>)}</> */}
      <img src={ele.preview_photos[0].urls.small} alt="pic"></img>
      <p>
        {ele.cover_photo.description
          ? ele.cover_photo.description.split(" ").slice(0, 4).join(" ")
          : ele.title}
      </p>

      <div>
        {user && photos && (
          <button
            disabled={photos.filter((photo) => photo.id === ele.id).length >= 1}
            onClick={likePhoto}
          >
            <i
              className={`${
                photos.filter((photo) => photo.id === ele.id).length >= 1
                  ? "fas"
                  : "far"
              } fa-heart`}
            ></i>
          </button>
        )}
        <button>
          <a href={ele.cover_photo.links.download}>
            <i className="far fa-save"></i>
          </a>
        </button>
      </div>
    </div>
  );
};

export default App;
