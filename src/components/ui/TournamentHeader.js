import Link from "next/link";

const TournamentHeader = ({tournament}) => (
  <>
    <div className={`display-4`}>
      <Link className={'icon-link'}
            href={`/tournaments/${tournament.identifier}`}>
        <i className={'bi bi-arrow-left'} aria-hidden={true}/>
        <span className={'visually-hidden'}>
          To tournament homepage
        </span>
      </Link>
      <span className={'ps-3'}>
        <span className={'d-none d-md-inline'}>
          {tournament.name}
        </span>
        <span className={'d-md-none'}>
          {tournament.abbreviation}
        </span>
        {' '}
        {tournament.year}
      </span>
    </div>

    <hr />
  </>
);

export default TournamentHeader;
