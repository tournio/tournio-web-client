import {useRouter} from "next/router";

import ColorModeToggler from "../../common/ColorModeToggler/ColorModeToggler";

import classes from './Footer.module.scss';

const Footer = () => {
  const router = useRouter();

  return (
    <div className={classes.Footer}>
      <a href={'/director'} className={`${classes.Element}`}>
        Login
      </a>
      {router.pathname !== '/about' &&
        <a href={'/about'} className={`${classes.Element}`}>
          About
        </a>
      }
      <span className={`${classes.Element}`}>
        &copy; 2015-2025
        {' '}
        <a href={'mailto:hello@tourn.io'}>
          Tournio
        </a>
      </span>
      <ColorModeToggler className={`d-inline-block mt-1 mb-0 py-1`} />
    </div>
  );
}

export default Footer;
