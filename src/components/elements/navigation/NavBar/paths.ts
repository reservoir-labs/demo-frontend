import { ISubNav } from '../SubNav/SubNav';

const NAV_LINKS: ISubNav[] = [
  { label: 'Swap', href: '/' },
  {
    label: 'Add liq',
    href: '/addLiq',
  },
  {
    label: 'Remove liq',
    href: '/removeLiq'
  }
  // {
  //   label: 'Transfers',
  //   href: '/transfers',
  //   children: [
  //     {
  //       label: 'ERC20',
  //       subLabel: 'Get your ERC20 transfers',
  //       href: '/transfers/erc20',
  //       logo: 'token',
  //     },
  //     {
  //       label: 'NFT',
  //       subLabel: 'Get your ERC721 an ERC1155 transfers',
  //       href: '/transfers/nft',
  //       logo: 'lazyNft',
  //     },
  //   ],
  // },
  // {
  //   label: 'Balances',
  //   href: '/balances',
  //   children: [
  //     {
  //       label: 'ERC20',
  //       subLabel: 'Get your ERC20 balances',
  //       href: '/balances/erc20',
  //       logo: 'token',
  //     },
  //     {
  //       label: 'NFT',
  //       subLabel: 'Get your ERC721 an ERC1155 balances',
  //       href: '/balances/nft',
  //       logo: 'pack',
  //     },
  //   ],
  // },
];

export default NAV_LINKS;
