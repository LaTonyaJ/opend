import Principal "mo:base/Principal";
import NFTActorClass "../NFT/nft";
import HashMap "mo:base/HashMap";
import List "mo:base/List";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
import Cycles "mo:base/ExperimentalCycles";

actor OpenD {

    private type Listing = {
        itemOwner: Principal;
        itemPrice: Nat;
    };

    var mapOfNFTs = HashMap.HashMap<Principal, NFTActorClass.NFT>(1, Principal.equal, Principal.hash);
    var mapOfOwners = HashMap.HashMap<Principal, List.List<Principal>>(1, Principal.equal, Principal.hash);
    var mapOfListings = HashMap.HashMap<Principal, Listing>(1, Principal.equal, Principal.hash);


    public shared(msg) func mint(imageData: [Nat8], name: Text): async Principal{
        
        let owner: Principal = msg.caller;

        Cycles.add(100_500_000_000);
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
    };

    public shared(msg) func listItem(id: Principal, price: Nat): async Text{
        var item: NFTActorClass.NFT = switch(mapOfNFTs.get(id)){
            case null return "NFT does not exist";
            case (?results) results;
        };

        let owner = await item.getOwner();

        if(Principal.equal(owner, msg.caller)){
            let newListing: Listing = {
                itemOwner = owner;
                itemPrice = price;
            };
            mapOfListings.put(id, newListing);
            return "Success";
        }else{
            return "Invalid Action: Must be NFT Owner";
        }

    };

    public query func getCanisterId(): async Principal{
        return Principal.fromActor(OpenD);
    };

    public query func isListed(id: Principal): async Bool{
        if(mapOfListings.get(id) == null) {
            return false;
        }else{
            return true;
        }
    };

    public query func getListed(): async [Principal]{
        var ids = Iter.toArray(mapOfListings.keys());
        return ids;
    };

    public query func getOriginalOwner(id: Principal): async Principal{
        var listing: Listing = switch(mapOfListings.get(id)){
            case null return Principal.fromText("");
            case (?result) result;
        };
        return listing.itemOwner;
    };

    public query func getListedPrice(id: Principal): async Nat{
        var listing: Listing = switch(mapOfListings.get(id)){
            case null return 0;
            case (?result) result; 
        };
        return listing.itemPrice;
    };

    public shared(msg) func completePurchase(id: Principal, ownerId: Principal, newOwnerId: Principal): async Text{
        var purchasedNFT: NFTActorClass.NFT = switch(mapOfNFTs.get(id)){
            case null return "NFT does not exist";
            case (?result) result;
        };

        var transferResults = await purchasedNFT.transferOwnership(newOwnerId);
        if(transferResults == "Success"){
            mapOfListings.delete(id);
            var ownedNFTs: List.List<Principal> = switch(mapOfOwners.get(ownerId)){
                case null List.nil<Principal>();
                case (?result) result;
            };
            ownedNFTs := List.filter(ownedNFTs, func (itemId: Principal): Bool {
                return itemId != id;
            });
            addToOwnership(newOwnerId, id);
            return "Success";
        }else{
            return transferResults;
        }

    } 

};
