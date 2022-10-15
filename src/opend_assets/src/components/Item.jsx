import React, {useState, useEffect} from "react";
import {Actor, HttpAgent} from "@dfinity/agent";
import {Principal} from "@dfinity/principal";
import {idlFactory} from "../../../declarations/NFT";
import {opend} from "../../../declarations/opend";
import Button from "./Button";

function Item(props) {
  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [input, setInput] = useState();
  const [loaderHidden, setLoader] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState("");


  const id = props.id;

  var localHost = "http://127.0.0.1:8000/";
  var agent = new HttpAgent({
    host: localHost
  });

  agent.fetchRootKey();
  let NFTActor;

  async function loadNFT(){

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

    const listed = await opend.isListed(props.id);
    console.log("id", id)
    console.log("listed", listed)

    if(listed){
      setBlur({filter: "blur(4px)"});
      setOwner("OpenD");
      setSellStatus("Listed");
    }else{
      setButton(<Button handleClick={handleSell} text={"Sell"}/>);
    }
  };

  useEffect(() =>{
    loadNFT();
  }, []);

  let price;
  async function handleSell(){
    console.log("Sell Clicked")
    setInput(
    <input
      placeholder="Price in TNK870"
      type="number"
      className="price-input"
      value={price}
      onChange={(e) => (price = e.target.value)}
    />)
    setButton(<Button handleClick={makeSell} text={"Confirm"}/>)
  };

  async function makeSell(){
    setBlur({filter: "blur(4px)"});
    setLoader(false);
    const listingResult = await opend.listItem(props.id, Number(price));
    console.log("listing", listingResult);

    if(listingResult == "Success"){
      setSellStatus("Listed");
      const opendID = await opend.getCanisterId();
      const transferResult = await NFTActor.transferOwnership(opendID);
      console.log("transfer", transferResult);
      if(transferResult == "Success"){
        setButton();
        setInput();
        setOwner("OpenD");
        setLoader(true);
      }
    }
  }

  return (
    <div className="disGrid-item">
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
