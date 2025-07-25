import Link from "next/link";
import classes from './Footer.module.scss';

const Footer = () => (
  <div className={classes.Footer}>
    <p className={'text-muted text-center py-2 my-2'}>
      <Link href={'/'}
            className={`${classes.Element} ${classes.Link}`}
      >
        Home
      </Link>
      <Link href={'/about'}
            className={`${classes.Element} ${classes.Link}`}
      >
        About
      </Link>
      <span className={classes.Element}>
        &copy; 2015-2025
        {' '}
        <Link href={'mailto:hello@tourn.io'}>
          Tournio
        </Link>
      </span>
    </p>
  </div>
);

export default Footer;
