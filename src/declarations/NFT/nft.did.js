export const idlFactory = ({ IDL }) => {
  const NFT = IDL.Service({
    'getAsset' : IDL.Func([], [IDL.Vec(IDL.Nat8)], []),
    'getCanisterId' : IDL.Func([], [IDL.Principal], []),
    'getName' : IDL.Func([], [IDL.Text], []),
    'getOwner' : IDL.Func([], [IDL.Principal], []),
  });
  return NFT;
};
export const init = ({ IDL }) => {
  return [IDL.Text, IDL.Principal, IDL.Vec(IDL.Nat8)];
};
