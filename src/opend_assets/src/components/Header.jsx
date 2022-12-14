import React, { useState, useEffect } from "react";
import logo from "../../assets/logo.png";
import { Link, Switch, Route, BrowserRouter } from "react-router-dom";
import Minter from "./Minter";
import Gallery from "./Gallery";
import homeImage from "../../assets/home-img.png";
import { opend } from "../../../declarations/opend";
import CURRENT_USER_ID from "../index";



function Header() {
  const [gallery, setGallery] = useState();
  const [discoverGallery, setdiscover] = useState();

  async function getNFTs(){
    const userNFTS = await opend.getOwnerNFTs(CURRENT_USER_ID);
    console.log("collection", userNFTS)
    setGallery(<Gallery title="My NFT's" ids={userNFTS} role="collection" />);

    const listedNFTS = await opend.getListed();
    console.log("listed", listedNFTS)
    setdiscover(<Gallery title="Discover" ids={listedNFTS} role="discover" />);
  }

  useEffect(() =>{
    getNFTs();
  }, []);

  return (
    <BrowserRouter forceRefresh={true}>
      <div className="app-root-1">
        <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
          <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
            <div className="header-left-4"></div>
            <img className="header-logo-11" src={logo} />
            <div className="header-vertical-9"></div>
            <Link to="/">
            <h5 className="Typography-root header-logo-text">OpenD</h5>
            </Link>
            <div className="header-empty-6"></div>
            <div className="header-space-8"></div>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/discover">Discover</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/minter">
                Minter
              </Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/collection">
                My NFTs
              </Link>
            </button>
          </div>
        </header>
      </div>
      <Switch>
        <Route exact path="/">
          <img className="bottom-space" src={homeImage} />
        </Route>
        <Route path="/discover">
          {discoverGallery}
        </Route>
        <Route path="/minter">
          <Minter />
        </Route>
        <Route path="/collection">
          {gallery}
        </Route>
      </Switch>
  </BrowserRouter>
  );
}

export default Header;
