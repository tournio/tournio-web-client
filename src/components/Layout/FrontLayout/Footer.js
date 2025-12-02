import ColorModeToggler from "../../common/ColorModeToggler/ColorModeToggler";

import classes from './Footer.module.scss';

const Footer = () => (
  <div className={classes.Footer}>
    <span className={`${classes.Element}`}>
      &copy; 2015-2025 Tourn.io
    </span>
    <ColorModeToggler className={`d-inline-block mt-1 mb-0 py-1`} />
  </div>
);

export default Footer;
