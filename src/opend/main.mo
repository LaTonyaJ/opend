import Principal "mo:base/Principal";
import NFTActorClass "../NFT/nft";
import HashMap "mo:base/HashMap";
import List "mo:base/List";

actor OpenD {
    var mapOfNFTs = HashMap.HashMap<Principal, NFTActorClass.NFT>(1, Principal.equal, Principal.hash);
    var mapOfOwners = HashMap.HashMap<Principal, List.List<Principal>>(1, Principal.equal, Principal.hash);

    public shared(msg) func mint(imageData: [Nat8], name: Text): async Principal{
        
        let owner: Principal = msg.caller;

        let newNFT = await NFTActorClass.NFT(name, owner, imageData);


        let NFTPrincipal = await newNFT.getCanisterId();
        mapOfNFTs.put(NFTPrincipal, newNFT);
        addToOwnership(owner, NFTPrincipal);

        return NFTPrincipal;
    };

    private func addToOwnership(owner: Principal, nftId: Principal){
        var ownedNFTs: List.List<Principal> = switch(mapOfOwners.get(owner)){
            case null List.nil<Principal>();
            case (?results) results;
        };

        ownedNFTs := List.push(nftId, ownedNFTs);
        mapOfOwners.put(owner, ownedNFTs); 
    };

    public query func getOwnerNFTs(user: Principal): async [Principal]{
        var listOfNFTs: List.List<Principal> = switch(mapOfOwners.get(user)){
            case null List.nil<Principal>();
            case (?results) results;
        };

        return List.toArray(listOfNFTs);
    } 

};
