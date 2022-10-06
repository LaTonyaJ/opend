import React, {useState, useEffect} from "react";
import {Actor, HttpAgent} from "@dfinity/agent";
import {Principal} from "@dfinity/principal";
import {idlFactory} from "../../../declarations/NFT";

function Item(props) {
  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();

  const id = props.id;

  var localHost = "http://127.0.0.1:8000/";
  var agent = new HttpAgent({
    host: localHost
  });

  async function loadNFT(){
    await agent.fetchRootKey();
    const NFTActor = await Actor.createActor(idlFactory, {
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
  };

  useEffect(() =>{
    loadNFT();
  }, []);

  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
        />
        <div className="disCardContent-root">
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"></span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Item;
