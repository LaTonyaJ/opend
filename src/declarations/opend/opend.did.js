export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'getCanisterId' : IDL.Func([], [IDL.Principal], ['query']),
    'getListed' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'getOwnerNFTs' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'isListed' : IDL.Func([IDL.Principal], [IDL.Bool], []),
    'listItem' : IDL.Func([IDL.Principal, IDL.Nat], [IDL.Text], []),
    'mint' : IDL.Func([IDL.Vec(IDL.Nat8), IDL.Text], [IDL.Principal], []),
  });
};
export const init = ({ IDL }) => { return []; };
