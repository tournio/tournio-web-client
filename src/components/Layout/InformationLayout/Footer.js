import classes from './Footer.module.scss';

const Footer = () => (
  <div className={classes.Footer}>
    <p className={'text-muted text-center py-2 my-2'}>
      <a href={'/'} className={`${classes.Element} ${classes.Link}`}>
        Home
      </a>
      <a href={'/about'} className={`${classes.Element} ${classes.Link}`}>
        About
      </a>
      <span className={classes.Element}>
        &copy; 2015-2025
        {' '}
        <a href={'mailto:hello@tourn.io'}>
          Tournio
        </a>
      </span>
    </p>
  </div>
);

export default Footer;
