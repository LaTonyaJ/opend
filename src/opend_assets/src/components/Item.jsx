import React, {useState, useEffect} from "react";
import {Actor, HttpAgent} from "@dfinity/agent";
import {Principal} from "@dfinity/principal";
import {idlFactory} from "../../../declarations/NFT";
import { idlFactory as tokenidlFactory} from "../../../declarations/token";
import {opend} from "../../../declarations/opend";
import Button from "./Button";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";

function Item(props) {
  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [input, setInput] = useState();
  const [loaderHidden, setLoader] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState("");
  const [displayPrice, setdisplayprice] = useState();
  const [shouldDisplay, setDisplay] = useState(true);


  const id = props.id;

  var localHost = "http://127.0.0.1:8080/";
  var agent = new HttpAgent({
    host: localHost
  });

  agent.fetchRootKey();
  let NFTActor;

  async function loadNFT(){
    // console.log("id", id.toText())
    NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id,
    });

    const name = await NFTActor.getName();
    const owner = await NFTActor.getOwner();
    const imageContent = await NFTActor.getAsset();
    const imageData = new Uint8Array(imageContent);
    const image = URL.createObjectURL(new Blob([imageData.buffer], {type: "image/png"}));

    setName(name);
    setOwner(owner.toText());
    setImage(image);


    if(props.role == "collection"){
      const listed = await opend.isListed(props.id);
      // console.log("listed", listed)

      if(listed){
        setBlur({filter: "blur(4px)"});
        setOwner("OpenD");
        setSellStatus("Listed");
      }else{
        setButton(<Button handleClick={handleSell} text={"Sell"}/>);
      }

    }else if (props.role == "discover"){
      var originalOwner = await opend.getOriginalOwner(props.id);
      if(originalOwner.toText() != CURRENT_USER_ID){
      setButton(<Button handleClick={handleBuy} text={"Buy"}/>);
      }

      var price = await opend.getListedPrice(props.id);
          setdisplayprice(<PriceLabel sellPrice={price.toString()}/>)
    }
}

  useEffect(() =>{
    loadNFT();
  }, []);

  let price;
  function handleSell(){
    console.log("Sell Clicked")
    setInput(
    <input
      placeholder="Price in TNK870"
      type="number"
      className="price-input"
      value={price}
      onChange={(e) => (price = e.target.value)}
    />);
    setButton(<Button handleClick={makeSell} text={"Confirm"}/>);
  }

  async function makeSell(){
    setBlur({filter: "blur(4px)"});
    setLoader(false);
    const listingResult = await opend.listItem(props.id, Number(price));
    console.log("listing", listingResult);

    if(listingResult == "Success"){
      setSellStatus("Listed");
      const opendID = await opend.getCanisterId();
      // console.log("Canister ID", opendID)
      const transferResult = await NFTActor.transferOwnership(opendID);
      console.log("transfer", transferResult);
      if(transferResult == "Success"){
        setButton();
        setInput();
        setOwner("OpenD");
        setLoader(true);
        setSellStatus("Listed");
      }
    }
  }

  async function handleBuy(){
    console.log("Buy triggered")
    setLoader(false);
    var tokenActor = await Actor.createActor(tokenidlFactory, {
      agent,
      canisterId: Principal.fromText("qsgjb-riaaa-aaaaa-aaaga-cai"),
    });

    const sellerId = await opend.getOriginalOwner(props.id);
    const sellPrice = await opend.getListedPrice(props.id);

    const results = await tokenActor.transfer(sellerId, sellPrice);
    console.log(results)
    if(results == "Success"){
      const purchaseResult = await opend.completePurchase(props.id, sellerId, CURRENT_USER_ID);
      console.log("Purchase", purchaseResult)
      setLoader(true);
      setDisplay(false);
    }
  }

  return (
    <div style={{display: shouldDisplay ? "inline" : "none" }} className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
        <div className="lds-ellipsis" hidden={loaderHidden}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
      </div>
        <div className="disCardContent-root">
          {displayPrice}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"> {sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {input}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
