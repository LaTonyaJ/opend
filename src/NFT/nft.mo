import Debug "mo:base/Debug";
import Principal "mo:base/Principal";

actor class NFT(name: Text, owner: Principal, content: [Nat8]) = this {
    // Debug.print("It works!");

    let itemName = name;
    let nftOwner = owner;
    let asset = content;

    public func getName(): async Text{
        return itemName;
    };

    public func getOwner(): async Principal{
        return nftOwner;
    };

    public func getAsset(): async [Nat8]{
        return asset;
    };

    public func getCanisterId(): async Principal{
        return Principal.fromActor(this);
    };
}